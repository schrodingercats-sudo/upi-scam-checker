#!/usr/bin/env python3
"""
Test the updated main system with the problematic scam message
"""

from engine.analyzer import analyze_message

def test_updated_system():
    """Test the updated system with the problematic message"""
    
    # The problematic message that was being manipulated
    problematic_message = "Your bank credit 12000 INR click on this link"
    
    print("🔍 Testing Updated Main System:")
    print(f"Message: '{problematic_message}'")
    print("-" * 60)
    
    try:
        # Analyze the message using the updated system
        result = analyze_message(problematic_message)
        
        print("📊 Analysis Result:")
        print(f"Classification: {result['classification']}")
        print(f"Confidence Score: {result['confidence_score']}")
        print(f"Risk Level: {result['risk_level']}")
        
        if 'red_flags' in result and result['red_flags']:
            print("\n🚨 Red Flags:")
            for flag in result['red_flags']:
                print(f"   • {flag}")
        
        if 'recommended_action' in result:
            print(f"\n💡 Recommended Action: {result['recommended_action']}")
        
        print("-" * 60)
        
        # Check if it's correctly identified
        if result['classification'].lower() == 'scam':
            print("✅ SUCCESS: System correctly identified as SCAM!")
        else:
            print("❌ FAILURE: System still incorrectly classified as SAFE!")
            
    except Exception as e:
        print(f"❌ Error testing updated system: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_updated_system()
