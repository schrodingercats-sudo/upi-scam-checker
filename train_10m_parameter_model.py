#!/usr/bin/env python3
"""
🚀 ULTIMATE 10 MILLION PARAMETER SMS SCAM DETECTION MODEL
Advanced Deep Learning with Transformer Architecture + CNNs + LSTMs
Training on 1 Million+ Real Scam Examples
"""

import os
import json
import pickle
import numpy as np
import pandas as pd
import re
import time
from datetime import datetime
from typing import List, Tuple, Dict, Any
import warnings
warnings.filterwarnings('ignore')

# Core ML Libraries
try:
    import tensorflow as tf
    from tensorflow.keras.models import Model, Sequential
    from tensorflow.keras.layers import (
        Dense, LSTM, GRU, Conv1D, MaxPooling1D, GlobalMaxPooling1D, 
        Embedding, Dropout, BatchNormalization, Input, Concatenate,
        MultiHeadAttention, LayerNormalization, GlobalAveragePooling1D,
        Bidirectional, SeparableConv1D, DepthwiseConv1D, Attention
    )
    from tensorflow.keras.optimizers import AdamW, RMSprop
    from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
    from tensorflow.keras.utils import to_categorical
    from tensorflow.keras.preprocessing.text import Tokenizer
    from tensorflow.keras.preprocessing.sequence import pad_sequences
    from sklearn.model_selection import train_test_split, StratifiedKFold
    from sklearn.preprocessing import StandardScaler, LabelEncoder
    from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score
    print("✅ TensorFlow and scikit-learn libraries loaded successfully")
except ImportError as e:
    print(f"❌ Required deep learning libraries not found: {e}")
    print("Please install: pip install tensorflow scikit-learn pandas numpy")
    exit(1)

