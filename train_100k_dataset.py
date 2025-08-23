#!/usr/bin/env python3
"""
Train AI Model on 100K SMS Dataset with Gemini API Integration
"""

import pandas as pd
import numpy as np
import json
import pickle
import os
import re
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, GradientBoostingClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support
import google.generativeai as genai
from typing import Dict, Any, List, Tuple
import warnings
warnings.filterwarnings('ignore')

# Configure Gemini API
GOOGLE_GEMINI_API_KEY = os.getenv('GOOGLE_GEMINI_API_KEY')
if GOOGLE_GEMINI_API_KEY:
    genai.configure(api_key=GOOGLE_GEMINI_API_KEY)
    print("✅ Gemini API configured")
else:
    print("⚠️ No Gemini API key found. Training without Gemini integration.")

class AdvancedSMSFeatureExtractor:
    """Advanced feature extractor for SMS analysis"""
    
    def __init__(self):
        self.sms_categories = {
            's': {'name': 'Service', 'trust_score': 0.9},
            'g': {'name': 'Government', 'trust_score': 0.95},
            'p': {'name': 'Promotional', 'trust_score': 0.3},
            't': {'name': 'Transactional/OTP', 'trust_score': 0.8}
        }
        
        # Initialize TF-IDF vectorizer
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 3),
            stop_words='english',
            min_df=2,
            max_df=0.95
        )
        
    def extract_text_features(self, text: str) -> List[float]:
        """Extract text-based features"""
        if not text:
            return [0] * 50
            
        text_lower = text.lower()
        features = []
        
        # Basic text features
        features.append(len(text))
        features.append(len(text.split()))
        features.append(len([c for c in text if c.isupper()]))
        features.append(len([c for c in text if c.isdigit()]))
        features.append(len([c for c in text if c in '!@#$%^&*()']))
        
        # Word count features
        features.append(len([word for word in text.split() if len(word) > 5]))
        features.append(len([word for word in text.split() if len(word) < 3]))
        
        # Character features
        features.append(text.count('!'))
        features.append(text.count('?'))
        features.append(text.count('.'))
        features.append(text.count(','))
        features.append(text.count(':'))
        features.append(text.count(';'))
        
        # URL features
        features.append(1 if 'http' in text_lower or 'www' in text_lower else 0)
        features.append(1 if any(shortener in text_lower for shortener in ['bit.ly', 'tinyurl', 'goo.gl', 't.co']) else 0)
        
        # Financial features
        features.append(1 if re.search(r'\d+[\d,]*(?:\.\d+)?\s*(?:inr|rs\.?|₹)', text_lower) else 0)
        features.append(1 if re.search(r'(?:inr|rs\.?|₹)\s?\d+[\d,]*(?:\.\d+)?', text_lower) else 0)
        features.append(1 if re.search(r'\b\d{4,}\b', text_lower) else 0)  # Large numbers
        
        # Action words
        action_words = ['click', 'verify', 'confirm', 'update', 'reactivate', 'login', 'secure', 'activate']
        features.append(sum(1 for word in action_words if word in text_lower))
        
        # Urgency words
        urgency_words = ['urgent', 'immediate', 'now', 'quick', 'hurry', 'fast', 'asap', 'emergency']
        features.append(sum(1 for word in urgency_words if word in text_lower))
        
        # Scam keywords
        scam_keywords = [
            'suspended', 'blocked', 'expired', 'verification', 'kyc', 'lottery', 'prize', 'won', 
            'inheritance', 'free money', 'processing fee', 'refund', 'penalty', 'fir', 'otp',
            'share otp', 'provide otp', 'account blocked', 'security alert', 'unusual activity'
        ]
        features.append(sum(1 for word in scam_keywords if word in text_lower))
        
        # Suspicious keywords
        suspicious_keywords = [
            'bank', 'credit', 'debit', 'inr', 'rs', '₹', 'update', 'confirm', 'reactivate',
            'government', 'official', 'authority', 'tax', 'income', 'aadhaar', 'pan'
        ]
        features.append(sum(1 for word in suspicious_keywords if word in text_lower))
        
        # Legitimate keywords
        legitimate_keywords = [
            'thank you', 'successful', 'completed', 'verified', 'confirmed', 'welcome',
            'team', 'support', 'customer', 'service', 'help', 'assist'
        ]
        features.append(sum(1 for word in legitimate_keywords if word in text_lower))
        
        # Language patterns
        features.append(1 if text.isupper() else 0)  # ALL CAPS
        features.append(1 if text.islower() else 0)  # all lowercase
        features.append(1 if text[0].isupper() and text[1:].islower() else 0)  # Title case
        
        # Punctuation patterns
        features.append(len(re.findall(r'[!]{2,}', text)))  # Multiple exclamation marks
        features.append(len(re.findall(r'[?]{2,}', text)))  # Multiple question marks
        
        # Number patterns
        features.append(len(re.findall(r'\d+', text)))  # Count of numbers
        features.append(len(re.findall(r'\b\d{6}\b', text)))  # 6-digit numbers (OTP)
        features.append(len(re.findall(r'\b\d{10}\b', text)))  # 10-digit numbers (phone)
        
        # Special character patterns
        features.append(len(re.findall(r'[^\w\s]', text)))  # Special characters
        features.append(len(re.findall(r'[0-9]', text)))  # Digits
        
        # Fill remaining features
        while len(features) < 50:
            features.append(0)
            
        return features[:50]
    
    def extract_header_features(self, header: str) -> List[float]:
        """Extract features from SMS header/sender ID"""
        if not header:
            return [0] * 20
            
        header_upper = header.upper()
        features = []
        
        # Category features (your sir's concept!)
        last_char = header_upper[-1] if header_upper else ''
        features.append(1 if last_char == 'S' else 0)  # Service
        features.append(1 if last_char == 'G' else 0)  # Government
        features.append(1 if last_char == 'P' else 0)  # Promotional
        features.append(1 if last_char == 'T' else 0)  # Transactional
        
        # Trust score based on category
        trust_score = 0.5  # Default
        if last_char in self.sms_categories:
            trust_score = self.sms_categories[last_char]['trust_score']
        features.append(trust_score)
        
        # Header length features
        features.append(len(header))
        features.append(len(header.split('-')))
        features.append(len(header.split('_')))
        
        # Known legitimate patterns
        legitimate_patterns = ['BANK', 'SBI', 'HDFC', 'ICICI', 'AXIS', 'PAYTM', 'PHONEPE', 'GPAY', 'AMAZON', 'GOVT', 'INCOME', 'AADHAAR', 'PAN', 'GST', 'INDIAN', 'IRCTC']
        features.append(sum(1 for pattern in legitimate_patterns if pattern in header_upper))
        
        # Suspicious patterns
        suspicious_patterns = ['LOTTERY', 'PRIZE', 'WIN', 'FREE', 'URGENT', 'SUSPEND', 'BLOCK', 'VERIFY', 'UPDATE', 'SECURE', 'ALERT', 'WARNING', 'CRITICAL', 'IMMEDIATE']
        features.append(sum(1 for pattern in suspicious_patterns if pattern in header_upper))
        
        # Header complexity
        features.append(len(set(header)))  # Unique characters
        features.append(len([c for c in header if c.isupper()]))  # Uppercase count
        features.append(len([c for c in header if c.isdigit()]))  # Digit count
        features.append(len([c for c in header if c in '-_']))  # Separator count
        
        # Fill remaining features
        while len(features) < 20:
            features.append(0)
            
        return features[:20]
    
    def extract_combined_features(self, text: str, header: str) -> List[float]:
        """Extract combined features from text and header"""
        text_features = self.extract_text_features(text)
        header_features = self.extract_header_features(header)
        
        # Combine features
        combined_features = text_features + header_features
        
        # Add interaction features
        if header and text:
            header_lower = header.lower()
            text_lower = text.lower()
            
            # Check if header keywords appear in text
            header_words = set(header_lower.replace('-', ' ').replace('_', ' ').split())
            text_words = set(text_lower.split())
            interaction_score = len(header_words.intersection(text_words)) / max(len(header_words), 1)
            combined_features.append(interaction_score)
        else:
            combined_features.append(0)
        
        return combined_features

