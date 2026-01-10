from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, date, timedelta
import os
import uuid
from pathlib import Path

from database import SessionLocal
from models import (
    User, Invitation, Portfolio, PortfolioPerformance,
    InvestmentOpportunity, OpportunityDocument, Subscription, Investment
)
from schemas import (
    UserCreate, UserResponse, Token, InvitationCreate, InvitationResponse,
    PortfolioCreate, PortfolioResponse, PortfolioUpdate, PortfolioPerformanceCreate,
    PortfolioPerformanceResponse, PortfolioPerformanceStats,
    InvestmentOpportunityCreate, InvestmentOpportunityResponse, InvestmentOpportunityUpdate,
    OpportunityDocumentResponse, SubscriptionCreate, SubscriptionResponse, SubscriptionUpdate,
    InvestmentCreate, InvestmentResponse, InvestmentUpdate, ConvertSubscriptionToInvestment
)
from auth import (
    get_current_active_user, get_current_admin_user,
    get_password_hash, verify_password, create_access_token
)

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])

# File upload directory for opportunity documents
UPLOAD_DIR = Path("uploads/opportunities")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# Authentication endpoints
@router.post("/auth/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with an invitation token"""
    # Check if invitation token is provided and valid
    if user_data.invitation_token:
        invitation = db.query(Invitation).filter(
            Invitation.token == user_data.invitation_token,
            Invitation.is_used == False,
            Invitation.expires_at > datetime.utcnow()
        ).first()
        
        if not invitation:
            raise HTTPException(status_code=400, detail="Invalid or expired invitation token")
        
        if invitation.email != user_data.email:
            raise HTTPException(status_code=400, detail="Email does not match invitation")
        
        # Mark invitation as used
        invitation.is_used = True
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    db_user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserResponse.model_validate(db_user)


@router.post("/auth/login", response_model=Token)
def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Login and get access token"""
    try:
        user = db.query(User).filter(User.email == username).first()
        if not user:
            raise HTTPException(status_code=401, detail="Incorrect email or password")
        
        if not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Incorrect email or password")
        
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
        
        access_token = create_access_token(data={"sub": str(user.id)})
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        # Log the error for debugging but don't expose internal details
        import traceback
        print(f"Login error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Internal server error during login")


@router.get("/auth/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return UserResponse.model_validate(current_user)


# Invitation endpoints (admin only)
@router.post("/invitations", response_model=InvitationResponse)
def create_invitation(
    invitation: InvitationCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new invitation (admin only)"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == invitation.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Create invitation (expires in 7 days)
    db_invitation = Invitation(
        email=invitation.email,
        invited_by_id=current_user.id,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(db_invitation)
    db.commit()
    db.refresh(db_invitation)
    
    return InvitationResponse.model_validate(db_invitation)


@router.get("/invitations", response_model=List[InvitationResponse])
def get_invitations(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all invitations (admin only)"""
    invitations = db.query(Invitation).order_by(desc(Invitation.created_at)).all()
    return [InvitationResponse.model_validate(i) for i in invitations]


# Portfolio endpoints
@router.post("/portfolios", response_model=PortfolioResponse)
def create_portfolio(
    portfolio: PortfolioCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new portfolio (admin only)"""
    db_portfolio = Portfolio(
        **portfolio.dict(),
        current_value=portfolio.initial_value
    )
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    return PortfolioResponse.model_validate(db_portfolio)


@router.get("/portfolios", response_model=List[PortfolioResponse])
def get_portfolios(
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get all portfolios"""
    query = db.query(Portfolio)
    if is_active is not None:
        query = query.filter(Portfolio.is_active == is_active)
    portfolios = query.order_by(Portfolio.name).all()
    return [PortfolioResponse.model_validate(p) for p in portfolios]


@router.get("/portfolios/{portfolio_id}", response_model=PortfolioResponse)
def get_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    """Get a specific portfolio"""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return PortfolioResponse.model_validate(portfolio)


@router.put("/portfolios/{portfolio_id}", response_model=PortfolioResponse)
def update_portfolio(
    portfolio_id: int,
    portfolio_update: PortfolioUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a portfolio (admin only)"""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    update_data = portfolio_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(portfolio, key, value)
    
    portfolio.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(portfolio)
    return PortfolioResponse.model_validate(portfolio)


@router.delete("/portfolios/{portfolio_id}")
def delete_portfolio(
    portfolio_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a portfolio (admin only)"""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    db.delete(portfolio)
    db.commit()
    return {"message": "Portfolio deleted"}


# Portfolio Performance endpoints
@router.post("/portfolios/{portfolio_id}/performance", response_model=PortfolioPerformanceResponse)
def add_performance_record(
    portfolio_id: int,
    performance: PortfolioPerformanceCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Add a performance record for a portfolio (admin only)"""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Calculate return percentage if not provided
    if performance.return_percentage is None and portfolio.initial_value > 0:
        performance.return_percentage = ((performance.value - portfolio.initial_value) / portfolio.initial_value) * 100
    
    db_performance = PortfolioPerformance(
        portfolio_id=portfolio_id,
        **performance.dict()
    )
    db.add(db_performance)
    
    # Update portfolio current value
    portfolio.current_value = performance.value
    portfolio.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_performance)
    return PortfolioPerformanceResponse.model_validate(db_performance)


@router.get("/portfolios/{portfolio_id}/performance", response_model=List[PortfolioPerformanceResponse])
def get_portfolio_performance(
    portfolio_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Get performance records for a portfolio"""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    query = db.query(PortfolioPerformance).filter(PortfolioPerformance.portfolio_id == portfolio_id)
    
    if start_date:
        query = query.filter(PortfolioPerformance.date >= start_date)
    if end_date:
        query = query.filter(PortfolioPerformance.date <= end_date)
    
    records = query.order_by(PortfolioPerformance.date).all()
    return [PortfolioPerformanceResponse.model_validate(r) for r in records]


@router.get("/portfolios/performance/stats", response_model=List[PortfolioPerformanceStats])
def get_portfolio_performance_stats(db: Session = Depends(get_db)):
    """Get performance statistics for all portfolios"""
    portfolios = db.query(Portfolio).filter(Portfolio.is_active == True).all()
    stats = []
    
    for portfolio in portfolios:
        # Get latest performance record
        latest_record = db.query(PortfolioPerformance).filter(
            PortfolioPerformance.portfolio_id == portfolio.id
        ).order_by(desc(PortfolioPerformance.date)).first()
        
        current_value = latest_record.value if latest_record else portfolio.current_value
        total_return = current_value - portfolio.initial_value
        total_return_percentage = (total_return / portfolio.initial_value * 100) if portfolio.initial_value > 0 else 0
        
        # Get all performance records
        performance_records = db.query(PortfolioPerformance).filter(
            PortfolioPerformance.portfolio_id == portfolio.id
        ).order_by(PortfolioPerformance.date).all()
        
        stats.append(PortfolioPerformanceStats(
            portfolio_id=portfolio.id,
            portfolio_name=portfolio.name,
            current_value=current_value,
            initial_value=portfolio.initial_value,
            total_return=total_return,
            total_return_percentage=total_return_percentage,
            latest_date=latest_record.date if latest_record else portfolio.created_at.date(),
            performance_records=[PortfolioPerformanceResponse.model_validate(r) for r in performance_records]
        ))
    
    return stats


# Investment Opportunity endpoints
@router.post("/opportunities", response_model=InvestmentOpportunityResponse)
def create_opportunity(
    opportunity: InvestmentOpportunityCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new investment opportunity (admin only)"""
    db_opportunity = InvestmentOpportunity(**opportunity.dict())
    db.add(db_opportunity)
    db.commit()
    db.refresh(db_opportunity)
    return InvestmentOpportunityResponse.model_validate(db_opportunity)


@router.get("/opportunities", response_model=List[InvestmentOpportunityResponse])
def get_opportunities(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all investment opportunities"""
    query = db.query(InvestmentOpportunity).options(joinedload(InvestmentOpportunity.documents))
    if status:
        query = query.filter(InvestmentOpportunity.status == status)
    opportunities = query.order_by(desc(InvestmentOpportunity.created_at)).all()
    
    result = []
    for opp in opportunities:
        opp_response = InvestmentOpportunityResponse.model_validate(opp)
        opp_response.documents = [OpportunityDocumentResponse.model_validate(d) for d in opp.documents]
        result.append(opp_response)
    
    return result


@router.get("/opportunities/{opportunity_id}", response_model=InvestmentOpportunityResponse)
def get_opportunity(opportunity_id: int, db: Session = Depends(get_db)):
    """Get a specific investment opportunity"""
    opportunity = db.query(InvestmentOpportunity).options(
        joinedload(InvestmentOpportunity.documents)
    ).filter(InvestmentOpportunity.id == opportunity_id).first()
    
    if not opportunity:
        raise HTTPException(status_code=404, detail="Investment opportunity not found")
    
    response = InvestmentOpportunityResponse.model_validate(opportunity)
    response.documents = [OpportunityDocumentResponse.model_validate(d) for d in opportunity.documents]
    return response


@router.put("/opportunities/{opportunity_id}", response_model=InvestmentOpportunityResponse)
def update_opportunity(
    opportunity_id: int,
    opportunity_update: InvestmentOpportunityUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update an investment opportunity (admin only)"""
    opportunity = db.query(InvestmentOpportunity).filter(InvestmentOpportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Investment opportunity not found")
    
    update_data = opportunity_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(opportunity, key, value)
    
    opportunity.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(opportunity)
    
    response = InvestmentOpportunityResponse.model_validate(opportunity)
    response.documents = [OpportunityDocumentResponse.model_validate(d) for d in opportunity.documents]
    return response


@router.delete("/opportunities/{opportunity_id}")
def delete_opportunity(
    opportunity_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete an investment opportunity (admin only)"""
    opportunity = db.query(InvestmentOpportunity).filter(InvestmentOpportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Investment opportunity not found")
    
    # Delete associated documents
    for doc in opportunity.documents:
        doc_path = Path(doc.file_path)
        if doc_path.exists():
            doc_path.unlink()
    
    db.delete(opportunity)
    db.commit()
    return {"message": "Investment opportunity deleted"}


# Document endpoints
@router.post("/opportunities/{opportunity_id}/documents", response_model=OpportunityDocumentResponse)
def upload_document(
    opportunity_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Upload a document for an investment opportunity (admin only)"""
    opportunity = db.query(InvestmentOpportunity).filter(InvestmentOpportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Investment opportunity not found")
    
    # Save file
    file_extension = Path(file.filename).suffix
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{opportunity_id}_{file_id}{file_extension}"
    
    with open(file_path, "wb") as f:
        content = file.file.read()
        f.write(content)
    
    # Create document record
    db_document = OpportunityDocument(
        opportunity_id=opportunity_id,
        filename=file.filename,
        file_path=str(file_path),
        file_size=len(content),
        mime_type=file.content_type
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    return OpportunityDocumentResponse.model_validate(db_document)


@router.get("/opportunities/{opportunity_id}/documents/{document_id}/download")
def download_document(
    opportunity_id: int,
    document_id: int,
    db: Session = Depends(get_db)
):
    """Download a document"""
    document = db.query(OpportunityDocument).filter(
        OpportunityDocument.id == document_id,
        OpportunityDocument.opportunity_id == opportunity_id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    file_path = Path(document.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=str(file_path),
        filename=document.filename,
        media_type=document.mime_type or "application/octet-stream"
    )


@router.delete("/opportunities/{opportunity_id}/documents/{document_id}")
def delete_document(
    opportunity_id: int,
    document_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a document (admin only)"""
    document = db.query(OpportunityDocument).filter(
        OpportunityDocument.id == document_id,
        OpportunityDocument.opportunity_id == opportunity_id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete file
    file_path = Path(document.file_path)
    if file_path.exists():
        file_path.unlink()
    
    db.delete(document)
    db.commit()
    return {"message": "Document deleted"}


# Subscription endpoints
@router.post("/opportunities/{opportunity_id}/subscribe", response_model=SubscriptionResponse)
def subscribe_to_opportunity(
    opportunity_id: int,
    subscription: SubscriptionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Subscribe to an investment opportunity"""
    opportunity = db.query(InvestmentOpportunity).filter(InvestmentOpportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Investment opportunity not found")
    
    if opportunity.status != "open":
        raise HTTPException(status_code=400, detail="Opportunity is not open for subscriptions")
    
    # Check if already subscribed
    existing = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.opportunity_id == opportunity_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already subscribed to this opportunity")
    
    db_subscription = Subscription(
        user_id=current_user.id,
        opportunity_id=opportunity_id,
        subscribed_amount=subscription.subscribed_amount,
        notes=subscription.notes
    )
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    
    # Load opportunity for response
    db.refresh(opportunity)
    opportunity.documents  # Trigger lazy load
    
    response = SubscriptionResponse.model_validate(db_subscription)
    opp_response = InvestmentOpportunityResponse.model_validate(opportunity)
    opp_response.documents = [OpportunityDocumentResponse.model_validate(d) for d in opportunity.documents]
    response.opportunity = opp_response
    
    return response


@router.get("/subscriptions", response_model=List[SubscriptionResponse])
def get_my_subscriptions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's subscriptions"""
    subscriptions = db.query(Subscription).options(
        joinedload(Subscription.opportunity).joinedload(InvestmentOpportunity.documents)
    ).filter(Subscription.user_id == current_user.id).order_by(desc(Subscription.created_at)).all()
    
    result = []
    for sub in subscriptions:
        response = SubscriptionResponse.model_validate(sub)
        opp_response = InvestmentOpportunityResponse.model_validate(sub.opportunity)
        opp_response.documents = [OpportunityDocumentResponse.model_validate(d) for d in sub.opportunity.documents]
        response.opportunity = opp_response
        result.append(response)
    
    return result


@router.get("/subscriptions/all", response_model=List[SubscriptionResponse])
def get_all_subscriptions(
    opportunity_id: Optional[int] = None,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all subscriptions (admin only)"""
    query = db.query(Subscription).options(
        joinedload(Subscription.opportunity).joinedload(InvestmentOpportunity.documents),
        joinedload(Subscription.user),
        joinedload(Subscription.investment)
    )
    
    if opportunity_id:
        query = query.filter(Subscription.opportunity_id == opportunity_id)
    
    subscriptions = query.order_by(desc(Subscription.created_at)).all()
    
    result = []
    for sub in subscriptions:
        response = SubscriptionResponse.model_validate(sub)
        opp_response = InvestmentOpportunityResponse.model_validate(sub.opportunity)
        opp_response.documents = [OpportunityDocumentResponse.model_validate(d) for d in sub.opportunity.documents]
        response.opportunity = opp_response
        # Add user info if available (not in schema but useful for admin)
        if hasattr(sub, 'user') and sub.user:
            response.user = UserResponse.model_validate(sub.user)
        # Add investment info if converted
        if hasattr(sub, 'investment') and sub.investment:
            response.investment = {"id": sub.investment.id}
        result.append(response)
    
    return result


@router.patch("/subscriptions/{subscription_id}", response_model=SubscriptionResponse)
def update_subscription(
    subscription_id: int,
    subscription_update: SubscriptionUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a subscription (admin only)"""
    subscription = db.query(Subscription).options(
        joinedload(Subscription.opportunity).joinedload(InvestmentOpportunity.documents)
    ).filter(Subscription.id == subscription_id).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    update_data = subscription_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(subscription, key, value)
    
    subscription.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(subscription)
    
    response = SubscriptionResponse.model_validate(subscription)
    opp_response = InvestmentOpportunityResponse.model_validate(subscription.opportunity)
    opp_response.documents = [OpportunityDocumentResponse.model_validate(d) for d in subscription.opportunity.documents]
    response.opportunity = opp_response
    
    return response


# Convert subscription to investment endpoint
@router.post("/subscriptions/{subscription_id}/convert-to-investment", response_model=InvestmentResponse)
def convert_subscription_to_investment(
    subscription_id: int,
    conversion_data: ConvertSubscriptionToInvestment,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Convert an approved subscription to an investment (admin only)"""
    subscription = db.query(Subscription).options(
        joinedload(Subscription.opportunity).joinedload(InvestmentOpportunity.documents),
        joinedload(Subscription.user)
    ).filter(Subscription.id == subscription_id).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    if subscription.status != "approved":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot convert subscription with status '{subscription.status}'. Only approved subscriptions can be converted."
        )
    
    # Check if already converted
    if subscription.investment:
        raise HTTPException(
            status_code=400,
            detail="This subscription has already been converted to an investment"
        )
    
    # Verify portfolio exists
    portfolio = db.query(Portfolio).filter(Portfolio.id == conversion_data.portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Create investment from subscription
    investment_amount = subscription.subscribed_amount or subscription.opportunity.investment_amount or 0.0
    if investment_amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot create investment: subscribed amount or opportunity investment amount is missing or invalid"
        )
    
    db_investment = Investment(
        portfolio_id=conversion_data.portfolio_id,
        opportunity_id=subscription.opportunity_id,
        subscription_id=subscription_id,
        name=f"{subscription.opportunity.title} - {subscription.user.full_name or subscription.user.email}",
        description=subscription.opportunity.description,
        initial_amount=investment_amount,
        current_value=conversion_data.current_value or investment_amount,
        currency=subscription.opportunity.currency,
        type=subscription.opportunity.type,  # Copy type from opportunity
        investment_date=conversion_data.investment_date,
        status="active",
        notes=conversion_data.notes or subscription.notes
    )
    db.add(db_investment)
    
    # Update subscription status to completed
    subscription.status = "completed"
    subscription.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_investment)
    
    # Load relationships for response
    response = InvestmentResponse.model_validate(db_investment)
    response.portfolio = PortfolioResponse.model_validate(db_investment.portfolio)
    if db_investment.opportunity:
        opp_response = InvestmentOpportunityResponse.model_validate(db_investment.opportunity)
        opp_response.documents = [OpportunityDocumentResponse.model_validate(d) for d in db_investment.opportunity.documents]
        response.opportunity = opp_response
    
    return response


# Investment endpoints
@router.post("/investments", response_model=InvestmentResponse)
def create_investment(
    investment: InvestmentCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new investment (admin only)"""
    # Verify portfolio exists
    portfolio = db.query(Portfolio).filter(Portfolio.id == investment.portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Verify opportunity exists if provided
    if investment.opportunity_id:
        opportunity = db.query(InvestmentOpportunity).filter(
            InvestmentOpportunity.id == investment.opportunity_id
        ).first()
        if not opportunity:
            raise HTTPException(status_code=404, detail="Investment opportunity not found")
    
    db_investment = Investment(**investment.dict())
    db.add(db_investment)
    db.commit()
    db.refresh(db_investment)
    
    # Load relationships for response
    db.refresh(db_investment)
    response = InvestmentResponse.model_validate(db_investment)
    response.portfolio = PortfolioResponse.model_validate(db_investment.portfolio)
    if db_investment.opportunity:
        opp_response = InvestmentOpportunityResponse.model_validate(db_investment.opportunity)
        opp_response.documents = [OpportunityDocumentResponse.model_validate(d) for d in db_investment.opportunity.documents]
        response.opportunity = opp_response
    
    return response


@router.get("/investments", response_model=List[InvestmentResponse])
def get_investments(
    portfolio_id: Optional[int] = None,
    opportunity_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all investments with optional filters"""
    query = db.query(Investment).options(
        joinedload(Investment.portfolio),
        joinedload(Investment.opportunity).joinedload(InvestmentOpportunity.documents)
    )
    
    if portfolio_id:
        query = query.filter(Investment.portfolio_id == portfolio_id)
    if opportunity_id:
        query = query.filter(Investment.opportunity_id == opportunity_id)
    if status:
        query = query.filter(Investment.status == status)
    
    investments = query.order_by(desc(Investment.investment_date)).all()
    
    result = []
    for inv in investments:
        response = InvestmentResponse.model_validate(inv)
        response.portfolio = PortfolioResponse.model_validate(inv.portfolio)
        if inv.opportunity:
            opp_response = InvestmentOpportunityResponse.model_validate(inv.opportunity)
            opp_response.documents = [OpportunityDocumentResponse.model_validate(d) for d in inv.opportunity.documents]
            response.opportunity = opp_response
        result.append(response)
    
    return result


@router.get("/investments/{investment_id}", response_model=InvestmentResponse)
def get_investment(investment_id: int, db: Session = Depends(get_db)):
    """Get a specific investment"""
    investment = db.query(Investment).options(
        joinedload(Investment.portfolio),
        joinedload(Investment.opportunity).joinedload(InvestmentOpportunity.documents)
    ).filter(Investment.id == investment_id).first()
    
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    
    response = InvestmentResponse.model_validate(investment)
    response.portfolio = PortfolioResponse.model_validate(investment.portfolio)
    if investment.opportunity:
        opp_response = InvestmentOpportunityResponse.model_validate(investment.opportunity)
        opp_response.documents = [OpportunityDocumentResponse.model_validate(d) for d in investment.opportunity.documents]
        response.opportunity = opp_response
    
    return response


@router.put("/investments/{investment_id}", response_model=InvestmentResponse)
def update_investment(
    investment_id: int,
    investment_update: InvestmentUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update an investment (admin only)"""
    investment = db.query(Investment).filter(Investment.id == investment_id).first()
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    
    update_data = investment_update.dict(exclude_unset=True)
    
    # Handle portfolio_id change
    if "portfolio_id" in update_data:
        new_portfolio_id = update_data.pop("portfolio_id")
        portfolio = db.query(Portfolio).filter(Portfolio.id == new_portfolio_id).first()
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        investment.portfolio_id = new_portfolio_id
    
    # Handle opportunity_id change
    if "opportunity_id" in update_data:
        new_opportunity_id = update_data.pop("opportunity_id")
        if new_opportunity_id:
            opportunity = db.query(InvestmentOpportunity).filter(
                InvestmentOpportunity.id == new_opportunity_id
            ).first()
            if not opportunity:
                raise HTTPException(status_code=404, detail="Investment opportunity not found")
        investment.opportunity_id = new_opportunity_id
    
    # Update other fields
    for key, value in update_data.items():
        setattr(investment, key, value)
    
    investment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(investment)
    
    # Load relationships for response
    db.refresh(investment)
    response = InvestmentResponse.model_validate(investment)
    response.portfolio = PortfolioResponse.model_validate(investment.portfolio)
    if investment.opportunity:
        opp_response = InvestmentOpportunityResponse.model_validate(investment.opportunity)
        opp_response.documents = [OpportunityDocumentResponse.model_validate(d) for d in investment.opportunity.documents]
        response.opportunity = opp_response
    
    return response


@router.delete("/investments/{investment_id}")
def delete_investment(
    investment_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete an investment (admin only)"""
    investment = db.query(Investment).filter(Investment.id == investment_id).first()
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    
    db.delete(investment)
    db.commit()
    return {"message": "Investment deleted"}
