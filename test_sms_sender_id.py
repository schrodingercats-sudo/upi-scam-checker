#!/usr/bin/env python3
"""
Test SMS Sender ID Analysis Feature
"""

from engine.simple_analyzer import analyze_message_simple

def test_sms_sender_id_analysis():
    """Test the new SMS sender ID analysis feature"""
    
    print("🚀 Testing SMS Sender ID Analysis Feature")
    print("=" * 60)
    
    # Test cases with different SMS sender IDs
    test_cases = [
        {
            'sender_id': 'SBI-S',
            'message': 'Your account has been credited with Rs. 5000. Thank you for banking with us.',
            'expected': 'Service message (should be safe)'
        },
        {
            'sender_id': 'GOVT-G',
            'message': 'Your Aadhaar verification is complete. Your details have been updated.',
            'expected': 'Government message (should be safe)'
        },
        {
            'sender_id': 'LOTTERY-P',
            'message': 'Congratulations! You have won Rs. 10,00,000! Click here to claim your prize!',
            'expected': 'Promotional message (likely scam)'
        },
        {
            'sender_id': 'HDFC-T',
            'message': 'Your OTP for transaction is 123456. Do not share with anyone.',
            'expected': 'Transactional/OTP message (should be safe)'
        },
        {
            'sender_id': 'UNKNOWN',
            'message': 'Your bank account has been suspended. Click here to verify immediately.',
            'expected': 'Unknown sender (suspicious content)'
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test {i}: {test_case['expected']}")
        print(f"📱 Sender ID: {test_case['sender_id']}")
        print(f"💬 Message: {test_case['message']}")
        
        result = analyze_message_simple(
            text=test_case['message'],
            sender_id=test_case['sender_id']
        )
        
        print(f"📊 Result:")
        print(f"   Classification: {result['classification']}")
        print(f"   Confidence: {result['confidence_score']}")
        print(f"   Risk Level: {result['risk_level']}")
        print(f"   Action: {result['recommended_action']}")
        
        if result.get('sender_analysis'):
            sender_info = result['sender_analysis']
            print(f"   📱 Sender Analysis:")
            print(f"      Category: {sender_info['category']} ({sender_info['category_code']})")
            print(f"      Trust Score: {sender_info['trust_score']:.1%}")
            print(f"      Description: {sender_info['description']}")
        
        print("-" * 60)

def test_sms_categories():
    """Test all SMS categories"""
    print("\n📱 SMS Sender ID Categories Reference:")
    print("=" * 60)
    
    categories = {
        's': 'Service (banks, companies) - TRUSTED',
        'g': 'Government (official messages) - TRUSTED', 
        'p': 'Promotional (marketing, ads) - SUSPICIOUS',
        't': 'Transactional/OTP (passwords, transactions) - TRUSTED'
    }
    
    for code, description in categories.items():
        print(f"   {code.upper()} → {description}")
    
    print("\n💡 Examples:")
    print("   SBI-S → Service message from State Bank of India")
    print("   GOVT-G → Government message")
    print("   LOTTERY-P → Promotional message (likely scam)")
    print("   HDFC-T → Transactional message from HDFC Bank")

if __name__ == "__main__":
    test_sms_categories()
    test_sms_sender_id_analysis()
    
    print("\n🎯 SMS Sender ID Analysis Feature Test Completed!")
    print("✅ This feature helps identify legitimate vs suspicious messages based on sender ID patterns.")
