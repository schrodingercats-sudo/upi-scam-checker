#!/usr/bin/env python3
"""
UPI Scam Detector - Python Backend API
Deploy on Render to run ML models
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys

# Add the parent directory to path to import engine modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engine.simple_analyzer import analyze_message_simple

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'version': '2.1.0',
        'features': ['ML Model', 'Rule-Based Analysis', 'Gemini 2-Step Verification', 'SMS Sender ID Analysis'],
        'message': 'UPI Scam Checker Backend is running',
        'sms_categories': {
            's': 'Service (banks, companies)',
            'g': 'Government (official messages)',
            'p': 'Promotional (marketing, ads)',
            't': 'Transactional/OTP (passwords, transactions)'
        }
    })

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        text = data.get('text', '')
        phone = data.get('phone', '')
        url = data.get('url', '')
        sender_id = data.get('sender_id', '')  # NEW: SMS Sender ID
        
        if not text and not phone and not url:
            return jsonify({'error': 'Provide at least one of: text, phone, url'}), 400
        
        # Use the simple analyzer with SMS sender ID support
        result = analyze_message_simple(text, phone, url, sender_id)
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Analysis error: {e}")
        return jsonify({
            'error': 'Analysis failed',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Starting UPI Scam Checker Backend v2.1.0")
    print("✅ Features: ML Model + Rule-Based + Gemini 2-Step Verification + SMS Sender ID Analysis")
    print("📱 SMS Categories: s=Service, g=Government, p=Promotional, t=Transactional/OTP")
    print("🌐 CORS enabled for frontend integration")
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)
