#!/usr/bin/env python3
"""
Test script to analyze the problematic scam message
"""

from simple_ultimate_trainer import SimpleUltimateFeatureExtractor

def test_problematic_message():
    """Test the problematic scam message with feature extraction"""
    
    # The problematic message that's being manipulated
    problematic_message = "Your bank credit 12000 INR click on this link"
    
    print("🔍 Testing Problematic Message:")
    print(f"Message: '{problematic_message}'")
    print("-" * 60)
    
    # Initialize feature extractor
    extractor = SimpleUltimateFeatureExtractor()
    
    # Extract features
    features = extractor.extract_advanced_features(problematic_message)
    
    # Feature names based on the extractor
    feature_names = [
        'text_length', 'word_count', 'contains_bank', 'contains_gov', 'contains_scam_keywords',
        'urgency_count', 'contains_url', 'suspicious_domains', 'contains_otp', 'contains_amount',
        'official_sender', 'caps_percentage', 'lottery_prize', 'processing_fee', 'account_blocked',
        'kyc_issues', 'security_alert', 'action_required', 'suspicious_actions', 'refund_claim',
        'character_substitution', 'url_obfuscation', 'domain_spoofing', 'unusual_spacing',
        'random_punctuation', 'suspicion_score', 'urgency_patterns', 'fear_tactics',
        'authority_impersonation', 'financial_manipulation'
    ]
    
    print("📊 Feature Analysis:")
    print("-" * 60)
    
    # Key scam indicators
    key_indicators = [
        'contains_bank', 'contains_scam_keywords', 'contains_url', 'suspicious_domains',
        'contains_amount', 'suspicious_actions', 'suspicion_score'
    ]
    
    for i, (name, value) in enumerate(zip(feature_names, features)):
        if name in key_indicators:
            print(f"🔴 {name}: {value}")
        else:
            print(f"   {name}: {value}")
    
    print("-" * 60)
    
    # Calculate risk score manually
    risk_score = 0
    
    # High risk indicators
    if features[2]:  # contains_bank
        risk_score += 25
        print("⚠️  Contains bank keywords: +25 points")
    
    if features[4]:  # contains_scam_keywords
        risk_score += 30
        print("⚠️  Contains scam keywords: +30 points")
    
    if features[6]:  # contains_url
        risk_score += 20
        print("⚠️  Contains URL/click patterns: +20 points")
    
    if features[7]:  # suspicious_domains
        risk_score += 25
        print("⚠️  Suspicious domain patterns: +25 points")
    
    if features[9]:  # contains_amount
        risk_score += 15
        print("⚠️  Contains amount: +15 points")
    
    if features[18]:  # suspicious_actions
        risk_score += 20
        print("⚠️  Suspicious actions: +20 points")
    
    print("-" * 60)
    print(f"🎯 Calculated Risk Score: {risk_score}/100")
    
    if risk_score >= 80:
        print("🚨 HIGH RISK - This is likely a scam!")
    elif risk_score >= 60:
        print("⚠️  MEDIUM-HIGH RISK - Exercise extreme caution!")
    elif risk_score >= 40:
        print("⚠️  MEDIUM RISK - Be cautious!")
    else:
        print("✅ LOW RISK - Appears safe")
    
    print("-" * 60)
    
    # Test specific patterns
    print("\n🔍 Pattern Analysis:")
    text_lower = problematic_message.lower()
    
    print(f"Contains 'bank': {'bank' in text_lower}")
    print(f"Contains 'credit': {'credit' in text_lower}")
    print(f"Contains 'click': {'click' in text_lower}")
    print(f"Contains 'link': {'link' in text_lower}")
    print(f"Contains amount pattern: {extractor._detect_amount(text_lower)}")
    print(f"Contains suspicious domains: {extractor._detect_suspicious_domains(text_lower)}")
    
    # Test the specific problematic pattern
    if 'click on this link' in text_lower:
        print("🚨 DETECTED: 'click on this link' pattern - HIGH RISK!")
    elif 'click' in text_lower and 'link' in text_lower:
        print("⚠️  DETECTED: 'click' + 'link' combination - MEDIUM-HIGH RISK!")

if __name__ == "__main__":
    test_problematic_message()
