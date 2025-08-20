#!/usr/bin/env python3
"""
🤖 SMS Scam Detection ML Model Trainer
High-parameter model trained on combined REAL and SYNTHETIC datasets with CV model selection
"""

import json
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import re
import os
from typing import List, Tuple, Dict
from utils.preprocess import normalize_text, basic_augment

class SMSFeatureExtractor:
    """Extract 12 engineered features (kept stable for API compatibility)."""
    
    def __init__(self):
        # Expanded bank names (common in India)
        self.bank_keywords = [
            'sbi', 'icici', 'hdfc', 'axis', 'pnb', 'canara', 'deutsche bank',
            'union bank', 'bank of baroda', 'kotak', 'yes bank', 'idfc', 'bob', 'boi', 'axis bank'
        ]
        # Government/authority entities
        self.gov_keywords = [
            'rbi', 'npci', 'upi', 'gov.in', 'nic.in', 'trai', 'dot', 'uidai',
            'income tax', 'lic', 'cybercrime.gov.in', 'passport', 'pan'
        ]
        # Scam indicators expanded
        self.scam_keywords = [
            'urgent', 'immediate', 'suspended', 'blocked', 'expired', 'verification',
            'click here', 'verify now', 'kyc pending', 'kyc expiring', 'lottery', 'prize',
            'won', 'inheritance', 'free money', 'processing fee', 'refund', 'penalty', 'fir',
            'under verification', 'share otp', 'provide otp'
        ]
        # Domains often seen in scams
        self.suspicious_domain_fragments = [
            'verify', 'secure', 'update', 'helpdesk', 'support', 'login', 'account', 'reactivate', 'kyc'
        ]
        self.shorteners = ['bit.ly', 'tinyurl', 'goo.gl', 't.co']
    
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
        ]
        # Fold normalization metrics into existing features without changing dimension
        features[4] = float(features[4]) or (metrics['zero_width_count'] > 0 or metrics['non_ascii_ratio'] > 0.1)
        # cast bools to floats
        features = [float(f) if isinstance(f, bool) else f for f in features]
        return features

# ------------------------- DATA LOADING ---------------------------------

def _read_csv_safe(path: str) -> pd.DataFrame:
    try:
        return pd.read_csv(path)
    except Exception:
        try:
            return pd.read_csv(path, header=None, names=['text'])
        except Exception:
            return pd.DataFrame(columns=['text'])

def load_all_datasets() -> Tuple[List[str], List[int], Dict]:
    texts: List[str] = []
    labels: List[int] = []
    meta: Dict = {'sources': []}

    # 1) Seed dataset (rich schema)
    seed_path = 'upi_sms_whatsapp_dataset_seed.csv'
    if os.path.exists(seed_path):
        df = pd.read_csv(seed_path)
        if {'text', 'label'}.issubset(df.columns):
            label_map = {'legit': 0, 'scam': 1}
            df = df.dropna(subset=['text', 'label'])
            texts.extend(df['text'].tolist())
            labels.extend([label_map.get(str(x).lower(), 1) for x in df['label']])
            meta['sources'].append({'file': seed_path, 'count': int(len(df))})

    # 2) Datasets with label,text
    for ds_path in ['upi_sms_dataset_100.csv', 'upi_sms_dataset.csv']:
        if os.path.exists(ds_path):
            df = _read_csv_safe(ds_path)
            if {'label', 'text'}.issubset(df.columns):
                df = df.dropna(subset=['text', 'label'])
                label_map = {'legit': 0, 'legitimate': 0, 'safe': 0, 'scam': 1}
                texts.extend(df['text'].astype(str).tolist())
                labels.extend([label_map.get(str(x).lower(), 1) for x in df['label']])
                meta['sources'].append({'file': ds_path, 'count': int(len(df))})

    # 3) Fake scams bulk (label = scam)
    for fake_file in ['upi_fake_scams_500.csv', 'upi_fake_scams_10000.csv']:
        if os.path.exists(fake_file):
            df = _read_csv_safe(fake_file)
            if 'text' not in df.columns and df.shape[1] >= 1:
                df = df.rename(columns={df.columns[0]: 'text'})
            df = df.dropna(subset=['text'])
            if not df.empty:
                rows = df['text'].astype(str).tolist()
                texts.extend(rows)
                labels.extend([1] * len(rows))
                meta['sources'].append({'file': fake_file, 'count': int(len(rows))})

    # 4) Scraped/collected dataset JSON (optional)
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

    # 5) Scraped/collected dataset CSV (optional)
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

    # Balance classes (cap majority to 1.5x of minority)
    minority = min(sum(1 for x in dedup_labels if x == 0), sum(1 for x in dedup_labels if x == 1))
    max_per_class = int(minority * 1.5) if minority > 0 else len(dedup_labels)
    final_texts = []
    final_labels = []
    count0 = count1 = 0
    for t, l in zip(dedup_texts, dedup_labels):
        if l == 0 and count0 < max_per_class:
            final_texts.append(t)
            final_labels.append(l)
            count0 += 1
        elif l == 1 and count1 < max_per_class:
            final_texts.append(t)
            final_labels.append(l)
            count1 += 1
        if count0 >= max_per_class and count1 >= max_per_class:
            break

    meta['final_counts'] = {'legitimate': count0, 'scam': count1}
    return final_texts, final_labels, meta

