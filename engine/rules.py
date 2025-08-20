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
    if s and s in WHITELIST_SENDERS:
        return True
    for d in domains or []:
        host = d.lower()
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
        # homograph/brand misuse heuristic
        if '-' in host and any(b in host for b in ['sbi', 'hdfc', 'icici', 'axis', 'pnb']):
            score += 10
            reasons.append('Potential homograph/brand misuse in domain')
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
