from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.security import hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import ChangePasswordRequest, UserResponse, UserUpdate

router = APIRouter()


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get user profile",
    description="Returns the profile of the currently authenticated user.",
)
def get_profile(current_user: User = Depends(get_current_user)):
    """Return the current user's profile."""
    return current_user


@router.patch(
    "/me",
    response_model=UserResponse,
    summary="Update user profile",
    description="Update the authenticated user's name and/or email address.",
)
def update_profile(
    profile: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Partially update the current user's profile. At least one field must be provided."""
    updates = profile.model_dump(exclude_unset=True)

    if "email" in updates:
        existing_user = (
            db.query(User)
            .filter(
                User.email == updates["email"],
                User.id != current_user.id,
            )
            .first()
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists",
            )

    for field, value in updates.items():
        setattr(current_user, field, value)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists",
        ) from exc

    db.refresh(current_user)
    return current_user


@router.patch(
    "/me/password",
    summary="Change password",
    description="Change the authenticated user's password. Requires the current password.",
)
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Change the current user's password. Returns 400 if the current password is wrong."""
    if not verify_password(request.current_password, str(current_user.password_hash)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    current_user.password_hash = hash_password(request.new_password)  # type: ignore[assignment]
    db.commit()
    return {"message": "Password updated successfully"}


@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete user account",
    description=(
        "Permanently delete the authenticated user's account and all associated data "
        "(emotions, conversations, messages) via cascade."
    ),
)
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete the current user account. Cascades to all owned resources."""
    db.delete(current_user)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
