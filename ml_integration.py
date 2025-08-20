#!/usr/bin/env python3
"""
🔗 ML Model Integration for Web Application
Connects trained scam detection model to Next.js frontend
"""

import pickle
import json
import numpy as np
import re
import pandas as pd
from typing import Dict, Any

class MLScamDetector:
    """Machine Learning-based SMS Scam Detector"""
    
    def __init__(self, model_path: str = 'sms_scam_model.pkl', 
                 scaler_path: str = 'sms_scam_scaler.pkl',
                 features_path: str = 'feature_names.json'):
        """Initialize the ML detector with trained model"""
        try:
            # Load trained model
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            
            # Load feature scaler
            with open(scaler_path, 'rb') as f:
                self.scaler = pickle.load(f)
            
            # Load feature names
            with open(features_path, 'r') as f:
                self.feature_names = json.load(f)
            
            print("✅ ML Model loaded successfully!")
            print(f"🔍 Features: {len(self.feature_names)}")
            
            # Try to load dataset info
            try:
                with open('dataset_info.json', 'r') as f:
                    self.dataset_info = json.load(f)
                print(f"📊 Dataset: {self.dataset_info['total_samples']} samples")
                print(f"🎯 Training Accuracy: {self.dataset_info['accuracy']:.1%}")
            except:
                self.dataset_info = None
                print("⚠️ Dataset info not available")
            
        except FileNotFoundError:
            print("⚠️ Model files not found. Please run train_ml_model.py first.")
            self.model = None
            self.scaler = None
            self.feature_names = None
            self.dataset_info = None
    
    def extract_features(self, text: str) -> list:
        """Extract features from SMS text (same as training)"""
        text_lower = text.lower()
        
        # Real bank names from the dataset
        bank_keywords = [
            'sbi', 'icici', 'hdfc', 'axis', 'pnb', 'canara', 'deutsche bank',
            'union bank', 'bank of baroda', 'kotak', 'yes bank', 'idfc'
        ]
        
        # Government entities from the dataset
        gov_keywords = [
            'rbi', 'npci', 'upi', 'gov.in', 'nic.in', 'trai', 'dot', 'uidai',
            'income tax', 'lic', 'cybercrime.gov.in'
        ]
        
        # Scam indicators from real fraud cases
        scam_keywords = [
            'urgent', 'immediate', 'suspended', 'blocked', 'expired', 
            'click here', 'verify now', 'kyc pending', 'lottery', 'prize',
            'won', 'inheritance', 'free money', 'processing fee'
        ]
        
        features = [
            len(text),  # text length
            len(text.split()),  # word count
            any(bank in text_lower for bank in bank_keywords),  # contains bank name
            any(gov in text_lower for gov in gov_keywords),  # contains gov name
            any(scam in text_lower for scam in scam_keywords),  # contains scam keywords
            sum(1 for word in ['urgent', 'immediate', 'now', 'quick', 'hurry'] if word in text_lower),  # urgency count
            'http' in text_lower or 'www.' in text_lower,  # contains URL
            any(short in text_lower for short in ['bit.ly', 'tinyurl', 'goo.gl', '.in', '.com']),  # short URL/domain
            'otp' in text_lower,  # contains OTP
            bool(re.search(r'₹\d+|\d+\s*rupees?|\d+\s*inr', text_lower)),  # contains amount
            bool(re.search(r'-[A-Z]{2,4}$|^[A-Z]{2,4}BNK$|^[A-Z]{2,4}GOV$', text)),  # official sender
            sum(1 for char in text if char.isupper()) / len(text) if text else 0,  # caps percentage
        ]
        
        return features
    
    def predict_sms(self, sms_text: str) -> Dict[str, Any]:
        """Predict if an SMS is a scam using ML model"""
        if not self.model or not self.scaler:
            return {
                'error': 'ML model not loaded. Please train the model first.',
                'prediction': 'unknown',
                'confidence': 0.0
            }
        
        try:
            # Extract features
            features = self.extract_features(sms_text)
            features_array = np.array([features])
            
            # Scale features
            features_scaled = self.scaler.transform(features_array)
            
            # Make prediction
            prediction = self.model.predict(features_scaled)[0]
            probabilities = self.model.predict_proba(features_scaled)[0]
            
            # Get confidence
            confidence = probabilities[1] if prediction == 1 else probabilities[0]
            
            # Determine result
            if prediction == 0:
                result = 'Safe'
                risk_level = 'Low'
                advice = 'This appears to be a legitimate message. Continue with normal caution.'
            else:
                result = 'Scam'
                risk_level = 'High'
                advice = 'This is likely a scam. Do not respond, click, or share any information. Report immediately.'
            
            # Generate red flags
            red_flags = self._generate_red_flags(sms_text, features)
            
            return {
                'label': result,
                'confidence': round(confidence, 3),
                'riskLevel': risk_level,
                'redFlags': red_flags,
                'advice': advice,
                'ml_prediction': True,
                'features_used': len(features),
                'model_info': {
                    'dataset_samples': self.dataset_info['total_samples'] if self.dataset_info else 'Unknown',
                    'training_accuracy': self.dataset_info['accuracy'] if self.dataset_info else 'Unknown'
                }
            }
            
        except Exception as e:
            return {
                'error': f'Prediction failed: {str(e)}',
                'prediction': 'unknown',
                'confidence': 0.0
            }
    
    def _generate_red_flags(self, text: str, features: list) -> list:
        """Generate red flags based on extracted features"""
        red_flags = []
        text_lower = text.lower()
        
        # Check specific features
        if features[2]:  # contains bank name
            red_flags.append('Contains bank name')
        
        if features[3]:  # contains government name
            red_flags.append('Contains government entity name')
        
        if features[4]:  # contains scam keywords
            red_flags.append('Contains suspicious keywords')
        
        if features[5] > 0:  # urgency count
            red_flags.append('Uses urgency tactics')
        
        if features[6]:  # contains URL
            red_flags.append('Contains URL/link')
        
        if features[7]:  # contains short URL
            red_flags.append('Uses URL shortener or suspicious domain')
        
        if features[8]:  # contains OTP
            red_flags.append('Contains OTP')
        
        if features[9]:  # contains amount
            red_flags.append('Contains monetary amount')
        
        if features[10]:  # official sender
            red_flags.append('Has official sender ID pattern')
        
        if features[11] > 0.5:  # caps percentage
            red_flags.append('Uses excessive capitalization')
        
        return red_flags

