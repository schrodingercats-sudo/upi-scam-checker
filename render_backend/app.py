#!/usr/bin/env python3
"""
UPI Scam Detector - Python Backend API
Deploy on Render to run ML models
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from engine.simple_analyzer import analyze_message_simple

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
        
        # Analyze with 100K trained model
        result = analyze_message_simple(
            text=text,
            phone=phone,
            url=url,
            sender_id=sender_id
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': f'Analysis failed: {str(e)}',
            'classification': 'Error',
            'confidence_score': '0%',
            'risk_level': 'Unknown',
            'recommended_action': 'System error occurred'
        }), 500

if __name__ == '__main__':
    print("🚀 Starting 100K SMS Scam Detection Backend")
    print("✅ 100K trained model loaded")
    print("✅ SMS Sender ID analysis active")
    print("✅ Gemini API integration ready")
    print("🌐 CORS enabled for frontend integration")
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)
