#!/usr/bin/env python3
"""
Test script specifically for the Fast2SMS message to demonstrate 2-step verification
"""

import os
import sys
from engine.enhanced_analyzer import analyze_message_enhanced

def test_fast2sms_message():
    """Test the Fast2SMS message with 2-step verification"""
    
    print("🧪 Testing Fast2SMS Message with 2-Step Verification System")
    print("=" * 70)
    
    # The Fast2SMS message that was incorrectly flagged as scam
    fast2sms_message = """Dear user,
Rs: 100.00 credited successfully into your Fast2SMS wallet.
Current wallet balance is Rs: 150.00.

- Team Fast2SMS"""
    
    print(f"📝 Message to test:")
    print(f"   {fast2sms_message}")
    print()
    
    # Get Gemini API key from environment variable
    gemini_api_key = os.getenv('GOOGLE_GEMINI_API_KEY')
    
    if gemini_api_key:
        print("✅ Google Gemini API key found")
        print(f"🔑 API Key: {gemini_api_key[:10]}...{gemini_api_key[-4:]}")
        print("🔄 2-Step Verification System: ENABLED")
        print()
        
        print("🔍 Step 1: Our ML Model Analysis")
        print("   This is where our model incorrectly flags Fast2SMS as scam")
        print("   (This is the problem we're solving)")
        print()
        
        print("🔍 Step 2: Gemini AI Verification")
        print("   Gemini will analyze both the message AND our model's response")
        print("   It should detect the false positive and correct it")
        print()
        
        print("🎯 Expected Result: SAFE (not SCAM)")
        print("   Fast2SMS is a legitimate SMS service provider")
        print("   This message is a normal credit notification")
        print()
        
        print("🚀 Running 2-Step Verification Analysis...")
        print("-" * 70)
        
        try:
            # Analyze message with 2-step verification
            result = analyze_message_enhanced(
                fast2sms_message, 
                'sms', 
                gemini_api_key
            )
            
            # Display results
            print(f"🎯 FINAL RESULT: {result['risk_level']}")
            print(f"📊 Confidence: {result['confidence']:.1f}%")
            print(f"🚨 Is Scam: {result['is_scam']}")
            print(f"⚡ Method: {result['analysis_method']}")
            print()
            
            # Show 2-step verification details
            if result.get('false_positive_detected'):
                print("🔍 SUCCESS! FALSE POSITIVE DETECTED by Gemini!")
                print(f"   ML Model Verification: {result.get('ml_model_verification', 'N/A')}")
                print(f"   Confidence Adjustment: {result.get('confidence_adjustment', 'N/A')}")
                print()
                print("✅ This demonstrates the 2-step verification working correctly!")
                print("   Our ML model made an error, but Gemini caught and corrected it!")
            else:
                print("⚠️  False positive was NOT detected")
                print("   This might indicate an issue with the verification system")
            
            # Show detailed analysis
            print("\n📊 DETAILED ANALYSIS:")
            print(f"   ML Result: {result.get('ml_result', {}).get('risk_level', 'Unknown')} ({result.get('ml_result', {}).get('confidence', 0):.1f}%)")
            print(f"   Rule Result: {result.get('rule_result', {}).get('risk_level', 'Unknown')} ({result.get('rule_result', {}).get('confidence', 0):.1f}%)")
            print(f"   Gemini Result: {result.get('gemini_result', {}).get('risk_level', 'Unknown')} ({result.get('gemini_result', {}).get('confidence', 0):.1f}%)")
            
            # Show Gemini's analysis
            if result.get('summary'):
                print(f"\n🧠 Gemini Summary: {result['summary']}")
            
            if result.get('original_message_analysis'):
                print(f"🔍 Gemini's Original Message Analysis: {result['original_message_analysis']}")
            
            # Show risk factors and recommendations
            if result.get('risk_factors'):
                print(f"\n⚠️  Risk Factors:")
                for factor in result['risk_factors']:
                    print(f"   • {factor}")
            
            if result.get('recommendations'):
                print(f"\n💡 Recommendations:")
                for rec in result['recommendations']:
                    print(f"   • {rec}")
            
            # Final assessment
            print("\n" + "=" * 70)
            if result.get('is_scam') == False:
                print("🎉 SUCCESS! Fast2SMS message correctly identified as SAFE")
                print("   The 2-step verification system worked correctly!")
            else:
                print("❌ FAILURE! Fast2SMS message still flagged as SCAM")
                print("   The 2-step verification system needs improvement")
            
        except Exception as e:
            print(f"❌ Error during 2-step verification: {e}")
            print("   This might indicate an issue with the enhanced analyzer")
    
    else:
        print("⚠️  No Google Gemini API key found")
        print("   Set GOOGLE_GEMINI_API_KEY environment variable to test 2-step verification")
        print()
        print("   Example:")
        print("   export GOOGLE_GEMINI_API_KEY='your-api-key-here'")
        print()
        print("   Without the API key, only Step 1 (ML model) will run")
        print("   This will show the original false positive problem")
        
        # Test without Gemini to show the problem
        print("\n🧪 Testing without Gemini (Step 1 only)...")
        print("-" * 70)
        
        try:
            result = analyze_message_enhanced(fast2sms_message, 'sms')
            
            print(f"🎯 Result: {result['risk_level']}")
            print(f"📊 Confidence: {result['confidence']:.1f}%")
            print(f"🚨 Is Scam: {result['is_scam']}")
            print()
            
            print("⚠️  This shows the problem:")
            print("   Without Gemini verification, Fast2SMS is incorrectly flagged")
            print("   The 2-step verification system is needed to fix this!")
            
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n📖 How 2-Step Verification Works:")
    print("1. Step 1: Our ML model analyzes the message")
    print("   (This is where Fast2SMS gets incorrectly flagged)")
    print()
    print("2. Step 2: Gemini AI gets BOTH the message AND our model's result")
    print("   Gemini can detect if our model made an error")
    print("   It provides verification and correction")
    print()
    print("3. Final Result: Combined analysis with false positive detection")
    print("   Confidence scores are adjusted based on verification")
    print("   The system becomes more accurate and trustworthy")

if __name__ == "__main__":
    test_fast2sms_message()
