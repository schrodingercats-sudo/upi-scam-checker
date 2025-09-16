# Real-Time Feedback System Setup

This document explains how to set up and use the real-time feedback system for improving the UPI scam detection model.

## How the Feedback System Works

1. When a user analyzes a message, it gets stored in the backend database with a unique `message_id`
2. The analysis result is displayed to the user with Thumbs Up/Thumbs Down buttons
3. When the user provides feedback, it's sent to the backend and stored in the feedback table
4. The feedback data is also added to the training data table for model retraining
5. The model can be retrained using the `/retrain` endpoint with proper authorization

## Setup Instructions

### 1. Environment Variables

Make sure your `.env.local` file has the correct backend URL:

```bash
# For local development
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# After deploying to Render, update to your actual Render URL
NEXT_PUBLIC_BACKEND_URL=https://your-render-app-name.onrender.com
```

### 2. Running the Backend Locally

To test the feedback system locally:

1. Navigate to the `render_backend` directory:
   ```bash
   cd render_backend
   ```

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the backend server:
   ```bash
   python app.py
   ```

### 3. Testing the Feedback System

1. Start the Next.js frontend:
   ```bash
   npm run dev
   ```

2. Open the application in your browser (usually at http://localhost:3000)

3. Analyze a message - you should see the Thumbs Up/Thumbs Down buttons in the result card

4. Click either button to provide feedback

5. Check the backend console or database to verify the feedback was stored

## Deploying to Production

### Frontend (Vercel)
1. Update `NEXT_PUBLIC_BACKEND_URL` in your Vercel environment variables to point to your Render backend URL
2. Deploy the frontend to Vercel

### Backend (Render)
1. Deploy the `render_backend` directory to Render
2. Set the following environment variables in your Render dashboard:
   - `GOOGLE_GEMINI_API_KEY` - Your Google Gemini API key
   - `RETRAIN_KEY` - A secret key for authorizing model retraining
   - `PORT` - 5000 (or your preferred port)

## Retraining the Model

To retrain the model with new feedback data, make a POST request to the `/retrain` endpoint:

```bash
curl -X POST https://your-render-app-name.onrender.com/retrain \
  -H "X-RETRAIN-KEY: your-retrain-key"
```

## Database Structure

The feedback system uses SQLite with three main tables:

1. `messages` - Stores analyzed messages and their results
2. `feedback` - Stores user feedback (real/fake) for messages
3. `training_data` - Stores verified training data for model retraining

## Troubleshooting

### Feedback Buttons Not Showing
- Ensure the backend is running and accessible
- Check that `NEXT_PUBLIC_BACKEND_URL` is correctly set
- Verify that the analysis response includes a `message_id`

### Feedback Not Being Saved
- Check the browser console for JavaScript errors
- Check the backend console for server errors
- Verify that the feedback API route is working correctly

### Model Retraining Fails
- Ensure the `RETRAIN_KEY` environment variable is set
- Check that the training data table has sufficient data
- Verify that all required Python dependencies are installed