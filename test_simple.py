#!/usr/bin/env python3
"""
Simple test for the unified analyzer system
"""

from engine.simple_analyzer import analyze_message_simple

def test_fast2sms_message():
    """Test the Fast2SMS legitimate message"""
    message = "Dear user, Rs: 100.00 credited successfully into your Fast2SMS wallet. Current wallet balance is Rs: 150.00. - Team Fast2SMS"
    
    print("🧪 Testing Fast2SMS message:")
    print(f"Message: {message}")
    print()
    
    result = analyze_message_simple(message)
    
    print("📊 Analysis Result:")
    print(f"Classification: {result['classification']}")
    print(f"Confidence: {result['confidence_score']}")
    print(f"Risk Level: {result['risk_level']}")
    print(f"Action: {result['recommended_action']}")
    print()
    
    if result['classification'] == 'Safe':
        print("✅ SUCCESS: Fast2SMS message correctly identified as SAFE")
    else:
        print("❌ FAILURE: Fast2SMS message incorrectly flagged as SCAM")
        print(f"Red flags: {result['red_flags']}")
    
    print("\n" + "="*50 + "\n")

def test_scam_message():
    """Test the original scam message"""
    message = "Your bank credit 12000 INR click on this link"
    
    print("🧪 Testing scam message:")
    print(f"Message: {message}")
    print()
    
    result = analyze_message_simple(message)
    
    print("📊 Analysis Result:")
    print(f"Classification: {result['classification']}")
    print(f"Confidence: {result['confidence_score']}")
    print(f"Risk Level: {result['risk_level']}")
    print(f"Action: {result['recommended_action']}")
    print()
    
    if result['classification'] == 'Scam':
        print("✅ SUCCESS: Scam message correctly identified as SCAM")
    else:
        print("❌ FAILURE: Scam message incorrectly flagged as SAFE")
        print(f"Red flags: {result['red_flags']}")
    
    print("\n" + "="*50 + "\n")

if __name__ == "__main__":
    print("🚀 Testing Simple Unified Analyzer System")
    print("="*50)
    
    test_fast2sms_message()
    test_scam_message()
    
    print("🎯 Test completed!")
