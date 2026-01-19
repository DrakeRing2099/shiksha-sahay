# app/utils/auth.py
import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Tuple

from jose import jwt

# ENV:
# AUTH_JWT_SECRET=...
# AUTH_JWT_ALG=HS256
# AUTH_ACCESS_MIN=30
# AUTH_REFRESH_DAYS=14
# OTP_PEPPER=...
# OTP_TTL_MIN=5
# OTP_MAX_ATTEMPTS=5
# OTP_DEV_RETURN=1   (dev only)


def _now():
    return datetime.now(timezone.utc)


def gen_otp(n_digits: int = 6) -> str:
    # 6 digit numeric OTP
    return "".join(str(secrets.randbelow(10)) for _ in range(n_digits))


def hash_otp(destination: str, otp: str) -> str:
    pepper = os.environ.get("OTP_PEPPER", "dev-pepper-change-me")
    msg = f"{destination}|{otp}".encode("utf-8")
    key = pepper.encode("utf-8")
    return hmac.new(key, msg, hashlib.sha256).hexdigest()


def verify_otp_hash(destination: str, otp: str, otp_hash: str) -> bool:
    return hmac.compare_digest(hash_otp(destination, otp), otp_hash)


def create_access_token(sub: str) -> str:
    secret = os.environ.get("AUTH_JWT_SECRET", "dev-secret-change-me")
    alg = os.environ.get("AUTH_JWT_ALG", "HS256")
    mins = int(os.environ.get("AUTH_ACCESS_MIN", "30"))
    payload = {
        "sub": sub,
        "type": "access",
        "exp": _now() + timedelta(minutes=mins),
        "iat": _now(),
    }
    return jwt.encode(payload, secret, algorithm=alg)


def gen_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_refresh(token: str) -> str:
    # hash refresh token before storing
    pepper = os.environ.get("OTP_PEPPER", "dev-pepper-change-me")
    return hashlib.sha256((pepper + "|" + token).encode("utf-8")).hexdigest()


def refresh_expiry() -> datetime:
    days = int(os.environ.get("AUTH_REFRESH_DAYS", "14"))
    return _now() + timedelta(days=days)


def otp_expiry() -> datetime:
    mins = int(os.environ.get("OTP_TTL_MIN", "5"))
    return _now() + timedelta(minutes=mins)
