# Engine configuration for whitelists, blacklists, and scoring weights

WHITELIST_SENDERS = {
    # banks
    'sbi', 'state bank of india', 'icici', 'hdfc', 'axis', 'pnb', 'canara', 'bank of baroda',
    'union bank', 'kotak', 'yes bank', 'idfc', 'bob', 'boi', 'deutsche bank',
    # government / authorities
    'rbi', 'reserve bank of india', 'npci', 'uidai', 'digilocker', 'income tax', 'meity', 'cert-in',
    # telecom
    'jio', 'airtel', 'vi', 'vodafone idea', 'bsnl'
}

WHITELIST_DOMAINS = {
    'rbi.org.in', 'npci.org.in', 'sbi.co.in', 'icicibank.com', 'hdfcbank.com', 'axisbank.com',
    'pnb.co.in', 'canarabank.com', 'unionbankofindia.co.in', 'bankofbaroda.in', 'uidai.gov.in',
    'digilocker.gov.in', 'incometax.gov.in', 'paytm.com', 'phonepe.com', 'google.com', 'googlepay.in'
}

SUSPICIOUS_TLDS = {'xyz', 'top', 'click', 'zip', 'cam', 'ru', 'su', 'cn'}
SHORTENERS = {'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'cutt.ly'}

# Scoring weights
WEIGHTS = {
    'rule_high': 50,
    'rule_medium': 25,
    'ml_weight': 40,  # ml_score * 40
    'link_risk': 20,
    'phone_risk': 15,
}

# Logging
LOG_DIR = 'logs'
LOG_FILE = 'logs/detections.jsonl'

# Phone number registry for reputation tracking and complaints
DATA_DIR = 'data'
PHONE_REGISTRY_FILE = 'data/phone_registry.json'
