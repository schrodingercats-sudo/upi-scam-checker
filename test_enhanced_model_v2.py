#!/usr/bin/env python3
"""
🧪 Test script for the Enhanced SMS Scam Detection Model V2
Tests the improved model on various scam and legitimate examples
"""

import pickle
import json
import numpy as np
from train_enhanced_model_v2 import EnhancedSMSFeatureExtractorV2

def load_model():
    """Load the trained V2 model and scaler."""
    try:
        with open('sms_scam_model_v2.pkl', 'rb') as f:
            model = pickle.load(f)
        with open('sms_scam_scaler_v2.pkl', 'rb') as f:
            scaler = pickle.load(f)
        with open('feature_names_v2.json', 'r') as f:
            feature_names = json.load(f)
        return model, scaler, feature_names
    except FileNotFoundError:
        print("❌ V2 Model files not found. Please run train_enhanced_model_v2.py first.")
        return None, None, None

def test_sms(text, model, scaler, extractor):
    """Test a single SMS message."""
    features = extractor.extract_features(text)
    features_scaled = scaler.transform([features])
    prob = model.predict_proba(features_scaled)[0][1]
    prediction = 'SCAM' if prob >= 0.5 else 'LEGITIMATE'
    confidence = max(prob, 1-prob)
    
    return {
        'text': text,
        'prediction': prediction,
        'scam_probability': prob,
        'confidence': confidence,
        'features': features
    }

def main():
    print("🧪 Testing Enhanced SMS Scam Detection Model V2")
    print("=" * 60)
    
    # Load model
    model, scaler, feature_names = load_model()
    if model is None:
        return
    
    extractor = EnhancedSMSFeatureExtractorV2()
    
    # Test cases from different categories
    test_cases = [
        # Easy scams (should be detected)
        "Kotak: Your ATM card is blocked. Verify now: https://airtelpaymentsbank-secure-auth.link.invalid/785CVPAn",
        "Yes Bank: Your ATM card is blocked. Verify now: https://yesbank-kyc-update.example.net/pT50l5yH",
        
        # Medium scams (should be detected)
        "[Kotak] KYC expired. Update within 1 hour to avoid restriction: https://kotak-kyc-update.example.net/CK2osrbK",
        "[Bank of Baroda] KYC expired. Update within 1 hour to avoid restriction: https://bankofbaroda-kyc-update.example.net/MtyehKyN",
        
        # Hard scams (should be detected)
        "[ICICI-BANK]: Dear Customer, your UPI account is temporarily suspended. Complete verification within 30 mins: https://phonepe-bonus.claims.example/SBYY3U4q",
        "[Yes Bank-BANK]: Dear Customer, your UPI account is temporarily suspended. Complete verification within 30 mins: https://yesbank-support-login.invalid/qt4h0LFz",
        
        # Intimate scams (should be detected)
        "Hey, it's me. Lost my wallet. Can you UPI ₹2499 to +917503512043? Will return tomorrow.",
        "Hey, it's me. Lost my wallet. Can you UPI ₹1799 to +917965893739? Will return tomorrow.",
        
        # Legitimate examples (should be classified as legitimate)
        "HDFC: Your credit card payment of ₹15,000 received. Thank you. -HDFCBNK",
        "SBI: Your account statement is ready. Download from mobile app. -SBIBNK",
        "ICICI Bank: Your UPI transaction of ₹2,500 to merchant@upi successful. -ICICIBANK",
        
        # Edge cases
        "SBI: Your OTP for UPI Rs 500 is 123456. Do not share.",
        "URGENT: Your KYC is expiring today. Verify now at http://upi-verify.in",
        "ICICI Bank: Unusual login detected. Secure now: https://icici-secure-login.com"
    ]
    
    print(f"🔍 Testing {len(test_cases)} SMS messages...")
    print(f"📊 Model: {type(model).__name__}")
    print(f"🔧 Features: {len(feature_names)}")
    print()
    
    results = []
    for i, text in enumerate(test_cases, 1):
        result = test_sms(text, model, scaler, extractor)
        results.append(result)
        
        # Determine if prediction is correct
        is_scam_text = any(keyword in text.lower() for keyword in ['blocked', 'expired', 'suspended', 'lost wallet', 'verify now', 'dear customer', 'complete verification'])
        is_correct = (result['prediction'] == 'SCAM' and is_scam_text) or (result['prediction'] == 'LEGITIMATE' and not is_scam_text)
        
        # Print result with status
        status = "✅" if is_correct else "❌"
        print(f"{i:2d}. {status} {result['prediction']:10s} (p={result['scam_probability']:.3f}) -> {text[:60]}...")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    scam_count = sum(1 for r in results if r['prediction'] == 'SCAM')
    legit_count = sum(1 for r in results if r['prediction'] == 'LEGITIMATE')
    
    print(f"🔴 Scam predictions: {scam_count}")
    print(f"🟢 Legitimate predictions: {legit_count}")
    print(f"📈 Total test cases: {len(test_cases)}")
    
    # Check if model is working as expected
    expected_scams = sum(1 for text in test_cases if any(keyword in text.lower() for keyword in ['blocked', 'expired', 'suspended', 'lost wallet', 'verify now', 'dear customer', 'complete verification']))
    expected_legit = len(test_cases) - expected_scams
    
    print(f"\n🎯 Expected scams: {expected_scams}")
    print(f"🎯 Expected legitimate: {expected_legit}")
    
    # Calculate accuracy
    correct_predictions = sum(1 for i, text in enumerate(test_cases) 
                             if (results[i]['prediction'] == 'SCAM' and any(keyword in text.lower() for keyword in ['blocked', 'expired', 'suspended', 'lost wallet', 'verify now', 'dear customer', 'complete verification'])) 
                             or (results[i]['prediction'] == 'LEGITIMATE' and not any(keyword in text.lower() for keyword in ['blocked', 'expired', 'suspended', 'lost wallet', 'verify now', 'dear customer', 'complete verification'])))
    
    accuracy = correct_predictions / len(test_cases)
    print(f"📊 Test Accuracy: {accuracy:.2%}")
    
    if accuracy >= 0.8:
        print("✅ Model is working correctly!")
    else:
        print("⚠️ Model may need retraining or adjustment")
    
    # Show feature importance if available
    if hasattr(model, 'feature_importances_'):
        print(f"\n🔍 Top 5 Most Important Features:")
        feature_importance = list(zip(feature_names, model.feature_importances_))
        feature_importance.sort(key=lambda x: x[1], reverse=True)
        for i, (name, importance) in enumerate(feature_importance[:5]):
            print(f"   {i+1}. {name}: {importance:.4f}")

if __name__ == "__main__":
    main()
