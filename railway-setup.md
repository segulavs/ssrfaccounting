# Railway Deployment Guide

This guide will help you deploy the SSRF Accounting application to Railway.

## Prerequisites

1. A Railway account (sign up at https://railway.app)
2. Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Connect Your Repository

1. Go to Railway dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo" (or your Git provider)
4. Select your repository

### 2. Configure Environment Variables

In Railway, go to your project settings and add these environment variables:

#### Required Variables:
- `PORT` - Railway will set this automatically, but you can verify it's set
- `ALLOWED_ORIGINS` - Set to your Railway frontend URL (e.g., `https://your-app.railway.app`) or leave empty for development

#### Database (Optional):
- `DATABASE_URL` - Railway PostgreSQL URL (Railway will provide this if you add a PostgreSQL service)
  - If not set, the app will use SQLite (not recommended for production)

#### Frontend API URL (Optional):
- `VITE_API_URL` - Set to your Railway backend URL (e.g., `https://your-backend.railway.app`)
  - If not set, the frontend will use relative URLs (recommended when serving from same domain)

### 3. Add PostgreSQL Database (Recommended)

1. In Railway, click "New" → "Database" → "Add PostgreSQL"
2. Railway will automatically set the `DATABASE_URL` environment variable
3. The app will automatically use this database

### 4. Deploy

Railway will automatically:
1. Detect the project structure
2. Install dependencies (Python and Node.js)
3. Build the frontend
4. Start the backend server

### 5. Verify Deployment

1. Check the Railway logs to ensure the app started successfully
2. Visit your Railway URL to see the application
3. Test the API at `https://your-app.railway.app/docs`

## Project Structure

Railway will:
- Build the frontend (React/Vite) into `frontend/dist`
- Serve static files from the backend
- Run the FastAPI backend on the configured PORT

## Troubleshooting

### Build Fails
- Check Railway logs for specific errors
- Ensure all dependencies are in `requirements.txt` and `package.json`
- Verify Node.js and Python versions are compatible

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL service is running in Railway
- Ensure database URL format is correct (postgresql:// not postgres://)

### CORS Errors
- Set `ALLOWED_ORIGINS` to your frontend URL
- Include both http and https if needed: `http://localhost:3000,https://your-app.railway.app`

### Frontend Can't Connect to Backend
- Set `VITE_API_URL` to your backend URL
- Or ensure frontend and backend are served from the same domain

## Environment Variables Summary

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | Auto | Port Railway assigns | `8000` |
| `DATABASE_URL` | No | PostgreSQL connection string | `postgresql://...` |
| `ALLOWED_ORIGINS` | No | CORS allowed origins (comma-separated) | `https://app.railway.app` |
| `VITE_API_URL` | No | Frontend API base URL | `https://api.railway.app` |

## Environment Variables for Local Development

Create a `.env` file in the root directory (not committed to git):

```env
# Backend
PORT=8000
DATABASE_URL=sqlite:///./ssrf_accounting.db
ALLOWED_ORIGINS=http://localhost:3000

# Frontend (create .env in frontend/ directory)
VITE_API_URL=http://localhost:8000
```

## Notes

- The app uses Nixpacks for automatic build detection
- Node.js 20.x is used (configured in `nixpacks.toml`)
- Frontend is built during deployment and served as static files
- Backend serves both API and static frontend files
- SQLite is used if `DATABASE_URL` is not set (not recommended for production)

## Troubleshooting Build Issues

If you encounter Node.js version errors:
- The project uses Node.js 20.x (configured in `nixpacks.toml`)
- Ensure your `package.json` engines field specifies `>=20.0.0`
- Railway will automatically use the version specified in `nixpacks.toml`

## Resource Requirements

### Minimum Resources (Testing/Small Scale)
- **vCPU**: 0.25 vCPU
- **RAM**: 512 MB
- **Use Case**: Development, testing, or very small transaction volumes (< 1,000 transactions)

**Note**: With minimum resources, large MT940 file uploads may timeout or fail.

### Recommended Resources (Production)
- **vCPU**: 0.5 - 1 vCPU
- **RAM**: 1 GB
- **Use Case**: Small to medium business (< 10,000 transactions, < 100 MB files)

### Optimal Resources (Heavy Usage)
- **vCPU**: 1+ vCPU
- **RAM**: 2 GB
- **Use Case**: Large transaction volumes (> 10,000 transactions), frequent file uploads, complex analytics queries

### Resource Considerations

1. **File Processing**: MT940 and CSV file uploads are memory-intensive. Larger files (> 10 MB) benefit from 1GB+ RAM.

2. **Database**: 
   - SQLite (default): Suitable for < 10,000 transactions with 512MB-1GB RAM
   - PostgreSQL (recommended): Better performance and can handle larger datasets, uses separate Railway service (doesn't count toward app resources)

3. **Dashboard Analytics**: Aggregating large datasets (filtering by date ranges, calculating project stats) benefits from additional CPU.

4. **Frontend**: Static files are served from FastAPI, no additional runtime resources needed.

### Setting Resources in Railway

1. Go to your service in Railway dashboard
2. Click on "Settings" → "Resources"
3. Adjust the CPU and Memory sliders
4. Save changes (will trigger a redeploy)

**Cost Note**: Railway charges based on usage. Start with minimum resources and scale up based on actual performance needs.
