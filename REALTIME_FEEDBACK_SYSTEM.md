# Real-time Feedback System for UPI Scam Checker

## Overview

This document explains the implementation of a real-time feedback system for the UPI Scam Checker that allows users to provide feedback on analysis results, which is then used to improve the machine learning model.

## System Architecture

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend  │────│   Feedback   │────│   Database   │
│  (Next.js)  │    │    Proxy     │    │   (SQLite)   │
└─────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│   Backend   │────│   Training   │────│   Retrained  │
│  (Flask)    │    │   Module     │    │    Model     │
└─────────────┘    └──────────────┘    └──────────────┘
```

## Components

### 1. Database (SQLite)
- **File**: `render_backend/engine/database.py`
- **Tables**:
  - `messages`: Stores all analyzed messages
  - `feedback`: Stores user feedback (real/fake)
  - `training_data`: Verified training samples for retraining

### 2. Frontend Integration
- **File**: `components/ResultCard.tsx` - Added feedback collection UI
- **File**: `components/ScamAnalyzer.tsx` - Modified to pass session IDs
- **API Routes**:
  - `/api/feedback` - Proxies feedback to backend
  - `/api/config` - Returns backend configuration

### 3. Backend API (Flask)
- **File**: `render_backend/app.py`
- **Endpoints**:
  - `POST /analyze` - Analyze SMS and store in database
  - `POST /feedback` - Store user feedback
  - `GET /stats` - Get feedback statistics
  - `POST /retrain` - Retrain model with feedback data (protected)

### 4. Model Retraining
- **File**: `render_backend/engine/retrain_model.py`
- Retrains the ML model using user feedback
- Updates the simple analyzer model with improved versions

## How It Works

1. **Message Analysis**:
   - User submits a message for analysis
   - Message is stored in the database with a unique ID
   - Analysis results are returned to the frontend

2. **Feedback Collection**:
   - User sees analysis results with feedback buttons
   - User clicks "Real Message" or "Fake/Scam"
   - Feedback is sent to the backend and stored in the database

3. **Training Data Management**:
   - Feedback is converted to training data
   - Real messages are labeled as "not scam" (0)
   - Fake messages are labeled as "scam" (1)

4. **Model Retraining**:
   - Periodically triggered via `/retrain` endpoint
   - Uses all feedback data to retrain the model
   - Updates the active model used for analysis

## Deployment

### Environment Variables
Set these in your Render dashboard:
- `GOOGLE_GEMINI_API_KEY` - For AI analysis features
- `RETRAIN_KEY` - Secret key to protect retraining endpoint
- `PORT` - Set to 5000 (default)

### Render Deployment
1. Connect your GitHub repository to Render
2. Set the build command: `pip install -r requirements.txt`
3. Set the start command: `python app.py`
4. Configure environment variables
5. Deploy!

## API Endpoints

### Frontend Endpoints
- `POST /api/feedback` - Submit user feedback
- `GET /api/config` - Get backend configuration

### Backend Endpoints
- `POST /analyze` - Analyze SMS message
- `POST /feedback` - Store user feedback
- `GET /stats` - Get feedback statistics
- `POST /retrain` - Retrain model (requires RETRAIN_KEY header)

## Security Considerations

1. **Retraining Protection**: The `/retrain` endpoint requires a secret key in the `X-RETRAIN-KEY` header
2. **CORS**: Properly configured to allow frontend communication
3. **Data Privacy**: Only stores message text and analysis results, no personal information

## Future Improvements

1. **Automated Retraining**: Schedule regular model retraining
2. **Advanced Feedback**: Allow users to provide detailed feedback
3. **Model Versioning**: Keep track of model versions and performance
4. **Analytics Dashboard**: Visualize feedback and model performance