#!/usr/bin/env python3
"""
Test the v3 enhanced model with the problematic scam message
"""

import pickle
import json
import numpy as np

def test_v3_model():
    """Test the v3 model with the problematic message"""
    
    # The problematic message
    problematic_message = "Your bank credit 12000 INR click on this link"
    
    print("🔍 Testing V3 Enhanced Model:")
    print(f"Message: '{problematic_message}'")
    print("-" * 60)
    
    try:
        # Load v3 model artifacts
        with open('sms_scam_model_v3.pkl', 'rb') as f:
            model = pickle.load(f)
        
        with open('sms_scam_scaler_v3.pkl', 'rb') as f:
            scaler = pickle.load(f)
            
        with open('feature_names_v3.json', 'r') as f:
            feature_names = json.load(f)
            
        print(f"✅ Loaded V3 model with {len(feature_names)} features")
        print(f"Model type: {type(model).__name__}")
        
        # Import the feature extractor
        from train_enhanced_model_v3 import EnhancedSMSFeatureExtractor
        
        # Extract features
        extractor = EnhancedSMSFeatureExtractor()
        features = extractor.extract_features(problematic_message)
        
        print(f"✅ Extracted {len(features)} features")
        
        # Scale features
        X = scaler.transform([features])
        
        # Get prediction
        prediction = model.predict(X)[0]
        proba = model.predict_proba(X)[0]
        
        print(f"✅ Prediction: {prediction} (0=Safe, 1=Scam)")
        print(f"✅ Probability: Safe={proba[0]:.3f}, Scam={proba[1]:.3f}")
        
        # Calculate confidence and risk
        if prediction == 1:  # Scam
            confidence = proba[1] * 100
            risk_level = "HIGH" if confidence > 80 else "MEDIUM-HIGH" if confidence > 60 else "MEDIUM"
            classification = "SCAM"
        else:  # Safe
            confidence = proba[0] * 100
            risk_level = "LOW" if confidence > 80 else "MEDIUM" if confidence > 60 else "MEDIUM-HIGH"
            classification = "Safe"
        
        print("-" * 60)
        print(f"🎯 Classification: {classification}")
        print(f"🎯 Confidence Score: {confidence:.1f}%")
        print(f"🎯 Risk Level: {risk_level}")
        
        if classification == "SCAM":
            print("🚨 CORRECTLY IDENTIFIED AS SCAM!")
        else:
            print("❌ INCORRECTLY CLASSIFIED AS SAFE!")
            
        # Show key features
        print("\n🔍 Key Features Detected:")
        key_features = ['contains_bank', 'contains_scam_keywords', 'contains_url', 'suspicious_domains', 'contains_amount']
        for i, name in enumerate(feature_names):
            if name in key_features:
                print(f"🔴 {name}: {features[i]}")
        
    except Exception as e:
        print(f"❌ Error testing V3 model: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_v3_model()
