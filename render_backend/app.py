#!/usr/bin/env python3
"""
UPI Scam Detector - Python Backend API
Deploy on Render to run ML models
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import sqlite3
from engine.simple_analyzer import analyze_message_simple
from engine.basic_analyzer import analyze_message_basic
from engine.database import db
from engine.retrain_model import ModelRetrainer

RETRAIN_KEY = os.getenv('RETRAIN_KEY')
if not RETRAIN_KEY:
    raise ValueError("A RETRAIN_KEY environment variable must be set.")

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'version': '3.0.0',
        'model': '100K SMS Trained Model',
        'features': [
            'Advanced ML Model (100K messages)',
            'SMS Sender ID Analysis (DND Categories)',
            'Gemini API Integration',
            'Multi-layered Detection',
            'Fast2SMS Whitelist',
            'Rule-based + ML + AI Analysis'
        ],
        'sms_categories': {
            's': 'Service (banks, companies) - TRUSTED',
            'g': 'Government (official messages) - TRUSTED',
            'p': 'Promotional (marketing, ads) - SUSPICIOUS',
            't': 'Transactional/OTP (passwords, transactions) - TRUSTED'
        }
    })

@app.route('/analyze', methods=['POST'])
def analyze_sms():
    """Analyze SMS message with 100K trained model"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'error': 'Missing required field: text'
            }), 400
        
        text = data['text']
        phone = data.get('phone', '')
        url = data.get('url', '')
        user_id = data.get('user_id', '')
        session_id = data.get('session_id', '')
        
        # Analyze with 100K trained model
        result = analyze_message_simple(
            text=text,
            phone=phone,
            url=url
        )
        
        # Store message in database for feedback collection
        message_id = db.store_message(
            message_text=text,
            analysis_result=result,
            user_id=user_id,
            session_id=session_id
        )
        
        # Add message_id to result for frontend feedback
        result['message_id'] = message_id
        
        return jsonify(result)
        
    except Exception as e:
        # In a real app, you'd use a logger here
        print(f"ERROR in /analyze: {e}")
        return jsonify({
            'error': 'An internal server error occurred during analysis.',
            'classification': 'Error',
            'confidence_score': '0%',
            'risk_level': 'Unknown',
            'recommended_action': 'A system error occurred. Please try again later.'
        }), 500

