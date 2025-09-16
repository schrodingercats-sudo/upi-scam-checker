# Real-time Feedback System

This document describes the implementation of the real-time feedback system for the UPI Scam Checker application.

## Workflow

### Input
- User enters a text message (string)

### Hybrid Analysis
1. Run Rules Engine (regex for UPI IDs, suspicious payment words, scammy links)
2. Run ML Model (current trained classifier)
3. Combine → choose label (FAKE or REAL) and probability score

### Output to User
- Display:
  - Prediction (FAKE / REAL)
  - Confidence (0–1)
  - Ask: "Is this correct? (Yes / No / Uncertain)"

### Review Handling
- If YES → store prediction as final_label in DB
- If NO → flip label and store corrected final_label
- If UNCERTAIN → store in DB with final_label=NULL for active learning later

### Database Storage
Insert into messages table:
- body (the text)
- predicted_label
- predicted_confidence
- reviewer_answer
- final_label

### Real-time Learning
When a final_label is confirmed (YES/NO), trigger incremental training:
- Update the ML model with the new labeled sample (partial_fit)
- Save model version

If uncertain → store separately in dataset_hold

### System Behavior
- Always respond instantly to user input
- Keep improving as more text + reviews come in
- Uncertain samples are fed back later for retraining (active learning)

## Example Runtime Decision Table

| Prediction | User says | Final Label | Action |
|------------|-----------|-------------|--------|
| FAKE | YES | FAKE | Store in fake dataset + train |
| FAKE | NO | REAL | Store in real dataset + train |
| REAL | YES | REAL | Store in real dataset + train |
| REAL | NO | FAKE | Store in fake dataset + train |
| ANY | UNCERTAIN | NULL | Hold for later active learning |

## Implementation Details

### Frontend (ResultCard.tsx)
- Updated feedback UI to include three options: Yes, No, Uncertain
- Sends feedback to backend API with message_id and feedback value

### Backend API (/feedback endpoint)
- Receives feedback from frontend
- Stores feedback in database
- Processes feedback according to the decision table:
  - YES: Confirms prediction and adds to training data
  - NO: Flips prediction and adds to training data
  - UNCERTAIN: Adds to hold data for active learning

### Database Schema
- messages: Stores analyzed messages
- feedback: Stores user feedback (Yes/No/Uncertain)
- training_data: Confirmed labeled data for model retraining
- hold_data: Uncertain samples for active learning

### Model Retraining
- New endpoint /retrain to trigger model retraining with confirmed data
- New endpoint /process-hold-data to handle uncertain samples
- Uses RandomForestClassifier for retraining
- Updates the simple analyzer model with retrained model

## Future Improvements
1. Implement automatic periodic retraining
2. Add more sophisticated active learning strategies
3. Implement model versioning and rollback capabilities
4. Add metrics tracking for model performance over time