# app/utils/otp_delivery.py
import os

def send_otp(channel: str, destination: str, otp: str) -> None:
    """
    Swap logic here later:
    - dev: return/log OTP
    - prod: SMS provider call (Twilio/MSG91/etc) OR email
    """
    if os.environ.get("OTP_DEV_RETURN", "1") == "1":
        # dev mode: backend logs
        print(f"[DEV OTP] {channel} -> {destination} : {otp}")
        return

    # prod placeholder: implement provider
    # if channel == "phone": send_sms(destination, otp)
    # elif channel == "email": send_email(destination, otp)
    raise RuntimeError("OTP delivery not configured (set OTP_DEV_RETURN=1 for dev).")
