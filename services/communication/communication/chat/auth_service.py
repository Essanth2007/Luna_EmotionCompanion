from __future__ import annotations

import os
from typing import Dict, Optional

from jose import JWTError, jwt


class AuthService:
    """WebSocket authentication service.

    Supports two token types so the communication layer can be used both
    as a standalone demo (in-memory demo tokens) and as part of the full
    Luna product where the backend issues JWTs:

    1. Demo tokens such as ``token-alice`` (used by the test suite and
       quick manual demos).
    2. Real backend JWTs (HS256). When a JWT is supplied we verify the
       signature with the shared ``SECRET_KEY`` and trust the ``sub``
       claim as the user identity.
    """

    def __init__(self, token_store: Optional[Dict[str, str]] = None):
        self.token_store: Dict[str, str] = token_store or {
            "token-alice": "alice",
            "token-bob": "bob",
        }
        self.secret_key = os.getenv("SECRET_KEY", "")
        self.algorithm = os.getenv("ALGORITHM", "HS256")

    # ----------------------------------------------------------------
    # Demo tokens
    # ----------------------------------------------------------------

    def validate_token(self, token: str) -> bool:
        """Return True when the supplied token is known and valid."""
        if not token or not token.strip():
            return False
        if token in self.token_store:
            return True
        # Fall back to validating a real backend JWT.
        return self._decode_jwt(token) is not None

    def get_user_from_token(self, token: str) -> str | None:
        """Resolve a user identifier from a token, if present."""
        if not token or not token.strip():
            return None
        if token in self.token_store:
            return self.token_store.get(token)
        payload = self._decode_jwt(token)
        if payload is None:
            return None
        return payload.get("sub")

    def issue_demo_token(self, user_id: str) -> str:
        """Generate a deterministic demo token for a user identifier."""
        normalized_user_id = user_id.strip()
        if not normalized_user_id:
            raise ValueError("user_id must not be empty.")

        token = f"token-{normalized_user_id}"
        self.token_store[token] = normalized_user_id
        return token

    # ----------------------------------------------------------------
    # Backend JWT
    # ----------------------------------------------------------------

    def _decode_jwt(self, token: str) -> Optional[dict]:
        if not self.secret_key:
            return None
        try:
            return jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
        except JWTError:
            return None
