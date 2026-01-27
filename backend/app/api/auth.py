# app/api/routes/auth.py
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError
from app.models.core import School

import re

from app.db.session import get_db
from app.models.core import Teacher  # adjust import path to your Teacher model
from app.models.auth import OTPCode, OTPChannel, AuthSession
from app.schemas.auth import RequestOTPIn, VerifyOTPIn, TokenOut, LogoutIn, SignupRequestOTPIn, SignupVerifyOTPIn
from app.utils.auth import (
    gen_otp, hash_otp, verify_otp_hash,
    create_access_token, gen_refresh_token, hash_refresh,
    otp_expiry, refresh_expiry
)
from app.utils.otp_delivery import send_otp

from app.schemas.auth import RefreshIn, AccessOut

router = APIRouter(prefix="/auth", tags=["auth"])


def _normalize_phone(destination: str) -> str:
    raw = destination.strip()
    digits = re.sub(r"\D", "", raw)
    if digits.startswith("0") and len(digits) == 11:
        digits = digits[1:]
    if raw.startswith("+"):
        return f"+{digits}"
    if len(digits) == 10:
        return f"+91{digits}"
    if len(digits) == 12 and digits.startswith("91"):
        return f"+{digits}"
    return digits


def _normalize_dest(channel: str, destination: str) -> str:
    dest = destination.strip()
    if channel == "phone":
        return _normalize_phone(dest)
    return dest.lower()


def _as_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt



@router.post("/signup/request-otp")
def signup_request_otp(payload: SignupRequestOTPIn, db: Session = Depends(get_db)):
    phone = _normalize_phone(payload.phone)
    email = _normalize_dest("email", payload.email)

    # If already exists -> block or reuse pending signup
    existing = db.query(Teacher).filter((Teacher.phone == phone) | (Teacher.email == email)).first()
    if existing:
        if existing.phone != phone or existing.email != email:
            raise HTTPException(status_code=409, detail="Teacher already registered")
        if int(getattr(existing, "onboarding_status", 0)) == 1:
            raise HTTPException(status_code=409, detail="Teacher already registered")
        teacher = existing
    else:
        # If a school is provided, validate it exists
        if payload.school_id:
            school = db.query(School).filter(School.id == payload.school_id).first()
            if not school:
                raise HTTPException(status_code=400, detail="Invalid school")

        # Create teacher in onboarding_status=0 (pending)
        teacher = Teacher(
            name=payload.name.strip(),
            phone=phone,
            email=email,
            school_id=payload.school_id,
            onboarding_status=0,
        )
        db.add(teacher)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=409, detail="Teacher already registered")

    # Send OTP to phone (signup verifies ownership)
    cooldown_sec = int(__import__("os").environ.get("OTP_REQUEST_COOLDOWN_SEC", "60"))
    if cooldown_sec > 0:
        last_code = (
            db.query(OTPCode)
            .filter(OTPCode.destination == phone, OTPCode.channel == OTPChannel.phone)
            .order_by(desc(OTPCode.created_at))
            .first()
        )
        if last_code:
            last_created = _as_utc(last_code.created_at)
            if datetime.now(timezone.utc) - last_created < timedelta(seconds=cooldown_sec):
                raise HTTPException(status_code=429, detail="Too many OTP requests")

    otp = gen_otp(6)
    code = OTPCode(
        teacher_id=teacher.id,
        channel=OTPChannel.phone,
        destination=phone,
        otp_hash=hash_otp(phone, otp),
        expires_at=otp_expiry(),
    )
    db.add(code)
    db.commit()

    send_otp("phone", phone, otp)

    import os
    if os.environ.get("OTP_DEV_RETURN", "1") == "1":
        return {"ok": True, "dev_otp": otp, "teacher_id": str(teacher.id)}
    return {"ok": True}


@router.post("/signup/verify-otp", response_model=TokenOut)
def signup_verify_otp(payload: SignupVerifyOTPIn, db: Session = Depends(get_db)):
    phone = _normalize_phone(payload.phone)
    otp = payload.otp.strip()

    teacher = db.query(Teacher).filter(Teacher.phone == phone).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # latest OTP for this phone
    code = (
        db.query(OTPCode)
        .filter(OTPCode.destination == phone, OTPCode.channel == OTPChannel.phone)
        .order_by(OTPCode.created_at.desc())
        .first()
    )
    if not code:
        raise HTTPException(status_code=400, detail="No OTP requested")
    if code.used_at is not None:
        raise HTTPException(status_code=400, detail="OTP already used")

    now = datetime.now(timezone.utc)
    if code.expires_at < now:
        raise HTTPException(status_code=400, detail="OTP expired")

    max_attempts = int(__import__("os").environ.get("OTP_MAX_ATTEMPTS", "5"))
    if code.attempts >= max_attempts:
        raise HTTPException(status_code=429, detail="Too many attempts")

    if not verify_otp_hash(phone, otp, code.otp_hash):
        code.attempts += 1
        db.add(code)
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # mark used + mark onboarded (verified)
    code.used_at = now
    teacher.onboarding_status = 1
    db.add(code)
    db.add(teacher)

    # issue tokens
    access = create_access_token(sub=str(teacher.id))
    refresh = gen_refresh_token()
    sess = AuthSession(
        teacher_id=teacher.id,
        refresh_token_hash=hash_refresh(refresh),
        expires_at=refresh_expiry(),
    )
    db.add(sess)
    db.commit()

    return TokenOut(access_token=access, refresh_token=refresh)





