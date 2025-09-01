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
from engine.database import db
from engine.retrain_model import ModelRetrainer

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
        sender_id = data.get('sender_id', '')
        user_id = data.get('user_id', '')
        session_id = data.get('session_id', '')
        
        # Analyze with 100K trained model
        result = analyze_message_simple(
            text=text,
            phone=phone,
            url=url,
            sender_id=sender_id
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
        return jsonify({
            'error': f'Analysis failed: {str(e)}',
            'classification': 'Error',
            'confidence_score': '0%',
            'risk_level': 'Unknown',
            'recommended_action': 'System error occurred'
        }), 500

@app.route('/feedback', methods=['POST'])
def store_feedback():
    """Store user feedback on message classification"""
    try:
        data = request.get_json()
        
        if not data or 'message_id' not in data or 'is_real' not in data:
            return jsonify({
                'error': 'Missing required fields: message_id and is_real'
            }), 400
        
        message_id = data['message_id']
        is_real = data['is_real']  # True for real, False for fake
        
        # Store feedback
        success = db.store_feedback(message_id, is_real)
        
        if success:
            # Add to training data
            # First, get the message text
            conn = sqlite3.connect(db.db_path)
            cursor = conn.cursor()
            cursor.execute('SELECT message_text FROM messages WHERE id = ?', (message_id,))
            result = cursor.fetchone()
            conn.close()
            
            if result:
                message_text = result[0]
                # For our labeling system: real messages are labeled as 0 (not scams), 
                # fake messages are labeled as 1 (scams)
                db.add_to_training_data(message_text, not is_real)
            
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
        return jsonify({
            'success': False,
            'error': f'Feedback storage failed: {str(e)}'
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
        return jsonify({
            'error': f'Stats retrieval failed: {str(e)}'
        }), 500

@app.route('/retrain', methods=['POST'])
def retrain_model():
    """Retrain the ML model with feedback data"""
    try:
        # Check for retraining authorization (in production, use proper auth)
        auth_key = request.headers.get('X-RETRAIN-KEY')
        if auth_key != os.getenv('RETRAIN_KEY', 'default-retrain-key'):
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
        return jsonify({
            'success': False,
            'error': f'Model retraining failed: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("🚀 Starting 100K SMS Scam Detection Backend")
    print("✅ 100K trained model loaded")
    print("✅ SMS Sender ID analysis active")
    print("✅ Gemini API integration ready")
    print("✅ Feedback system ready")
    print("🌐 CORS enabled for frontend integration")
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)