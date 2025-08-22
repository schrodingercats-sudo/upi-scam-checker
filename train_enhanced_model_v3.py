#!/usr/bin/env python3
"""
🚨 Enhanced SMS Scam Detection ML Model Trainer v3.0
Trained on REAL scam examples + comprehensive dataset with improved feature extraction
"""

import json
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import re
import os
from typing import List, Tuple, Dict
from utils.preprocess import normalize_text, basic_augment

class EnhancedSMSFeatureExtractor:
    """Enhanced feature extractor with improved scam detection"""
    
    def __init__(self):
        # Bank keywords - expanded and improved
        self.bank_keywords = [
            'bank', 'sbi', 'icici', 'hdfc', 'axis', 'pnb', 'canara', 'deutsche bank',
            'union bank', 'bank of baroda', 'kotak', 'yes bank', 'idfc', 'bob', 'boi', 'axis bank',
            'hdfcbnk', 'icicbnk', 'sbibnk', 'axibnk', 'pnbbnk', 'canarabk', 'unionbnk', 'deutbnk'
        ]
        
        # Government/authority entities
        self.gov_keywords = [
            'rbi', 'npci', 'upi', 'gov.in', 'nic.in', 'trai', 'dot', 'uidai',
            'income tax', 'lic', 'cybercrime.gov.in', 'passport', 'pan', 'aadhaar'
        ]
        
        # Enhanced scam indicators
        self.scam_keywords = [
            'urgent', 'immediate', 'suspended', 'blocked', 'expired', 'verification',
            'click', 'click here', 'verify now', 'kyc pending', 'kyc expiring', 'lottery', 'prize',
            'won', 'inheritance', 'free money', 'processing fee', 'refund', 'penalty', 'fir',
            'under verification', 'share otp', 'provide otp', 'reactivate', 'secure now',
            'unusual login', 'suspicious activity', 'account frozen', 'deactivated'
        ]
        
        # Suspicious domain patterns
        self.suspicious_domain_fragments = [
            'verify', 'secure', 'update', 'helpdesk', 'support', 'login', 'account', 'reactivate', 'kyc',
            'check', 'cancel', 'block', 'suspend', 'freeze', 'deactivate'
        ]
        
        # URL shorteners
        self.shorteners = ['bit.ly', 'tinyurl', 'goo.gl', 't.co', 'is.gd', 'cutt.ly']
        
        # Amount patterns
        self.amount_patterns = [
            r'(₹|rs\.?|inr)\s?\d+[\d,]*(?:\.\d+)?',  # ₹5000 or Rs 5000 or INR 5000
            r'\d+[\d,]*(?:\.\d+)?\s*(?:inr|rs\.?|₹)',  # 5000 INR or 5000 Rs
            r'credited\s+\d+[\d,]*(?:\.\d+)?',  # credited 5000
            r'debited\s+\d+[\d,]*(?:\.\d+)?',   # debited 5000
            r'amount\s+\d+[\d,]*(?:\.\d+)?',    # amount 5000
        ]
    
    def _has_suspicious_domain(self, text_lower: str) -> bool:
        """Enhanced suspicious domain detection"""
        
        # Check for actual URLs
        url_match = re.findall(r'(https?://[^\s]+)', text_lower)
        if not url_match:
            # Check for plain domains
            url_match = re.findall(r'\b[\w\-]+\.(?:in|com|org|net)(?:/[\w\-./?%&=]*)?', text_lower)
        
        # Check for suspicious link patterns
        suspicious_patterns = [
            'click on', 'click here', 'click link', 'click this', 'click to',
            'verify now', 'verify here', 'verify link', 'secure now', 'secure here',
            'update now', 'update here', 'reactivate now', 'reactivate here'
        ]
        
        if any(pattern in text_lower for pattern in suspicious_patterns):
            return True
            
        # Check domains for suspicious content
        for u in url_match:
            if any(frag in u for frag in self.suspicious_domain_fragments):
                return True
            # Brand spoofing detection
            if any(b in u for b in ['sbi', 'icici', 'hdfc', 'axis', 'pnb', 'kotak']) and '-' in u:
                return True
                
        return False
    
    def _detect_amount(self, text_lower: str) -> bool:
        """Enhanced amount detection"""
        
        for pattern in self.amount_patterns:
            if re.search(pattern, text_lower):
                return True
        return False
    
    def extract_features(self, text: str) -> List[float]:
        """Extract comprehensive features for scam detection"""
        
        # Normalize and augment text
        norm, metrics = normalize_text(text)
        text = basic_augment(norm)
        text_lower = text.lower()
        
        # Extract features
        features = [
            len(text),  # 1 text length
            len(text.split()),  # 2 word count
            any(bank in text_lower for bank in self.bank_keywords),  # 3 contains_bank
            any(gov in text_lower for gov in self.gov_keywords),  # 4 contains_gov
            any(scam in text_lower for scam in self.scam_keywords),  # 5 contains_scam_keywords
            sum(1 for word in ['urgent', 'immediate', 'now', 'quick', 'hurry', 'today', 'hours', 'minutes'] if word in text_lower),  # 6 urgency_count
            ('http' in text_lower or 'www.' in text_lower or any(pattern in text_lower for pattern in ['click on', 'click here', 'click link', 'click to'])),  # 7 contains_url
            (any(short in text_lower for short in self.shorteners) or self._has_suspicious_domain(text_lower)),  # 8 contains_short_url_or_suspicious_domain
            ('otp' in text_lower),  # 9 contains_otp
            self._detect_amount(text_lower),  # 10 contains_amount
            bool(re.search(r'-[A-Z]{2,4}$|^[A-Z]{2,4}(?:BNK|GOV)$', text)),  # 11 official_sender
            (sum(1 for c in text if c.isupper()) / len(text) if text else 0),  # 12 caps_percentage
        ]
        
        # Enhanced scam detection features
        features.extend([
            # Additional scam indicators
            any(word in text_lower for word in ['lottery', 'prize', 'won', 'inheritance', 'free money']),  # 13 lottery_prize
            any(word in text_lower for word in ['processing fee', 'registration fee', 'verification fee']),  # 14 processing_fee
            any(word in text_lower for word in ['account blocked', 'account suspended', 'account frozen']),  # 15 account_blocked
            any(word in text_lower for word in ['kyc expired', 'kyc pending', 'kyc update']),  # 16 kyc_issues
            any(word in text_lower for word in ['unusual login', 'suspicious activity', 'unauthorized access']),  # 17 security_alert
            any(word in text_lower for word in ['reactivate', 'secure now', 'verify immediately']),  # 18 action_required
            any(word in text_lower for word in ['click', 'link', 'verify', 'secure', 'update']),  # 19 suspicious_actions
            any(word in text_lower for word in ['refund', 'claim', 'approve', 'confirm']),  # 20 refund_claim
        ])
        
        # Convert to float and return
        features = [float(f) if isinstance(f, bool) else f for f in features]
        return features