class GeminiAnalyzer:
    """Gemini API integration for enhanced analysis"""
    
    def __init__(self):
        self.model = None
        if GOOGLE_GEMINI_API_KEY:
            try:
                self.model = genai.GenerativeModel('gemini-pro')
                print("✅ Gemini model initialized")
            except Exception as e:
                print(f"⚠️ Gemini initialization failed: {e}")
    
    def analyze_message(self, text: str, header: str, category: str) -> Dict[str, Any]:
        """Analyze message using Gemini API"""
        if not self.model:
            return {
                'analysis': 'Gemini not available',
                'confidence': 0.5,
                'reason': 'No API key configured'
            }
        
        try:
            prompt = f"""
            Analyze this SMS message for scam detection. Consider the sender ID and category.

            SENDER ID: {header}
            CATEGORY: {category}
            MESSAGE: "{text}"

            Analyze for:
            1. Legitimacy based on sender ID pattern
            2. Content analysis for scam indicators
            3. Consistency between sender ID and message content
            4. Overall risk assessment

            Respond in JSON format:
            {{
                "analysis": "brief analysis",
                "confidence": 0.0 to 1.0,
                "reason": "explanation",
                "risk_factors": ["factor1", "factor2"],
                "legitimacy_score": 0.0 to 1.0
            }}
            """
            
            response = self.model.generate_content(prompt)
            result = json.loads(response.text)
            
            return result
            
        except Exception as e:
            print(f"Gemini analysis error: {e}")
            return {
                'analysis': 'Analysis failed',
                'confidence': 0.5,
                'reason': f'Error: {str(e)}',
                'risk_factors': [],
                'legitimacy_score': 0.5
            }

