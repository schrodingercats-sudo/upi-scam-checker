from typing import Dict, Any, List
from urllib.parse import urlparse
import re
from .config import WHITELIST_SENDERS, WHITELIST_DOMAINS, SUSPICIOUS_TLDS, SHORTENERS, WEIGHTS

SCAM_KEYWORDS = [
    'urgent', 'refund', 'claim', 'block', 'lottery', 'kyc expired', 'verify immediately',
    'update account', 'share pin', 'share otp', 'provide otp', 'immediate action', 'restricted', 'suspended'
]

HIGH_SEVERITY = [
    # OTP requested with refund/claim
    re.compile(r'\b(otp|one\s*time\s*password)\b.*\b(refund|claim)\b', re.IGNORECASE),
    # Asking for PIN/UPI PIN
    re.compile(r'\b(upi\s*pin|atm\s*pin|pin)\b.*\b(share|send|provide)\b', re.IGNORECASE),
]

MEDIUM_SEVERITY = [
    re.compile(r'\b(verify|update|kyc)\b.*\b(immediately|now|today)\b', re.IGNORECASE),
]

TIME_PRESSURE = re.compile(r'\b(\d+\s*(?:min|mins|minutes|hour|hours|hr|hrs))\b|within\s*\d+\s*(?:min|hour|hrs)', re.IGNORECASE)


def is_whitelisted(sender: str, domains: List[str]) -> bool:
    s = (sender or '').lower().strip()
    # Sender-based whitelist only if we have a true sender token (from DLT pattern), not just brand mention
    if s and s in WHITELIST_SENDERS:
        return True
    for d in domains or []:
        host = d.lower()
        # Exact official domains only. Do not treat lookalikes or hyphenated brand domains as whitelisted.
        if host in WHITELIST_DOMAINS or any(host.endswith('.' + w) for w in WHITELIST_DOMAINS):
            return True
    return False


def link_risk(domains: List[str]) -> (int, List[str]):
    score = 0
    reasons: List[str] = []
    for d in domains:
        host = d.lower()
        tld = host.split('.')[-1]
        if tld in SUSPICIOUS_TLDS:
            score += 10
            reasons.append(f'Suspicious TLD: .{tld}')
        if any(sh in host for sh in SHORTENERS):
            score += 10
            reasons.append('Shortened URL detected')
        # brand-spoof/homograph detection e.g., icici-bank-verify.net
        brand_tokens = ['sbi', 'hdfc', 'icici', 'axis', 'pnb', 'canara', 'kotak']
        if any(bt in host for bt in brand_tokens):
            # If host is not an exact whitelisted bank domain (or subdomain), penalize strongly
            if host not in WHITELIST_DOMAINS and not any(host.endswith('.' + w) for w in WHITELIST_DOMAINS):
                score += 15
                reasons.append('Brand name present on non-official domain')
        # hyphenated or multi-token brand-like domain often used in phishing
        if '-' in host and any(bt in host for bt in brand_tokens):
            score += 10
            reasons.append('Suspicious hyphenated brand-like domain')
    return min(score, WEIGHTS['link_risk']), reasons


def phone_risk(phones: List[str]) -> (int, List[str]):
    # Placeholder heuristics (no external DB access in this environment)
    score = 0
    reasons: List[str] = []
    for p in phones:
        if p.startswith('+') and not p.startswith('+91'):
            score += 10
            reasons.append('Non-Indian country code used')
        if re.match(r'^91[6-9]\d{8}$', p):
            # Possible improperly formatted Indian number
            score += 0
    return min(score, WEIGHTS['phone_risk']), reasons


def rule_check(text: str, domains: List[str]) -> (int, List[str]):
    t = text.lower()
    reasons: List[str] = []
    score = 0

    # IMMEDIATE HARD-CODED BLOCKING - SECONDARY SECURITY LAYER
    immediate_block_patterns = [
        # Your specific problematic message pattern
        'your bank credit' in t and 'inr' in t and ('click' in t or 'link' in t),
        
        # Bank + Amount + Action patterns
        any(bank in t for bank in ['bank', 'sbi', 'hdfc', 'icici', 'axis']) and
        any(amount in t for amount in ['12000', '10000', '5000', '2000', '1000']) and
        any(action in t for action in ['click', 'link', 'verify', 'confirm']),
        
        # Credit/Debit + Amount + Action
        any(financial in t for financial in ['credit', 'debit', 'withdraw', 'deposit']) and
        any(amount in t for amount in ['12000', '10000', '5000', '2000', '1000']) and
        any(action in t for action in ['click', 'link', 'verify', 'confirm']),
        
        # Government + Financial + Action
        any(gov in t for gov in ['government', 'govt', 'official', 'authority', 'ministry']) and
        any(financial in t for financial in ['credit', 'debit', 'refund', 'claim']) and
        any(action in t for action in ['click', 'link', 'verify', 'confirm']),
        
        # OTP + Financial + Action
        any(otp in t for otp in ['otp', 'verification', 'code', 'password']) and
        any(financial in t for financial in ['credit', 'debit', 'refund', 'claim']) and
        any(action in t for action in ['click', 'link', 'verify', 'confirm']),
        
        # Urgency + Financial + Action
        any(urgent in t for urgent in ['urgent', 'immediate', 'quick', 'fast', 'now']) and
        any(financial in t for financial in ['credit', 'debit', 'refund', 'claim']) and
        any(action in t for action in ['click', 'link', 'verify', 'confirm']),
        
        # Multiple exclamation marks + Financial
        text.count('!') >= 2 and any(financial in t for financial in ['credit', 'debit', 'refund', 'claim', 'bank']),
        
        # ALL CAPS + Financial + Action
        len([c for c in text if c.isupper()]) > len(text) * 0.5 and
        any(financial in t for financial in ['credit', 'debit', 'refund', 'claim', 'bank']) and
        any(action in t for action in ['click', 'link', 'verify', 'confirm'])
    ]
    
    # If ANY immediate pattern matches, return maximum score
    if any(immediate_block_patterns):
        reasons.append('IMMEDIATE BLOCK: Hard-coded scam pattern detected')
        reasons.append('Cannot be bypassed by ML manipulation')
        return WEIGHTS['rule_high'] * 2, reasons

    for rx in HIGH_SEVERITY:
        if rx.search(t):
            score += WEIGHTS['rule_high']
            reasons.append('High severity rule match (OTP + refund/PIN request)')
    for rx in MEDIUM_SEVERITY:
        if rx.search(t):
            score += WEIGHTS['rule_medium']
            reasons.append('Urgent verification/update request')

    # time pressure / fear tactics
    if TIME_PRESSURE.search(t):
        score += WEIGHTS['rule_medium']
        reasons.append('Time pressure detected')
    if any(w in t for w in ['restricted', 'suspended', 'permanent block', 'blocked']):
        score += 10
        reasons.append('Fear tactic detected')

    # context mismatch: credit mentioned + link present
    if 'credit' in t and domains:
        score += 10
        reasons.append('Context mismatch: credit with link present')

    # scam keywords fuzzy (simple contains)
    hits = [kw for kw in SCAM_KEYWORDS if kw in t]
    if hits:
        score += 10
        reasons.append(f'Contains keywords: {", ".join(hits[:3])}')

    return score, reasons
