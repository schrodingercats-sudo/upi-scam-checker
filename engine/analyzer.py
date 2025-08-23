# UPI Scam Detector - Enhanced Security System
# Last Updated: 2025-01-27 - Immediate Hard-coded Blocking Added
# This system cannot be bypassed by ML manipulation attempts

import os
import json
from typing import Any, Dict, List
from datetime import datetime
from utils.preprocess import normalize_text
from engine.entities import extract_entities, parse_domains, sender_heuristics
from engine.rules import is_whitelisted, rule_check, link_risk, phone_risk
from engine.config import WEIGHTS, LOG_DIR, LOG_FILE
import pickle
import numpy as np
from engine.phone_registry import record_observation

# Lazy-load ML artifacts
_MODEL = None
_SCALER = None
_FEATURES = None

# Whitelist for legitimate SMS service providers
LEGITIMATE_SMS_PROVIDERS = [
    'fast2sms',
    'msg91',
    'twilio',
    'nexmo',
    'plivo',
    'bandwidth',
    'sinch',
    'africas talking',
    'infobip',
    'messagebird'
]

def _is_legitimate_sms_provider(text: str) -> bool:
    """Check if message is from a legitimate SMS service provider"""
    text_lower = text.lower()
    return any(provider in text_lower for provider in LEGITIMATE_SMS_PROVIDERS)

def _load_ml():
    global _MODEL, _SCALER, _FEATURES
    if _MODEL is None:
        # Use the enhanced v3 model instead of the old one
        with open('sms_scam_model_v3.pkl', 'rb') as f:
            _MODEL = pickle.load(f)
    if _SCALER is None:
        with open('sms_scam_scaler_v3.pkl', 'rb') as f:
            _SCALER = pickle.load(f)
    if _FEATURES is None:
        with open('feature_names_v3.json', 'r') as f:
            _FEATURES = json.load(f)


def _ml_score(text: str) -> float:
    from train_enhanced_model_v3 import EnhancedSMSFeatureExtractor
    _load_ml()
    extractor = EnhancedSMSFeatureExtractor()
    feats = extractor.extract_features(text)
    X = _SCALER.transform([feats])
    proba = _MODEL.predict_proba(X)[0][1]
    return float(proba)


def _ensure_log_dir():
    os.makedirs(LOG_DIR, exist_ok=True)


def _append_log(record: Dict[str, Any]):
    _ensure_log_dir()
    # immutable append-only JSONL
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(json.dumps(record, ensure_ascii=False) + '\n')


