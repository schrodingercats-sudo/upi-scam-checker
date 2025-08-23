#!/usr/bin/env python3
"""
Test script for the Enhanced UPI Analyzer with Google Gemini API integration
"""

import os
import sys
from engine.enhanced_analyzer import analyze_message_enhanced

def test_enhanced_analyzer():
    """Test the enhanced analyzer with various messages"""
    
    print("🚀 Testing Enhanced UPI Analyzer with Google Gemini API")
    print("=" * 60)
    
    # Test messages
    test_messages = [
        {
            "message": "Your bank credit 12000 INR click on this link",
            "type": "sms",
            "expected": "SCAM"
        },
        {
            "message": "Your UPI payment of Rs. 5000 has been processed successfully. Transaction ID: UPI123456789",
            "type": "sms",
            "expected": "SAFE"
        },
        {
            "message": "URGENT: Your account has been suspended. Click here to verify immediately: https://fake-bank.com/verify",
            "type": "whatsapp",
            "expected": "SCAM"
        },
        {
            "message": "Hello, this is your bank. We need to verify your account details. Please call 1800-123-4567",
            "type": "sms",
            "expected": "SCAM"
        },
        {
            "message": "Your order #12345 has been shipped. Track at: https://legitimate-store.com/track",
            "type": "email",
            "expected": "SAFE"
        }
    ]
    
    # Get Gemini API key from environment variable
    gemini_api_key = os.getenv('GOOGLE_GEMINI_API_KEY')
    
    if gemini_api_key:
        print("✅ Google Gemini API key found in environment")
        print(f"🔑 API Key: {gemini_api_key[:10]}...{gemini_api_key[-4:]}")
    else:
        print("⚠️  No Google Gemini API key found in environment")
        print("   Set GOOGLE_GEMINI_API_KEY environment variable to enable Gemini analysis")
        print("   Example: export GOOGLE_GEMINI_API_KEY='your-api-key-here'")
        print()
    
    print()
    
    # Test each message
    for i, test_case in enumerate(test_messages, 1):
        print(f"🧪 Test {i}: {test_case['type'].upper()}")
        print(f"📝 Message: {test_case['message']}")
        print(f"🎯 Expected: {test_case['expected']}")
        
        try:
            # Analyze message
            result = analyze_message_enhanced(
                test_case['message'], 
                test_case['type'], 
                gemini_api_key
            )
            
            # Display results
            print(f"🔍 Result: {result['risk_level']}")
            print(f"📊 Confidence: {result['confidence']:.1f}%")
            print(f"🚨 Is Scam: {result['is_scam']}")
            print(f"⚡ Method: {result['analysis_method']}")
            
            # Show risk factors
            if result.get('risk_factors'):
                print(f"⚠️  Risk Factors:")
                for factor in result['risk_factors']:
                    print(f"   • {factor}")
            
            # Show recommendations
            if result.get('recommendations'):
                print(f"💡 Recommendations:")
                for rec in result['recommendations']:
                    print(f"   • {rec}")
            
            # Show Gemini summary if available
            if result.get('summary'):
                print(f"🧠 Gemini Summary: {result['summary']}")
            
            # Check if result matches expectation
            actual_result = "SCAM" if result['is_scam'] else "SAFE"
            if actual_result == test_case['expected']:
                print("✅ PASS: Result matches expectation")
            else:
                print(f"❌ FAIL: Expected {test_case['expected']}, got {actual_result}")
            
        except Exception as e:
            print(f"❌ Error analyzing message: {e}")
        
        print("-" * 60)
        print()
    
    print("🎉 Enhanced Analyzer Test Complete!")
    
    # Show usage instructions
    print("\n📖 Usage Instructions:")
    print("1. Set your Google Gemini API key:")
    print("   export GOOGLE_GEMINI_API_KEY='your-api-key-here'")
    print()
    print("2. Use in your code:")
    print("   from engine.enhanced_analyzer import analyze_message_enhanced")
    print("   result = analyze_message_enhanced(message, 'sms', gemini_api_key)")
    print()
    print("3. The analyzer will automatically:")
    print("   • Check immediate blocking patterns")
    print("   • Run ML model analysis")
    print("   • Apply rule-based checks")
    print("   • Use Google Gemini AI (if API key provided)")
    print("   • Combine all results for final decision")

if __name__ == "__main__":
    test_enhanced_analyzer()
