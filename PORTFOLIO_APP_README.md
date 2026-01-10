# Portfolio & Investment App

This is a new UI application for managing portfolios, tracking performance, and subscribing to investment opportunities. It uses the same database as the main SSRF Accounting app but requires user invitations for access.

## Features

- **Invitation-based Access**: Users must be invited by an admin to register
- **Portfolio Performance**: View portfolio performance metrics and charts
- **Portfolio Management** (Admin): Create and manage investment portfolios
- **Investment Opportunities**: Browse opportunities with documents and subscribe
- **Subscription Management**: View and manage your subscriptions
- **Document Management**: Upload and download documents for investment opportunities

## Setup

### Backend Setup

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Create the first admin user:
```bash
python create_admin.py admin@example.com yourpassword "Admin Name"
```

3. Start the backend server:
```bash
python main.py
# or
uvicorn main:app --reload
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Access the portfolio app at:
   - Main app: http://localhost:3000
   - Portfolio app: http://localhost:3000/portfolio.html (or configure your dev server)

## Usage

### For Admins

1. **Create Invitations**:
   - Log in as admin
   - Go to "Invitations" in the navigation
   - Enter an email address and click "Create Invitation"
   - Share the invitation token with the user

2. **Manage Portfolios**:
   - Go to "Manage Portfolios"
   - Create new portfolios with initial values
   - Update portfolio current values
   - Add performance records

3. **Manage Investment Opportunities**:
   - Create opportunities with descriptions and investment amounts
   - Upload documents (PDFs, images, etc.)
   - Set opportunity status (open, closed, completed)

4. **Manage Subscriptions**:
   - View all user subscriptions
   - Approve or reject subscriptions
   - Update subscription status

### For Users

1. **Register**:
   - Go to the registration page
   - Enter your email, password, and the invitation token provided by admin
   - Complete registration

2. **View Portfolio Performance**:
   - See all portfolios and their performance metrics
   - View performance charts over time

3. **Browse Opportunities**:
   - View all open investment opportunities
   - Download associated documents
   - Subscribe to opportunities

4. **Manage Subscriptions**:
   - View your subscriptions
   - Check subscription status
   - Download documents for subscribed opportunities

## API Endpoints

All portfolio API endpoints are prefixed with `/api/portfolio`:

- **Auth**: `/api/portfolio/auth/login`, `/api/portfolio/auth/register`, `/api/portfolio/auth/me`
- **Invitations**: `/api/portfolio/invitations` (admin only)
- **Portfolios**: `/api/portfolio/portfolios`
- **Performance**: `/api/portfolio/portfolios/{id}/performance`
- **Opportunities**: `/api/portfolio/opportunities`
- **Documents**: `/api/portfolio/opportunities/{id}/documents`
- **Subscriptions**: `/api/portfolio/subscriptions`

## Database Models

The app adds the following models to the existing database:

- `users`: User accounts with authentication
- `invitations`: Invitation tokens for user registration
- `portfolios`: Investment portfolios
- `portfolio_performance`: Performance records over time
- `investment_opportunities`: Investment opportunities
- `opportunity_documents`: Documents associated with opportunities
- `subscriptions`: User subscriptions to opportunities

## Security Notes

- Change the `SECRET_KEY` in production (set via `SECRET_KEY` environment variable)
- Use strong passwords for admin accounts
- Invitation tokens expire after 7 days
- Documents are stored in `uploads/opportunities/` directory

## Development

The portfolio app is built with:
- **Backend**: FastAPI, SQLAlchemy, JWT authentication
- **Frontend**: React, TypeScript, Tailwind CSS, Recharts

To add new features, extend the models, schemas, and API endpoints following the existing patterns.
