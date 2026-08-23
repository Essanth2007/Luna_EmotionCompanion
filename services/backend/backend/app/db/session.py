from app.db.database import SessionLocal


def get_db():
    """Yield a database session, rolling back on exception and always closing."""
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
