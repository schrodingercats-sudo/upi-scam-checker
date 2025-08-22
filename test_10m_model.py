#!/usr/bin/env python3
"""
Test script for the 10 Million Parameter SMS Scam Detection Model
"""

import pickle
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences

def test_10m_model():
    """Test the 10M parameter model with sample messages"""
    
    print("🔍 Testing 10 Million Parameter Model")
    print("=" * 50)
    
    try:
        # Load model and artifacts
        print("📦 Loading model artifacts...")
        model = load_model('ultimate_scam_detector_10m.h5')
        
        with open('tokenizer_10m.pkl', 'rb') as f:
            tokenizer = pickle.load(f)
        
        with open('feature_scaler_10m.pkl', 'rb') as f:
            scaler = pickle.load(f)
        
        with open('feature_extractor_10m.pkl', 'rb') as f:
            feature_extractor = pickle.load(f)
        
        with open('training_info_10m.json', 'r') as f:
            training_info = json.load(f)
        
        print(f"✅ Model loaded: {training_info['model_parameters']:,} parameters")
        print(f"✅ Training accuracy: {training_info['test_accuracy']:.4f}")
        print(f"✅ AUC Score: {training_info['auc_score']:.4f}")
        
        # Test messages
        test_messages = [
            "Your bank credit 12000 INR click on this link",  # Original problematic message
            "Your SBI account has been credited with Rs 5000. Thank you for using our services.",  # Legitimate
            "URGENT: Your account will be blocked in 2 hours. Click here to verify now!",  # Scam
            "Transaction successful. Rs 1500 debited from your account. SMS STOP to opt out.",  # Legitimate
            "Congratulations! You have won lottery prize of Rs 50000. Call now to claim.",  # Scam
            "Dear customer, your UPI transaction for Rs 299 was successful. Ref: TXN123456",  # Legitimate
            "Your bank account is under investigation. Verify details immediately at secure-bank-verify.com",  # Scam
            "Your credit card ending 4567 was used for Rs 2999. If not you, call customer care."  # Legitimate
        ]
        
        labels = ["Scam", "Safe", "Scam", "Safe", "Scam", "Safe", "Scam", "Safe"]
        
        print("\n🧪 Testing Messages:")
        print("-" * 80)
        
        correct_predictions = 0
        
        for i, (message, expected_label) in enumerate(zip(test_messages, labels)):
            print(f"\n📨 Message {i+1}: {message[:60]}{'...' if len(message) > 60 else ''}")
            print(f"Expected: {expected_label}")
            
            # Extract features
            features = feature_extractor.extract_advanced_features(message)
            features_scaled = scaler.transform([features])
            
            # Tokenize text
            sequence = tokenizer.texts_to_sequences([message])
            text_padded = pad_sequences(sequence, maxlen=100, padding='post', truncating='post')
            
            # Make prediction
            predictions = model.predict([text_padded, features_scaled], verbose=0)
            scam_prob = predictions[0][0][0]
            confidence = predictions[1][0][0]
            risk_levels = predictions[2][0]
            
            # Determine prediction
            predicted_label = "Scam" if scam_prob > 0.5 else "Safe"
            risk_level = ["Low", "Medium", "High"][np.argmax(risk_levels)]
            
            print(f"Predicted: {predicted_label} ({scam_prob:.3f})")
            print(f"Confidence: {confidence:.3f}")
            print(f"Risk Level: {risk_level}")
            
            if predicted_label == expected_label:
                print("✅ CORRECT")
                correct_predictions += 1
            else:
                print("❌ INCORRECT")
        
        accuracy = correct_predictions / len(test_messages)
        print(f"\n🎯 Test Results:")
        print(f"Accuracy: {accuracy:.3f} ({correct_predictions}/{len(test_messages)})")
        
        # Test the original problematic message specifically
        print("\n🔍 ORIGINAL PROBLEMATIC MESSAGE TEST:")
        print("-" * 50)
        problematic_message = "Your bank credit 12000 INR click on this link"
        
        features = feature_extractor.extract_advanced_features(problematic_message)
        features_scaled = scaler.transform([features])
        sequence = tokenizer.texts_to_sequences([problematic_message])
        text_padded = pad_sequences(sequence, maxlen=100, padding='post', truncating='post')
        
        predictions = model.predict([text_padded, features_scaled], verbose=0)
        scam_prob = predictions[0][0][0]
        confidence = predictions[1][0][0]
        risk_levels = predictions[2][0]
        risk_level = ["Low", "Medium", "High"][np.argmax(risk_levels)]
        
        print(f"Message: {problematic_message}")
        print(f"Scam Probability: {scam_prob:.6f}")
        print(f"Confidence: {confidence:.6f}")
        print(f"Risk Level: {risk_level}")
        
        if scam_prob > 0.5:
            print("🚨 CORRECTLY IDENTIFIED AS SCAM!")
        else:
            print("❌ Still incorrectly classified as safe")
        
    except FileNotFoundError as e:
        print(f"❌ Model files not found: {e}")
        print("Please run train_10m_parameter_model.py first to train the model.")
    except Exception as e:
        print(f"❌ Error testing model: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_10m_model()
