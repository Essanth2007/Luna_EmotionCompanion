import logging
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set")

engine = create_engine(DATABASE_URL)


@event.listens_for(engine, "handle_error")
def log_database_error(exception_context):
    logging.getLogger("luna.database").error(
        "database.operation_failed",
        extra={"error_type": type(exception_context.original_exception).__name__},
    )


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()
