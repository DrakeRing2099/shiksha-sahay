from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest
from jose import jwt

from app.models.auth import OTPCode, AuthSession
from app.models.core import Teacher
from app.utils.auth import hash_otp, verify_otp_hash, create_access_token
from app.api.auth import _normalize_dest

from app.models.core import Teacher
from app.models.auth import OTPCode


# -----------------------
# 1) Unit tests (utils)
# -----------------------

def test_hashing_consistency(monkeypatch):
    monkeypatch.setenv("OTP_PEPPER", "pepper123")
    h1 = hash_otp("user", "123456")
    h2 = hash_otp("user", "123456")
    assert h1 == h2


def test_verify_otp_hash_logic(monkeypatch):
    monkeypatch.setenv("OTP_PEPPER", "pepper123")

    good = hash_otp("userA", "123456")
    assert verify_otp_hash("userA", "123456", good) is True
    assert verify_otp_hash("userA", "000000", good) is False
    assert verify_otp_hash("userB", "123456", good) is False


def test_token_generation(monkeypatch):
    monkeypatch.setenv("AUTH_JWT_SECRET", "secret")
    monkeypatch.setenv("AUTH_JWT_ALG", "HS256")
    monkeypatch.setenv("AUTH_ACCESS_MIN", "30")

    before = datetime.now(timezone.utc)
    token = create_access_token(sub="teacher-id-123")
    decoded = jwt.decode(token, "secret", algorithms=["HS256"])
    after = datetime.now(timezone.utc)

    assert decoded["sub"] == "teacher-id-123"
    assert decoded["type"] == "access"

    # exp is around now + 30 minutes (allow some drift)
    exp = datetime.fromtimestamp(decoded["exp"], tz=timezone.utc)
    assert (before + timedelta(minutes=29)) <= exp <= (after + timedelta(minutes=31))


# -----------------------
# Helpers
# -----------------------

def _mk_teacher(db_session, phone="+919999999999", email="test@school.com", name="T"):
    t = Teacher(name=name, phone=phone, email=email)
    db_session.add(t)
    db_session.commit()
    return t


# -----------------------
# 2) Happy path integration
# -----------------------

def test_request_otp_success(client, db_session):
    _mk_teacher(db_session)

    resp = client.post("/auth/request-otp", json={"channel": "phone", "destination": "+919999999999"})
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("ok") is True
    assert data.get("dev_otp") is not None

    row = db_session.query(OTPCode).filter(OTPCode.destination == "+919999999999").first()
    assert row is not None


def test_verify_otp_success_marks_used(client, db_session):
    _mk_teacher(db_session)

    r = client.post("/auth/request-otp", json={"channel": "phone", "destination": "+919999999999"})
    otp = r.json()["dev_otp"]

    v = client.post("/auth/verify-otp", json={"channel": "phone", "destination": "+919999999999", "otp": otp})
    assert v.status_code == 200
    out = v.json()
    assert "access_token" in out
    assert "refresh_token" in out

    row = db_session.query(OTPCode).filter(OTPCode.destination == "+919999999999").order_by(OTPCode.created_at.desc()).first()
    assert row.used_at is not None


def test_logout_revokes_session(client, db_session):
    _mk_teacher(db_session)

    otp = client.post("/auth/request-otp", json={"channel": "phone", "destination": "+919999999999"}).json()["dev_otp"]
    out = client.post("/auth/verify-otp", json={"channel": "phone", "destination": "+919999999999", "otp": otp}).json()
    refresh = out["refresh_token"]

    resp = client.post("/auth/logout", json={"refresh_token": refresh})
    assert resp.status_code == 200

    sess = db_session.query(AuthSession).first()
    assert sess is not None
    assert sess.revoked_at is not None


# -----------------------
# 3) Edge cases & security
# -----------------------

def test_nonexistent_user_request_otp(client):
    resp = client.post("/auth/request-otp", json={"channel": "phone", "destination": "+911111111111"})
    assert resp.status_code == 404