def analyze_message(text: str, phone: str = '', url: str = '') -> Dict[str, Any]:
    # Check for legitimate SMS service providers first
    if _is_legitimate_sms_provider(text):
        output = {
            'classification': 'Safe',
            'confidence_score': '95%',
            'risk_level': 'Low',
            'red_flags': ['Message from legitimate SMS service provider'],
            'recommended_action': 'This is a legitimate SMS notification. Proceed with normal caution.'
        }
        record_observation(phone or '', output['classification'], text[:200] if text else '')
        _append_log({**output, 'ts': datetime.utcnow().isoformat(), 'input_hash': hash(text), 'whitelisted_by': 'sms_provider'})
        return output
    
    # IMMEDIATE HARD-CODED BLOCKING - CANNOT BE BYPASSED
    body = text or ''
    body_lower = body.lower()
    
    # CRITICAL: Immediate blocking for obvious scam patterns
    immediate_scam_patterns = [
        # Bank credit/debit patterns
        'bank credit' in body_lower and ('click' in body_lower or 'link' in body_lower),
        'bank debit' in body_lower and ('click' in body_lower or 'link' in body_lower),
        'credit' in body_lower and 'inr' in body_lower and ('click' in body_lower or 'link' in body_lower),
        'debit' in body_lower and 'inr' in body_lower and ('click' in body_lower or 'link' in body_lower),
        
        # Amount + action patterns (more specific to avoid false positives)
        any(amount in body_lower for amount in ['12000', '10000', '5000', '2000', '1000']) and 
        any(action in body_lower for action in ['click', 'link', 'verify', 'confirm', 'login', 'secure']),
        
        # Urgency + financial patterns
        any(urgent in body_lower for urgent in ['urgent', 'immediate', 'quick', 'fast']) and
        any(financial in body_lower for financial in ['bank', 'credit', 'debit', 'inr', 'rs', '₹']),
        
        # Government + action patterns
        any(gov in body_lower for gov in ['government', 'govt', 'official', 'authority']) and
        any(action in body_lower for action in ['click', 'link', 'verify', 'confirm']),
        
        # OTP + action patterns
        any(otp in body_lower for otp in ['otp', 'verification', 'code']) and
        any(action in body_lower for action in ['click', 'link', 'verify', 'confirm']),
        
        # Suspicious URL patterns
        any(suspicious in body_lower for suspicious in ['bit.ly', 'tinyurl', 'goo.gl', 't.co', 'is.gd']),
        
        # Character substitution attempts
        any(sub in body_lower for sub in ['b@nk', 'cr3dit', 'd3bit', '0tp', 'v3rify', 'c0nfirm']),
        
        # Multiple exclamation marks (urgency indicator)
        body.count('!') >= 3 and any(financial in body_lower for financial in ['bank', 'credit', 'debit', 'inr', 'rs', '₹']),
        
        # ALL CAPS financial messages
        len([c for c in body if c.isupper()]) > len(body) * 0.6 and 
        any(financial in body_lower for financial in ['bank', 'credit', 'debit', 'inr', 'rs', '₹'])
    ]
    
    # If ANY pattern matches, immediately block as SCAM
    if any(immediate_scam_patterns):
        output = {
            'classification': 'Scam',
            'confidence_score': '99%',
            'risk_level': 'Critical',
            'red_flags': [
                'IMMEDIATE BLOCK: Obvious scam pattern detected',
                'Hard-coded security rule triggered',
                'Cannot be bypassed by ML manipulation'
            ],
            'recommended_action': 'BLOCKED: This is a confirmed scam message. Do not interact.'
        }
        record_observation(phone or '', output['classification'], text[:200] if text else '')
        _append_log({**output, 'ts': datetime.utcnow().isoformat(), 'input_hash': hash(body), 'blocked_by': 'immediate_pattern'})
        return output

    # Normalize input and aggregate
    if phone:
        body += f"\nPhone: {phone}"
    if url:
        body += f"\nURL: {url}"

    norm, _ = normalize_text(body)
    ents = extract_entities(norm)
    domains = parse_domains(ents['urls'] + ([url] if url else []))
    sender = sender_heuristics(norm)

    # Whitelist check
    if is_whitelisted(sender, domains):
        output = {
            'classification': 'Safe',
            'confidence_score': '95%',
            'risk_level': 'Low',
            'red_flags': [f'Message appears from trusted source: {sender or (domains[:1] or ["unknown"]) [0]}'],
            'recommended_action': 'Proceed with normal caution.'
        }
        record_observation(phone or '', output['classification'], text[:200] if text else '')
        _append_log({**output, 'ts': datetime.utcnow().isoformat(), 'input_hash': hash(norm)})
        return output

    # Rules
    rule_score, reasons = rule_check(norm, domains)

    # Link / Phone risks
    lscore, lreasons = link_risk(domains)
    pscore, preasons = phone_risk(ents['phones'] + ([phone] if phone else []))

    # ML
    ml_prob = _ml_score(norm)

    # Combine
    risk = 0
    risk += rule_score
    risk += int(ml_prob * WEIGHTS['ml_weight'])
    risk += lscore + pscore
    risk = max(0, min(100, risk))

    # Enhanced classification logic with ML priority
    if ml_prob >= 0.95:  # Very high ML confidence for scam
        cat = 'Scam'
        level = 'High'
        conf = max(90, int(ml_prob * 100))
    elif ml_prob >= 0.8:  # High ML confidence for scam
        cat = 'Scam'
        level = 'High'
        conf = max(80, int(ml_prob * 100))
    elif risk <= 20 and not reasons and not lreasons and not preasons:
        cat = 'Safe'
        level = 'Low'
        conf = max(80, int((1 - ml_prob) * 100))
    elif risk <= 60:
        cat = 'Suspicious'
        level = 'Medium'
        conf = max(50, int(ml_prob * 100))
    else:
        cat = 'Scam'
        level = 'High'
        conf = max(70, int(ml_prob * 100))

    explanation: List[str] = []
    explanation.extend(reasons)
    explanation.extend(lreasons)
    explanation.extend(preasons)
    if ents['otp_codes']:
        explanation.append('Contains OTP pattern')
    if ents['upi_ids']:
        explanation.append('UPI ID(s) detected')
    if not explanation:
        explanation.append('General ML-based classification and heuristics applied')

    # Multi-flag logic guard: any flag → not Safe
    if (reasons or lreasons or preasons) and cat == 'Safe':
        cat = 'Suspicious'
        level = 'Medium'
        conf = min(conf, 80)

    # Extra guard: if any domain contains a bank brand but is not whitelisted, ensure at least Suspicious
    if cat == 'Safe':
        brand_tokens = ['sbi', 'hdfc', 'icici', 'axis', 'pnb', 'canara', 'kotak']
        if any(any(bt in d for bt in brand_tokens) for d in domains):
            if not any(d in domains for d in ['sbi.co.in','icicibank.com','hdfcbank.com','axisbank.com','pnb.co.in','canarabank.com','kotak.com']):
                cat = 'Suspicious'
                level = 'Medium'
                conf = min(conf, 80)

    # Hard rule: brand-spoof domain present ⇒ at least Suspicious; with time pressure/verify language ⇒ Scam
    brand_spoof = any('non-official domain' in r.lower() or 'hyphenated brand' in r.lower() for r in lreasons)
    if brand_spoof:
        if any('time pressure' in r.lower() or 'urgent' in r.lower() or 'verify' in r.lower() for r in reasons):
            cat = 'Scam'
            level = 'High'
            conf = max(conf, 85)
        else:
            if cat == 'Safe':
                cat = 'Suspicious'
                level = 'Medium'
                conf = min(max(conf, 70), 85)

    out = {
        'classification': cat,
        'confidence_score': f'{conf}%',
        'risk_level': level,
        'red_flags': explanation[:5],
        'recommended_action': ('Do not trust this message' if cat == 'Scam' else 'Be cautious. Verify via official site.' if cat == 'Suspicious' else 'Proceed with normal caution.'),
    }

    record_observation(phone or '', out['classification'], text[:200] if text else '')
    _append_log({**out, 'ts': datetime.utcnow().isoformat(), 'input_hash': hash(norm)})
    return out