class Ultimate10MFeatureExtractor:
    """
    Advanced feature extractor for 10M parameter model
    Extracts 100+ features from SMS text for deep learning
    """
    
    def __init__(self):
        print("🔧 Initializing Ultimate 10M Feature Extractor...")
        
        # Comprehensive keyword databases
        self.bank_keywords = [
            'bank', 'sbi', 'icici', 'hdfc', 'axis', 'pnb', 'canara', 'kotak', 'yes bank',
            'idfc', 'bob', 'boi', 'union bank', 'deutsche bank', 'rbl', 'karur vysya',
            'indian bank', 'central bank', 'punjab national', 'bank of baroda',
            'andhra bank', 'allahabad bank', 'corporation bank', 'dena bank',
            'vijaya bank', 'syndicate bank', 'oriental bank', 'uco bank'
        ]
        
        self.payment_apps = [
            'paytm', 'phonepe', 'gpay', 'googlepay', 'bhim', 'freecharge', 'mobikwik',
            'amazon pay', 'whatsapp pay', 'jio money', 'airtel money', 'ola money',
            'paypal', 'razorpay', 'cashfree', 'instamojo', 'ccavenue'
        ]
        
        self.scam_indicators = [
            'urgent', 'immediate', 'suspended', 'blocked', 'expired', 'verification',
            'click', 'click here', 'verify now', 'kyc pending', 'kyc expiring', 'lottery',
            'prize', 'won', 'inheritance', 'free money', 'processing fee', 'refund',
            'penalty', 'fir', 'under verification', 'share otp', 'provide otp',
            'reactivate', 'secure now', 'unusual login', 'suspicious activity',
            'account frozen', 'deactivated', 'last chance', 'final warning',
            'act now', 'limited time', 'expire soon', 'update required'
        ]
        
        self.legitimate_indicators = [
            'transaction successful', 'payment received', 'credited to account',
            'debited from account', 'balance enquiry', 'mini statement',
            'thank you', 'regards', 'customer care', 'toll free',
            'unsubscribe', 'terms and conditions', 'privacy policy'
        ]
        
        self.authority_keywords = [
            'rbi', 'npci', 'upi', 'gov.in', 'nic.in', 'trai', 'dot', 'uidai',
            'income tax', 'lic', 'cybercrime.gov.in', 'passport', 'pan', 'aadhaar',
            'traffic police', 'police', 'court', 'lawyer', 'judge', 'government'
        ]
        
        # Regex patterns for various detection
        self.amount_patterns = [
            r'(₹|rs\.?|inr)\s?\d+[\d,]*(?:\.\d+)?',
            r'\d+[\d,]*(?:\.\d+)?\s*(?:inr|rs\.?|₹)',
            r'credited\s+\d+[\d,]*(?:\.\d+)?',
            r'debited\s+\d+[\d,]*(?:\.\d+)?',
            r'amount\s+\d+[\d,]*(?:\.\d+)?',
            r'balance\s+\d+[\d,]*(?:\.\d+)?'
        ]
        
        self.phone_patterns = [
            r'\+91[\s\-]?\d{10}',
            r'91[\s\-]?\d{10}',
            r'\d{10}',
            r'\d{3}[\s\-]\d{3}[\s\-]\d{4}'
        ]
        
        self.url_patterns = [
            r'https?://[^\s]+',
            r'www\.[^\s]+',
            r'[a-zA-Z0-9][a-zA-Z0-9\-]*\.(?:com|org|net|in|co\.in|gov\.in)',
            r'bit\.ly/[^\s]+',
            r'tinyurl\.com/[^\s]+'
        ]
        
        print("✅ Feature extractor initialized with comprehensive keyword databases")
    
    def extract_advanced_features(self, text: str) -> List[float]:
        """Extract 100+ advanced features for deep learning"""
        
        if not text or len(text.strip()) == 0:
            return [0.0] * 120  # Return zero vector for empty text
        
        text_lower = text.lower()
        text_words = text_lower.split()
        
        features = []
        
        # 1-10: Basic text statistics
        features.extend([
            len(text),  # Character count
            len(text_words),  # Word count
            len(set(text_words)),  # Unique word count
            len([w for w in text_words if len(w) > 6]),  # Long words
            text.count('.'),  # Sentence count
            text.count('!'),  # Exclamation marks
            text.count('?'),  # Question marks
            sum(1 for c in text if c.isupper()) / len(text) if text else 0,  # Caps ratio
            sum(1 for c in text if c.isdigit()) / len(text) if text else 0,  # Digit ratio
            len(re.findall(r'\s+', text)) / len(text) if text else 0  # Space ratio
        ])
        
        # 11-20: Keyword presence (binary)
        features.extend([
            any(bank in text_lower for bank in self.bank_keywords),
            any(app in text_lower for app in self.payment_apps),
            any(scam in text_lower for scam in self.scam_indicators),
            any(legit in text_lower for legit in self.legitimate_indicators),
            any(auth in text_lower for auth in self.authority_keywords),
            'otp' in text_lower,
            'cvv' in text_lower,
            'pin' in text_lower,
            'password' in text_lower,
            'upi' in text_lower
        ])
        
        # 21-30: Keyword counts
        features.extend([
            sum(1 for bank in self.bank_keywords if bank in text_lower),
            sum(1 for app in self.payment_apps if app in text_lower),
            sum(1 for scam in self.scam_indicators if scam in text_lower),
            sum(1 for legit in self.legitimate_indicators if legit in text_lower),
            sum(1 for auth in self.authority_keywords if auth in text_lower),
            text_lower.count('urgent'),
            text_lower.count('click'),
            text_lower.count('verify'),
            text_lower.count('update'),
            text_lower.count('secure')
        ])
        
        # 31-40: Pattern detection
        features.extend([
            len(re.findall(r'|'.join(self.amount_patterns), text_lower)),
            len(re.findall(r'|'.join(self.phone_patterns), text)),
            len(re.findall(r'|'.join(self.url_patterns), text_lower)),
            bool(re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)),  # Email
            bool(re.search(r'\b\d{4}\b', text)),  # 4-digit codes
            bool(re.search(r'\b\d{6}\b', text)),  # 6-digit codes
            bool(re.search(r'\b\d{12}\b', text)),  # 12-digit codes (Aadhaar)
            bool(re.search(r'\b[A-Z]{5}\d{4}[A-Z]\b', text)),  # PAN pattern
            bool(re.search(r'\bIFSC[A-Z0-9]{7}\b', text, re.IGNORECASE)),  # IFSC code
            bool(re.search(r'[A-Z]{2,4}\d{2,4}$', text))  # Sender code pattern
        ])
        
        # 41-50: Linguistic features
        features.extend([
            len([w for w in text_words if w.endswith('ed')]),  # Past tense verbs
            len([w for w in text_words if w.endswith('ing')]),  # Present participles
            len([w for w in text_words if w.startswith('re')]),  # "re-" prefix words
            len([w for w in text_words if 'tion' in w]),  # "-tion" suffix words
            sum(len(w) for w in text_words) / len(text_words) if text_words else 0,  # Avg word length
            max(len(w) for w in text_words) if text_words else 0,  # Max word length
            min(len(w) for w in text_words) if text_words else 0,  # Min word length
            len([w for w in text_words if len(w) == 1]),  # Single char words
            len([w for w in text_words if w.isalpha()]),  # Alphabetic words only
            len([w for w in text_words if w.isdigit()])  # Numeric words only
        ])
        
        # 51-60: Urgency and emotional indicators
        urgency_words = ['urgent', 'immediate', 'now', 'asap', 'quick', 'fast', 'hurry', 'today', 'tomorrow']
        fear_words = ['blocked', 'suspended', 'frozen', 'expired', 'danger', 'risk', 'threat', 'warning']
        positive_words = ['congratulations', 'winner', 'lucky', 'selected', 'chosen', 'prize', 'reward']
        action_words = ['click', 'call', 'visit', 'download', 'install', 'update', 'verify', 'confirm']
        
        features.extend([
            sum(1 for word in urgency_words if word in text_lower),
            sum(1 for word in fear_words if word in text_lower),
            sum(1 for word in positive_words if word in text_lower),
            sum(1 for word in action_words if word in text_lower),
            bool(re.search(r'\b(?:within|before|until)\s+\d+\s+(?:hours?|days?|minutes?)', text_lower)),
            bool(re.search(r'\b(?:expires?|expiring|expired)\b', text_lower)),
            bool(re.search(r'\b(?:last|final)\s+(?:chance|opportunity|warning)', text_lower)),
            bool(re.search(r'\b(?:limited|only)\s+(?:time|offer)', text_lower)),
            bool(re.search(r'\b(?:act|respond|reply)\s+(?:now|immediately)', text_lower)),
            text_lower.count('!!') + text_lower.count('???')  # Multiple punctuation
        ])
        
        # 61-70: Technical and security indicators
        features.extend([
            bool(re.search(r'\b(?:ssl|https|secure|encrypted)\b', text_lower)),
            bool(re.search(r'\b(?:virus|malware|infected|hack)\b', text_lower)),
            bool(re.search(r'\b(?:firewall|antivirus|security)\b', text_lower)),
            bool(re.search(r'\b(?:login|signin|logon)\b', text_lower)),
            bool(re.search(r'\b(?:username|userid|user\s+id)\b', text_lower)),
            bool(re.search(r'\b(?:transaction|transfer|payment)\b', text_lower)),
            bool(re.search(r'\b(?:account|acc|a\/c)\b', text_lower)),
            bool(re.search(r'\b(?:balance|amount|money|cash|fund)\b', text_lower)),
            bool(re.search(r'\b(?:credit|debit|withdraw|deposit)\b', text_lower)),
            bool(re.search(r'\b(?:bank|atm|card|debit\s+card|credit\s+card)\b', text_lower))
        ])
        
        # 71-80: Evasion detection
        features.extend([
            bool(re.search(r'[a-z][A-Z]', text)),  # Mixed case within words
            bool(re.search(r'[0-9][a-zA-Z][0-9]', text)),  # Numbers mixed with letters
            bool(re.search(r'[!@#$%^&*()_+=\[\]{}|\\:";\'<>?,./]', text)),  # Special characters
            len(re.findall(r'[aeiou]', text_lower)) / len(text) if text else 0,  # Vowel ratio
            len(re.findall(r'[bcdfghjklmnpqrstvwxyz]', text_lower)) / len(text) if text else 0,  # Consonant ratio
            bool(re.search(r'(.)\1{2,}', text)),  # Repeated characters (aaa, bbb, etc.)
            len(re.findall(r'\s{2,}', text)),  # Multiple spaces
            bool(re.search(r'[a-zA-Z]{15,}', text)),  # Very long words
            sum(1 for c in text if ord(c) > 127),  # Non-ASCII characters
            len(set(text)) / len(text) if text else 0  # Character diversity
        ])
        
        # 81-90: Domain and URL analysis
        urls = re.findall(r'https?://[^\s]+|www\.[^\s]+', text_lower)
        features.extend([
            len(urls),  # URL count
            any('bit.ly' in url or 'tinyurl' in url or 'goo.gl' in url for url in urls),  # Shorteners
            any('.tk' in url or '.ml' in url or '.ga' in url for url in urls),  # Suspicious TLDs
            any('bank' in url and not any(official in url for official in ['sbi.co.in', 'icicibank.com', 'hdfcbank.com']) for url in urls),  # Fake bank domains
            any(len(url) > 50 for url in urls),  # Long URLs
            any(url.count('-') > 3 for url in urls),  # Many hyphens
            any(url.count('.') > 3 for url in urls),  # Many dots
            any(re.search(r'\d+\.\d+\.\d+\.\d+', url) for url in urls),  # IP addresses
            any('secure' in url or 'verify' in url for url in urls),  # Suspicious keywords in URL
            sum(url.count('%') for url in urls)  # URL encoding
        ])
        
        # 91-100: Advanced linguistic analysis
        features.extend([
            len([w for w in text_words if w in ['the', 'and', 'or', 'but', 'if', 'when', 'where', 'how']]),  # Common words
            len([w for w in text_words if w.capitalize() == w]),  # Capitalized words
            len([w for w in text_words if w.isupper()]),  # All caps words
            len([w for w in text_words if not w.isalpha() and not w.isdigit()]),  # Mixed alphanumeric
            sum(1 for i, c in enumerate(text[:-1]) if c.isalpha() and text[i+1].isdigit()),  # Letter-digit transitions
            sum(1 for i, c in enumerate(text[:-1]) if c.isdigit() and text[i+1].isalpha()),  # Digit-letter transitions
            len(re.findall(r'\b[A-Z]{2,}\b', text)),  # Acronyms
            bool(re.search(r'\b(?:SMS|sms|message|msg|text)\b', text_lower)),  # SMS-related words
            bool(re.search(r'\b(?:free|gratis|complimentary)\b', text_lower)),  # Free offers
            text.count('\n') + text.count('\r')  # Line breaks
        ])
        
        # 101-120: Statistical features
        char_freqs = {}
        for char in text_lower:
            char_freqs[char] = char_freqs.get(char, 0) + 1
        
        features.extend([
            max(char_freqs.values()) if char_freqs else 0,  # Most frequent char count
            len(char_freqs),  # Unique character count
            char_freqs.get('a', 0),  # Frequency of 'a'
            char_freqs.get('e', 0),  # Frequency of 'e'
            char_freqs.get('i', 0),  # Frequency of 'i'
            char_freqs.get('o', 0),  # Frequency of 'o'
            char_freqs.get('u', 0),  # Frequency of 'u'
            char_freqs.get(' ', 0),  # Space frequency
            sum(1 for w in text_words if len(w) >= 3 and w == w[::-1]),  # Palindromes
            len(text.split('.')) - 1,  # Sentence count
            len(text.split(',')) - 1,  # Comma count
            len(text.split(';')) - 1,  # Semicolon count
            len(text.split(':')) - 1,  # Colon count
            bool(re.search(r'\b(?:dear|hi|hello|greetings)\b', text_lower)),  # Greetings
            bool(re.search(r'\b(?:regards|thanks|thank you|sincerely)\b', text_lower)),  # Closings
            bool(re.search(r'\b(?:sir|madam|maam|customer)\b', text_lower)),  # Formal address
            text.count('*'),  # Asterisk count
            text.count('#'),  # Hash count
            text.count('@'),  # At symbol count
            1.0 if text.strip() else 0.0  # Non-empty indicator
        ])
        
        # Ensure exactly 120 features
        while len(features) < 120:
            features.append(0.0)
        
        return features[:120]