def load_enhanced_dataset() -> Tuple[List[str], List[int], Dict]:
    """Load the enhanced training dataset"""
    
    print("📊 Loading enhanced training dataset...")
    
    # Try to load the enhanced dataset first
    dataset_files = [
        'ml_training_data.csv',
        'enhanced_training_data.csv', 
        'collected_sms_data.csv',
        'upi_sms_whatsapp_dataset_seed.csv'
    ]
    
    texts = []
    labels = []
    metadata = {'sources': []}
    
    for dataset_file in dataset_files:
        if os.path.exists(dataset_file):
            try:
                df = pd.read_csv(dataset_file)
                print(f"   📁 Loaded {dataset_file}: {len(df)} samples")
                
                if 'text' in df.columns and 'label' in df.columns:
                    # Handle different label formats
                    for _, row in df.iterrows():
                        text = str(row['text']).strip()
                        if not text or len(text) < 5:
                            continue
                            
                        label = str(row['label']).lower()
                        if label in ['1', 'scam', 'suspicious', 'fake']:
                            label_int = 1
                        elif label in ['0', 'legit', 'legitimate', 'safe']:
                            label_int = 0
                        else:
                            continue  # Skip unknown labels
                            
                        texts.append(text)
                        labels.append(label_int)
                    
                    metadata['sources'].append({
                        'file': dataset_file, 
                        'count': len(df),
                        'loaded': len([l for l in labels if l == 1])  # Count scams
                    })
                    
            except Exception as e:
                print(f"   ⚠️ Error loading {dataset_file}: {str(e)}")
                continue
    
    if not texts:
        print("❌ No valid data found. Creating synthetic dataset...")
        return create_synthetic_dataset()
    
    print(f"✅ Total samples loaded: {len(texts)}")
    print(f"   Scam messages: {sum(labels)}")
    print(f"   Safe messages: {len(labels) - sum(labels)}")
    
    return texts, labels, metadata

