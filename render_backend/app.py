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

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from Vercel

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Render"""
    return jsonify({
        'status': 'healthy',
        'ml_available': False,  # Will be True once ML modules are loaded
        'timestamp': datetime.utcnow().isoformat(),
        'version': '2.0.0',
        'backend': 'Render Python Backend'
    })

@app.route('/analyze', methods=['POST'])
def analyze():
    """Main analysis endpoint with immediate blocking"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        phone = data.get('phone', '')
        url = data.get('url', '')
        
        if not text and not phone and not url:
            return jsonify({'error': 'Provide at least one of: text, phone, url'}), 400
        
        # Apply immediate hard-coded blocking (same logic as Vercel)
        immediate_blocking_result = immediate_blocking_check(text)
        if immediate_blocking_result:
            return jsonify(immediate_blocking_result)
        
        # For now, use enhanced fallback analysis
        result = enhanced_fallback_analysis(text, phone, url)
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

def immediate_blocking_check(text):
    """Immediate blocking for obvious scam patterns - CANNOT BE BYPASSED"""
    if not text:
        return None
        
    body = text.lower()
    
    # CRITICAL: Immediate blocking for obvious scam patterns
    immediate_scam_patterns = [
        # Bank credit/debit patterns
        'bank credit' in body and ('click' in body or 'link' in body),
        'bank debit' in body and ('click' in body or 'link' in body),
        'credit' in body and 'inr' in body and ('click' in body or 'link' in body),
        'debit' in body and 'inr' in body and ('click' in body or 'link' in body),
        
        # Amount + action patterns
        any(amount in body for amount in ['12000', '10000', '5000', '2000', '1000']) and 
        any(action in body for action in ['click', 'link', 'verify', 'confirm']),
        
        # Urgency + financial patterns
        any(urgent in body for urgent in ['urgent', 'immediate', 'quick', 'fast']) and
        any(financial in body for financial in ['bank', 'credit', 'debit', 'inr', 'rs', '₹']),
        
        # Government + action patterns
        any(gov in body for gov in ['government', 'govt', 'official', 'authority']) and
        any(action in body for action in ['click', 'link', 'verify', 'confirm']),
        
        # OTP + action patterns
        any(otp in body for otp in ['otp', 'verification', 'code']) and
        any(action in body for action in ['click', 'link', 'verify', 'confirm']),
        
        # Suspicious URL patterns
        any(suspicious in body for suspicious in ['bit.ly', 'tinyurl', 'goo.gl', 't.co', 'is.gd']),
        
        # Character substitution attempts
        any(sub in body for sub in ['b@nk', 'cr3dit', 'd3bit', '0tp', 'v3rify', 'c0nfirm']),
        
        # Multiple exclamation marks (urgency indicator)
        text.count('!') >= 3 and any(financial in body for financial in ['bank', 'credit', 'debit', 'inr', 'rs', '₹']),
        
        # ALL CAPS financial messages
        len([c for c in text if c.isupper()]) > len(text) * 0.6 and 
        any(financial in body for financial in ['bank', 'credit', 'debit', 'inr', 'rs', '₹'])
    ]
    
    # If ANY pattern matches, immediately block as SCAM
    if any(immediate_scam_patterns):
        return {
            'classification': 'Scam',
            'confidence_score': '99%',
            'risk_level': 'High',
            'red_flags': [
                'IMMEDIATE BLOCK: Obvious scam pattern detected',
                'Hard-coded security rule triggered',
                'Cannot be bypassed by ML manipulation'
            ],
            'recommended_action': 'BLOCKED: This is a confirmed scam message. Do not interact.',
            'blocked_by': 'immediate_pattern',
            'backend': 'Render Python Backend'
        }
    
    return None  # No immediate blocking needed

def enhanced_fallback_analysis(text, phone='', url=''):
    """Enhanced fallback analysis system"""
    input_text = text or ''
    input_lower = input_text.lower()
    
    # Enhanced scam detection patterns
    scam_keywords = [
        'urgent', 'immediate', 'suspended', 'blocked', 'expired', 'verification',
        'click', 'click here', 'verify now', 'kyc pending', 'kyc expiring', 'lottery', 'prize',
        'won', 'inheritance', 'free money', 'processing fee', 'refund', 'penalty', 'fir',
        'under verification', 'share otp', 'provide otp', 'account blocked', 'security alert'
    ]
    
    suspicious_keywords = [
        'bank', 'credit', 'debit', 'inr', 'rs', '₹', 'otp', 'verification', 'kyc',
        'update', 'confirm', 'verify', 'reactivate', 'suspended', 'blocked'
    ]
    
    score = 0
    red_flags = []
    
    # Check for scam keywords
    for keyword in scam_keywords:
        if keyword in input_lower:
            score += 0.4
            red_flags.append(f'Contains scam keyword: "{keyword}"')
    
    # Check for suspicious patterns
    for keyword in suspicious_keywords:
        if keyword in input_lower:
            score += 0.2
            red_flags.append(f'Contains suspicious keyword: "{keyword}"')
    
    # Check for urgency indicators
    if any(urgent in input_lower for urgent in ['urgent', 'immediate', 'now', 'quick', 'hurry', 'fast']):
        score += 0.3
        red_flags.append('Uses urgency tactics')
    
    # Check for suspicious URLs
    if any(suspicious in input_lower for suspicious in ['bit.ly', 'tinyurl', 'goo.gl', 't.co', 'is.gd']):
        score += 0.5
        red_flags.append('Uses URL shortener (potential redirection)')
    
    # Check for amount patterns
    import re
    if re.search(r'\d+[\d,]*(?:\.\d+)?\s*(?:inr|rs\.?|₹)', input_lower) or re.search(r'(?:inr|rs\.?|₹)\s?\d+[\d,]*(?:\.\d+)?', input_lower):
        score += 0.3
        red_flags.append('Contains financial amount')
    
    # Check for action words
    if any(action in input_lower for action in ['click', 'verify', 'confirm', 'update', 'reactivate']):
        score += 0.3
        red_flags.append('Requests action')
    
    # Check for multiple exclamation marks
    exclamation_count = input_text.count('!')
    if exclamation_count >= 2:
        score += 0.2 * exclamation_count
        red_flags.append(f'Uses {exclamation_count} exclamation marks (urgency indicator)')
    
    # Check for ALL CAPS
    upper_case_count = len([c for c in input_text if c.isupper()])
    if upper_case_count > len(input_text) * 0.5:
        score += 0.3
        red_flags.append('Uses excessive capitalization')
    
    # Determine classification
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
    
    # Generate advice
    if classification == 'Safe':
        recommended_action = 'This appears to be safe. Continue with normal caution.'
    elif classification == 'Suspicious':
        recommended_action = 'Exercise caution. Do not share personal information or click suspicious links.'
    else:
        recommended_action = 'This is likely a scam. Do not respond, click, or share any information. Report immediately.'
    
    return {
        'classification': classification,
        'confidence_score': confidence,
        'risk_level': risk_level,
        'red_flags': red_flags[:6],
        'recommended_action': recommended_action,
        'backend': 'Render Python Backend',
        'analysis_type': 'enhanced_fallback'
    }

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
