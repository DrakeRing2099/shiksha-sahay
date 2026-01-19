# app/schemas/auth.py
from pydantic import BaseModel, Field
from typing import Literal, Optional


Channel = Literal["phone", "email"]


class RequestOTPIn(BaseModel):
    channel: Channel = "phone"
    destination: str = Field(..., description="phone like +91... or email")


class VerifyOTPIn(BaseModel):
    channel: Channel = "phone"
    destination: str
    otp: str = Field(..., min_length=4, max_length=8)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str


class LogoutIn(BaseModel):
    refresh_token: str


class RefreshIn(BaseModel):
    refresh_token: str


class AccessOut(BaseModel):
    access_token: str
    token_type: str = "bearer"