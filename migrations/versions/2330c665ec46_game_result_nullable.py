"""game result nullable

Revision ID: 2330c665ec46
Revises: bb31db626049
Create Date: 2021-09-03 10:38:56.975312

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2330c665ec46'
down_revision = 'bb31db626049'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('game', schema=None) as batch_op:
        batch_op.alter_column('result',
               existing_type=sa.VARCHAR(),
               nullable=True)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('game', schema=None) as batch_op:
        batch_op.alter_column('result',
               existing_type=sa.VARCHAR(),
               nullable=False)

    # ### end Alembic commands ###
