import atexit
import os
import tempfile
from pathlib import Path

import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

load_dotenv()

configured_database_url = os.getenv("DATABASE_URL")
test_database_url = os.getenv("TEST_DATABASE_URL")
temporary_database_path: Path | None = None

if test_database_url:
    if configured_database_url and test_database_url == configured_database_url:
        raise RuntimeError("TEST_DATABASE_URL must be separate from DATABASE_URL")
    os.environ["DATABASE_URL"] = test_database_url
else:
    temporary_database_path = Path(tempfile.gettempdir()) / f"luna_pytest_{os.getpid()}.db"
    os.environ["DATABASE_URL"] = f"sqlite:///{temporary_database_path.as_posix()}"

os.environ.setdefault("SECRET_KEY", "pytest-test-secret")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
os.environ["TESTING"] = "true"
os.environ["AI_PROVIDER"] = "mock"


def _remove_temporary_database() -> None:
    if temporary_database_path and temporary_database_path.exists():
        from app.db.database import engine

        engine.dispose()
        temporary_database_path.unlink()


atexit.register(_remove_temporary_database)


@pytest.fixture()
def client() -> TestClient:
    from app.db.database import Base, engine
    from app.db.session import get_db
    from app.main import app

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        db = testing_session_local()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
