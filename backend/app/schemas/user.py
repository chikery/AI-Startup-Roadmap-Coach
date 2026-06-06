from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserUpdate(BaseModel):
    item_keyword: Optional[str] = None
    startup_stage: Optional[str] = None
    region: Optional[str] = None
    category: Optional[str] = None
    has_team: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    item_keyword: Optional[str]
    startup_stage: Optional[str]
    region: Optional[str]
    category: Optional[str]
    has_team: Optional[str]

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
