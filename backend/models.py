from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    transactions = relationship("Transaction", back_populates="project")
    cash_transactions = relationship("CashTransaction", back_populates="project")


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
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True, index=True)
    upload_batch_id = Column(String, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="transactions")


class CashTransaction(Base):
    __tablename__ = "cash_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="EUR")
    description = Column(Text, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="cash_transactions")
