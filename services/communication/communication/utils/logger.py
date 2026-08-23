import logging
from pathlib import Path


# Create logs directory if it does not exist
Path("logs").mkdir(exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[
        logging.FileHandler("logs/communication.log"),
        logging.StreamHandler(),
    ],
)


def get_logger(name: str):
    """
    Return a configured logger.
    """
    return logging.getLogger(name)