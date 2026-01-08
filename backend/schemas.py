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


class TransactionResponse(TransactionBase):
    id: int
    reference: Optional[str] = None
    account_number: Optional[str] = None
    statement_number: Optional[str] = None
    project_id: Optional[int] = None
    project: Optional[ProjectResponse] = None
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
    pass


class CashTransactionResponse(CashTransactionBase):
    id: int
    project: Optional[ProjectResponse] = None
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