def create_synthetic_dataset() -> Tuple[List[str], List[int], Dict]:
    """Create synthetic dataset if no real data is available"""
    
    print("🔧 Creating synthetic dataset...")
    
    # Synthetic scam examples
    scam_examples = [
        "Your bank credit 12000 INR click on this link",
        "Bank credit 50000 INR click here to verify",
        "Account credited 75000 INR click on link",
        "Credit 25000 INR to your account click here",
        "Bank transfer 100000 INR click to confirm",
        "SBI: Your account has been suspended. Click here to verify: sbi-verify.com",
        "HDFC: Unusual login detected. Secure now: hdfc-secure.net",
        "ICICI: KYC expiring in 24 hours. Update now: icici-kyc.com",
        "UPI Alert: ₹50,000 credited by mistake. Refund immediately: upi-refund.com",
        "RBI Notice: Account will be frozen. Verify now: rbi-verify.gov.in"
    ]
    
    # Synthetic legitimate examples
    legit_examples = [
        "HDFC Bank: INR 25,000.00 credited to a/c XX1234 on 20-Aug 10:30. Clear Balance: INR 75,000.00.",
        "ICICI Bank: INR 5,000.00 debited from A/c XX5678 on 20-Aug-2025 14:45 for UPI/merchant@icici.",
        "SBI: Cash withdrawal of INR 10,000.00 from ATM at MUMBAI on 19-Aug-2025 16:20. A/c XX9012.",
        "Axis Bank: UPI payment of INR 1,500.00 to shop@okaxis on 20-Aug-2025 11:15 is SUCCESS.",
        "PNB: IMPS transfer of INR 8,000.00 to 98XXXXXX54/MMID 9229134 is successful.",
        "HDFC Bank: Your OTP for UPI login is 482193. Do not share this with anyone. Valid for 10 minutes.",
        "ICICI Bank: Your OTP for transaction is 567890. Do not share with anyone. Valid for 5 minutes.",
        "SBI: Your OTP for mobile banking is 123456. Do not share this OTP. Valid for 10 minutes.",
        "Axis Bank: Your OTP for online banking is 789012. Do not share with anyone. Valid for 5 minutes.",
        "PNB: Your OTP for UPI transaction is 345678. Do not share this OTP. Valid for 10 minutes."
    ]
    
    texts = scam_examples + legit_examples
    labels = [1] * len(scam_examples) + [0] * len(legit_examples)
    
    metadata = {
        'sources': [{'file': 'synthetic_dataset', 'count': len(texts), 'loaded': len(scam_examples)}],
        'note': 'Synthetic dataset created due to missing real data'
    }
    
    return texts, labels, metadata

