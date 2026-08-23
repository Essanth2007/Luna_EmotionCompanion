"""add emotions

Revision ID: 3a7b8c9d0e1f
Revises: 0fc99ea2f1fd
"""

from alembic import op
import sqlalchemy as sa


revision = "3a7b8c9d0e1f"
down_revision = "0fc99ea2f1fd"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "emotions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("emotion", sa.String(length=50), nullable=False),
        sa.Column("intensity", sa.Integer(), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_emotions_id", "emotions", ["id"], unique=False)
    op.create_index("ix_emotions_user_id", "emotions", ["user_id"], unique=False)
    op.create_index(
        "ix_emotions_user_created_at",
        "emotions",
        ["user_id", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_emotions_user_created_at", table_name="emotions")
    op.drop_index("ix_emotions_user_id", table_name="emotions")
    op.drop_index("ix_emotions_id", table_name="emotions")
    op.drop_table("emotions")