# ------------------------- TRAINING ---------------------------------

def train_model():
    print("🚀 Starting SMS Scam Detection Model Training (MULTI-DATASET + CV)")
    print("=" * 60)

    sms_data, labels, metadata = load_all_datasets()
    if len(sms_data) < 10:
        print("❌ Not enough data after loading. Please ensure datasets exist.")
        return

    extractor = SMSFeatureExtractor()

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

    # Model candidates
    candidates = {
        'RandomForest': RandomForestClassifier(
            n_estimators=700, max_depth=30, min_samples_split=3, min_samples_leaf=1,
            max_features='sqrt', random_state=42, n_jobs=-1, class_weight='balanced'
        ),
        'ExtraTrees': ExtraTreesClassifier(
            n_estimators=900, max_depth=None, min_samples_split=2, min_samples_leaf=1,
            max_features='sqrt', random_state=42, n_jobs=-1, class_weight='balanced'
        ),
        'GradientBoosting': GradientBoostingClassifier(
            n_estimators=350, learning_rate=0.08, max_depth=3, subsample=0.9, random_state=42
        ),
    }

    print("\n🧪 Cross-validation model selection (StratifiedKFold=5)...")
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    best_name = None
    best_score = -1.0
    best_model = None

    for name, model in candidates.items():
        # Trees don't need scaling, but we keep scaled for consistency
        scores = cross_val_score(model, X_train_scaled, y_train_np, cv=skf, scoring='accuracy', n_jobs=-1)
        mean_score = float(np.mean(scores))
        print(f"   {name}: CV accuracy = {mean_score:.4f}")
        if mean_score > best_score:
            best_score = mean_score
            best_name = name
            best_model = model

    print(f"\n🏆 Selected model: {best_name} (CV={best_score:.4f})")

    # Train best on full training set
    best_model.fit(X_train_scaled, y_train_np)

    # Evaluate
    y_pred = best_model.predict(X_test_scaled)
    acc = accuracy_score(y_test_np, y_pred)
    print(f"\n🎯 Test Accuracy: {acc:.4f}")
    print("\n📋 Detailed Report:")
    print(classification_report(y_test_np, y_pred, target_names=['Legitimate', 'Scam']))

    # Save artifacts
    print("💾 Saving model...")
    with open('sms_scam_model.pkl', 'wb') as f:
        pickle.dump(best_model, f)
    with open('sms_scam_scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)

    feature_names = [
        'text_length', 'word_count', 'contains_bank', 'contains_gov',
        'contains_scam_keywords', 'urgency_count', 'contains_url',
        'contains_short_url_or_suspicious_domain', 'contains_otp', 'contains_amount',
        'official_sender', 'caps_percentage'
    ]
    with open('feature_names.json', 'w') as f:
        json.dump(feature_names, f)

    dataset_info = {
        'total_samples': len(sms_data),
        'legitimate_count': int(sum(1 for l in labels if l == 0)),
        'scam_count': int(sum(1 for l in labels if l == 1)),
        'feature_count': len(feature_names),
        'training_samples': int(len(X_train_scaled)),
        'testing_samples': int(len(X_test_scaled)),
        'cv_model': best_name,
        'cv_accuracy': float(best_score),
        'test_accuracy': float(acc),
        'metadata': metadata
    }
    with open('dataset_info.json', 'w') as f:
        json.dump(dataset_info, f, indent=2)

    # Sanity checks
    print("\n🧪 Quick sanity checks...")
    samples = [
        "SBI: Your OTP for UPI Rs 500 is 123456. Do not share.",
        "URGENT: Your KYC is expiring today. Verify now at http://upi-verify.in",
        "ICICI Bank: Unusual login detected. Secure now: https://icici-secure-login.com"
    ]
    for i, s in enumerate(samples, 1):
        feats = extractor.extract_features(s)
        prob = best_model.predict_proba(scaler.transform([feats]))[0][1]
        pred = 'Scam' if prob >= 0.5 else 'Legitimate'
        print(f"   {i}. {pred} (p_scam={prob:.3f}) -> {s[:70]}...")

    print("\n🎉 Training complete. Artifacts: sms_scam_model.pkl, sms_scam_scaler.pkl, feature_names.json, dataset_info.json")

if __name__ == "__main__":
    train_model()
