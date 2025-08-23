#!/usr/bin/env python3
"""
Simple test script for the enhanced analyzer
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from engine.enhanced_analyzer import analyze_message_enhanced
    print("✅ Enhanced analyzer imported successfully!")
    
    # Test message
    test_message = "Your bank credit 12000 INR click on this link"
    
    print(f"🧪 Testing message: {test_message}")
    
    # Test without Gemini first
    result = analyze_message_enhanced(test_message, 'sms')
    
    print(f"🎯 Result: {result['risk_level']}")
    print(f"📊 Confidence: {result['confidence']:.1f}%")
    print(f"🚨 Is Scam: {result['is_scam']}")
    print(f"⚡ Method: {result['analysis_method']}")
    
    print("\n✅ Test completed successfully!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("This might be a Python path issue")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
