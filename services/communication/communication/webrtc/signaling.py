from typing import Dict, Any


class SignalingManager:
    """
    Handles WebRTC signaling messages.

    Supported signaling types:
    - Offer
    - Answer
    - ICE Candidate
    """

    OFFER = "offer"
    ANSWER = "answer"
    ICE_CANDIDATE = "ice_candidate"

    VALID_MESSAGE_TYPES = {
        OFFER,
        ANSWER,
        ICE_CANDIDATE,
    }

    REQUIRED_FIELDS = {
        "type",
        "room_id",
        "sender",
        "receiver",
    }

    @staticmethod
    def create_offer(
        room_id: str,
        sender: str,
        receiver: str,
        sdp: Any,
    ) -> Dict[str, Any]:
        """
        Create an SDP Offer message.
        """

        return {
            "type": SignalingManager.OFFER,
            "room_id": room_id,
            "sender": sender,
            "receiver": receiver,
            "sdp": sdp,
        }

    @staticmethod
    def create_answer(
        room_id: str,
        sender: str,
        receiver: str,
        sdp: Any,
    ) -> Dict[str, Any]:
        """
        Create an SDP Answer message.
        """

        return {
            "type": SignalingManager.ANSWER,
            "room_id": room_id,
            "sender": sender,
            "receiver": receiver,
            "sdp": sdp,
        }

    @staticmethod
    def create_ice_candidate(
        room_id: str,
        sender: str,
        receiver: str,
        candidate: Any,
    ) -> Dict[str, Any]:
        """
        Create an ICE Candidate message.
        """

        return {
            "type": SignalingManager.ICE_CANDIDATE,
            "room_id": room_id,
            "sender": sender,
            "receiver": receiver,
            "candidate": candidate,
        }

    @staticmethod
    def validate_message(message: Dict[str, Any]) -> bool:
        """
        Validate a signaling message.
        """

        if not isinstance(message, dict):
            return False

        if not SignalingManager.REQUIRED_FIELDS.issubset(message.keys()):
            return False

        if message["type"] not in SignalingManager.VALID_MESSAGE_TYPES:
            return False

        if not message["room_id"]:
            return False

        if not message["sender"]:
            return False

        if not message["receiver"]:
            return False

        return True

    @staticmethod
    def parse_message(message: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse and validate an incoming signaling message.
        Raises ValueError if the message is invalid.
        """

        if not SignalingManager.validate_message(message):
            raise ValueError("Invalid signaling message.")

        return message

    @staticmethod
    def get_message_type(message: Dict[str, Any]) -> str:
        """
        Return the signaling message type.
        """

        return message.get("type", "")

    @staticmethod
    def is_offer(message: Dict[str, Any]) -> bool:
        return message.get("type") == SignalingManager.OFFER

    @staticmethod
    def is_answer(message: Dict[str, Any]) -> bool:
        return message.get("type") == SignalingManager.ANSWER

    @staticmethod
    def is_ice_candidate(message: Dict[str, Any]) -> bool:
        return message.get("type") == SignalingManager.ICE_CANDIDATE