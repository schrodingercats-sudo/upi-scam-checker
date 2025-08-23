#!/usr/bin/env python3
"""
Test script to verify the immediate hard-coded blocking system
"""

import sys
import os
sys.path.append('.')

from engine.analyzer import analyze_message

def test_blocking():
    """Test the immediate blocking system"""
    
    # Test message that should be blocked
    test_message = "Your bank credit 12000 INR click on this link"
    
    print("🧪 Testing Immediate Blocking System")
    print("=" * 50)
    print(f"Test Message: {test_message}")
    print()
    
    try:
        # Analyze the message
        result = analyze_message(test_message)
        
        print("📊 Analysis Result:")
        print(f"Classification: {result.get('classification', 'N/A')}")
        print(f"Confidence: {result.get('confidence_score', 'N/A')}")
        print(f"Risk Level: {result.get('risk_level', 'N/A')}")
        print(f"Red Flags: {result.get('red_flags', [])}")
        print(f"Action: {result.get('recommended_action', 'N/A')}")
        print()
        
        # Check if blocking worked
        if result.get('classification') == 'Scam' and result.get('confidence_score') == '99%':
            print("✅ SUCCESS: Message correctly blocked as SCAM with 99% confidence!")
            print("✅ Hard-coded blocking system is working correctly!")
        else:
            print("❌ FAILURE: Message was not blocked correctly!")
            print(f"Expected: Scam with 99% confidence")
            print(f"Got: {result.get('classification')} with {result.get('confidence_score')}")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        print("The blocking system may not be working correctly.")

if __name__ == "__main__":
    test_blocking()