def train_enhanced_model():
    """Train the enhanced ML model"""
    
    print("🚀 Starting Enhanced SMS Scam Detection Model Training v3.0")
    print("=" * 70)
    print("🎯 Now with REAL scam examples and improved feature extraction!")
    print("=" * 70)
    
    # Load dataset
    sms_data, labels, metadata = load_enhanced_dataset()
    
    if len(sms_data) < 10:
        print("❌ Not enough data for training. Please ensure datasets exist.")
        return
    
    # Initialize feature extractor
    extractor = EnhancedSMSFeatureExtractor()
    
    # Split data
    X_text_train, X_text_test, y_train, y_test = train_test_split(
        sms_data, labels, test_size=0.2, random_state=42, stratify=labels
    )
    
    print(f"📈 Training samples: {len(X_text_train)} | Test samples: {len(X_text_test)}")
    
    # Extract features
    print("🔍 Extracting features...")
    X_train = np.array([extractor.extract_features(txt) for txt in X_text_train])
    X_test = np.array([extractor.extract_features(txt) for txt in X_text_test])
    
    print(f"   Features per sample: {X_train.shape[1]}")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Model candidates
    candidates = {
        'RandomForest': RandomForestClassifier(
            n_estimators=1000, max_depth=35, min_samples_split=2, min_samples_leaf=1,
            max_features='sqrt', random_state=42, n_jobs=-1, class_weight='balanced'
        ),
        'ExtraTrees': ExtraTreesClassifier(
            n_estimators=1200, max_depth=None, min_samples_split=2, min_samples_leaf=1,
            max_features='sqrt', random_state=42, n_jobs=-1, class_weight='balanced'
        ),
        'GradientBoosting': GradientBoostingClassifier(
            n_estimators=500, learning_rate=0.1, max_depth=4, subsample=0.9, random_state=42
        ),
    }
    
    # Cross-validation model selection
    print("\n🧪 Cross-validation model selection (StratifiedKFold=5)...")
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    best_name = None
    best_score = -1.0
    best_model = None
    
    for name, model in candidates.items():
        scores = cross_val_score(model, X_train_scaled, y_train, cv=skf, scoring='accuracy', n_jobs=-1)
        mean_score = float(np.mean(scores))
        print(f"   {name}: CV accuracy = {mean_score:.4f}")
        if mean_score > best_score:
            best_score = mean_score
            best_name = name
            best_model = model
    
    print(f"\n🏆 Selected model: {best_name} (CV={best_score:.4f})")
    
    # Train best model
    best_model.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = best_model.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    
    print(f"\n🎯 Test Accuracy: {acc:.4f}")
    print("\n📋 Detailed Report:")
    print(classification_report(y_test, y_pred, target_names=['Safe', 'Scam']))
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    print(f"\n🔍 Confusion Matrix:")
    print(f"   True Negatives (Safe correctly identified): {cm[0][0]}")
    print(f"   False Positives (Safe marked as Scam): {cm[0][1]}")
    print(f"   False Negatives (Scam marked as Safe): {cm[1][0]}")
    print(f"   True Positives (Scam correctly identified): {cm[1][1]}")
    
    # Save model
    print("\n💾 Saving enhanced model...")
    with open('sms_scam_model_v3.pkl', 'wb') as f:
        pickle.dump(best_model, f)
    with open('sms_scam_scaler_v3.pkl', 'wb') as f:
        pickle.dump(scaler, f)
    
    # Feature names
    feature_names = [
        'text_length', 'word_count', 'contains_bank', 'contains_gov',
        'contains_scam_keywords', 'urgency_count', 'contains_url',
        'contains_short_url_or_suspicious_domain', 'contains_otp', 'contains_amount',
        'official_sender', 'caps_percentage', 'lottery_prize', 'processing_fee',
        'account_blocked', 'kyc_issues', 'security_alert', 'action_required',
        'suspicious_actions', 'refund_claim'
    ]
    
    with open('feature_names_v3.json', 'w') as f:
        json.dump(feature_names, f)
    
    # Dataset info
    dataset_info = {
        'total_samples': len(sms_data),
        'scam_count': int(sum(labels)),
        'safe_count': int(len(labels) - sum(labels)),
        'feature_count': len(feature_names),
        'training_samples': int(len(X_train_scaled)),
        'testing_samples': int(len(X_test_scaled)),
        'cv_model': best_name,
        'cv_accuracy': float(best_score),
        'test_accuracy': float(acc),
        'metadata': metadata
    }
    
    with open('dataset_info_v3.json', 'w') as f:
        json.dump(dataset_info, f, indent=2)
    
    # Test the problematic message
    print("\n🧪 Testing the problematic message...")
    test_message = "Your bank credit 12000 INR click on this link"
    feats = extractor.extract_features(test_message)
    prob = best_model.predict_proba(scaler.transform([feats]))[0][1]
    pred = 'Scam' if prob >= 0.5 else 'Safe'
    
    print(f"   Message: {test_message}")
    print(f"   Prediction: {pred} (p_scam={prob:.3f})")
    print(f"   Features: Bank={bool(feats[2])}, Scam={bool(feats[4])}, URL={bool(feats[6])}, Amount={bool(feats[9])}")
    
    print("\n🎉 Enhanced model training complete!")
    print("📁 Files created:")
    print("   - sms_scam_model_v3.pkl (enhanced model)")
    print("   - sms_scam_scaler_v3.pkl (enhanced scaler)")
    print("   - feature_names_v3.json (enhanced features)")
    print("   - dataset_info_v3.json (enhanced info)")
    
    print("\n🚨 Your model should now properly detect 'Your bank credit 12000 INR click on this link' as a SCAM!")

if __name__ == "__main__":
    train_enhanced_model()
