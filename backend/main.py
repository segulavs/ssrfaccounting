from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, date
import mt940
import csv
import io
import uuid
import os
from pathlib import Path
from pydantic import BaseModel
from database import SessionLocal, engine, Base
from models import Transaction, Project, CashTransaction
from schemas import (
    TransactionCreate, TransactionResponse, TransactionUpdate,
    ProjectCreate, ProjectResponse,
    CashTransactionCreate, CashTransactionResponse,
    DashboardStats, PeriodFilter, ProjectStats,
    CSVColumnMapping, CSVPreviewResponse, UploadBatchResponse
)
from typing import Union

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SSRF Accounting API")

# CORS middleware - allow origins from environment variable
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "SSRF Accounting API"}

@app.get("/")
def read_root():
    # In production, this will be handled by the frontend route
    # But we keep it for API-only access
    return {"message": "SSRF Accounting API", "docs": "/docs"}


@app.post("/api/upload-mt940", response_model=List[TransactionResponse])
async def upload_mt940(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload and parse MT940 statement file"""
    try:
        # Generate unique batch ID for this upload
        batch_id = str(uuid.uuid4())
        
        content = await file.read()
        content_str = content.decode('utf-8')
        transactions_data = mt940.parse(content_str)
        
        created_transactions = []
        
        # MT940 parser returns a dict with account numbers as keys
        if isinstance(transactions_data, dict):
            for account_number, account in transactions_data.items():
                statement_number = getattr(account, 'statement_number', '') if hasattr(account, 'statement_number') else ''
                
                # Get transactions from the account
                transactions = getattr(account, 'transactions', [])
                
                for transaction in transactions:
                    # Extract transaction details
                    trans_date = None
                    amount = 0.0
                    currency = 'EUR'
                    reference = ''
                    description = ''
                    
                    # Get date
                    if hasattr(transaction, 'date'):
                        trans_date_obj = transaction.date
                        if hasattr(trans_date_obj, 'date'):
                            trans_date = trans_date_obj.date()
                        elif isinstance(trans_date_obj, date):
                            trans_date = trans_date_obj
                    
                    # Get amount
                    if hasattr(transaction, 'amount'):
                        amount_obj = transaction.amount
                        if hasattr(amount_obj, 'amount'):
                            amount = float(amount_obj.amount)
                        elif isinstance(amount_obj, (int, float)):
                            amount = float(amount_obj)
                        
                        if hasattr(amount_obj, 'currency'):
                            currency = amount_obj.currency
                    
                    # Get reference
                    if hasattr(transaction, 'transaction_reference'):
                        reference = str(transaction.transaction_reference)
                    elif hasattr(transaction, 'reference'):
                        reference = str(transaction.reference)
                    
                    # Get description/details
                    if hasattr(transaction, 'transaction_details'):
                        description = str(transaction.transaction_details)
                    elif hasattr(transaction, 'details'):
                        description = str(transaction.details)
                    elif hasattr(transaction, 'description'):
                        description = str(transaction.description)
                    
                    if trans_date:
                        # Check for duplicate: date, reference, and amount must match
                        existing = db.query(Transaction).filter(
                            Transaction.date == trans_date,
                            Transaction.reference == reference,
                            Transaction.amount == amount
                        ).first()
                        
                        if not existing:
                            db_transaction = Transaction(
                                date=trans_date,
                                amount=amount,
                                currency=currency,
                                reference=reference,
                                description=description,
                                account_number=str(account_number) if account_number else '',
                                statement_number=str(statement_number) if statement_number else '',
                                raw_data=str(transaction.__dict__ if hasattr(transaction, '__dict__') else transaction),
                                upload_batch_id=batch_id
                            )
                            db.add(db_transaction)
                            created_transactions.append(db_transaction)
        else:
            # Fallback: try to iterate directly
            for account in transactions_data:
                account_number = getattr(account, 'account', '') if hasattr(account, 'account') else ''
                statement_number = getattr(account, 'statement_number', '') if hasattr(account, 'statement_number') else ''
                transactions = getattr(account, 'transactions', [account])
                
                for transaction in transactions:
                    trans_date = getattr(transaction, 'date', None)
                    if trans_date and hasattr(trans_date, 'date'):
                        trans_date = trans_date.date()
                    
                    amount = 0.0
                    if hasattr(transaction, 'amount'):
                        amt = transaction.amount
                        amount = float(getattr(amt, 'amount', amt) if hasattr(amt, 'amount') else amt)
                    
                    currency = 'EUR'
                    if hasattr(transaction, 'amount') and hasattr(transaction.amount, 'currency'):
                        currency = transaction.amount.currency
                    
                    reference = getattr(transaction, 'transaction_reference', '') or getattr(transaction, 'reference', '')
                    description = getattr(transaction, 'transaction_details', '') or getattr(transaction, 'details', '') or getattr(transaction, 'description', '')
                    
                    if trans_date:
                        # Check for duplicate: date, reference, and amount must match
                        existing = db.query(Transaction).filter(
                            Transaction.date == trans_date,
                            Transaction.reference == str(reference),
                            Transaction.amount == amount
                        ).first()
                        
                        if not existing:
                            db_transaction = Transaction(
                                date=trans_date,
                                amount=amount,
                                currency=currency,
                                reference=str(reference),
                                description=str(description),
                                account_number=str(account_number),
                                statement_number=str(statement_number),
                                raw_data=str(transaction.__dict__ if hasattr(transaction, '__dict__') else transaction),
                                upload_batch_id=batch_id
                            )
                            db.add(db_transaction)
                            created_transactions.append(db_transaction)
        
        db.commit()
        for transaction in created_transactions:
            db.refresh(transaction)
        
        return [TransactionResponse.model_validate(t) for t in created_transactions]
    except Exception as e:
        db.rollback()
        import traceback
        raise HTTPException(status_code=400, detail=f"Error parsing MT940: {str(e)}\n{traceback.format_exc()}")


@app.get("/api/preview-csv/test")
def test_preview_endpoint():
    """Test endpoint to verify preview-csv route is registered"""
    return {"message": "Preview CSV endpoint is available"}


@app.post("/api/preview-csv", response_model=CSVPreviewResponse)
async def preview_csv(file: UploadFile = File(...)):
    """Preview CSV file to detect columns and show sample rows"""
    try:
        content = await file.read()
        content_str = content.decode('utf-8')
        
        # Handle different encodings
        if not content_str:
            raise HTTPException(status_code=400, detail="CSV file appears to be empty")
        
        csv_reader = csv.DictReader(io.StringIO(content_str))
        
        # Get column names
        columns = csv_reader.fieldnames or []
        
        if not columns:
            raise HTTPException(status_code=400, detail="CSV file has no columns or is not a valid CSV")
        
        # Get first 5 rows as samples
        sample_rows = []
        for i, row in enumerate(csv_reader):
            if i >= 5:
                break
            sample_rows.append(dict(row))
        
        return CSVPreviewResponse(columns=list(columns), sample_rows=sample_rows)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        raise HTTPException(status_code=400, detail=f"Error reading CSV: {str(e)}\n{traceback.format_exc()}")


@app.post("/api/upload-csv", response_model=List[TransactionResponse])
async def upload_csv(
    file: UploadFile = File(...),
    column_mapping: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Upload and parse CSV file with bank transactions. Deduplicates based on date, reference, and amount.
    
    column_mapping: JSON string with mapping like {"date": "Transaction Date", "amount": "Amount", ...}
    """
    try:
        # Generate unique batch ID for this upload
        batch_id = str(uuid.uuid4())
        
        # Parse column mapping if provided
        mapping = {}
        if column_mapping:
            import json
            mapping = json.loads(column_mapping)
        
        content = await file.read()
        content_str = content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(content_str))
        
        created_transactions = []
        skipped_count = 0
        error_rows = []
        
        # Helper function to get value from row using mapping or auto-detect
        def get_value(row, field_name, default_alternatives=None):
            # First try explicit mapping
            if field_name in mapping and mapping[field_name]:
                mapped_col = mapping[field_name]
                if mapped_col in row:
                    return row[mapped_col]
            
            # Then try default alternatives
            if default_alternatives:
                for alt in default_alternatives:
                    if alt in row and row[alt]:
                        return row[alt]
            
            # Try case-insensitive match
            field_lower = field_name.lower()
            for key in row.keys():
                if key.lower() == field_lower:
                    return row[key]
            
            return None
        
        for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 (row 1 is header)
            try:
                # Parse date
                trans_date = None
                date_str = get_value(row, 'date', ['Date', 'DATE', 'transaction_date', 'Transaction Date', 'Date/Time'])
                if date_str:
                    from dateutil import parser
                    try:
                        trans_date = parser.parse(str(date_str)).date()
                    except:
                        # Try specific formats
                        for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%Y/%m/%d', '%d-%m-%Y', '%m-%d-%Y', '%d.%m.%Y', '%m.%d.%Y']:
                            try:
                                trans_date = datetime.strptime(str(date_str).strip(), fmt).date()
                                break
                            except:
                                continue
                
                if not trans_date:
                    error_rows.append(f"Row {row_num}: Could not parse date from '{date_str}'")
                    continue
                
                # Parse amount - check for transaction type column (Debit/Credit text) or separate debit/credit columns
                transaction_type_str = get_value(row, 'transaction_type', ['Transaction Type', 'Type', 'TYPE', 'Debit or Credit', 'Debit/Credit', 'D/C', 'DC'])
                debit_str = get_value(row, 'debit', ['Debit', 'DEBIT', 'Debit Amount', 'Debit Amount (EUR)'])
                credit_str = get_value(row, 'credit', ['Credit', 'CREDIT', 'Credit Amount', 'Credit Amount (EUR)'])
                amount_str = get_value(row, 'amount', ['Amount', 'AMOUNT', 'transaction_amount', 'Transaction Amount', 'Value'])
                
                # Helper function to parse European number formats
                def parse_european_number(num_str):
                    """Parse number that may use comma as decimal separator (Dutch/German format)"""
                    if not num_str or str(num_str).strip() == '':
                        return None
                    num_str = str(num_str).strip()
                    
                    # Handle negative amounts in parentheses: (1.234,56) -> -1234.56
                    is_negative = False
                    if num_str.startswith('(') and num_str.endswith(')'):
                        is_negative = True
                        num_str = num_str[1:-1].strip()
                    elif num_str.startswith('-'):
                        is_negative = True
                        num_str = num_str[1:].strip()
                    
                    # Count commas and dots to determine format
                    comma_count = num_str.count(',')
                    dot_count = num_str.count('.')
                    
                    # Dutch/German format: comma as decimal, dot as thousands separator
                    # Examples: "1.234,56" or "1,50" or "1234,56"
                    if comma_count == 1 and dot_count >= 0:
                        # Remove thousands separators (dots) and replace comma with dot
                        num_str = num_str.replace('.', '').replace(',', '.')
                    # US format: dot as decimal, comma as thousands separator
                    # Examples: "1,234.56" or "1.50"
                    elif dot_count == 1 and comma_count >= 0:
                        # Remove thousands separators (commas)
                        num_str = num_str.replace(',', '')
                    # No decimal separator, just remove thousands separators
                    elif comma_count > 1 or dot_count > 1:
                        # Multiple separators - assume last comma is decimal if more commas than dots
                        if comma_count > dot_count:
                            # Last comma is decimal
                            last_comma = num_str.rfind(',')
                            num_str = num_str[:last_comma].replace(',', '').replace('.', '') + '.' + num_str[last_comma+1:].replace(',', '').replace('.', '')
                        else:
                            # Last dot is decimal
                            last_dot = num_str.rfind('.')
                            num_str = num_str[:last_dot].replace(',', '').replace('.', '') + '.' + num_str[last_dot+1:].replace(',', '').replace('.', '')
                    # Single comma, no dots - treat as decimal separator (Dutch format)
                    elif comma_count == 1:
                        num_str = num_str.replace(',', '.')
                    # Single dot, no commas - already in US format, just remove any remaining commas
                    elif dot_count == 1:
                        num_str = num_str.replace(',', '')
                    # No separators or ambiguous - try removing all and see if it's an integer
                    else:
                        # Try as integer (no decimal part)
                        num_str = num_str.replace(',', '').replace('.', '')
                    
                    result = float(num_str)
                    return -result if is_negative else result
                
                # Determine amount based on transaction type, separate debit/credit columns, or amount column
                amount = None
                
                # First, check if we have a transaction type column (Debit/Credit text indicator)
                if transaction_type_str and amount_str:
                    transaction_type = str(transaction_type_str).strip().upper()
                    try:
                        base_amount = parse_european_number(amount_str)
                        if base_amount is not None:
                            # Apply sign based on transaction type
                            if 'DEBIT' in transaction_type:
                                amount = -abs(base_amount)  # Debit = negative
                            elif 'CREDIT' in transaction_type:
                                amount = abs(base_amount)  # Credit = positive
                            else:
                                # Unknown type, use amount as-is
                                amount = base_amount
                    except Exception as e:
                        error_rows.append(f"Row {row_num}: Could not parse amount '{amount_str}' with type '{transaction_type_str}': {str(e)}")
                
                # If transaction type approach didn't work, try separate debit/credit columns
                if amount is None:
                    if debit_str and str(debit_str).strip():
                        # Debit should be negative
                        try:
                            debit_amount = parse_european_number(debit_str)
                            if debit_amount is not None:
                                amount = -abs(debit_amount)  # Ensure negative
                        except Exception as e:
                            # If debit parsing fails, try credit instead
                            pass
                    
                    if amount is None and credit_str and str(credit_str).strip():
                        # Credit should be positive
                        try:
                            credit_amount = parse_european_number(credit_str)
                            if credit_amount is not None:
                                amount = abs(credit_amount)  # Ensure positive
                        except Exception as e:
                            # Will fall back to amount column if credit also fails
                            pass
                
                # Fall back to amount column if transaction type or debit/credit not available
                if amount is None:
                    if not amount_str:
                        error_rows.append(f"Row {row_num}: No amount, transaction type, debit, or credit column found")
                        continue
                    try:
                        amount = parse_european_number(amount_str)
                        if amount is None:
                            error_rows.append(f"Row {row_num}: Could not parse amount '{amount_str}'")
                            continue
                    except Exception as e:
                        error_rows.append(f"Row {row_num}: Could not parse amount '{amount_str}': {str(e)}")
                        continue
                
                # Get other fields
                reference = str(get_value(row, 'reference', ['Reference', 'REFERENCE', 'transaction_reference', 'Transaction Reference', 'Ref', 'ID']) or '').strip()
                description = str(get_value(row, 'description', ['Description', 'DESCRIPTION', 'details', 'Details', 'transaction_details', 'Memo', 'Narrative']) or '').strip()
                currency = str(get_value(row, 'currency', ['Currency', 'CURRENCY', 'Curr']) or 'EUR').strip()[:3] or 'EUR'
                account_number = str(get_value(row, 'account_number', ['Account Number', 'Account', 'account', 'Account No']) or '').strip()
                statement_number = str(get_value(row, 'statement_number', ['Statement Number', 'Statement', 'statement']) or '').strip()
                
                # Check for duplicate: date, reference, and amount must match
                existing = db.query(Transaction).filter(
                    Transaction.date == trans_date,
                    Transaction.reference == reference,
                    Transaction.amount == amount
                ).first()
                
                if existing:
                    skipped_count += 1
                    continue
                
                # Create new transaction
                db_transaction = Transaction(
                    date=trans_date,
                    amount=amount,
                    currency=currency,
                    reference=reference,
                    description=description,
                    account_number=account_number,
                    statement_number=statement_number,
                    raw_data=str(row),
                    upload_batch_id=batch_id
                )
                db.add(db_transaction)
                created_transactions.append(db_transaction)
                
            except Exception as e:
                error_rows.append(f"Row {row_num}: {str(e)}")
                continue
        
        if not created_transactions and not skipped_count:
            # No transactions created and none skipped - likely a mapping issue
            error_msg = "No transactions were imported. "
            if error_rows:
                error_msg += f"Errors: {'; '.join(error_rows[:10])}"
            else:
                error_msg += "Please check your column mapping or CSV format."
            raise HTTPException(status_code=400, detail=error_msg)
        
        db.commit()
        for transaction in created_transactions:
            db.refresh(transaction)
        
        return [TransactionResponse.model_validate(t) for t in created_transactions]
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import traceback
        raise HTTPException(status_code=400, detail=f"Error parsing CSV: {str(e)}\n{traceback.format_exc()}")


