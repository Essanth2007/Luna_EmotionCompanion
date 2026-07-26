class CommunicationError(Exception):
    """
    Base exception for all communication-related errors.
    """
    pass


class ConnectionError(CommunicationError):
    """
    Raised when a WebSocket connection fails.
    """
    pass


class UserNotConnectedError(CommunicationError):
    """
    Raised when attempting to communicate with a disconnected user.
    """
    pass


class RoomNotFoundError(CommunicationError):
    """
    Raised when a room does not exist.
    """
    pass


class RoomAlreadyExistsError(CommunicationError):
    """
    Raised when attempting to create an existing room.
    """
    pass


class InvalidSignalingMessageError(CommunicationError):
    """
    Raised when a signaling message is invalid.
    """
    pass


class NotificationError(CommunicationError):
    """
    Raised when notification delivery fails.
    """
    pass