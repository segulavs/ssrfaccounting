"""
Server entry point for ASGI applications.
This file allows deployment platforms to import the app as 'server:app'
"""
from main import app

__all__ = ["app"]