@app.get("/api/transactions", response_model=List[TransactionResponse])
def get_transactions(
    project_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Get all transactions with optional filters"""
    query = db.query(Transaction)
    
    if project_id:
        query = query.filter(Transaction.project_id == project_id)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    
    transactions = query.order_by(Transaction.date.desc()).all()
    return [TransactionResponse.model_validate(t) for t in transactions]


@app.get("/api/transactions/{transaction_id}", response_model=TransactionResponse)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Get a specific transaction"""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return TransactionResponse.model_validate(transaction)


@app.patch("/api/transactions/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction_update: TransactionUpdate,
    db: Session = Depends(get_db)
):
    """Update a transaction (e.g., tag to project)"""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction_update.project_id is not None:
        # Verify project exists
        project = db.query(Project).filter(Project.id == transaction_update.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        transaction.project_id = transaction_update.project_id
    
    if transaction_update.description is not None:
        transaction.description = transaction_update.description
    
    db.commit()
    db.refresh(transaction)
    return TransactionResponse.model_validate(transaction)


@app.delete("/api/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Delete a transaction - Bank transactions cannot be deleted"""
    raise HTTPException(status_code=403, detail="Bank transactions cannot be deleted")


@app.get("/api/upload-batches", response_model=List[UploadBatchResponse])
def get_upload_batches(db: Session = Depends(get_db)):
    """Get all upload batches with transaction counts"""
    # Get distinct batch IDs with their metadata
    batches_query = db.query(
        Transaction.upload_batch_id,
        func.min(Transaction.created_at).label('created_at'),
        func.count(Transaction.id).label('transaction_count'),
        func.min(Transaction.account_number).label('account_number'),
        func.min(Transaction.statement_number).label('statement_number')
    ).filter(
        Transaction.upload_batch_id.isnot(None)
    ).group_by(
        Transaction.upload_batch_id
    ).order_by(
        func.min(Transaction.created_at).desc()
    ).all()
    
    batches = []
    for batch in batches_query:
        # Determine upload type based on statement_number presence (MT940 usually has it)
        upload_type = "MT940" if batch.statement_number else "CSV"
        
        batches.append(UploadBatchResponse(
            upload_batch_id=batch.upload_batch_id,
            upload_type=upload_type,
            transaction_count=batch.transaction_count,
            created_at=batch.created_at,
            account_number=batch.account_number,
            statement_number=batch.statement_number
        ))
    
    return batches


@app.delete("/api/upload-batches/{batch_id}")
def delete_upload_batch(batch_id: str, db: Session = Depends(get_db)):
    """Delete all transactions from a specific upload batch"""
    transactions = db.query(Transaction).filter(
        Transaction.upload_batch_id == batch_id
    ).all()
    
    if not transactions:
        raise HTTPException(status_code=404, detail="Upload batch not found")
    
    count = len(transactions)
    for transaction in transactions:
        db.delete(transaction)
    
    db.commit()
    return {"message": f"Deleted {count} transactions from upload batch", "deleted_count": count}


@app.delete("/api/transactions/all")
def delete_all_transactions(db: Session = Depends(get_db)):
    """Delete all bank transactions"""
    try:
        count = db.query(Transaction).count()
        if count == 0:
            return {"message": "No transactions to delete", "deleted_count": 0}
        
        # Delete all transactions
        deleted_count = db.query(Transaction).delete()
        db.commit()
        
        return {"message": f"Deleted {deleted_count} transactions", "deleted_count": deleted_count}
    except Exception as e:
        db.rollback()
        import traceback
        raise HTTPException(
            status_code=500, 
            detail=f"Error deleting transactions: {str(e)}\n{traceback.format_exc()}"
        )


# Project endpoints
@app.post("/api/projects", response_model=ProjectResponse)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project"""
    db_project = Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return ProjectResponse.model_validate(db_project)


@app.get("/api/projects", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    """Get all projects"""
    projects = db.query(Project).order_by(Project.name).all()
    return [ProjectResponse.model_validate(p) for p in projects]


@app.get("/api/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get a specific project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse.model_validate(project)


@app.put("/api/projects/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_update: ProjectCreate,
    db: Session = Depends(get_db)
):
    """Update a project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    for key, value in project_update.dict().items():
        setattr(project, key, value)
    
    db.commit()
    db.refresh(project)
    return ProjectResponse.model_validate(project)


@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete a project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Remove project tags from transactions
    db.query(Transaction).filter(Transaction.project_id == project_id).update({"project_id": None})
    db.query(CashTransaction).filter(CashTransaction.project_id == project_id).update({"project_id": None})
    
    db.delete(project)
    db.commit()
    return {"message": "Project deleted"}


# Cash transaction endpoints
@app.post("/api/cash-transactions", response_model=CashTransactionResponse)
def create_cash_transaction(
    transaction: CashTransactionCreate,
    db: Session = Depends(get_db)
):
    """Create a cash transaction"""
    if transaction.project_id:
        project = db.query(Project).filter(Project.id == transaction.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
    
    db_transaction = CashTransaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return CashTransactionResponse.model_validate(db_transaction)


@app.get("/api/cash-transactions", response_model=List[CashTransactionResponse])
def get_cash_transactions(
    project_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Get all cash transactions with optional filters"""
    query = db.query(CashTransaction)
    
    if project_id:
        query = query.filter(CashTransaction.project_id == project_id)
    if start_date:
        query = query.filter(CashTransaction.date >= start_date)
    if end_date:
        query = query.filter(CashTransaction.date <= end_date)
    
    transactions = query.order_by(CashTransaction.date.desc()).all()
    return [CashTransactionResponse.model_validate(t) for t in transactions]


@app.patch("/api/cash-transactions/{transaction_id}", response_model=CashTransactionResponse)
def update_cash_transaction(
    transaction_id: int,
    transaction_update: CashTransactionCreate,
    db: Session = Depends(get_db)
):
    """Update a cash transaction"""
    transaction = db.query(CashTransaction).filter(CashTransaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Cash transaction not found")
    
    for key, value in transaction_update.dict().items():
        setattr(transaction, key, value)
    
    db.commit()
    db.refresh(transaction)
    return CashTransactionResponse.model_validate(transaction)


@app.delete("/api/cash-transactions/{transaction_id}")
def delete_cash_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Delete a cash transaction"""
    transaction = db.query(CashTransaction).filter(CashTransaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Cash transaction not found")
    
    db.delete(transaction)
    db.commit()
    return {"message": "Cash transaction deleted"}


# Dashboard endpoints
@app.post("/api/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(
    filter: PeriodFilter,
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for a project and period"""
    start_date = filter.start_date
    end_date = filter.end_date
    
    # Get bank transactions
    bank_query = db.query(Transaction)
    if filter.project_id:
        bank_query = bank_query.filter(Transaction.project_id == filter.project_id)
    bank_query = bank_query.filter(Transaction.date >= start_date, Transaction.date <= end_date)
    bank_transactions = bank_query.all()
    
    # Get cash transactions
    cash_query = db.query(CashTransaction)
    if filter.project_id:
        cash_query = cash_query.filter(CashTransaction.project_id == filter.project_id)
    cash_query = cash_query.filter(CashTransaction.date >= start_date, CashTransaction.date <= end_date)
    cash_transactions = cash_query.all()
    
    # Calculate totals
    total_income = sum(t.amount for t in bank_transactions + cash_transactions if t.amount > 0)
    total_expenses = abs(sum(t.amount for t in bank_transactions + cash_transactions if t.amount < 0))
    net_amount = total_income - total_expenses
    
    # Transaction counts
    bank_count = len(bank_transactions)
    cash_count = len(cash_transactions)
    
    # Calculate project-wise statistics
    project_stats_dict = {}
    all_transactions = bank_transactions + cash_transactions
    
    for transaction in all_transactions:
        project_id = transaction.project_id
        project_name = None
        if project_id:
            project = db.query(Project).filter(Project.id == project_id).first()
            project_name = project.name if project else None
        
        key = project_id if project_id else None
        
        if key not in project_stats_dict:
            project_stats_dict[key] = {
                'project_id': project_id,
                'project_name': project_name or 'Untagged',
                'income': 0.0,
                'expenses': 0.0,
                'transaction_count': 0
            }
        
        if transaction.amount > 0:
            project_stats_dict[key]['income'] += transaction.amount
        else:
            project_stats_dict[key]['expenses'] += abs(transaction.amount)
        
        project_stats_dict[key]['transaction_count'] += 1
    
    # Convert to list and calculate net amounts
    project_stats_list = []
    for key, stats in project_stats_dict.items():
        net_amount = stats['income'] - stats['expenses']
        project_stats_list.append(ProjectStats(
            project_id=stats['project_id'],
            project_name=stats['project_name'],
            income=stats['income'],
            expenses=stats['expenses'],
            net_amount=net_amount,
            transaction_count=stats['transaction_count']
        ))
    
    # Sort by project name (with Untagged last)
    project_stats_list.sort(key=lambda x: (x.project_name == 'Untagged', x.project_name or ''))
    
    return DashboardStats(
        project_id=filter.project_id,
        start_date=start_date,
        end_date=end_date,
        total_income=total_income,
        total_expenses=total_expenses,
        net_amount=net_amount,
        bank_transaction_count=bank_count,
        cash_transaction_count=cash_count,
        transactions=[TransactionResponse.model_validate(t) for t in bank_transactions] + 
                     [CashTransactionResponse.model_validate(t) for t in cash_transactions],
        project_stats=project_stats_list
    )


# Serve static files from frontend build directory (for production)
# This must be added AFTER all API routes are defined
frontend_build_path = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_build_path.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_build_path / "assets")), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend files, with fallback to index.html for client-side routing"""
        # Don't serve API routes or docs
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="Not found")
        
        file_path = frontend_build_path / full_path
        # Only serve actual files (with extensions), not directories
        if file_path.exists() and file_path.is_file() and file_path.suffix:
            return FileResponse(str(file_path))
        # For client-side routing (React Router), serve index.html
        index_file = frontend_build_path / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        raise HTTPException(status_code=404, detail="Frontend not found")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
