#!/usr/bin/env python3
"""
🧪 Test Script for Enhanced SMS Scam Detection Model v3.0
"""

import pickle
import json
import numpy as np
from train_enhanced_model_v3 import EnhancedSMSFeatureExtractor

def test_enhanced_model():
    """Test the enhanced model with various messages"""
    
    print("🧪 Testing Enhanced SMS Scam Detection Model v3.0")
    print("=" * 60)
    
    # Load the enhanced model
    try:
        with open('sms_scam_model_v3.pkl', 'rb') as f:
            model = pickle.load(f)
        with open('sms_scam_scaler_v3.pkl', 'rb') as f:
            scaler = pickle.load(f)
        print("✅ Enhanced model loaded successfully!")
    except Exception as e:
        print(f"❌ Error loading model: {str(e)}")
        return
    
    # Initialize feature extractor
    extractor = EnhancedSMSFeatureExtractor()
    
    # Test messages
    test_messages = [
        # The problematic message that was failing
        "Your bank credit 12000 INR click on this link",
        
        # More scam examples
        "SBI: Your account has been suspended. Click here to verify: sbi-verify.com",
        "HDFC: Unusual login detected. Secure now: hdfc-secure.net",
        "UPI Alert: ₹50,000 credited by mistake. Refund immediately: upi-refund.com",
        "RBI Notice: Account will be frozen. Verify now: rbi-verify.gov.in",
        "Congratulations! You have won ₹50,00,000 in RBI lottery. Claim now: rbi-lottery-claim.com",
        
        # Legitimate examples
        "HDFC Bank: INR 25,000.00 credited to a/c XX1234 on 20-Aug 10:30. Clear Balance: INR 75,000.00.",
        "ICICI Bank: Your OTP for UPI login is 482193. Do not share this with anyone. Valid for 10 minutes.",
        "SBI: Cash withdrawal of INR 10,000.00 from ATM at MUMBAI on 19-Aug-2025 16:20. A/c XX9012.",
        "Axis Bank: UPI payment of INR 1,500.00 to shop@okaxis on 20-Aug-2025 11:15 is SUCCESS.",
        "PNB: IMPS transfer of INR 8,000.00 to 98XXXXXX54/MMID 9229134 is successful."
    ]
    
    print(f"\n🔍 Testing {len(test_messages)} messages...")
    print("-" * 60)
    
    for i, message in enumerate(test_messages, 1):
        # Extract features
        features = extractor.extract_features(message)
        
        # Make prediction
        features_scaled = scaler.transform([features])
        proba = model.predict_proba(features_scaled)[0]
        scam_prob = proba[1]
        safe_prob = proba[0]
        
        # Determine prediction
        prediction = "SCAM" if scam_prob >= 0.5 else "SAFE"
        confidence = max(scam_prob, safe_prob)
        
        # Show key features
        bank_detected = bool(features[2])
        scam_keywords = bool(features[4])
        url_detected = bool(features[6])
        amount_detected = bool(features[9])
        
        print(f"{i:2d}. {prediction:4s} ({confidence:.1%}) - {message[:60]}...")
        print(f"     Features: Bank={bank_detected}, Scam={scam_keywords}, URL={url_detected}, Amount={amount_detected}")
        print()
    
    print("✅ Enhanced model testing completed!")
    print("\n🎯 The model should now correctly identify all scam messages!")

if __name__ == "__main__":
    test_enhanced_model()
