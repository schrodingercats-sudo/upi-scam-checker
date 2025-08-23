#!/usr/bin/env python3
"""
Test script for the Enhanced UPI Analyzer with 2-Step Verification System
"""

import os
import sys
from engine.enhanced_analyzer import analyze_message_enhanced

def test_enhanced_analyzer():
    """Test the enhanced analyzer with 2-step verification"""
    
    print("🚀 Testing Enhanced UPI Analyzer with 2-Step Verification System")
    print("=" * 70)
    
    # Test messages including the Fast2SMS legitimate message
    test_messages = [
        {
            "message": "Your bank credit 12000 INR click on this link",
            "type": "sms",
            "expected": "SCAM",
            "description": "Obvious scam message"
        },
        {
            "message": "Dear user,\nRs: 100.00 credited successfully into your Fast2SMS wallet.\nCurrent wallet balance is Rs: 150.00.\n\n- Team Fast2SMS",
            "type": "sms",
            "expected": "SAFE",
            "description": "Legitimate Fast2SMS credit notification"
        },
        {
            "message": "Your UPI payment of Rs. 5000 has been processed successfully. Transaction ID: UPI123456789",
            "type": "sms",
            "expected": "SAFE",
            "description": "Legitimate UPI payment confirmation"
        },
        {
            "message": "URGENT: Your account has been suspended. Click here to verify immediately: https://fake-bank.com/verify",
            "type": "whatsapp",
            "expected": "SCAM",
            "description": "Suspicious account suspension message"
        },
        {
            "message": "Hello, this is your bank. We need to verify your account details. Please call 1800-123-4567",
            "type": "sms",
            "expected": "SCAM",
            "description": "Suspicious bank verification request"
        }
    ]
    
    # Get Gemini API key from environment variable
    gemini_api_key = os.getenv('GOOGLE_GEMINI_API_KEY')
    
    if gemini_api_key:
        print("✅ Google Gemini API key found in environment")
        print(f"🔑 API Key: {gemini_api_key[:10]}...{gemini_api_key[-4:]}")
        print("🔄 2-Step Verification System: ENABLED")
    else:
        print("⚠️  No Google Gemini API key found in environment")
        print("   Set GOOGLE_GEMINI_API_KEY environment variable to enable 2-step verification")
        print("   Example: export GOOGLE_GEMINI_API_KEY='your-api-key-here'")
        print("🔄 2-Step Verification System: DISABLED")
        print()
    
    print()
    
    # Test each message
    for i, test_case in enumerate(test_messages, 1):
        print(f"🧪 Test {i}: {test_case['type'].upper()}")
        print(f"📝 Description: {test_case['description']}")
        print(f"📝 Message: {test_case['message']}")
        print(f"🎯 Expected: {test_case['expected']}")
        
        try:
            # Analyze message with 2-step verification
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
            
            # Show 2-step verification details if available
            if result.get('false_positive_detected'):
                print("🔍 FALSE POSITIVE DETECTED by Gemini!")
                print(f"   ML Model Verification: {result.get('ml_model_verification', 'N/A')}")
                print(f"   Confidence Adjustment: {result.get('confidence_adjustment', 'N/A')}")
            
            if result.get('false_negative_detected'):
                print("🔍 FALSE NEGATIVE DETECTED by Gemini!")
                print(f"   ML Model Verification: {result.get('ml_model_verification', 'N/A')}")
                print(f"   Confidence Adjustment: {result.get('confidence_adjustment', 'N/A')}")
            
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
            
            # Show original message analysis if available
            if result.get('original_message_analysis'):
                print(f"🔍 Gemini's Original Message Analysis: {result['original_message_analysis']}")
            
            # Check if result matches expectation
            actual_result = "SCAM" if result['is_scam'] else "SAFE"
            if actual_result == test_case['expected']:
                print("✅ PASS: Result matches expectation")
            else:
                print(f"❌ FAIL: Expected {test_case['expected']}, got {actual_result}")
                
                # Special handling for Fast2SMS message
                if "Fast2SMS" in test_case['message'] and actual_result == "SCAM":
                    print("⚠️  This is a known false positive case!")
                    print("   Our ML model incorrectly flags legitimate Fast2SMS messages")
                    print("   The 2-step verification system should catch this!")
            
        except Exception as e:
            print(f"❌ Error analyzing message: {e}")
        
        print("-" * 70)
        print()
    
    print("🎉 Enhanced Analyzer with 2-Step Verification Test Complete!")
    
    # Show usage instructions
    print("\n📖 Usage Instructions:")
    print("1. Set your Google Gemini API key:")
    print("   export GOOGLE_GEMINI_API_KEY='your-api-key-here'")
    print()
    print("2. Use in your code:")
    print("   from engine.enhanced_analyzer import analyze_message_enhanced")
    print("   result = analyze_message_enhanced(message, 'sms', gemini_api_key)")
    print()
    print("3. The 2-step verification system will:")
    print("   • Step 1: Run our ML model and rule engine")
    print("   • Step 2: Pass results to Gemini for verification")
    print("   • Detect false positives/negatives from our model")
    print("   • Provide final corrected analysis")
    print()
    print("4. Key benefits:")
    print("   • Catches false positives (like Fast2SMS messages)")
    print("   • Catches false negatives (missed scams)")
    print("   • Provides detailed verification explanations")
    print("   • Adjusts confidence scores based on verification")

if __name__ == "__main__":
    test_enhanced_analyzer()
