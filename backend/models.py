from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime, Table
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

# Association table for many-to-many relationship between transactions and projects
transaction_projects = Table(
    'transaction_projects',
    Base.metadata,
    Column('transaction_id', Integer, ForeignKey('transactions.id'), primary_key=True),
    Column('project_id', Integer, ForeignKey('projects.id'), primary_key=True)
)

# Association table for many-to-many relationship between cash_transactions and projects
cash_transaction_projects = Table(
    'cash_transaction_projects',
    Base.metadata,
    Column('cash_transaction_id', Integer, ForeignKey('cash_transactions.id'), primary_key=True),
    Column('project_id', Integer, ForeignKey('projects.id'), primary_key=True)
)


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    transactions = relationship("Transaction", back_populates="project", foreign_keys="Transaction.project_id")
    cash_transactions = relationship("CashTransaction", back_populates="project", foreign_keys="CashTransaction.project_id")
    transaction_associations = relationship("Transaction", secondary=transaction_projects, back_populates="projects")
    cash_transaction_associations = relationship("CashTransaction", secondary=cash_transaction_projects, back_populates="projects")


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="EUR")
    reference = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    account_number = Column(String, nullable=True)
    statement_number = Column(String, nullable=True)
    raw_data = Column(Text, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True, index=True)  # Keep for backward compatibility
    upload_batch_id = Column(String, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="transactions", foreign_keys=[project_id])
    projects = relationship("Project", secondary=transaction_projects, back_populates="transaction_associations")  # Many-to-many


class CashTransaction(Base):
    __tablename__ = "cash_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="EUR")
    description = Column(Text, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True, index=True)  # Keep for backward compatibility
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="cash_transactions", foreign_keys=[project_id])
    projects = relationship("Project", secondary=cash_transaction_projects, back_populates="cash_transaction_associations")  # Many-to-many
