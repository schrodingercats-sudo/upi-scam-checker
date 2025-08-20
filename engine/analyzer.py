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


def _load_ml():
    global _MODEL, _SCALER, _FEATURES
    if _MODEL is None:
        with open('sms_scam_model.pkl', 'rb') as f:
            _MODEL = pickle.load(f)
    if _SCALER is None:
        with open('sms_scam_scaler.pkl', 'rb') as f:
            _SCALER = pickle.load(f)
    if _FEATURES is None:
        with open('feature_names.json', 'r') as f:
            _FEATURES = json.load(f)


def _ml_score(text: str) -> float:
    from train_ml_model import SMSFeatureExtractor
    _load_ml()
    extractor = SMSFeatureExtractor()
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
    # Normalize input and aggregate
    body = text or ''
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

    if risk <= 20 and not reasons and not lreasons and not preasons:
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
