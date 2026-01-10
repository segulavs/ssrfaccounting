# Deployment Links & Configuration

## Application Structure

This application contains three separate React apps served from a single FastAPI backend:

### 1. **Shri Sai Ram Financials** (Default - Root)
- **Default Route**: `/`
- **Description**: Co-operative company providing investment opportunities
- **Routes**:
  - `/` - Landing page (Home)
  - `/about` - About Us page
  - `/opportunities` - Investment Opportunities
  - `/testimonials` - Member Testimonials
  - `/login` - Login page

### 2. **SSRF Accounting** (Legacy App)
- **Route**: `/accounting`
- **Description**: Financial accounting and transaction management system
- **Routes** (relative to `/accounting`):
  - `/accounting/` - Dashboard
  - `/accounting/transactions` - Transactions
  - `/accounting/cash-transactions` - Cash Transactions
  - `/accounting/projects` - Projects

### 3. **Portfolio & Investments** (Portfolio App)
- **Route**: `/portfolio`
- **Description**: Investment portfolio management system
- **Routes** (relative to `/portfolio`):
  - `/portfolio/` - Portfolio Dashboard
  - `/portfolio/login` - Login
  - `/portfolio/register` - Register
  - `/portfolio/opportunities` - Investment Opportunities
  - `/portfolio/subscriptions` - My Subscriptions
  - `/portfolio/portfolios/manage` - Portfolio Management (Admin)
  - `/portfolio/opportunities/manage` - Opportunity Management (Admin)
  - And more...

## Railway Deployment URLs

After deploying to Railway, your applications will be accessible at:

### Base URL Structure
Replace `your-app-name` with your Railway app domain:

```
https://your-app-name.railway.app
```

### Application Links

1. **Shri Sai Ram Financials (Default)**
   - Main site: `https://your-app-name.railway.app/`
   - About: `https://your-app-name.railway.app/about`
   - Opportunities: `https://your-app-name.railway.app/opportunities`
   - Testimonials: `https://your-app-name.railway.app/testimonials`
   - Login: `https://your-app-name.railway.app/login`

2. **SSRF Accounting**
   - Main app: `https://your-app-name.railway.app/accounting`
   - Dashboard: `https://your-app-name.railway.app/accounting/`
   - Transactions: `https://your-app-name.railway.app/accounting/transactions`
   - Cash Transactions: `https://your-app-name.railway.app/accounting/cash-transactions`
   - Projects: `https://your-app-name.railway.app/accounting/projects`

3. **Portfolio & Investments**
   - Main app: `https://your-app-name.railway.app/portfolio`
   - Dashboard: `https://your-app-name.railway.app/portfolio/`
   - Login: `https://your-app-name.railway.app/portfolio/login`
   - Opportunities: `https://your-app-name.railway.app/portfolio/opportunities`
   - Subscriptions: `https://your-app-name.railway.app/portfolio/subscriptions`

### API Documentation
- Swagger UI: `https://your-app-name.railway.app/docs`
- ReDoc: `https://your-app-name.railway.app/redoc`
- OpenAPI JSON: `https://your-app-name.railway.app/openapi.json`

## Railway Deployment Configuration

### Environment Variables

Set these in Railway dashboard under your service settings:

```bash
# Required - Railway sets this automatically
PORT=8000

# CORS - Allow your Railway domain
ALLOWED_ORIGINS=https://your-app-name.railway.app

# Database (if using PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/dbname

# Frontend API URL (optional - uses relative URLs by default)
VITE_API_URL=https://your-app-name.railway.app
```

### Build Process

Railway will automatically:
1. Install Python dependencies (`backend/requirements.txt`)
2. Install Node.js dependencies (`frontend/package.json`)
3. Build the frontend React apps (`npm run build`)
4. Start the FastAPI server

### Build Configuration

The app uses `nixpacks.toml` for build configuration:
- Builds Python virtual environment
- Installs frontend dependencies
- Builds all three React apps
- Serves static files from `frontend/dist`

## Local Development URLs

When running locally:

- **Shri Sai Ram Financials**: `http://localhost:3000/` or `http://localhost:3000/index.html`
- **SSRF Accounting**: `http://localhost:3000/accounting` or `http://localhost:3000/accounting.html`
- **Portfolio**: `http://localhost:3000/portfolio` or `http://localhost:3000/portfolio.html`
- **Backend API**: `http://localhost:8000`
- **API Docs**: `http://localhost:8000/docs`

## File Structure

```
frontend/
├── index.html          → Shri Sai Ram Financials (default)
├── accounting.html     → SSRF Accounting app
├── portfolio.html      → Portfolio & Investments app
└── src/
    ├── shri-sai-ram/   → Shri Sai Ram Financials app code
    ├── main.tsx        → Accounting app entry point
    └── portfolio/      → Portfolio app code

backend/
└── main.py            → FastAPI server with static file serving
```

## Troubleshooting

### Frontend not loading
- Ensure `frontend/dist` directory exists after build
- Check that `npm run build` completed successfully
- Verify static file paths in `backend/main.py`

### Routes not working
- Check that React Router basename is configured correctly
- Verify backend route handlers for `/accounting` and `/portfolio`
- Check browser console for routing errors

### CORS errors
- Set `ALLOWED_ORIGINS` environment variable in Railway
- Include your Railway domain URL
- Restart the service after updating environment variables

## Quick Deploy Commands

```bash
# Build frontend
cd frontend && npm run build

# Test locally
cd backend && python -m uvicorn main:app --reload

# Deploy to Railway (automatic via git push)
git add .
git commit -m "Deploy updates"
git push origin main
```

## Notes

- All three apps share the same backend API
- Static files are served from the FastAPI backend in production
- Each app has its own routing configuration
- The default app (Shri Sai Ram Financials) is served at root `/`
