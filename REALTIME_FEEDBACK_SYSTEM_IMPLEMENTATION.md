# Real-time Feedback System Implementation

## Overview

This document describes the implementation of the real-time feedback system for the UPI Scam Checker application. The system allows users to provide feedback on scam detection results, which is then used to improve the machine learning model over time.

## System Architecture

### Components

1. **Frontend (ResultCard.tsx)**: Displays analysis results and collects user feedback
2. **API Layer (feedback/route.ts)**: Forwards feedback to the backend
3. **Backend (app.py)**: Processes feedback and updates databases
4. **Database (database.py)**: Stores messages, feedback, and training data
5. **Model Retraining (retrain_model.py)**: Retrains the ML model with new feedback

## Workflow Implementation

### 1. User Interaction

When a user analyzes a message, the system:
1. Runs hybrid analysis (rules + ML + AI)
2. Displays results with confidence score
3. Presents feedback options: "Yes", "No", "Uncertain"

### 2. Feedback Processing

Based on user feedback:
- **Yes**: Confirms the prediction and adds to training data
- **No**: Flips the prediction and adds to training data
- **Uncertain**: Stores in hold data for active learning

### 3. Database Schema

The system uses four tables:
1. **messages**: Stores analyzed messages with results
2. **feedback**: Stores user feedback (Yes/No/Uncertain)
3. **training_data**: Confirmed labeled data for model retraining
4. **hold_data**: Uncertain samples for active learning

### 4. Model Retraining

The system supports:
- Periodic retraining with confirmed data
- Active learning with uncertain samples
- Model versioning and updates

## Implementation Details

### Frontend Changes

Modified `ResultCard.tsx` to include three feedback options:
- Yes (ThumbsUp icon)
- No (ThumbsDown icon)
- Uncertain (HelpCircle icon)

### Backend API

Updated `/feedback` endpoint to handle new feedback types:
- Validates feedback values
- Processes feedback according to decision table
- Updates appropriate database tables

### Database Layer

Enhanced `database.py` with:
- New `feedback` table schema (text feedback instead of boolean)
- `hold_data` table for uncertain samples
- Methods for managing all data types

### Model Retraining

Extended `retrain_model.py` with:
- Proper type annotations
- Hold data processing for active learning
- Better error handling

## Testing

Created test scripts to verify:
- Feedback storage and processing
- Database operations
- Model retraining workflow

## Usage

### Providing Feedback

Users can provide feedback through the UI after each analysis:
1. Click "Yes" to confirm the prediction
2. Click "No" to correct the prediction
3. Click "Uncertain" if unsure about the result

### Retraining the Model

To retrain the model with new feedback:
```bash
python trigger_retraining.py
```

Note: Model retraining requires sufficient data from both classes (at least 2 samples per class).

## Future Improvements

1. **Automated Retraining**: Implement periodic retraining based on feedback volume
2. **Active Learning**: Develop more sophisticated strategies for handling uncertain samples
3. **Model Versioning**: Track model performance over time with version control
4. **Metrics Dashboard**: Create visualization of feedback statistics and model performance
5. **Incremental Learning**: Implement online learning algorithms for real-time model updates

## Decision Table

| Prediction | User Feedback | Final Label | Action |
|------------|---------------|-------------|--------|
| FAKE | YES | FAKE | Store in fake dataset + train |
| FAKE | NO | REAL | Store in real dataset + train |
| REAL | YES | REAL | Store in real dataset + train |
| REAL | NO | FAKE | Store in fake dataset + train |
| ANY | UNCERTAIN | NULL | Hold for later active learning |

## API Endpoints

### POST /feedback
Store user feedback on message classification

**Request Body:**
```json
{
  "message_id": 123,
  "feedback": "yes"  // or "no" or "uncertain"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback stored successfully"
}
```

### POST /retrain
Retrain the ML model with feedback data

**Headers:**
```
X-RETRAIN-KEY: [retrain_key]
```

**Response:**
```json
{
  "success": true,
  "message": "Model retrained and updated successfully"
}
```

### POST /process-hold-data
Process hold data for active learning

**Headers:**
```
X-RETRAIN-KEY: [retrain_key]
```

**Response:**
```json
{
  "success": true,
  "message": "Hold data processed successfully"
}
```