class TransformerBlock(tf.keras.layers.Layer):
    """Custom Transformer Block for SMS Analysis"""
    
    def __init__(self, embed_dim, num_heads, ff_dim, rate=0.1):
        super(TransformerBlock, self).__init__()
        self.att = MultiHeadAttention(num_heads=num_heads, key_dim=embed_dim)
        self.ffn = Sequential([
            Dense(ff_dim, activation="relu"),
            Dense(embed_dim),
        ])
        self.layernorm1 = LayerNormalization(epsilon=1e-6)
        self.layernorm2 = LayerNormalization(epsilon=1e-6)
        self.dropout1 = Dropout(rate)
        self.dropout2 = Dropout(rate)

    def call(self, inputs, training=None):
        attn_output = self.att(inputs, inputs)
        attn_output = self.dropout1(attn_output, training=training)
        out1 = self.layernorm1(inputs + attn_output)
        ffn_output = self.ffn(out1)
        ffn_output = self.dropout2(ffn_output, training=training)
        return self.layernorm2(out1 + ffn_output)

class StopAfterBatches(tf.keras.callbacks.Callback):
    """Callback to stop training after a fixed number of batches and save weights."""
    def __init__(self, max_batches: int | None = None, save_path: str | None = None):
        super().__init__()
        self.max_batches = int(max_batches) if max_batches else None
        self.save_path = save_path
        self._seen = 0

    def on_train_batch_end(self, batch, logs=None):
        if self.max_batches is None:
            return
        self._seen += 1
        if self._seen >= self.max_batches:
            if self.save_path:
                # Save weights-only checkpoint for fast resume
                self.model.save_weights(self.save_path)
            self.model.stop_training = True

