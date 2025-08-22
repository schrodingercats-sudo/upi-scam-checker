#!/usr/bin/env python3
"""
🤖 ENHANCED SMS Scam Detection ML Model Trainer V2
Improved version with better class balancing and scam detection
"""

import json
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score
import re
import os
from typing import List, Tuple, Dict
from utils.preprocess import normalize_text, basic_augment

class EnhancedSMSFeatureExtractorV2:
    """Enhanced feature extractor with improved scam detection patterns."""
    
    def __init__(self):
        # Bank names (common in India)
        self.bank_keywords = [
            'sbi', 'icici', 'hdfc', 'axis', 'pnb', 'canara', 'deutsche bank',
            'union bank', 'bank of baroda', 'kotak', 'yes bank', 'idfc', 'bob', 'boi', 'axis bank'
        ]
        # Government/authority entities
        self.gov_keywords = [
            'rbi', 'npci', 'upi', 'gov.in', 'nic.in', 'trai', 'dot', 'uidai',
            'income tax', 'lic', 'cybercrime.gov.in', 'passport', 'pan'
        ]
        # Enhanced scam indicators
        self.scam_keywords = [
            'urgent', 'immediate', 'suspended', 'blocked', 'expired', 'verification',
            'click here', 'verify now', 'kyc pending', 'kyc expiring', 'lottery', 'prize',
            'won', 'inheritance', 'free money', 'processing fee', 'refund', 'penalty', 'fir',
            'under verification', 'share otp', 'provide otp', 'lost wallet', 'temporarily suspended',
            'update within', 'avoid restriction', 'complete verification', 'dear customer'
        ]
        # Domains often seen in scams
        self.suspicious_domain_fragments = [
            'verify', 'secure', 'update', 'helpdesk', 'support', 'login', 'account', 'reactivate', 'kyc'
        ]
        self.shorteners = ['bit.ly', 'tinyurl', 'goo.gl', 't.co']
        
        # Strong scam indicators
        self.strong_scam_indicators = [
            'verify now', 'click here', 'update within', 'avoid restriction',
            'temporarily suspended', 'complete verification', 'lost wallet'
        ]
        
        # UPI-specific patterns
        self.upi_patterns = [
            'upi', 'upi payment', 'upi transaction', 'upi ref', 'upi pin'
        ]
    
    def _has_suspicious_domain(self, text_lower: str) -> bool:
        # Simple detection of URLs
        url_match = re.findall(r'(https?://[^\s]+)', text_lower)
        if not url_match:
            # Also catch plain domains
            url_match = re.findall(r'\b[\w\-]+\.(?:in|com|org|net)(?:/[\w\-./?%&=]*)?', text_lower)
        if not url_match:
            return False
        # Flag if domain contains suspicious fragments or hyphenated brand lookalikes
        for u in url_match:
            if any(frag in u for frag in self.suspicious_domain_fragments):
                return True
            # Hyphenated brand + unrelated domain
            if any(b in u for b in ['sbi', 'icici', 'hdfc', 'axis', 'pnb', 'kotak']) and '-' in u:
                return True
        return False
    
    def _detect_strong_scam_patterns(self, text_lower: str) -> bool:
        """Detect strong scam patterns that are almost always scams."""
        return any(pattern in text_lower for pattern in self.strong_scam_indicators)
    
    def _detect_upi_specific(self, text_lower: str) -> bool:
        """Detect UPI-specific scam patterns."""
        return any(pattern in text_lower for pattern in self.upi_patterns)
    
    def _detect_time_pressure(self, text_lower: str) -> bool:
        """Detect time pressure tactics."""
        time_pressure_words = ['within', 'hour', 'mins', 'tonight', 'today', 'now', 'immediate']
        return any(word in text_lower for word in time_pressure_words)
    
    def _detect_emotional_manipulation(self, text_lower: str) -> bool:
        """Detect emotional manipulation tactics."""
        emotional_words = ['dear customer', 'urgent', 'important', 'critical', 'serious']
        return any(word in text_lower for word in emotional_words)
    
    def extract_features(self, text: str) -> List[float]:
        # Normalize first and collect metrics
        norm, metrics = normalize_text(text)
        text = basic_augment(norm)
        text_lower = text.lower()
        
        features = [
            len(text),  # 1 text length
            len(text.split()),  # 2 word count
            any(bank in text_lower for bank in self.bank_keywords),  # 3 contains_bank
            any(gov in text_lower for gov in self.gov_keywords),  # 4 contains_gov
            any(scam in text_lower for scam in self.scam_keywords),  # 5 contains_scam_keywords
            sum(1 for word in ['urgent', 'immediate', 'now', 'quick', 'hurry', 'today', 'hours'] if word in text_lower),  # 6 urgency_count
            ('http' in text_lower or 'www.' in text_lower),  # 7 contains_url
            (any(short in text_lower for short in self.shorteners) or self._has_suspicious_domain(text_lower)),  # 8 contains_short_url_or_suspicious_domain
            ('otp' in text_lower),  # 9 contains_otp
            bool(re.search(r'(₹|rs\.?|inr)\s?\d+[\d,]*(?:\.\d+)?', text_lower)),  # 10 contains_amount
            bool(re.search(r'-[A-Z]{2,4}$|^[A-Z]{2,4}(?:BNK|GOV)$', text)),  # 11 official_sender
            (sum(1 for c in text if c.isupper()) / len(text) if text else 0),  # 12 caps_percentage
            self._detect_strong_scam_patterns(text_lower),  # 13 strong_scam_patterns
            self._detect_upi_specific(text_lower),  # 14 upi_specific_pattern
            self._detect_time_pressure(text_lower),  # 15 time_pressure_tactic
            self._detect_emotional_manipulation(text_lower),  # 16 emotional_manipulation
            bool(re.search(r'\+\d{10,}', text_lower)),  # 17 contains_phone_number
            bool(re.search(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', text_lower)),  # 18 contains_email
            bool(re.search(r'[A-Z]{2,4}-BANK', text)),  # 19 fake_bank_format
            (metrics['zero_width_count'] > 0 or metrics['non_ascii_ratio'] > 0.1),  # 20 suspicious_characters
        ]
        
        # cast bools to floats
        features = [float(f) if isinstance(f, bool) else f for f in features]
        return features

def load_all_datasets() -> Tuple[List[str], List[int], Dict]:
    """Load ALL datasets including the new ones provided by user."""
    texts: List[str] = []
    labels: List[int] = []
    meta: Dict = {'sources': []}

    # 1) Seed dataset (rich schema with legitimate examples)
    seed_path = 'upi_sms_whatsapp_dataset_seed.csv'
    if os.path.exists(seed_path):
        df = pd.read_csv(seed_path)
        if {'text', 'label'}.issubset(df.columns):
            label_map = {'legit': 0, 'scam': 1}
            df = df.dropna(subset=['text', 'label'])
            texts.extend(df['text'].tolist())
            labels.extend([label_map.get(str(x).lower(), 1) for x in df['label']])
            meta['sources'].append({'file': seed_path, 'count': int(len(df))})

    # 2) NEW DATASETS PROVIDED BY USER (all scam examples)
    new_datasets = [
        'easy_dataset.csv',
        'medium_dataset.csv', 
        'hard_dataset.csv',
        'intimate_dataset.csv',
        'hacker_dataset.csv',
        'pro_dataset.csv',
        'god_dataset.csv'
    ]
    
    for ds_path in new_datasets:
        if os.path.exists(ds_path):
            try:
                df = pd.read_csv(ds_path)
                if {'text', 'label'}.issubset(df.columns):
                    df = df.dropna(subset=['text', 'label'])
                    # All these are scam examples
                    rows = df['text'].astype(str).tolist()
                    texts.extend(rows)
                    labels.extend([1] * len(rows))  # All scams
                    meta['sources'].append({'file': ds_path, 'count': int(len(rows))})
                    print(f"✅ Loaded {len(rows)} scam examples from {ds_path}")
            except Exception as e:
                print(f"⚠️ Error loading {ds_path}: {e}")

    # 3) Existing datasets with label,text
    for ds_path in ['upi_sms_dataset_100.csv', 'upi_sms_dataset.csv']:
        if os.path.exists(ds_path):
            df = pd.read_csv(ds_path)
            if {'label', 'text'}.issubset(df.columns):
                df = df.dropna(subset=['text', 'label'])
                label_map = {'legit': 0, 'legitimate': 0, 'safe': 0, 'scam': 1}
                texts.extend(df['text'].astype(str).tolist())
                labels.extend([label_map.get(str(x).lower(), 1) for x in df['label']])
                meta['sources'].append({'file': ds_path, 'count': int(len(df))})

    # 4) Fake scams bulk (label = scam)
    for fake_file in ['upi_fake_scams_500.csv', 'upi_fake_scams_10000.csv']:
        if os.path.exists(fake_file):
            df = pd.read_csv(fake_file)
            if 'text' not in df.columns and df.shape[1] >= 1:
                df = df.rename(columns={df.columns[0]: 'text'})
            df = df.dropna(subset=['text'])
            if not df.empty:
                rows = df['text'].astype(str).tolist()
                texts.extend(rows)
                labels.extend([1] * len(rows))
                meta['sources'].append({'file': fake_file, 'count': int(len(rows))})

    # 5) Scraped/collected dataset JSON (optional)
    collected_json = 'collected_sms_data.json'
    if os.path.exists(collected_json):
        try:
            with open(collected_json, 'r', encoding='utf-8') as f:
                data = json.load(f)
            added = 0
            for item in data:
                t = str(item.get('text', '')).strip()
                if not t:
                    continue
                label_str = str(item.get('label', 'suspicious')).lower()
                lbl = 0 if label_str in ['safe', 'legit', 'legitimate'] else 1
                texts.append(t)
                labels.append(lbl)
                added += 1
            meta['sources'].append({'file': collected_json, 'count': added})
        except Exception:
            pass

    # 6) Scraped/collected dataset CSV (optional)
    collected_csv = 'collected_sms_data.csv'
    if os.path.exists(collected_csv):
        try:
            df = pd.read_csv(collected_csv)
            if 'text' in df.columns:
                df = df.dropna(subset=['text'])
                # Map label if present; default suspicious/scam -> 1
                if 'label' in df.columns:
                    label_map = {'safe': 0, 'legit': 0, 'legitimate': 0, 'scam': 1, 'suspicious': 1}
                    lbls = [label_map.get(str(x).lower(), 1) for x in df['label']]
                else:
                    lbls = [1] * len(df)
                rows = df['text'].astype(str).tolist()
                texts.extend(rows)
                labels.extend(lbls)
                meta['sources'].append({'file': collected_csv, 'count': int(len(rows))})
        except Exception:
            pass

    # Deduplicate
    seen = set()
    dedup_texts = []
    dedup_labels = []
    for t, l in zip(texts, labels):
        key = t.strip()
        if key in seen:
            continue
        seen.add(key)
        dedup_texts.append(key)
        dedup_labels.append(l)

    # Better class balancing - use more legitimate examples
    legitimate_count = sum(1 for l in dedup_labels if l == 0)
    scam_count = sum(1 for l in dedup_labels if l == 1)
    
    # Use all legitimate examples and sample scams to balance
    final_texts = []
    final_labels = []
    
    # Add all legitimate examples
    for t, l in zip(dedup_texts, dedup_labels):
        if l == 0:
            final_texts.append(t)
            final_labels.append(l)
    
    # Sample scams to create better balance (2:1 ratio)
    scam_texts = [t for t, l in zip(dedup_texts, dedup_labels) if l == 1]
    target_scam_count = min(len(scam_texts), legitimate_count * 2)
    
    # Use stratified sampling for scams
    import random
    random.seed(42)
    selected_scams = random.sample(scam_texts, target_scam_count)
    
    for scam_text in selected_scams:
        final_texts.append(scam_text)
        final_labels.append(1)
    
    meta['final_counts'] = {'legitimate': len([l for l in final_labels if l == 0]), 'scam': len([l for l in final_labels if l == 1])}
    return final_texts, final_labels, meta

def train_enhanced_model_v2():
    print("🚀 Starting ENHANCED SMS Scam Detection Model Training V2")
    print("📊 Using ALL NEW DATASETS + existing data with improved balancing")
    print("=" * 70)

    sms_data, labels, metadata = load_all_datasets()
    if len(sms_data) < 10:
        print("❌ Not enough data after loading. Please ensure datasets exist.")
        return

    print(f"📈 Total samples loaded: {len(sms_data)}")
    print(f"📊 Class distribution: Legitimate={sum(1 for l in labels if l == 0)}, Scam={sum(1 for l in labels if l == 1)}")
    
    extractor = EnhancedSMSFeatureExtractorV2()

    # Split BEFORE augmentation to avoid leakage
    X_text_train, X_text_test, y_train, y_test = train_test_split(
        sms_data, labels, test_size=0.2, random_state=42, stratify=labels
    )

    # Augment only training texts
    aug_train_texts: List[str] = []
    aug_train_labels: List[int] = []
    for t, y in zip(X_text_train, y_train):
        aug_train_texts.append(t)
        aug_train_texts.append(basic_augment(t))
        aug_train_labels.extend([y, y])

    print(f"📈 Train texts (augmented): {len(aug_train_texts)} | Test texts: {len(X_text_test)}")

    X_train = np.array([extractor.extract_features(txt) for txt in aug_train_texts])
    X_test = np.array([extractor.extract_features(txt) for txt in X_text_test])
    y_train_np = np.array(aug_train_labels)
    y_test_np = np.array(y_test)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Enhanced model candidates with better parameters
    candidates = {
        'RandomForest': RandomForestClassifier(
            n_estimators=1500, max_depth=40, min_samples_split=2, min_samples_leaf=1,
            max_features='sqrt', random_state=42, n_jobs=-1, class_weight='balanced_subsample'
        ),
        'ExtraTrees': ExtraTreesClassifier(
            n_estimators=1500, max_depth=None, min_samples_split=2, min_samples_leaf=1,
            max_features='sqrt', random_state=42, n_jobs=-1, class_weight='balanced_subsample'
        ),
        'GradientBoosting': GradientBoostingClassifier(
            n_estimators=800, learning_rate=0.03, max_depth=5, subsample=0.9, random_state=42
        ),
        'LogisticRegression': LogisticRegression(
            C=0.1, max_iter=2000, random_state=42, class_weight='balanced'
        ),
        'SVM': SVC(
            C=0.1, kernel='rbf', gamma='scale', random_state=42, class_weight='balanced', probability=True
        )
    }

    print("\n🧪 Cross-validation model selection (StratifiedKFold=5)...")
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    best_name = None
    best_score = -1.0
    best_model = None

    for name, model in candidates.items():
        try:
            scores = cross_val_score(model, X_train_scaled, y_train_np, cv=skf, scoring='roc_auc', n_jobs=-1)
            mean_score = float(np.mean(scores))
            print(f"   {name}: CV ROC-AUC = {mean_score:.4f}")
            if mean_score > best_score:
                best_score = mean_score
                best_name = name
                best_model = model
        except Exception as e:
            print(f"   {name}: Error during CV - {e}")

    print(f"\n🏆 Selected model: {best_name} (CV ROC-AUC={best_score:.4f})")

    # Train best on full training set
    best_model.fit(X_train_scaled, y_train_np)

    # Evaluate
    y_pred = best_model.predict(X_test_scaled)
    y_pred_proba = best_model.predict_proba(X_test_scaled)[:, 1]
    
    acc = accuracy_score(y_test_np, y_pred)
    auc = roc_auc_score(y_test_np, y_pred_proba)
    
    print(f"\n🎯 Test Accuracy: {acc:.4f}")
    print(f"📊 Test ROC-AUC: {auc:.4f}")
    print("\n📋 Detailed Report:")
    print(classification_report(y_test_np, y_pred, target_names=['Legitimate', 'Scam']))
    
    # Confusion Matrix
    cm = confusion_matrix(y_test_np, y_pred)
    print(f"\n📊 Confusion Matrix:")
    print(f"   Predicted:    0    1")
    print(f"Actual 0:    {cm[0,0]:4d} {cm[0,1]:4d}")
    print(f"Actual 1:    {cm[1,0]:4d} {cm[1,1]:4d}")

    # Save artifacts
    print("\n💾 Saving model...")
    with open('sms_scam_model_v2.pkl', 'wb') as f:
        pickle.dump(best_model, f)
    with open('sms_scam_scaler_v2.pkl', 'wb') as f:
        pickle.dump(scaler, f)

    feature_names = [
        'text_length', 'word_count', 'contains_bank', 'contains_gov',
        'contains_scam_keywords', 'urgency_count', 'contains_url',
        'contains_short_url_or_suspicious_domain', 'contains_otp', 'contains_amount',
        'official_sender', 'caps_percentage', 'strong_scam_patterns', 'upi_specific_pattern',
        'time_pressure_tactic', 'emotional_manipulation', 'contains_phone_number',
        'contains_email', 'fake_bank_format', 'suspicious_characters'
    ]
    with open('feature_names_v2.json', 'w') as f:
        json.dump(feature_names, f)

    dataset_info = {
        'total_samples': len(sms_data),
        'legitimate_count': int(sum(1 for l in labels if l == 0)),
        'scam_count': int(sum(1 for l in labels if l == 1)),
        'feature_count': len(feature_names),
        'training_samples': int(len(X_train_scaled)),
        'testing_samples': int(len(X_test_scaled)),
        'cv_model': best_name,
        'cv_roc_auc': float(best_score),
        'test_accuracy': float(acc),
        'test_roc_auc': float(auc),
        'metadata': metadata
    }
    with open('dataset_info_v2.json', 'w') as f:
        json.dump(dataset_info, f, indent=2)

    # Enhanced sanity checks
    print("\n🧪 Enhanced sanity checks...")
    test_samples = [
        "SBI: Your OTP for UPI Rs 500 is 123456. Do not share.",
        "URGENT: Your KYC is expiring today. Verify now at http://upi-verify.in",
        "ICICI Bank: Unusual login detected. Secure now: https://icici-secure-login.com",
        "Hey, it's me. Lost my wallet. Can you UPI ₹2499 to +917503512043? Will return tomorrow.",
        "[ICICI-BANK]: Dear Customer, your UPI account is temporarily suspended. Complete verification within 30 mins: https://phonepe-bonus.claims.example/SBYY3U4q",
        "HDFC: Your credit card payment of ₹15,000 received. Thank you. -HDFCBNK",
        "SBI: Your account statement is ready. Download from mobile app. -SBIBNK"
    ]
    
    for i, s in enumerate(test_samples, 1):
        feats = extractor.extract_features(s)
        prob = best_model.predict_proba(scaler.transform([feats]))[0][1]
        pred = 'Scam' if prob >= 0.5 else 'Legitimate'
        print(f"   {i}. {pred} (p_scam={prob:.3f}) -> {s[:70]}...")

    print(f"\n🎉 ENHANCED V2 Training complete!")
    print(f"📁 Artifacts saved: sms_scam_model_v2.pkl, sms_scam_scaler_v2.pkl, feature_names_v2.json, dataset_info_v2.json")
    print(f"🔍 Model trained on {len(sms_data)} samples with {len(feature_names)} features")
    print(f"📊 Final accuracy: {acc:.4f}, ROC-AUC: {auc:.4f}")

if __name__ == "__main__":
    train_enhanced_model_v2()
