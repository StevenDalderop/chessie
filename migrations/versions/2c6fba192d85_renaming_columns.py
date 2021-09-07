"""renaming columns

Revision ID: 2c6fba192d85
Revises: 2cdf6dc336b8
Create Date: 2021-09-03 10:29:17.562606

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2c6fba192d85'
down_revision = '2cdf6dc336b8'
branch_labels = None
depends_on = None

def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('game', schema=None) as batch_op:
        batch_op.alter_column('type_pk', new_column_name='type')
        batch_op.alter_column('result_pk', nullable=False, new_column_name='result')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('game', schema=None) as batch_op:
        batch_op.alter_column('type', new_column_name='type_pk')
        batch_op.alter_column('result', nullable=True, new_column_name='result_pk')