@app.route('/feedback', methods=['POST'])
def store_feedback():
    """Store user feedback on message classification"""
    try:
        data = request.get_json()
        
        if not data or 'message_id' not in data or 'feedback' not in data:
            return jsonify({
                'error': 'Missing required fields: message_id and feedback'
            }), 400
        
        message_id = data['message_id']
        feedback = data['feedback']  # 'yes', 'no', or 'uncertain'
        
        # Validate feedback value
        if feedback not in ['yes', 'no', 'uncertain']:
            return jsonify({
                'error': 'Invalid feedback value. Must be "yes", "no", or "uncertain"'
            }), 400
        
        # Store feedback in database
        success = db.store_user_feedback(message_id, feedback)
        
        if success:
            # Get the original message and analysis result
            conn = sqlite3.connect(db.db_path)
            cursor = conn.cursor()
            cursor.execute('SELECT message_text, analysis_result FROM messages WHERE id = ?', (message_id,))
            result = cursor.fetchone()
            conn.close()
            
            if result:
                message_text = result[0]
                analysis_result = json.loads(result[1]) if result[1] else {}
                
                # Process feedback based on the response
                if feedback == 'yes':
                    # User confirms the prediction - store with final label
                    predicted_label = analysis_result.get('classification', 'Unknown')
                    is_scam = predicted_label in ['Scam', 'Suspicious']
                    # Store in training data with the confirmed label
                    db.add_to_training_data(message_text, is_scam)
                elif feedback == 'no':
                    # User disagrees with prediction - flip the label
                    predicted_label = analysis_result.get('classification', 'Unknown')
                    is_scam = predicted_label in ['Scam', 'Suspicious']
                    # Store with flipped label
                    db.add_to_training_data(message_text, not is_scam)
                elif feedback == 'uncertain':
                    # User is uncertain - store in hold data for active learning
                    # Get the feedback ID for reference
                    conn = sqlite3.connect(db.db_path)
                    cursor = conn.cursor()
                    cursor.execute('SELECT id FROM feedback WHERE message_id = ? ORDER BY id DESC LIMIT 1', (message_id,))
                    feedback_result = cursor.fetchone()
                    conn.close()
                    
                    if feedback_result:
                        feedback_id = feedback_result[0]
                        db.add_to_hold_data(message_text, analysis_result, feedback_id)
            
            return jsonify({
                'success': True,
                'message': 'Feedback stored successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to store feedback'
            }), 500
            
    except Exception as e:
        print(f"ERROR in /feedback: {e}")
        return jsonify({
            'success': False,
            'error': 'An internal server error occurred while storing feedback.'
        }), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get feedback statistics"""
    try:
        feedback_counts = db.get_feedback_count()
        recent_messages = db.get_recent_messages(5)
        
        return jsonify({
            'feedback_counts': feedback_counts,
            'recent_messages': recent_messages
        })
    except Exception as e:
        print(f"ERROR in /stats: {e}")
        return jsonify({
            'error': 'An internal server error occurred while retrieving stats.'
        }), 500

@app.route('/retrain', methods=['POST'])
def retrain_model():
    """Retrain the ML model with feedback data"""
    try:
        # Check for retraining authorization
        auth_key = request.headers.get('X-RETRAIN-KEY')
        if auth_key != RETRAIN_KEY:
            return jsonify({
                'success': False,
                'error': 'Unauthorized retraining request'
            }), 401
        
        # Perform retraining
        retrainer = ModelRetrainer()
        success = retrainer.retrain_model()
        
        if success:
            # Update the simple analyzer model
            retrainer.update_simple_analyzer_model()
            
            return jsonify({
                'success': True,
                'message': 'Model retrained and updated successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Model retraining failed'
            }), 500
            
    except Exception as e:
        print(f"ERROR in /retrain: {e}")
        return jsonify({
            'success': False,
            'error': 'An internal server error occurred during model retraining.'
        }), 500

@app.route('/process-hold-data', methods=['POST'])
def process_hold_data():
    """Process hold data for active learning"""
    try:
        # Check for authorization
        auth_key = request.headers.get('X-RETRAIN-KEY')
        if auth_key != RETRAIN_KEY:
            return jsonify({
                'success': False,
                'error': 'Unauthorized request'
            }), 401
        
        # Process hold data
        retrainer = ModelRetrainer()
        success = retrainer.process_hold_data()
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Hold data processed successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Hold data processing failed'
            }), 500
            
    except Exception as e:
        print(f"ERROR in /process-hold-data: {e}")
        return jsonify({
            'success': False,
            'error': 'An internal server error occurred while processing hold data.'
        }), 500

@app.route('/analyze-basic', methods=['POST'])
def analyze_sms_basic():
    """Analyze SMS message with basic regex-based analysis"""
    try:
        data = request.get_json()

        if not data or 'text' not in data:
            return jsonify({
                'error': 'Missing required field: text'
            }), 400

        text = data['text']

        result = analyze_message_basic(text)

        return jsonify(result)

    except Exception as e:
        print(f"ERROR in /analyze-basic: {e}")
        return jsonify({
            'error': 'An internal server error occurred during basic analysis.'
        }), 500

if __name__ == '__main__':
    print("🚀 Starting 100K SMS Scam Detection Backend")
    print("✅ 100K trained model loaded")
    print("✅ SMS Sender ID analysis active")
    print("✅ Gemini API integration ready")
    print("✅ Feedback system ready")
    print("🌐 CORS enabled for frontend integration")
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)