def load_and_preprocess_dataset(filepath: str) -> Tuple[pd.DataFrame, List[str], List[str], List[str], List[str]]:
    """Load and preprocess the 100K dataset"""
    print("📁 Loading 100K SMS dataset...")
    
    # Load dataset
    df = pd.read_csv(filepath)
    print(f"✅ Loaded {len(df)} messages")
    
    # Clean data
    df = df.dropna()
    df = df[df['sms_text'].str.len() > 0]
    
    # Extract features
    extractor = AdvancedSMSFeatureExtractor()
    
    print("🔧 Extracting features...")
    features = []
    for idx, row in df.iterrows():
        if idx % 10000 == 0:
            print(f"   Processed {idx}/{len(df)} messages...")
        
        combined_features = extractor.extract_combined_features(
            str(row['sms_text']), 
            str(row['header'])
        )
        features.append(combined_features)
    
    # Prepare labels
    labels = (df['label'] == 'scam').astype(int)
    
    print(f"✅ Feature extraction complete: {len(features)} samples, {len(features[0])} features")
    
    return df, features, labels, df['sms_text'].tolist(), df['header'].tolist()

def train_advanced_model(features: List[List[float]], labels: List[int]) -> Tuple[Any, StandardScaler]:
    """Train advanced ensemble model"""
    print("🤖 Training advanced ensemble model...")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        features, labels, test_size=0.2, random_state=42, stratify=labels
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Create ensemble model
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    
    # Train model
    print("   Training Random Forest...")
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='binary')
    
    print(f"✅ Model trained successfully!")
    print(f"   Accuracy: {accuracy:.3f}")
    print(f"   Precision: {precision:.3f}")
    print(f"   Recall: {recall:.3f}")
    print(f"   F1-Score: {f1:.3f}")
    
    return model, scaler

