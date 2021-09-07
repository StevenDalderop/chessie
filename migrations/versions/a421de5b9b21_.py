"""empty message

Revision ID: a421de5b9b21
Revises: de6f2dcd0937
Create Date: 2021-09-02 10:11:47.927485

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a421de5b9b21'
down_revision = 'de6f2dcd0937'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user_details', schema=None) as batch_op:
        batch_op.alter_column('color',
               existing_type=sa.VARCHAR(length=100),
               nullable=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user_details', schema=None) as batch_op:
        batch_op.alter_column('color',
               existing_type=sa.VARCHAR(length=100),
               nullable=True)

    # ### end Alembic commands ###