def create_api_endpoint():
    """Create a simple API endpoint for the web application"""
    
    # This would be integrated with your Next.js API routes
    api_code = '''
// Next.js API Route: pages/api/analyze-sms.js
import { MLScamDetector } from '../../ml_integration.py'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const { sms_text, type } = req.body
    
    if (!sms_text) {
      return res.status(400).json({ error: 'SMS text is required' })
    }
    
    // Initialize ML detector
    const detector = new MLScamDetector()
    
    // Analyze SMS
    const result = detector.predict_sms(sms_text)
    
    res.status(200).json(result)
    
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
'''
    
    return api_code

def test_with_real_dataset():
    """Test the ML detector with examples from the real dataset"""
    
    print("🧪 Testing ML Detector with Real Dataset Examples")
    print("=" * 60)
    
    try:
        # Load real dataset
        df = pd.read_csv('upi_sms_whatsapp_dataset_seed.csv')
        
        # Initialize detector
        detector = MLScamDetector()
        
        if not detector.model:
            print("❌ ML model not loaded. Please train the model first.")
            return
        
        # Test with real examples
        test_cases = []
        
        # Add some legitimate examples
        legit_examples = df[df['label'] == 'legit'].head(3)
        for _, row in legit_examples.iterrows():
            test_cases.append({
                'text': row['text'],
                'expected': 'Safe',
                'description': f"Legitimate {row['category']} - {row['channel']}"
            })
        
        # Add some scam examples
        scam_examples = df[df['label'] == 'scam'].head(3)
        for _, row in scam_examples.iterrows():
            test_cases.append({
                'text': row['text'],
                'expected': 'Scam',
                'description': f"Scam {row['category']} - {row['channel']}"
            })
        
        # Run tests
        correct = 0
        total = len(test_cases)
        
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n📱 Test {i}: {test_case['description']}")
            print(f"   SMS: {test_case['text'][:80]}...")
            
            result = detector.predict_sms(test_case['text'])
            
            if 'error' in result:
                print(f"   ❌ Error: {result['error']}")
                continue
            
            prediction = result['label']
            confidence = result['confidence']
            risk_level = result['riskLevel']
            
            status = "✅" if prediction == test_case['expected'] else "❌"
            if prediction == test_case['expected']:
                correct += 1
            
            print(f"   {status} Prediction: {prediction} (Expected: {test_case['expected']})")
            print(f"   📊 Confidence: {confidence}")
            print(f"   🚨 Risk Level: {risk_level}")
            print(f"   🔍 Red Flags: {len(result['redFlags'])} detected")
        
        # Show results
        accuracy = correct / total if total > 0 else 0
        print(f"\n🎯 Test Results:")
        print(f"   Correct: {correct}/{total}")
        print(f"   Accuracy: {accuracy:.1%}")
        
        if accuracy >= 0.8:
            print("   🎉 Excellent performance!")
        elif accuracy >= 0.6:
            print("   👍 Good performance!")
        else:
            print("   ⚠️ Performance needs improvement")
            
    except FileNotFoundError:
        print("❌ Real dataset not found. Please ensure upi_sms_whatsapp_dataset_seed.csv exists.")
    except Exception as e:
        print(f"❌ Error testing with real dataset: {str(e)}")