def test_expired_otp(client, db_session):
    _mk_teacher(db_session)

    r = client.post("/auth/request-otp", json={"channel": "phone", "destination": "+919999999999"})
    otp = r.json()["dev_otp"]

    row = db_session.query(OTPCode).filter(OTPCode.destination == "+919999999999").order_by(OTPCode.created_at.desc()).first()
    row.expires_at = datetime.now(timezone.utc) - timedelta(minutes=1)
    db_session.add(row)
    db_session.commit()

    v = client.post("/auth/verify-otp", json={"channel": "phone", "destination": "+919999999999", "otp": otp})
    assert v.status_code == 400
    assert "expired" in v.text.lower()


def test_replay_attack_used_otp(client, db_session):
    _mk_teacher(db_session)

    otp = client.post("/auth/request-otp", json={"channel": "phone", "destination": "+919999999999"}).json()["dev_otp"]
    first = client.post("/auth/verify-otp", json={"channel": "phone", "destination": "+919999999999", "otp": otp})
    assert first.status_code == 200

    second = client.post("/auth/verify-otp", json={"channel": "phone", "destination": "+919999999999", "otp": otp})
    assert second.status_code == 400
    assert "used" in second.text.lower()


def test_bruteforce_protection(client, db_session):
    _mk_teacher(db_session)

    otp = client.post("/auth/request-otp", json={"channel": "phone", "destination": "+919999999999"}).json()["dev_otp"]

    # wrong 5 times
    for _ in range(5):
        r = client.post("/auth/verify-otp", json={"channel": "phone", "destination": "+919999999999", "otp": "000000"})
        assert r.status_code == 400

    # correct on 6th -> should be blocked (429)
    sixth = client.post("/auth/verify-otp", json={"channel": "phone", "destination": "+919999999999", "otp": otp})
    assert sixth.status_code in (429, 400)


def test_cross_user_attack(client, db_session):
    _mk_teacher(db_session, phone="+919999999999", email="a@school.com", name="A")
    _mk_teacher(db_session, phone="+918888888888", email="b@school.com", name="B")

    otp_a = client.post("/auth/request-otp", json={"channel": "phone", "destination": "+919999999999"}).json()["dev_otp"]

    # try using A's OTP with B's phone
    resp = client.post("/auth/verify-otp", json={"channel": "phone", "destination": "+918888888888", "otp": otp_a})
    assert resp.status_code in (400, 404)


# -----------------------
# 4) SMS/OTP hygiene
# -----------------------

def test_request_throttling(client, db_session, monkeypatch):
    monkeypatch.setenv("OTP_REQUEST_COOLDOWN_SEC", "60")
    _mk_teacher(db_session)

    first = client.post("/auth/request-otp", json={"channel": "phone", "destination": "+919999999999"})
    assert first.status_code == 200

    second = client.post("/auth/request-otp", json={"channel": "phone", "destination": "+919999999999"})
    assert second.status_code == 429


def test_phone_normalization_logic():
    inputs = ["+91 98765 12345", "98765-12345", "09876512345"]
    for num in inputs:
        assert _normalize_dest("phone", num) == "+919876512345"


def test_request_otp_calls_provider(client, db_session):
    _mk_teacher(db_session)

    with patch("app.api.auth.send_otp") as mock_send:
        resp = client.post("/auth/request-otp", json={"channel": "phone", "destination": "+91 99999 99999"})
        assert resp.status_code == 200
        mock_send.assert_called_once()
        args = mock_send.call_args[0]
        assert args[0] == "phone"
        assert args[1] == "+919999999999"


# -----------------------
# 5) Session tests (/refresh)
# -----------------------

def test_refresh_token_flow(client, db_session):
    _mk_teacher(db_session)

    otp = client.post("/auth/request-otp", json={"channel": "phone", "destination": "+919999999999"}).json()["dev_otp"]
    tokens = client.post("/auth/verify-otp", json={"channel": "phone", "destination": "+919999999999", "otp": otp}).json()
    refresh = tokens["refresh_token"]

    r = client.post("/auth/refresh", json={"refresh_token": refresh})
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data


def test_revoked_refresh_token_usage(client, db_session):
    _mk_teacher(db_session)

    otp = client.post("/auth/request-otp", json={"channel": "phone", "destination": "+919999999999"}).json()["dev_otp"]
    tokens = client.post("/auth/verify-otp", json={"channel": "phone", "destination": "+919999999999", "otp": otp}).json()
    refresh = tokens["refresh_token"]

    client.post("/auth/logout", json={"refresh_token": refresh})

    r = client.post("/auth/refresh", json={"refresh_token": refresh})
    assert r.status_code == 401


