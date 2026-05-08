# Smart AQI Health Impact Analysis System

## Quick Start (Development)

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# Runs on http://localhost:8000
# API docs: http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Login
- Email: `demo@aqi.com`
- Password: `demo1234`

---

## Docker (Production)

```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
```

---

## Project Structure

```
smart-aqi-health-system/
├── backend/          # FastAPI + ML pipeline
├── frontend/         # React + Vite SPA
├── dataset/          # Training data (air_quality.csv)
├── models/           # Trained ML model artifacts
├── logs/             # Audit logs
├── static/           # SVG icons and logo
└── docker-compose.yml
```

## Tech Stack
- **Backend**: FastAPI, scikit-learn, XGBoost, pandas, ReportLab
- **Frontend**: React, TypeScript, Vite, Plotly, Leaflet
- **ML**: Random Forest, Gradient Boosting, XGBoost, Linear Regression
