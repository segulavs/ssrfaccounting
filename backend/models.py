from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime, Table, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, date
import secrets

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


# Portfolio/Investment App Models

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    subscriptions = relationship("Subscription", back_populates="user")


class Invitation(Base):
    __tablename__ = "invitations"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    invited_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    invited_by = relationship("User", foreign_keys=[invited_by_id])
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.token:
            self.token = secrets.token_urlsafe(32)


class Portfolio(Base):
    __tablename__ = "portfolios"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    initial_value = Column(Float, default=0.0)
    current_value = Column(Float, default=0.0)
    currency = Column(String(3), default="EUR")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    performance_records = relationship("PortfolioPerformance", back_populates="portfolio", cascade="all, delete-orphan")
    investments = relationship("Investment", back_populates="portfolio", cascade="all, delete-orphan")


class PortfolioPerformance(Base):
    __tablename__ = "portfolio_performance"
    
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    value = Column(Float, nullable=False)
    return_percentage = Column(Float, nullable=True)  # Percentage return since inception
    created_at = Column(DateTime, default=datetime.utcnow)
    
    portfolio = relationship("Portfolio", back_populates="performance_records")


class InvestmentOpportunity(Base):
    __tablename__ = "investment_opportunities"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    investment_amount = Column(Float, nullable=True)  # Required investment amount
    currency = Column(String(3), default="EUR")
    type = Column(String, nullable=False, index=True)  # real_estate, private_equity, building_loan
    status = Column(String, default="open")  # open, closed, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    documents = relationship("OpportunityDocument", back_populates="opportunity", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="opportunity")
    investments = relationship("Investment", back_populates="opportunity")


class OpportunityDocument(Base):
    __tablename__ = "opportunity_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("investment_opportunities.id"), nullable=False, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=True)  # Size in bytes
    mime_type = Column(String, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    opportunity = relationship("InvestmentOpportunity", back_populates="documents")


class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    opportunity_id = Column(Integer, ForeignKey("investment_opportunities.id"), nullable=False, index=True)
    subscribed_amount = Column(Float, nullable=True)  # Amount user wants to invest
    status = Column(String, default="pending")  # pending, approved, rejected, completed
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="subscriptions")
    opportunity = relationship("InvestmentOpportunity", back_populates="subscriptions")
    investment = relationship("Investment", back_populates="subscription", uselist=False)  # One-to-one: subscription becomes investment


class Investment(Base):
    __tablename__ = "investments"
    
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False, index=True)
    opportunity_id = Column(Integer, ForeignKey("investment_opportunities.id"), nullable=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=True, index=True)  # Track origin subscription
    name = Column(String, nullable=False, index=True)  # Investment name/description
    description = Column(Text, nullable=True)
    initial_amount = Column(Float, nullable=False)  # Amount invested
    current_value = Column(Float, nullable=True)  # Current market value
    currency = Column(String(3), default="EUR")
    type = Column(String, nullable=False, index=True)  # real_estate, private_equity, building_loan
    investment_date = Column(Date, nullable=False, index=True)  # Date of investment
    status = Column(String, default="active")  # active, sold, written_off, etc.
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    portfolio = relationship("Portfolio", back_populates="investments")
    opportunity = relationship("InvestmentOpportunity", back_populates="investments")
    subscription = relationship("Subscription", back_populates="investment")