def test_signup_happy_path_creates_teacher_and_tokens(client, db_session):
    payload = {
        "name": "New Teacher",
        "phone": "+917777777777",
        "email": "newteacher@school.com"
    }

    r = client.post("/auth/signup/request-otp", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data.get("ok") is True
    otp = data.get("dev_otp")
    assert otp is not None

    # teacher exists, onboarding_status=0 before verify
    t = db_session.query(Teacher).filter(Teacher.phone == "+917777777777").first()
    assert t is not None
    assert int(t.onboarding_status) == 0

    # otp row exists
    code = (
        db_session.query(OTPCode)
        .filter(OTPCode.destination == "+917777777777")
        .order_by(OTPCode.created_at.desc())
        .first()
    )
    assert code is not None
    assert code.used_at is None

    # verify otp -> tokens
    v = client.post("/auth/signup/verify-otp", json={"phone": "+917777777777", "otp": otp})
    assert v.status_code == 200
    out = v.json()
    assert "access_token" in out
    assert "refresh_token" in out

    # onboarding_status flips to 1
    db_session.refresh(t)
    assert int(t.onboarding_status) == 1


def test_signup_conflict_if_teacher_exists(client, db_session):
    # create existing teacher
    t = Teacher(name="Existing", phone="+916666666666", email="exists@school.com")
    db_session.add(t)
    db_session.commit()

    payload = {
        "name": "Someone",
        "phone": "+916666666666",
        "email": "new@school.com"
    }
    r = client.post("/auth/signup/request-otp", json=payload)
    assert r.status_code == 409

    payload2 = {
        "name": "Someone",
        "phone": "+915555555555",
        "email": "exists@school.com"
    }
    r2 = client.post("/auth/signup/request-otp", json=payload2)
    assert r2.status_code == 409


def test_signup_verify_wrong_otp_increments_attempts(client, db_session):
    payload = {
        "name": "Teacher X",
        "phone": "+914444444444",
        "email": "teachx@school.com"
    }
    r = client.post("/auth/signup/request-otp", json=payload)
    assert r.status_code == 200

    # wrong otp
    v = client.post("/auth/signup/verify-otp", json={"phone": "+914444444444", "otp": "000000"})
    assert v.status_code == 400

    code = (
        db_session.query(OTPCode)
        .filter(OTPCode.destination == "+914444444444")
        .order_by(OTPCode.created_at.desc())
        .first()
    )
    assert code.attempts == 1


def test_signup_verify_expired_otp(client, db_session):
    payload = {
        "name": "Teacher Y",
        "phone": "+913333333333",
        "email": "teachy@school.com"
    }
    r = client.post("/auth/signup/request-otp", json=payload)
    assert r.status_code == 200
    otp = r.json()["dev_otp"]

    code = (
        db_session.query(OTPCode)
        .filter(OTPCode.destination == "+913333333333")
        .order_by(OTPCode.created_at.desc())
        .first()
    )
    code.expires_at = datetime.now(timezone.utc) - timedelta(minutes=1)
    db_session.add(code)
    db_session.commit()

    v = client.post("/auth/signup/verify-otp", json={"phone": "+913333333333", "otp": otp})
    assert v.status_code == 400
    assert "expired" in v.text.lower()


def test_signup_replay_attack_used_otp(client, db_session):
    payload = {
        "name": "Teacher Z",
        "phone": "+912222222222",
        "email": "teachz@school.com"
    }
    otp = client.post("/auth/signup/request-otp", json=payload).json()["dev_otp"]

    first = client.post("/auth/signup/verify-otp", json={"phone": "+912222222222", "otp": otp})
    assert first.status_code == 200

    second = client.post("/auth/signup/verify-otp", json={"phone": "+912222222222", "otp": otp})
    assert second.status_code == 400
    assert "used" in second.text.lower()


def test_signup_request_throttling(client, db_session, monkeypatch):
    monkeypatch.setenv("OTP_REQUEST_COOLDOWN_SEC", "60")
    payload = {
        "name": "Teacher T",
        "phone": "+911111111111",
        "email": "teachert@school.com"
    }

    first = client.post("/auth/signup/request-otp", json=payload)
    assert first.status_code == 200

    second = client.post("/auth/signup/request-otp", json=payload)
    assert second.status_code == 429


