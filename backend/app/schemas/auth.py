"""Authentication request and response schemas."""

from __future__ import annotations

from pydantic import BaseModel, Field

from app.schemas.user import UserProfile


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50, description="Unique username")
    password: str = Field(min_length=4, max_length=100, description="Password")


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=100)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile
