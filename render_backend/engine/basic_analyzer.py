import re

def analyze_message_basic(text: str):
    lower_text = text.lower()

    security_patterns = {
        'urgency': {'regex': r'kyc|verify|deadline|expiry|block|suspend|immediate|urgent|quick|before|soon', 'weight': 0.3},
        'phishing': {'regex': r'link|otp|pin|password|login|account|bank|upi|payment|click|update', 'weight': 0.25},
        'social_engineering': {'regex': r'free|offer|reward|winner|claim|limited|exclusive', 'weight': 0.2},
        'impersonation': {'regex': r'sbi|hdfc|icici|axis|kotak|pnb|bank|gov|official|rbi|npci', 'weight': 0.3},
        'suspicious_links': {'regex': r'http|www|\.com|\.in|\.co|bit\.ly|tinyurl|\.tk|\.ml', 'weight': 0.25}
    }

    risk_score = 0
    red_flags = []

    for pattern, config in security_patterns.items():
        if re.search(config['regex'], text, re.IGNORECASE):
            risk_score += config['weight']
            red_flags.append(f"{pattern.replace('_', ' ').title()} indicators detected")

    if 'kyc' in lower_text and ('expiry' in lower_text or 'deadline' in lower_text or 'verify' in lower_text):
        risk_score += 0.4
        red_flags.append('KYC expiry scam detected - High-risk pattern')

    if 'deadline' in lower_text or 'urgent' in lower_text or 'immediate' in lower_text or 'soon' in lower_text:
        risk_score += 0.25
        red_flags.append('Urgency pressure detected - Common scam tactic')

    if '₹' in text or 'Rs' in text or 'rupee' in text or 'rs.' in text:
        risk_score += 0.2
        red_flags.append('Financial transaction mentioned')

    if 'otp' in lower_text or 'pin' in lower_text or 'verification code' in lower_text:
        risk_score += 0.3
        red_flags.append('OTP/PIN request detected - Never share these')

    if len(text) > 0:
        caps_ratio = sum(1 for c in text if c.isupper()) / len(text)
        if caps_ratio > 0.3:
            risk_score += 0.15
            red_flags.append('Excessive capitalization detected - Scam indicator')

    if '!!!' in text or '??' in text or '...' in text:
        risk_score += 0.1
        red_flags.append('Suspicious punctuation patterns detected')

    risk_score = min(risk_score, 1.0)

    if risk_score >= 0.8:
        label = 'Scam'
        risk_level = 'Critical'
        confidence = 0.9
    elif risk_score >= 0.6:
        label = 'Scam'
        risk_level = 'High'
        confidence = 0.8
    elif risk_score >= 0.4:
        label = 'Suspicious'
        risk_level = 'Medium'
        confidence = 0.7
    elif risk_score >= 0.2:
        label = 'Suspicious'
        risk_level = 'Low'
        confidence = 0.6
    else:
        label = 'Safe'
        risk_level = 'Low'
        confidence = 0.5

    if risk_score >= 0.8:
        advice = "🚨 CRITICAL RISK: This message contains multiple scam indicators. Do NOT click any links, share personal information, or make payments. This appears to be a fraudulent attempt."
    elif risk_score >= 0.6:
        advice = "⚠️ HIGH RISK: Multiple suspicious indicators detected. Do not click links, share OTP, or make payments. Verify with official sources before proceeding."
    elif risk_score >= 0.4:
        advice = "⚠️ MEDIUM RISK: Several suspicious patterns detected. Exercise caution and verify with official sources before taking any action."
    elif risk_score >= 0.2:
        advice = "⚠️ LOW RISK: Minor suspicious indicators detected. Verify with official sources before proceeding."
    else:
        advice = "✅ Appears safe, but always verify with official sources before taking any action."

    return {
        'label': label,
        'confidence': float(f'{confidence:.2f}'),
        'redFlags': red_flags,
        'advice': advice,
        'riskLevel': risk_level
    }
