#!/usr/bin/env python3
"""
UPI Scam Detector - Python Backend API
Deploy on Render to run ML models
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Import the enhanced analyzer
try:
    from engine.enhanced_analyzer import analyze_message_enhanced
    ENHANCED_ANALYZER_AVAILABLE = True
    print("✅ Enhanced analyzer imported successfully")
except ImportError as e:
    print(f"⚠️ Enhanced analyzer not available: {e}")
    ENHANCED_ANALYZER_AVAILABLE = False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "enhanced_analyzer": ENHANCED_ANALYZER_AVAILABLE
    })

@app.route('/analyze', methods=['POST'])
def analyze_message():
    """Analyze message using enhanced detection"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({"error": "Missing 'text' field"}), 400
        
        message = data['text']
        message_type = data.get('type', 'sms')
        
        print(f"🔍 Analyzing message: {message[:50]}...")
        
        # Use enhanced analyzer if available
        if ENHANCED_ANALYZER_AVAILABLE:
            try:
                # Get Gemini API key from environment
                gemini_api_key = os.getenv('GOOGLE_GEMINI_API_KEY')
                
                if gemini_api_key:
                    print("✅ Using enhanced analyzer with Google Gemini API")
                    result = analyze_message_enhanced(message, message_type, gemini_api_key)
                else:
                    print("⚠️ No Gemini API key, using enhanced analyzer without Gemini")
                    result = analyze_message_enhanced(message, message_type)
                
                # Format response
                response = {
                    "is_scam": result.get('is_scam', False),
                    "risk_level": result.get('risk_level', 'Unknown'),
                    "confidence": result.get('confidence', 0.0),
                    "message_type": message_type,
                    "timestamp": datetime.now().isoformat(),
                    "analysis_method": result.get('analysis_method', 'enhanced_hybrid'),
                    "risk_factors": result.get('risk_factors', []),
                    "recommendations": result.get('recommendations', []),
                    "summary": result.get('summary', ''),
                    "technical_analysis": result.get('technical_analysis', ''),
                    "ml_result": result.get('ml_result', {}),
                    "rule_result": result.get('rule_result', {}),
                    "gemini_result": result.get('gemini_result', {})
                }
                
                print(f"🎯 Analysis complete: {response['risk_level']} ({response['confidence']:.1f}%)")
                return jsonify(response)
                
            except Exception as e:
                print(f"❌ Enhanced analyzer failed: {e}")
                # Fall back to immediate blocking check
                return immediate_blocking_check(message, message_type)
        
        else:
            # Fall back to immediate blocking check
            print("⚠️ Using fallback immediate blocking check")
            return immediate_blocking_check(message, message_type)
            
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        return jsonify({
            "error": "Analysis failed",
            "details": str(e)
        }), 500

def immediate_blocking_check(message: str, message_type: str = "sms"):
    """Immediate blocking check for obvious scam patterns"""
    message_lower = message.lower()
    
    # Critical scam patterns that should be blocked immediately
    critical_patterns = [
        "your bank credit",
        "click on this link",
        "urgent action required",
        "account suspended",
        "verify immediately",
        "unusual activity detected",
        "payment failed",
        "refund available",
        "prize won",
        "lottery winner",
        "inheritance",
        "government refund",
        "tax refund",
        "bank transfer",
        "upi payment",
        "otp verification",
        "account verification"
    ]
    
    # Check for critical patterns
    for pattern in critical_patterns:
        if pattern in message_lower:
            return jsonify({
                "is_scam": True,
                "risk_level": "Critical",
                "confidence": 99.0,
                "message_type": message_type,
                "timestamp": datetime.now().isoformat(),
                "analysis_method": "immediate_blocking",
                "blocked_reason": f"Critical pattern detected: '{pattern}'",
                "risk_factors": [f"Contains critical scam pattern: {pattern}"],
                "recommendations": [
                    "DO NOT click any links",
                    "DO NOT provide personal information",
                    "DO NOT call any numbers",
                    "Report to authorities if needed"
                ],
                "summary": f"Message blocked due to critical scam pattern: {pattern}",
                "technical_analysis": "Immediate blocking system detected obvious scam indicators"
            })
    
    # Check for suspicious URLs or phone numbers
    if any(char in message for char in ['http://', 'https://', 'www.']):
        if any(word in message_lower for word in ['click', 'verify', 'login', 'secure']):
            return jsonify({
                "is_scam": True,
                "risk_level": "Critical",
                "confidence": 95.0,
                "message_type": message_type,
                "timestamp": datetime.now().isoformat(),
                "analysis_method": "immediate_blocking",
                "blocked_reason": "Suspicious URL with action words",
                "risk_factors": ["Contains suspicious URL with action words"],
                "recommendations": [
                    "DO NOT click the link",
                    "Verify the sender independently",
                    "Check official website directly"
                ],
                "summary": "Message blocked due to suspicious URL with action words",
                "technical_analysis": "Immediate blocking system detected suspicious URL patterns"
            })
    
    # If no immediate blocking, return safe result
    return jsonify({
        "is_scam": False,
        "risk_level": "Safe",
        "confidence": 0.0,
        "message_type": message_type,
        "timestamp": datetime.now().isoformat(),
        "analysis_method": "immediate_blocking",
        "blocked_reason": None,
        "risk_factors": [],
        "recommendations": ["Continue with normal caution"],
        "summary": "No immediate scam indicators detected",
        "technical_analysis": "Immediate blocking system found no obvious scam patterns"
    })

if __name__ == '__main__':
    # Check for Gemini API key
    gemini_api_key = os.getenv('GOOGLE_GEMINI_API_KEY')
    if gemini_api_key:
        print("✅ Google Gemini API key found")
        print(f"🔑 API Key: {gemini_api_key[:10]}...{gemini_api_key[-4:]}")
    else:
        print("⚠️ No Google Gemini API key found")
        print("   Set GOOGLE_GEMINI_API_KEY environment variable to enable Gemini analysis")
    
    print("🚀 Enhanced UPI Scam Detector Backend Starting...")
    print(f"📊 Enhanced Analyzer Available: {ENHANCED_ANALYZER_AVAILABLE}")
    
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)), debug=False)