def test_ml_detector():
    """Test the ML detector with various SMS examples"""
    
    print("🧪 Testing ML Scam Detector")
    print("=" * 40)
    
    # Initialize detector
    detector = MLScamDetector()
    
    if not detector.model:
        print("❌ ML model not loaded. Please train the model first.")
        return
    
    # Test cases
    test_cases = [
        {
            'text': "SBI: Your OTP for transaction of ₹500 is 123456. -SBIBNK",
            'expected': 'Safe',
            'description': 'Legitimate SBI OTP'
        },
        {
            'text': "URGENT: Your KYC expired. Click here: bit.ly/kyc-verify-now. Account blocked in 2 hours!",
            'expected': 'Scam',
            'description': 'Fake KYC expiry scam'
        },
        {
            'text': "ICICI Bank: Account suspended. Click here: icicibank-secure-verify.com. Verify now!",
            'expected': 'Scam',
            'description': 'Sophisticated banking scam'
        },
        {
            'text': "RBI: Your UPI transaction of ₹1000 successful. Transaction ID: UPI123456789. -RBIGOV",
            'expected': 'Safe',
            'description': 'Legitimate RBI message'
        },
        {
            'text': "🎉 CONGRATULATIONS! You won ₹50,000! Click here: tinyurl.com/prize-claim. Limited time!",
            'expected': 'Scam',
            'description': 'Prize scam'
        }
    ]
    
    correct = 0
    total = len(test_cases)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📱 Test {i}: {test_case['description']}")
        print(f"   SMS: {test_case['text'][:60]}...")
        
        result = detector.predict_sms(test_case['text'])
        
        if 'error' in result:
            print(f"   ❌ Error: {result['error']}")
            continue
        
        prediction = result['label']
        confidence = result['confidence']
        risk_level = result['riskLevel']
        
        status = "✅" if prediction == test_case['expected'] else "❌"
        if prediction == test_case['expected']:
            correct += 1
        
        print(f"   {status} Prediction: {prediction} (Expected: {test_case['expected']})")
        print(f"   📊 Confidence: {confidence}")
        print(f"   🚨 Risk Level: {risk_level}")
        print(f"   🔍 Red Flags: {len(result['redFlags'])} detected")
    
    # Show results
    accuracy = correct / total if total > 0 else 0
    print(f"\n🎯 Test Results:")
    print(f"   Correct: {correct}/{total}")
    print(f"   Accuracy: {accuracy:.1%}")
    
    if accuracy >= 0.8:
        print("   🎉 Excellent performance!")
    elif accuracy >= 0.6:
        print("   👍 Good performance!")
    else:
        print("   ⚠️ Performance needs improvement")

def main():
    """Main function to run tests"""
    
    print("🔗 ML Model Integration Testing")
    print("=" * 50)
    
    # Test 1: Basic functionality
    print("\n🧪 Test 1: Basic ML Detector Testing")
    test_ml_detector()
    
    # Test 2: Real dataset testing
    print("\n🧪 Test 2: Real Dataset Testing")
    test_with_real_dataset()
    
    # Show API integration code
    print("\n🔗 API Integration Code:")
    print("=" * 40)
    print(create_api_endpoint())

if __name__ == "__main__":
    main()
