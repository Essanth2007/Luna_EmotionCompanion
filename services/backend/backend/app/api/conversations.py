from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.hardening import rate_limit
from app.db.session import get_db
from app.models.conversation import Conversation
from app.models.user import User
from app.schemas.conversation import (
    ChatResponse,
    ConversationCreate,
    ConversationDetailResponse,
    ConversationResponse,
    MessageCreate,
)
from app.services.chat import ChatProviderError, ChatService, create_chat_provider

router = APIRouter()


def get_chat_service() -> ChatService:
    try:
        return ChatService(create_chat_provider())
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Chat provider is currently unavailable",
        ) from exc


def get_owned_conversation(conversation_id: int, current_user: User, db: Session) -> Conversation:
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
        .first()
    )
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return conversation


@router.post(
    "",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a conversation",
    description="Create a new conversation thread for the authenticated user.",
)
def create_conversation(
    conversation_data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new conversation. Returns 201 with the created conversation."""
    conversation = Conversation(
        user_id=current_user.id,
        title=conversation_data.title or "New conversation",
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


@router.get(
    "",
    response_model=list[ConversationResponse],
    summary="List conversations",
    description="Return all conversations for the authenticated user, most recently updated first.",
)
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all conversations for the current user, ordered by most recently updated."""
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc(), Conversation.id.desc())
        .all()
    )


@router.get(
    "/{conversation_id}",
    response_model=ConversationDetailResponse,
    summary="Get a conversation with messages",
    description="Retrieve a specific conversation and its full message history.",
)
def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return a conversation and all its messages. Returns 404 if not owned by the user."""
    return get_owned_conversation(conversation_id, current_user, db)


@router.delete(
    "/{conversation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a conversation",
    description="Delete a conversation and all its messages via cascade.",
)
def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a conversation by ID. Cascades to messages. Returns 204 on success."""
    conversation = get_owned_conversation(conversation_id, current_user, db)
    db.delete(conversation)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{conversation_id}/messages",
    response_model=ChatResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit("chat-message", 60))],
    summary="Send a chat message",
    description=(
        "Send a message in a conversation and receive an AI-generated reply. "
        "Returns 502 if the AI provider is unavailable."
    ),
)
def send_message(
    conversation_id: int,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service),
):
    """Send a user message and get an AI assistant reply. Returns 201 with both messages."""
    conversation = get_owned_conversation(conversation_id, current_user, db)
    try:
        user_message, assistant_message = chat_service.generate_and_store(
            conversation,
            message_data.content,
            db,
        )
    except ChatProviderError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Chat provider is currently unavailable",
        ) from exc

    return ChatResponse(
        conversation_id=int(conversation.id),
        user_message=user_message,
        assistant_message=assistant_message,
    )
