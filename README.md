# Vet Management System

This repository is a monorepo with:
- Backend (Django): `backend/Veterinarymanagementsystem`
- Frontend (Vite/React): `frontend/vetmanagementsystem`

## Why your Render deploy failed
Render ran `pip install -r requirements.txt` from the repo root, but `requirements.txt` is in `backend/Veterinarymanagementsystem/requirements.txt`.

## Deploy on Render (recommended)
Use the included blueprint file: `render.yaml`.

1. In Render, create a new **Blueprint** and connect this repo.
2. Render will create:
   - `vetmanagement-backend` (Python web service)
   - `vetmanagement-frontend` (Static site)
3. Set backend environment variables in Render:
   - `DATABASE_URL` (your Postgres URL)
   - `SECRET_KEY` (strong random value)
   - `ALLOWED_HOSTS` (comma-separated hosts)
   - `CORS_ALLOWED_ORIGINS` (comma-separated frontend origins)
   - `CSRF_TRUSTED_ORIGINS` (comma-separated trusted frontend origins)
   - `DEBUG=False`
4. Set frontend env var on Render static site:
   - `VITE_BACKEND_URL=https://<your-backend-service>.onrender.com`

## Manual deploy alternative
If deploying backend as a single Render web service (not blueprint):
- Root Directory: `backend/Veterinarymanagementsystem`
- Build Command: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
- Start Command: `gunicorn Veterinarymanagementsystem.wsgi:application`
