from pydantic import BaseModel
from typing import Optional, List, Union
from datetime import date, datetime


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class TransactionBase(BaseModel):
    date: date
    amount: float
    currency: str = "EUR"
    description: Optional[str] = None


class TransactionCreate(TransactionBase):
    reference: Optional[str] = None
    account_number: Optional[str] = None
    statement_number: Optional[str] = None


class TransactionUpdate(BaseModel):
    project_id: Optional[int] = None
    description: Optional[str] = None
    project_ids: Optional[List[int]] = None  # For multiple projects (amount split in calculations, not in UI)


class TransactionResponse(TransactionBase):
    id: int
    reference: Optional[str] = None
    account_number: Optional[str] = None
    statement_number: Optional[str] = None
    project_id: Optional[int] = None  # Keep for backward compatibility
    project: Optional[ProjectResponse] = None  # Keep for backward compatibility (first project)
    projects: Optional[List[ProjectResponse]] = None  # All projects assigned to this transaction
    upload_batch_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class CashTransactionBase(BaseModel):
    date: date
    amount: float
    currency: str = "EUR"
    description: Optional[str] = None
    project_id: Optional[int] = None


class CashTransactionCreate(CashTransactionBase):
    project_ids: Optional[List[int]] = None  # For multiple projects


class CashTransactionUpdate(BaseModel):
    project_id: Optional[int] = None
    description: Optional[str] = None
    project_ids: Optional[List[int]] = None  # For multiple projects (amount split in calculations, not in UI)


class CashTransactionResponse(CashTransactionBase):
    id: int
    project: Optional[ProjectResponse] = None  # Keep for backward compatibility (first project)
    projects: Optional[List[ProjectResponse]] = None  # All projects assigned to this transaction
    created_at: datetime
    
    class Config:
        from_attributes = True


class PeriodFilter(BaseModel):
    project_id: Optional[int] = None
    start_date: date
    end_date: date
    period_type: Optional[str] = None  # week, month, quarter, year


class ProjectStats(BaseModel):
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    income: float
    expenses: float
    net_amount: float
    transaction_count: int


class DashboardStats(BaseModel):
    project_id: Optional[int] = None
    start_date: date
    end_date: date
    total_income: float
    total_expenses: float
    net_amount: float
    bank_transaction_count: int
    cash_transaction_count: int
    transactions: List[Union[TransactionResponse, CashTransactionResponse]] = []
    project_stats: List[ProjectStats] = []


class CSVColumnMapping(BaseModel):
    date: Optional[str] = None
    amount: Optional[str] = None
    debit: Optional[str] = None
    credit: Optional[str] = None
    transaction_type: Optional[str] = None  # Column with "Debit" or "Credit" text values
    reference: Optional[str] = None
    description: Optional[str] = None
    currency: Optional[str] = None
    account_number: Optional[str] = None
    statement_number: Optional[str] = None


class CSVPreviewResponse(BaseModel):
    columns: List[str]
    sample_rows: List[dict]


class UploadBatchResponse(BaseModel):
    upload_batch_id: str
    upload_type: str  # "MT940" or "CSV"
    transaction_count: int
    created_at: datetime
    account_number: Optional[str] = None
    statement_number: Optional[str] = None


# Portfolio/Investment App Schemas

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str
    invitation_token: Optional[str] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[int] = None


class InvitationCreate(BaseModel):
    email: str


class InvitationResponse(BaseModel):
    id: int
    email: str
    token: str
    is_used: bool
    expires_at: datetime
    created_at: datetime
    invited_by_id: int
    
    class Config:
        from_attributes = True


class PortfolioBase(BaseModel):
    name: str
    description: Optional[str] = None
    initial_value: float = 0.0
    currency: str = "EUR"


class PortfolioCreate(PortfolioBase):
    pass


class PortfolioUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    current_value: Optional[float] = None
    is_active: Optional[bool] = None


class PortfolioResponse(PortfolioBase):
    id: int
    current_value: float
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PortfolioPerformanceCreate(BaseModel):
    portfolio_id: int
    date: date
    value: float
    return_percentage: Optional[float] = None


class PortfolioPerformanceResponse(BaseModel):
    id: int
    portfolio_id: int
    date: date
    value: float
    return_percentage: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class PortfolioPerformanceStats(BaseModel):
    portfolio_id: int
    portfolio_name: str
    current_value: float
    initial_value: float
    total_return: float
    total_return_percentage: float
    latest_date: date
    performance_records: List[PortfolioPerformanceResponse] = []


class InvestmentOpportunityBase(BaseModel):
    title: str
    description: Optional[str] = None
    investment_amount: Optional[float] = None
    currency: str = "EUR"
    type: str  # real_estate, private_equity, building_loan


class InvestmentOpportunityCreate(InvestmentOpportunityBase):
    pass


class InvestmentOpportunityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    investment_amount: Optional[float] = None
    type: Optional[str] = None
    status: Optional[str] = None


class OpportunityDocumentResponse(BaseModel):
    id: int
    opportunity_id: int
    filename: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    uploaded_at: datetime
    
    class Config:
        from_attributes = True


class InvestmentOpportunityResponse(InvestmentOpportunityBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    documents: List[OpportunityDocumentResponse] = []
    
    class Config:
        from_attributes = True


class SubscriptionCreate(BaseModel):
    opportunity_id: int
    subscribed_amount: Optional[float] = None
    notes: Optional[str] = None


class SubscriptionUpdate(BaseModel):
    status: Optional[str] = None
    subscribed_amount: Optional[float] = None
    notes: Optional[str] = None


class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    opportunity_id: int
    subscribed_amount: Optional[float] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    opportunity: Optional[InvestmentOpportunityResponse] = None
    user: Optional[UserResponse] = None  # Added for admin view
    investment: Optional[dict] = None  # Added to track if converted
    
    class Config:
        from_attributes = True


class InvestmentBase(BaseModel):
    name: str
    description: Optional[str] = None
    initial_amount: float
    current_value: Optional[float] = None
    currency: str = "EUR"
    type: str  # real_estate, private_equity, building_loan
    investment_date: date
    status: str = "active"
    notes: Optional[str] = None


class InvestmentCreate(InvestmentBase):
    portfolio_id: int
    opportunity_id: Optional[int] = None
    subscription_id: Optional[int] = None


class InvestmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    initial_amount: Optional[float] = None
    current_value: Optional[float] = None
    type: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    portfolio_id: Optional[int] = None
    opportunity_id: Optional[int] = None
    subscription_id: Optional[int] = None


class InvestmentResponse(InvestmentBase):
    id: int
    portfolio_id: int
    opportunity_id: Optional[int] = None
    subscription_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    portfolio: Optional[PortfolioResponse] = None
    opportunity: Optional[InvestmentOpportunityResponse] = None
    
    class Config:
        from_attributes = True


class ConvertSubscriptionToInvestment(BaseModel):
    portfolio_id: int
    investment_date: date
    current_value: Optional[float] = None
    notes: Optional[str] = None