def create_10m_parameter_model(vocab_size: int = 10000, max_length: int = 100, feature_count: int = 120) -> Model:
    """
    Create a 10 million parameter neural network for SMS scam detection
    
    Architecture:
    - Text Embedding + Transformer Blocks
    - CNN feature extraction 
    - LSTM sequence processing
    - Dense feature integration
    - Multi-head output
    """
    
    print("🏗️ Building 10 Million Parameter Neural Network...")
    
    # Text input branch (for tokenized text)
    text_input = Input(shape=(max_length,), name='text_input')
    
    # Embedding layer (vocab_size * embedding_dim parameters)
    embedding_dim = 256  # 10000 * 256 = 2.56M parameters
    x = Embedding(vocab_size, embedding_dim, input_length=max_length)(text_input)
    x = Dropout(0.2)(x)
    
    # Transformer blocks (Multi-head attention)
    x = TransformerBlock(embed_dim=embedding_dim, num_heads=8, ff_dim=512)(x)
    x = TransformerBlock(embed_dim=embedding_dim, num_heads=8, ff_dim=512)(x)
    
    # CNN branches for different n-gram features
    # Branch 1: 1D CNN for local patterns
    conv1 = Conv1D(128, 3, activation='relu', padding='same')(x)
    conv1 = BatchNormalization()(conv1)
    conv1 = MaxPooling1D(2)(conv1)
    conv1 = Dropout(0.3)(conv1)
    
    conv2 = Conv1D(128, 5, activation='relu', padding='same')(x)
    conv2 = BatchNormalization()(conv2)
    conv2 = MaxPooling1D(2)(conv2)
    conv2 = Dropout(0.3)(conv2)
    
    conv3 = Conv1D(128, 7, activation='relu', padding='same')(x)
    conv3 = BatchNormalization()(conv3)
    conv3 = MaxPooling1D(2)(conv3)
    conv3 = Dropout(0.3)(conv3)
    
    # Merge CNN branches
    conv_merged = Concatenate()([conv1, conv2, conv3])
    
    # Bidirectional LSTM for sequence understanding
    lstm_out = Bidirectional(LSTM(256, return_sequences=True, dropout=0.3, recurrent_dropout=0.3))(conv_merged)
    lstm_out = Bidirectional(LSTM(128, dropout=0.3, recurrent_dropout=0.3))(lstm_out)
    
    # Global pooling for text features
    text_features = GlobalAveragePooling1D()(conv_merged)
    
    # Combine LSTM and pooled features
    text_combined = Concatenate()([lstm_out, text_features])
    
    # Feature input branch (for engineered features)
    feature_input = Input(shape=(feature_count,), name='feature_input')
    
    # Dense processing for engineered features
    feature_dense = Dense(512, activation='relu')(feature_input)
    feature_dense = BatchNormalization()(feature_dense)
    feature_dense = Dropout(0.4)(feature_dense)
    
    feature_dense = Dense(256, activation='relu')(feature_dense)
    feature_dense = BatchNormalization()(feature_dense)
    feature_dense = Dropout(0.4)(feature_dense)
    
    feature_dense = Dense(128, activation='relu')(feature_dense)
    feature_dense = BatchNormalization()(feature_dense)
    feature_dense = Dropout(0.3)(feature_dense)
    
    # Merge text and feature branches
    merged = Concatenate()([text_combined, feature_dense])
    
    # Final dense layers
    x = Dense(1024, activation='relu')(merged)
    x = BatchNormalization()(x)
    x = Dropout(0.5)(x)
    
    x = Dense(512, activation='relu')(x)
    x = BatchNormalization()(x)
    x = Dropout(0.5)(x)
    
    x = Dense(256, activation='relu')(x)
    x = BatchNormalization()(x)
    x = Dropout(0.4)(x)
    
    x = Dense(128, activation='relu')(x)
    x = BatchNormalization()(x)
    x = Dropout(0.3)(x)
    
    # Multiple output heads for ensemble-like behavior
    scam_output = Dense(1, activation='sigmoid', name='scam_prediction')(x)
    confidence_output = Dense(1, activation='sigmoid', name='confidence_prediction')(x)
    risk_level_output = Dense(3, activation='softmax', name='risk_level_prediction')(x)  # Low, Medium, High
    
    # Create the model
    model = Model(
        inputs=[text_input, feature_input], 
        outputs=[scam_output, confidence_output, risk_level_output]
    )
    
    # Count parameters
    total_params = model.count_params()
    print(f"✅ Model created with {total_params:,} parameters")
    
    # Compile with advanced optimizer
    model.compile(
        optimizer=AdamW(learning_rate=0.001, weight_decay=0.01),
        loss={
            'scam_prediction': 'binary_crossentropy',
            'confidence_prediction': 'mse',
            'risk_level_prediction': 'categorical_crossentropy'
        },
        loss_weights={
            'scam_prediction': 1.0,
            'confidence_prediction': 0.5,
            'risk_level_prediction': 0.3
        },
        metrics={
            'scam_prediction': ['accuracy', 'precision', 'recall'],
            'confidence_prediction': ['mae'],
            'risk_level_prediction': ['accuracy']
        }
    )
    
    return model

