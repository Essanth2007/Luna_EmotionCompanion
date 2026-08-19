from pydantic import BaseModel, EmailStr, Field, model_validator


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, description="Minimum 8 characters")


class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None

    @model_validator(mode="after")
    def require_update_field(self) -> "UserUpdate":
        if self.name is None and self.email is None:
            raise ValueError("At least one profile field is required")
        return self


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)
