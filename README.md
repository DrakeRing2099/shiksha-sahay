# shiksha-sahay
Grit Teach is an on-the-go, AI-powered support system designed to help teachers during real classroom moments. When a teacher faces a challenge, they can speak or type their problem, and the system quickly converts it into a structured query with key context like subject, grade, time constraints, and available materials.

## Prerequisites
- Docker (for Postgres)
- Python (3.x) + pip
- Node.js (LTS recommended) + npm

## Quick start (after cloning)

### 1) Start the database
The repo includes a Postgres service on port `5433`.

```bash
docker compose up -d db
```

To stop it later:

```bash
docker compose down
```

### 2) Configure backend env vars
Create `backend/.env` from the example:

```bash
copy backend\.env.example backend\.env
```

The default values are:
```
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/shiksha_sahay
LLM_PROVIDER="pollinations"
```

### 3) Install and run the backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Optional seed data (creates tables if needed):

```bash
python scripts\seed_db.py --create-schema
```

### 4) Install and run the frontend
In another terminal:

```bash
cd frontend
npm install
npm run dev
```

By default the frontend calls the backend at `http://localhost:8000`. To change it, create `frontend/.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Open the app at `http://localhost:3000`.
