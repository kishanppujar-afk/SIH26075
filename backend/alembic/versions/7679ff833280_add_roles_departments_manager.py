"""add_roles_departments_manager

Revision ID: 7679ff833280
Revises: a523e335f9b2
Create Date: 2026-09-27 23:36:18.261668

"""
from typing import Sequence, Union
from datetime import datetime, timezone
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7679ff833280'
down_revision: Union[str, Sequence[str], None] = 'a523e335f9b2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    # 1. Create departments table if not exists
    if 'departments' not in tables:
        op.create_table(
            'departments',
            sa.Column('id', sa.String(length=50), nullable=False),
            sa.Column('name', sa.String(length=100), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('name')
        )

        departments_table = sa.table(
            'departments',
            sa.column('id', sa.String),
            sa.column('name', sa.String),
            sa.column('created_at', sa.DateTime),
        )
        now = datetime.now(timezone.utc)
        op.bulk_insert(
            departments_table,
            [
                {'id': 'labour-statistics', 'name': 'Labour Statistics', 'created_at': now},
                {'id': 'price-statistics', 'name': 'Price Statistics', 'created_at': now},
                {'id': 'national-accounts', 'name': 'National Accounts', 'created_at': now},
                {'id': 'survey-design', 'name': 'Survey Design', 'created_at': now},
            ]
        )

    # 2. Handle employees table
    if 'employees' not in tables:
        # Fresh database: create all tables from Base metadata
        from app.core.database import Base
        import app.models  # noqa
        Base.metadata.create_all(bind=conn)
    else:
        cols = [c['name'] for c in inspector.get_columns('employees')]
        with op.batch_alter_table('employees', schema=None) as batch_op:
            if 'role' not in cols:
                batch_op.add_column(sa.Column('role', sa.String(length=20), nullable=False, server_default='employee'))
            if 'department_id' not in cols:
                batch_op.add_column(sa.Column('department_id', sa.String(length=50), nullable=True))
                batch_op.create_foreign_key('fk_employees_department_id', 'departments', ['department_id'], ['id'])
            if 'manager_id' not in cols:
                batch_op.add_column(sa.Column('manager_id', sa.String(length=50), nullable=True))
                batch_op.create_foreign_key('fk_employees_manager_id', 'employees', ['manager_id'], ['id'])

        op.execute(
            "UPDATE employees SET role = 'employee', department_id = 'labour-statistics' WHERE id = 'EMP-2048'"
        )


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    if 'employees' in tables:
        cols = [c['name'] for c in inspector.get_columns('employees')]
        with op.batch_alter_table('employees', schema=None) as batch_op:
            if 'manager_id' in cols:
                try:
                    batch_op.drop_constraint('fk_employees_manager_id', type_='foreignkey')
                except Exception:
                    pass
                batch_op.drop_column('manager_id')
            if 'department_id' in cols:
                try:
                    batch_op.drop_constraint('fk_employees_department_id', type_='foreignkey')
                except Exception:
                    pass
                batch_op.drop_column('department_id')
            if 'role' in cols:
                batch_op.drop_column('role')

    if 'departments' in tables:
        op.drop_table('departments')
