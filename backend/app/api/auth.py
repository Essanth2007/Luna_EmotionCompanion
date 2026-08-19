import logging

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.hardening import rate_limit
from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    oauth2_scheme,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.login import TokenResponse
from app.schemas.user import UserCreate, UserResponse

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit("register", 20))],
    summary="Register a new user account",
    description=(
        "Create a new user account with name, email, and password. "
        "Returns the created user profile. Email must be unique."
    ),
)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user. Returns 201 on success, 400 if the email is already registered."""
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists",
        )

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
    )
    db.add(new_user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists",
        ) from exc

    db.refresh(new_user)
    return new_user


@router.post(
    "/login",
    response_model=TokenResponse,
    dependencies=[Depends(rate_limit("login", 30))],
    summary="Obtain a JWT access token",
    description=(
        "Authenticate with email (as 'username') and password using OAuth2 form-data. "
        "Returns a Bearer JWT token valid for the configured expiry period."
    ),
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Login with email + password. Returns a JWT access token on success."""
    user = db.query(User).filter(User.email == form_data.username).first()

    # Use a generic reason in logs to avoid distinguishing unknown user vs wrong password
    if not user or not verify_password(form_data.password, str(user.password_hash)):
        logging.getLogger("luna.security").warning(
            "auth.login_failed", extra={"reason": "invalid_credentials"}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(subject=str(user.email))
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Dependency: decode JWT and return the authenticated User, or raise 401."""
    payload = decode_access_token(token)

    email = payload.get("sub")
    if not email:
        logging.getLogger("luna.security").warning(
            "auth.token_invalid", extra={"reason": "missing_subject"}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        logging.getLogger("luna.security").warning("auth.user_not_found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    return user


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the authenticated user's profile",
    description="Returns the profile of the currently authenticated user.",
)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the current user's profile."""
    return current_user