def save_model_and_features(model: Any, scaler: StandardScaler, feature_names: List[str]):
    """Save the trained model and features"""
    print("💾 Saving model and features...")
    
    # Save model
    with open('sms_scam_model_100k.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    # Save scaler
    with open('sms_scam_scaler_100k.pkl', 'wb') as f:
        pickle.dump(scaler, f)
    
    # Save feature names
    with open('feature_names_100k.json', 'w') as f:
        json.dump(feature_names, f)
    
    print("✅ Model saved as 'sms_scam_model_100k.pkl'")
    print("✅ Scaler saved as 'sms_scam_scaler_100k.pkl'")
    print("✅ Feature names saved as 'feature_names_100k.json'")

def test_gemini_integration(df: pd.DataFrame, model: Any, scaler: StandardScaler):
    """Test Gemini integration with sample messages"""
    print("\n🧪 Testing Gemini integration...")
    
    gemini_analyzer = GeminiAnalyzer()
    
    # Test cases
    test_cases = [
        {
            'text': 'Your account has been credited with Rs. 5000. Thank you for banking with us.',
            'header': 'SBI-S',
            'category': 's',
            'expected': 'legit'
        },
        {
            'text': 'Congratulations! You have won Rs. 10,00,000! Click here to claim your prize!',
            'header': 'LOTTERY-P',
            'category': 'p',
            'expected': 'scam'
        },
        {
            'text': 'Your OTP for transaction is 123456. Do not share with anyone.',
            'header': 'HDFC-T',
            'category': 't',
            'expected': 'legit'
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test {i}: {test_case['expected']} message")
        print(f"   Header: {test_case['header']}")
        print(f"   Text: {test_case['text']}")
        
        # ML prediction
        extractor = AdvancedSMSFeatureExtractor()
        features = extractor.extract_combined_features(test_case['text'], test_case['header'])
        features_scaled = scaler.transform([features])
        ml_prediction = model.predict(features_scaled)[0]
        ml_probability = model.predict_proba(features_scaled)[0]
        
        print(f"   ML Prediction: {'SCAM' if ml_prediction else 'LEGIT'} ({max(ml_probability):.1%})")
        
        # Gemini analysis
        gemini_result = gemini_analyzer.analyze_message(
            test_case['text'], 
            test_case['header'], 
            test_case['category']
        )
        
        print(f"   Gemini Analysis: {gemini_result['analysis']}")
        print(f"   Gemini Confidence: {gemini_result['confidence']:.1%}")
        print(f"   Reason: {gemini_result['reason']}")

def main():
    """Main training function"""
    print("🚀 Starting 100K SMS Dataset Training with Gemini Integration")
    print("=" * 70)
    
    # Load and preprocess dataset
    df, features, labels, texts, headers = load_and_preprocess_dataset('sms_dataset_100k.csv')
    
    # Train model
    model, scaler = train_advanced_model(features, labels)
    
    # Save model
    feature_names = [f"feature_{i}" for i in range(len(features[0]))]
    save_model_and_features(model, scaler, feature_names)
    
    # Test Gemini integration
    test_gemini_integration(df, model, scaler)
    
    print("\n🎉 Training completed successfully!")
    print("📊 Dataset Statistics:")
    print(f"   Total messages: {len(df)}")
    print(f"   Legitimate: {sum(labels == 0)}")
    print(f"   Scam: {sum(labels == 1)}")
    print(f"   Features: {len(features[0])}")
    
    print("\n✅ Your system now has:")
    print("   🤖 Advanced ML model trained on 100K messages")
    print("   📱 SMS Sender ID analysis (your sir's concept)")
    print("   🧠 Gemini API integration for enhanced analysis")
    print("   🛡️ Multi-layered scam detection")

if __name__ == "__main__":
    main()