def load_ultimate_dataset():
    """Load the ultimate 1M+ sample dataset"""
    
    print("📊 Loading Ultimate Dataset for 10M Parameter Training...")
    
    dataset_files = [
        'ultimate_scam_dataset.csv',
        'enhanced_training_data.csv',
        'ml_training_data.csv'
    ]
    
    all_texts = []
    all_labels = []
    
    for file_path in dataset_files:
        if os.path.exists(file_path):
            try:
                df = pd.read_csv(file_path)
                print(f"   📁 Loading {file_path}: {len(df):,} samples")
                
                if 'text' in df.columns and 'label' in df.columns:
                    texts = df['text'].astype(str).tolist()
                    labels = df['label'].astype(int).tolist()
                    
                    # Filter out very short texts
                    filtered_data = [(t, l) for t, l in zip(texts, labels) if len(t.strip()) >= 10]
                    
                    if filtered_data:
                        filtered_texts, filtered_labels = zip(*filtered_data)
                        all_texts.extend(filtered_texts)
                        all_labels.extend(filtered_labels)
                        print(f"      ✅ Added {len(filtered_data):,} valid samples")
                
            except Exception as e:
                print(f"   ⚠️ Error loading {file_path}: {str(e)}")
    
    if not all_texts:
        print("❌ No training data found!")
        return [], [], [], []
    
    print(f"✅ Total dataset: {len(all_texts):,} samples")
    print(f"   Scam messages: {sum(all_labels):,}")
    print(f"   Safe messages: {len(all_labels) - sum(all_labels):,}")
    
    return all_texts, all_labels