@router.post("/request-otp")
def request_otp(payload: RequestOTPIn, db: Session = Depends(get_db)):
    channel = payload.channel
    destination = _normalize_dest(channel, payload.destination)

    # Find teacher
    if channel == "phone":
        teacher = db.query(Teacher).filter(Teacher.phone == destination).first()
    else:
        teacher = db.query(Teacher).filter(Teacher.email == destination).first()

    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    cooldown_sec = int(__import__("os").environ.get("OTP_REQUEST_COOLDOWN_SEC", "60"))
    if cooldown_sec > 0:
        last_code = (
            db.query(OTPCode)
            .filter(OTPCode.destination == destination)
            .order_by(desc(OTPCode.created_at))
            .first()
        )
        if last_code:
            last_created = _as_utc(last_code.created_at)
            if datetime.now(timezone.utc) - last_created < timedelta(seconds=cooldown_sec):
                raise HTTPException(status_code=429, detail="Too many OTP requests")

    otp = gen_otp(6)
    code = OTPCode(
        teacher_id=teacher.id,
        channel=OTPChannel.phone if channel == "phone" else OTPChannel.email,
        destination=destination,
        otp_hash=hash_otp(destination, otp),
        expires_at=otp_expiry(),
    )
    db.add(code)
    db.commit()

    send_otp(channel, destination, otp)

    # dev ergonomics: return hint only in dev
    import os
    if os.environ.get("OTP_DEV_RETURN", "1") == "1":
        return {"ok": True, "dev_otp": otp}
    return {"ok": True}


@router.post("/verify-otp", response_model=TokenOut)
def verify_otp(payload: VerifyOTPIn, db: Session = Depends(get_db)):
    channel = payload.channel
    destination = _normalize_dest(channel, payload.destination)
    otp = payload.otp.strip()

    teacher = None
    if channel == "phone":
        teacher = db.query(Teacher).filter(Teacher.phone == destination).first()
    else:
        teacher = db.query(Teacher).filter(Teacher.email == destination).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # latest OTP for this destination
    code = (
        db.query(OTPCode)
        .filter(OTPCode.destination == destination)
        .order_by(desc(OTPCode.created_at))
        .first()
    )
    if not code:
        raise HTTPException(status_code=400, detail="No OTP requested")

    if code.used_at is not None:
        raise HTTPException(status_code=400, detail="OTP already used")

    now = datetime.now(timezone.utc)
    if code.expires_at < now:
        raise HTTPException(status_code=400, detail="OTP expired")

    max_attempts = int(__import__("os").environ.get("OTP_MAX_ATTEMPTS", "5"))
    if code.attempts >= max_attempts:
        raise HTTPException(status_code=429, detail="Too many attempts")

    if not verify_otp_hash(destination, otp, code.otp_hash):
        code.attempts += 1
        db.add(code)
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # mark used
    code.used_at = now
    db.add(code)

    # issue tokens
    access = create_access_token(sub=str(teacher.id))
    refresh = gen_refresh_token()
    refresh_hash = hash_refresh(refresh)

    sess = AuthSession(
        teacher_id=teacher.id,
        refresh_token_hash=refresh_hash,
        expires_at=refresh_expiry(),
    )
    db.add(sess)
    db.commit()

    return TokenOut(access_token=access, refresh_token=refresh)


@router.post("/logout")
def logout(payload: LogoutIn, db: Session = Depends(get_db)):
    refresh_hash = hash_refresh(payload.refresh_token)
    sess = db.query(AuthSession).filter(AuthSession.refresh_token_hash == refresh_hash).first()
    if not sess:
        # idempotent logout
        return {"ok": True}

    if sess.revoked_at is None:
        sess.revoked_at = datetime.now(timezone.utc)
        db.add(sess)
        db.commit()

    return {"ok": True}


@router.post("/refresh", response_model=AccessOut)
def refresh(payload: RefreshIn, db: Session = Depends(get_db)):
    refresh_hash = hash_refresh(payload.refresh_token)

    sess = db.query(AuthSession).filter(AuthSession.refresh_token_hash == refresh_hash).first()
    if not sess:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    now = datetime.now(timezone.utc)
    if sess.revoked_at is not None:
        raise HTTPException(status_code=401, detail="Refresh token revoked")
    if sess.expires_at < now:
        raise HTTPException(status_code=401, detail="Refresh token expired")

    access = create_access_token(sub=str(sess.teacher_id))
    return AccessOut(access_token=access)
