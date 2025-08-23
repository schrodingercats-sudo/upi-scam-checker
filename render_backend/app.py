#!/usr/bin/env python3
"""
UPI Scam Detector - Python Backend API
Deploy on Render to run ML models
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import json
from datetime import datetime

# Add the parent directory to path to import engine modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from engine.analyzer import analyze_message
    from engine.entities import extract_entities, parse_domains, sender_heuristics
    from engine.rules import is_whitelisted, rule_check, link_risk, phone_risk
    from engine.config import WEIGHTS, LOG_DIR, LOG_FILE
    from engine.phone_registry import record_observation
    ML_AVAILABLE = True
except ImportError as e:
    print(f"ML modules not available: {e}")
    ML_AVAILABLE = False

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from Vercel

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Render"""
    return jsonify({
        'status': 'healthy',
        'ml_available': ML_AVAILABLE,
        'timestamp': datetime.utcnow().isoformat(),
        'version': '2.0.0'
    })

@app.route('/analyze', methods=['POST'])
def analyze():
    """Main analysis endpoint"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        phone = data.get('phone', '')
        url = data.get('url', '')
        
        if not text and not phone and not url:
            return jsonify({'error': 'Provide at least one of: text, phone, url'}), 400
        
        if ML_AVAILABLE:
            # Use the full ML-powered analysis
            result = analyze_message(text, phone, url)
            return jsonify(result)
        else:
            # Fallback analysis if ML modules aren't available
            result = fallback_analysis(text, phone, url)
            return jsonify(result)
            
    except Exception as e:
        return jsonify({
            'error': str(e),
            'classification': 'Suspicious',
            'confidence_score': '70%',
            'risk_level': 'Medium',
            'red_flags': [f'Analysis error: {str(e)}'],
            'recommended_action': 'Error occurred during analysis. Exercise caution.'
        }), 500

def fallback_analysis(text, phone='', url=''):
    """Fallback analysis if ML modules aren't available"""
    input_text = text or ''
    input_lower = input_text.lower()
    
    # Basic scam detection patterns
    scam_patterns = [
        'bank credit' in input_lower and ('click' in input_lower or 'link' in input_lower),
        'bank debit' in input_lower and ('click' in input_lower or 'link' in input_lower),
        'credit' in input_lower and 'inr' in input_lower and ('click' in input_lower or 'link' in input_lower),
        'debit' in input_lower and 'inr' in input_lower and ('click' in input_lower or 'link' in input_lower),
        any(amount in input_lower for amount in ['12000', '10000', '5000', '2000', '1000']) and 
        any(action in input_lower for action in ['click', 'link', 'verify', 'confirm']),
        any(urgent in input_lower for urgent in ['urgent', 'immediate', 'quick', 'fast']) and
        any(financial in input_lower for financial in ['bank', 'credit', 'debit', 'inr', 'rs', '₹']),
        any(gov in input_lower for gov in ['government', 'govt', 'official', 'authority']) and
        any(action in input_lower for action in ['click', 'link', 'verify', 'confirm']),
        any(otp in input_lower for otp in ['otp', 'verification', 'code']) and
        any(action in input_lower for action in ['click', 'link', 'verify', 'confirm']),
        any(suspicious in input_lower for suspicious in ['bit.ly', 'tinyurl', 'goo.gl', 't.co', 'is.gd']),
        any(sub in input_lower for sub in ['b@nk', 'cr3dit', 'd3bit', '0tp', 'v3rify', 'c0nfirm']),
        input_text.count('!') >= 3 and any(financial in input_lower for financial in ['bank', 'credit', 'debit', 'inr', 'rs', '₹']),
        len([c for c in input_text if c.isupper()]) > len(input_text) * 0.6 and 
        any(financial in input_lower for financial in ['bank', 'credit', 'debit', 'inr', 'rs', '₹'])
    ]
    
    if any(scam_patterns):
        return {
            'classification': 'Scam',
            'confidence_score': '99%',
            'risk_level': 'High',
            'red_flags': [
                'IMMEDIATE BLOCK: Obvious scam pattern detected',
                'Hard-coded security rule triggered',
                'Cannot be bypassed by ML manipulation'
            ],
            'recommended_action': 'BLOCKED: This is a confirmed scam message. Do not interact.'
        }
    
    # Basic scoring system
    score = 0
    red_flags = []
    
    scam_keywords = ['urgent', 'immediate', 'suspended', 'blocked', 'expired', 'verification',
                     'click', 'click here', 'verify now', 'kyc pending', 'kyc expiring', 'lottery', 'prize',
                     'won', 'inheritance', 'free money', 'processing fee', 'refund', 'penalty', 'fir']
    
    for keyword in scam_keywords:
        if keyword in input_lower:
            score += 0.4
            red_flags.append(f'Contains scam keyword: "{keyword}"')
    
    if score >= 0.8:
        classification = 'Scam'
        risk_level = 'High'
        confidence = '90%'
    elif score >= 0.4:
        classification = 'Suspicious'
        risk_level = 'Medium'
        confidence = '75%'
    else:
        classification = 'Safe'
        risk_level = 'Low'
        confidence = '85%'
    
    # Safety guard: any red flag → at least Suspicious
    if red_flags and classification == 'Safe':
        classification = 'Suspicious'
        risk_level = 'Medium'
        confidence = '70%'
    
    return {
        'classification': classification,
        'confidence_score': confidence,
        'risk_level': risk_level,
        'red_flags': red_flags[:6],
        'recommended_action': 'Analysis completed with fallback system.'
    }

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