def preprocess_for_deep_learning(texts: List[str], labels: List[int], max_vocab: int = 10000, max_length: int = 100):
    """Preprocess text data for deep learning"""
    
    print("🔄 Preprocessing data for deep learning...")
    
    # Tokenize texts
    tokenizer = Tokenizer(num_words=max_vocab, oov_token='<OOV>')
    tokenizer.fit_on_texts(texts)
    
    # Convert to sequences
    sequences = tokenizer.texts_to_sequences(texts)
    X_text = pad_sequences(sequences, maxlen=max_length, padding='post', truncating='post')
    
    print(f"✅ Text preprocessing complete:")
    print(f"   Vocabulary size: {len(tokenizer.word_index):,}")
    print(f"   Sequence length: {max_length}")
    print(f"   Total sequences: {len(X_text):,}")
    
    return X_text, tokenizer

def train_10m_parameter_model():
    """Main training function for 10M parameter model"""
    
    print("🚀 STARTING 10 MILLION PARAMETER MODEL TRAINING")
    print("=" * 80)
    
    start_time = time.time()
    
    # Load dataset
    texts, labels = load_ultimate_dataset()
    if not texts:
        print("❌ No training data available!")
        return
    
    # Initialize feature extractor
    feature_extractor = Ultimate10MFeatureExtractor()
    
    # Extract features
    print("🔧 Extracting advanced features...")
    features = []
    for i, text in enumerate(texts):
        if i % 10000 == 0:
            print(f"   Processing {i:,}/{len(texts):,} samples...")
        features.append(feature_extractor.extract_advanced_features(text))
    
    X_features = np.array(features)
    print(f"✅ Feature extraction complete: {X_features.shape}")
    
    # Preprocess text for deep learning
    X_text, tokenizer = preprocess_for_deep_learning(texts, labels)
    
    # Prepare labels
    y_scam = np.array(labels)
    y_confidence = np.array([1.0 if label == 1 else 0.8 for label in labels])  # High confidence for scams
    
    # Risk levels: 0=Low, 1=Medium, 2=High
    y_risk = []
    for label in labels:
        if label == 1:  # Scam
            y_risk.append([0, 0, 1])  # High risk
        else:  # Safe
            y_risk.append([1, 0, 0])  # Low risk
    y_risk = np.array(y_risk)
    
    # Scale features
    scaler = StandardScaler()
    X_features_scaled = scaler.fit_transform(X_features)
    
    # Split data
    X_text_train, X_text_test, X_feat_train, X_feat_test, y_scam_train, y_scam_test, y_conf_train, y_conf_test, y_risk_train, y_risk_test = train_test_split(
        X_text, X_features_scaled, y_scam, y_confidence, y_risk,
        test_size=0.2, random_state=42, stratify=y_scam
    )
    
    print(f"✅ Data split complete:")
    print(f"   Training samples: {len(X_text_train):,}")
    print(f"   Testing samples: {len(X_text_test):,}")
    
    # Create model
    model = create_10m_parameter_model(
        vocab_size=len(tokenizer.word_index) + 1,
        max_length=X_text.shape[1],
        feature_count=X_features_scaled.shape[1]
    )
    
    # Print model summary
    print("\n🏗️ Model Architecture:")
    model.summary()
    
    # Callbacks
    callbacks = [
        EarlyStopping(monitor='val_scam_prediction_accuracy', patience=5, restore_best_weights=True),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, min_lr=1e-7),
        ModelCheckpoint('scam_detector_10m.h5', save_best_only=True, monitor='val_scam_prediction_accuracy')
    ]

    # Limited-step / resumable training configuration via env vars
    max_steps_env = os.getenv('MAX_TRAIN_STEPS')  # e.g., 1000
    ckpt_path = os.getenv('STEP_CHECKPOINT', 'ckpt_10m.weights.h5')
    resume_from = os.getenv('RESUME_WEIGHTS')  # path to weights file to resume from

    if resume_from and os.path.exists(resume_from):
        try:
            print(f"🔁 Resuming weights from: {resume_from}")
            model.load_weights(resume_from)
        except Exception as e:
            print(f"⚠️ Failed to load resume weights: {e}")

    if max_steps_env:
        print(f"⏱️ Limiting training to {max_steps_env} batches this run. Checkpoint: {ckpt_path}")
        callbacks.append(StopAfterBatches(max_batches=int(max_steps_env), save_path=ckpt_path))

    # Train the model
    print("🚀 Starting training...")
    history = model.fit(
        [X_text_train, X_feat_train],
        [y_scam_train, y_conf_train, y_risk_train],
        batch_size=64,
        epochs=50,
        validation_data=([X_text_test, X_feat_test], [y_scam_test, y_conf_test, y_risk_test]),
        callbacks=callbacks,
        verbose=1
    )
    
    # Evaluate model
    print("📊 Evaluating model...")
    test_results = model.evaluate([X_text_test, X_feat_test], [y_scam_test, y_conf_test, y_risk_test], verbose=0)
    
    # Predictions
    predictions = model.predict([X_text_test, X_feat_test])
    scam_predictions = (predictions[0] > 0.5).astype(int)
    
    # Calculate metrics
    accuracy = accuracy_score(y_scam_test, scam_predictions)
    auc = roc_auc_score(y_scam_test, predictions[0])
    
    print(f"\n🎯 Final Results:")
    print(f"   Accuracy: {accuracy:.4f}")
    print(f"   AUC Score: {auc:.4f}")
    print(f"   Training time: {time.time() - start_time:.2f} seconds")
    
    # Save artifacts
    print("💾 Saving model artifacts...")
    model.save('ultimate_scam_detector_10m.h5')
    
    with open('tokenizer_10m.pkl', 'wb') as f:
        pickle.dump(tokenizer, f)
    
    with open('feature_scaler_10m.pkl', 'wb') as f:
        pickle.dump(scaler, f)
    
    with open('feature_extractor_10m.pkl', 'wb') as f:
        pickle.dump(feature_extractor, f)
    
    # Save training info
    training_info = {
        'model_parameters': model.count_params(),
        'training_samples': len(X_text_train),
        'test_accuracy': float(accuracy),
        'auc_score': float(auc),
        'vocab_size': len(tokenizer.word_index),
        'feature_count': X_features_scaled.shape[1],
        'training_time': time.time() - start_time,
        'timestamp': datetime.now().isoformat()
    }
    
    with open('training_info_10m.json', 'w') as f:
        json.dump(training_info, f, indent=2)
    
    print("✅ 10 Million Parameter Model Training Complete!")
    print(f"📁 Saved: ultimate_scam_detector_10m.h5, tokenizer_10m.pkl, feature_scaler_10m.pkl")
    print(f"🎯 Final Accuracy: {accuracy:.4f}")

if __name__ == "__main__":
    # Set GPU memory growth
    try:
        gpus = tf.config.experimental.list_physical_devices('GPU')
        if gpus:
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
            print(f"✅ GPU acceleration enabled: {len(gpus)} GPU(s) found")
        else:
            print("⚠️ No GPU found, using CPU")
    except:
        print("⚠️ GPU setup failed, using CPU")
    
    train_10m_parameter_model()
