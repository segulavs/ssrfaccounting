# SSRF Accounting Application

A comprehensive accounting application that processes MT940 bank statements, manages transactions, projects, and provides detailed financial dashboards.

## Features

- **MT940 Statement Processing**: Upload and parse MT940 bank statement files
- **Transaction Management**: View, tag, and manage bank transactions
- **Cash Transaction Entry**: Manually add cash transactions
- **Project Management**: Create and manage projects for cost tracking
- **Transaction Tagging**: Tag transactions to specific projects
- **Dashboard Analytics**: 
  - View consolidated costs per project
  - Filter by period (week/month/quarter/year)
  - Income vs expenses visualization
  - Net amount trends
  - Transaction summaries

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database operations
- **SQLite**: Database (can be upgraded to PostgreSQL)
- **MT940**: Library for parsing MT940 statements

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Recharts**: Data visualization
- **React Router**: Navigation
- **Axios**: HTTP client

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

### 1. Create Projects
- Navigate to the "Projects" page
- Click "Create Project"
- Enter project name and description
- Projects can be used to tag transactions

### 2. Upload MT940 Statements
- Navigate to the "Transactions" page
- Click "Upload MT940" and select your MT940 file
- Transactions will be automatically imported and parsed
- **Note**: MT940 files are standard bank statement files. Ensure your file is in proper MT940 format (usually .940 or .txt extension)

### 3. Tag Transactions
- On the Transactions page, click on "Click to tag" next to any transaction
- Select a project from the dropdown
- The transaction will be tagged to that project

### 4. Add Cash Transactions
- Navigate to the "Cash Transactions" page
- Click "+ Add Cash Transaction"
- Fill in the details (date, amount, description, project)
- Use negative amounts for expenses

### 5. View Dashboard
- Navigate to the Dashboard
- Select a project (or "All Projects")
- Choose a period type (week/month/quarter/year)
- View consolidated statistics, charts, and recent transactions

## API Endpoints

### Transactions
- `POST /api/upload-mt940` - Upload MT940 file
- `GET /api/transactions` - Get all transactions (with optional filters)
- `PATCH /api/transactions/{id}` - Update transaction (tag to project)
- `DELETE /api/transactions/{id}` - Delete transaction

### Cash Transactions
- `POST /api/cash-transactions` - Create cash transaction
- `GET /api/cash-transactions` - Get all cash transactions
- `PATCH /api/cash-transactions/{id}` - Update cash transaction
- `DELETE /api/cash-transactions/{id}` - Delete cash transaction

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - Get all projects
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Dashboard
- `POST /api/dashboard/stats` - Get dashboard statistics

## Database

The application uses SQLite by default. The database file (`ssrf_accounting.db`) will be created automatically in the backend directory.

To use PostgreSQL or another database, update the `SQLALCHEMY_DATABASE_URL` in `backend/database.py`.

## Development

### Backend Development
- The API documentation is available at `http://localhost:8000/docs` (Swagger UI)
- Alternative docs at `http://localhost:8000/redoc`

### Frontend Development
- Hot module replacement is enabled
- TypeScript strict mode is enabled
- Tailwind CSS is configured for styling

## Deployment

### Railway Deployment

This application is configured for deployment on Railway. See [railway-setup.md](./railway-setup.md) for detailed deployment instructions.

#### Quick Railway Setup:

1. **Connect Repository**: Link your GitHub/GitLab repository to Railway
2. **Add PostgreSQL**: Add a PostgreSQL database service in Railway
3. **Set Environment Variables** (optional):
   - `ALLOWED_ORIGINS`: Your Railway app URL
   - `VITE_API_URL`: Your backend API URL (if frontend/backend are separate)
4. **Deploy**: Railway will automatically build and deploy

The application will:
- Build the frontend React app
- Serve static files from the FastAPI backend
- Use PostgreSQL database (if configured) or SQLite (fallback)

For more details, see [railway-setup.md](./railway-setup.md).

## License

MIT
