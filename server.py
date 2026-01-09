"""
Server entry point for ASGI applications.
This file allows running uvicorn from the root directory.
"""
import sys
from pathlib import Path

# Add backend directory to Python path so we can import from it
backend_dir = Path(__file__).parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Now import the app from backend/main.py
from main import app

__all__ = ["app"]
