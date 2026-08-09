from __future__ import annotations

from typing import Dict, Optional


class AuthService:
    """In-memory authentication service for Sprint 3 demo sessions."""

    def __init__(self, token_store: Optional[Dict[str, str]] = None):
        self.token_store: Dict[str, str] = token_store or {
            "token-alice": "alice",
            "token-bob": "bob",
        }

    def validate_token(self, token: str) -> bool:
        """Return True when the supplied token is known and valid."""
        if not token or not token.strip():
            return False
        return token in self.token_store

    def get_user_from_token(self, token: str) -> str | None:
        """Resolve a user identifier from a token, if present in the store."""
        if not token or not token.strip():
            return None
        return self.token_store.get(token)

    def issue_demo_token(self, user_id: str) -> str:
        """Generate a deterministic demo token for a user identifier."""
        normalized_user_id = user_id.strip()
        if not normalized_user_id:
            raise ValueError("user_id must not be empty.")

        token = f"token-{normalized_user_id}"
        self.token_store[token] = normalized_user_id
        return token
