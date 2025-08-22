#!/usr/bin/env python3
"""
Test script to verify immediate blocking system works
Tests the problematic message: "Your bank credit 12000 INR click on this link"
"""

from engine.analyzer import analyze_message

def test_immediate_blocking():
    print("🔒 Testing Immediate Blocking System")
    print("=" * 50)
    
    # Test the problematic message
    problematic_message = "Your bank credit 12000 INR click on this link"
    print(f"📱 Testing: '{problematic_message}'")
    
    result = analyze_message(problematic_message)
    
    print(f"\n✅ Result:")
    print(f"   Classification: {result['classification']}")
    print(f"   Confidence: {result['confidence_score']}")
    print(f"   Risk Level: {result['risk_level']}")
    print(f"   Red Flags: {result['red_flags']}")
    print(f"   Action: {result['recommended_action']}")
    
    # Verify it's blocked
    if result['classification'] == 'Scam' and result['confidence_score'] == '99%':
        print(f"\n🎯 SUCCESS: Message correctly blocked as SCAM with 99% confidence!")
    else:
        print(f"\n❌ FAILURE: Message not properly blocked!")
    
    print("\n" + "=" * 50)
    
    # Test other obvious scam patterns
    test_cases = [
        "Bank credit 10000 INR click here to verify",
        "URGENT: Your account has been credited 5000 INR. Click link to confirm",
        "Government credit 2000 INR. Click to verify immediately!",
        "OTP verification required for 1000 INR credit. Click link now!",
        "Your bank debit 15000 INR. Click here to block transaction"
    ]
    
    print("🧪 Testing Additional Scam Patterns:")
    for i, test_msg in enumerate(test_cases, 1):
        print(f"\n{i}. Testing: '{test_msg}'")
        result = analyze_message(test_msg)
        print(f"   Result: {result['classification']} - {result['confidence_score']}")
        
        if result['classification'] == 'Scam':
            print(f"   ✅ CORRECTLY BLOCKED")
        else:
            print(f"   ❌ NOT BLOCKED - Security issue!")

if __name__ == "__main__":
    test_immediate_blocking()
