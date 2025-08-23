import json
import re
import os
import google.generativeai as genai
from typing import Dict, Any, List, Tuple

# Configure Gemini API
GOOGLE_GEMINI_API_KEY = os.getenv('GOOGLE_GEMINI_API_KEY')
if GOOGLE_GEMINI_API_KEY:
    genai.configure(api_key=GOOGLE_GEMINI_API_KEY)

class SimpleUPIAnalyzer:
    def __init__(self):
        self.legitimate_providers = [
            'fast2sms', 'fast2sms wallet', 'team fast2sms',
            'paytm', 'paytm wallet', 'team paytm',
            'phonepe', 'phonepe wallet', 'team phonepe',
            'google pay', 'gpay', 'team google pay',
            'amazon pay', 'amazonpay', 'team amazon pay',
            'mobikwik', 'mobikwik wallet', 'team mobikwik',
            'freecharge', 'freecharge wallet', 'team freecharge',
            'ola money', 'ola wallet', 'team ola',
            'uber', 'uber wallet', 'team uber',
            'swiggy', 'swiggy money', 'team swiggy',
            'zomato', 'zomato wallet', 'team zomato',
            'razorpay', 'team razorpay',
            'stripe', 'team stripe',
            'paypal', 'team paypal',
            'bank of india', 'sbi', 'hdfc', 'icici', 'axis', 'kotak', 'yes bank',
            'team bank of india', 'team sbi', 'team hdfc', 'team icici', 'team axis', 'team kotak', 'team yes bank'
        ]
        
        # SMS Sender ID Categories (DND Classification)
        self.sms_categories = {
            's': {
                'name': 'Service',
                'description': 'Legitimate service messages (banks, companies)',
                'risk_level': 'Low',
                'trust_score': 0.9
            },
            'g': {
                'name': 'Government',
                'description': 'Official government messages',
                'risk_level': 'Low',
                'trust_score': 0.95
            },
            'p': {
                'name': 'Promotional',
                'description': 'Marketing and promotional messages',
                'risk_level': 'Medium',
                'trust_score': 0.3
            },
            't': {
                'name': 'Transactional/OTP',
                'description': 'One-time passwords and transaction messages',
                'risk_level': 'Low',
                'trust_score': 0.8
            }
        }
        
        # Load your current ML model files
        try:
            with open('sms_scam_model_v3.pkl', 'rb') as f:
                import pickle
                self.ml_model = pickle.load(f)
            
            with open('sms_scam_scaler_v3.pkl', 'rb') as f:
                self.scaler = pickle.load(f)
                
            with open('feature_names_v3.json', 'r') as f:
                self.feature_names = json.load(f)
        except:
            print("Warning: ML model files not found, using rule-based only")
            self.ml_model = None
            self.scaler = None
            self.feature_names = None

    def analyze_sms_sender_id(self, sender_id: str) -> Dict[str, Any]:
        """Analyze SMS sender ID based on DND classification"""
        if not sender_id:
            return {
                'category': 'Unknown',
                'risk_level': 'Medium',
                'trust_score': 0.5,
                'description': 'No sender ID provided'
            }
        
        # Extract the last character (category indicator)
        sender_id_upper = sender_id.upper()
        last_char = sender_id_upper[-1] if sender_id_upper else ''
        
        # Check if it matches known categories
        if last_char in self.sms_categories:
            category_info = self.sms_categories[last_char]
            return {
                'category': category_info['name'],
                'risk_level': category_info['risk_level'],
                'trust_score': category_info['trust_score'],
                'description': category_info['description'],
                'sender_id': sender_id,
                'category_code': last_char
            }
        
        # If no category found, analyze the sender ID pattern
        return self._analyze_unknown_sender_id(sender_id)

    def _analyze_unknown_sender_id(self, sender_id: str) -> Dict[str, Any]:
        """Analyze unknown sender ID patterns"""
        sender_id_upper = sender_id.upper()
        
        # Check for common legitimate patterns
        legitimate_patterns = [
            ('BANK', 'Likely bank sender'),
            ('SBI', 'State Bank of India'),
            ('HDFC', 'HDFC Bank'),
            ('ICICI', 'ICICI Bank'),
            ('AXIS', 'Axis Bank'),
            ('PAYTM', 'Paytm'),
            ('PHONEPE', 'PhonePe'),
            ('GPAY', 'Google Pay'),
            ('AMAZON', 'Amazon'),
            ('FLIPKART', 'Flipkart'),
            ('SWIGGY', 'Swiggy'),
            ('ZOMATO', 'Zomato'),
            ('OLA', 'Ola'),
            ('UBER', 'Uber'),
            ('GOVT', 'Government'),
            ('INCOME', 'Income Tax'),
            ('AADHAAR', 'Aadhaar'),
            ('PAN', 'PAN Card'),
            ('GST', 'GST'),
            ('INDIAN', 'Indian Railways'),
            ('IRCTC', 'IRCTC')
        ]
        
        for pattern, description in legitimate_patterns:
            if pattern in sender_id_upper:
                return {
                    'category': 'Service',
                    'risk_level': 'Low',
                    'trust_score': 0.8,
                    'description': f'Legitimate: {description}',
                    'sender_id': sender_id,
                    'category_code': 's'
                }
        
        # Check for suspicious patterns
        suspicious_patterns = [
            ('LOTTERY', 'Lottery scam'),
            ('PRIZE', 'Prize scam'),
            ('WIN', 'Winning scam'),
            ('FREE', 'Free money scam'),
            ('URGENT', 'Urgency scam'),
            ('SUSPEND', 'Account suspension scam'),
            ('BLOCK', 'Account blocking scam'),
            ('VERIFY', 'Verification scam'),
            ('UPDATE', 'Update scam'),
            ('SECURE', 'Security scam'),
            ('ALERT', 'Alert scam'),
            ('WARNING', 'Warning scam'),
            ('CRITICAL', 'Critical scam'),
            ('IMMEDIATE', 'Immediate action scam')
        ]
        
        for pattern, description in suspicious_patterns:
            if pattern in sender_id_upper:
                return {
                    'category': 'Suspicious',
                    'risk_level': 'High',
                    'trust_score': 0.1,
                    'description': f'Suspicious: {description}',
                    'sender_id': sender_id,
                    'category_code': 'p'
                }
        
        # Default for unknown patterns
        return {
            'category': 'Unknown',
            'risk_level': 'Medium',
            'trust_score': 0.5,
            'description': 'Unknown sender ID pattern',
            'sender_id': sender_id,
            'category_code': '?'
        }

    def check_legitimate_provider(self, text: str) -> Dict[str, Any] | None:
        """Check if message is from a legitimate provider (whitelist)"""
        text_lower = text.lower()
        
        for provider in self.legitimate_providers:
            if provider in text_lower:
                return {
                    'is_scam': False,
                    'confidence': 0.95,
                    'method': 'whitelist',
                    'reason': f'Legitimate provider: {provider}'
                }
        
        return None

    def extract_features(self, text: str) -> List[float]:
        """Extract features from text for ML model"""
        if not self.feature_names:
            return []
            
        features = []
        text_lower = text.lower()
        
        # Basic features
        features.append(len(text))
        features.append(len(text.split()))
        features.append(len([c for c in text if c.isupper()]))
        features.append(len([c for c in text if c.isdigit()]))
        features.append(len([c for c in text if c in '!@#$%^&*()']))
        
        # Keyword features
        scam_keywords = ['urgent', 'immediate', 'suspended', 'blocked', 'expired', 'verification', 
                        'click', 'verify', 'kyc', 'lottery', 'prize', 'won', 'inheritance', 
                        'free money', 'processing fee', 'refund', 'penalty', 'fir', 'otp']
        
        suspicious_keywords = ['bank', 'credit', 'debit', 'inr', 'rs', '₹', 'update', 'confirm', 'reactivate']
        
        scam_count = sum(1 for word in scam_keywords if word in text_lower)
        suspicious_count = sum(1 for word in suspicious_keywords if word in text_lower)
        
        features.append(scam_count)
        features.append(suspicious_count)
        
        # URL features
        features.append(1 if 'http' in text_lower or 'www' in text_lower else 0)
        features.append(1 if any(shortener in text_lower for shortener in ['bit.ly', 'tinyurl', 'goo.gl']) else 0)
        
        # Amount features
        features.append(1 if re.search(r'\d+[\d,]*(?:\.\d+)?\s*(?:inr|rs\.?|₹)', text_lower) else 0)
        
        # Action features
        features.append(1 if any(action in text_lower for action in ['click', 'verify', 'confirm', 'update']) else 0)
        
        # Urgency features
        features.append(1 if any(urgent in text_lower for urgent in ['urgent', 'immediate', 'now', 'quick']) else 0)
        
        # Fill remaining features with zeros
        while len(features) < len(self.feature_names):
            features.append(0)
            
        return features[:len(self.feature_names)]

    def ml_analysis(self, text: str) -> Dict[str, Any]:
        """Run ML model analysis"""
        if not self.ml_model or not self.scaler:
            return {
                'is_scam': False,
                'confidence': 0.5,
                'method': 'rule-based (no ML model)'
            }
        
        try:
            features = self.extract_features(text)
            features_scaled = self.scaler.transform([features])
            prediction = self.ml_model.predict(features_scaled)[0]
            probability = self.ml_model.predict_proba(features_scaled)[0]
            
            return {
                'is_scam': bool(prediction),
                'confidence': float(max(probability)),
                'method': 'ML model v3'
            }
        except Exception as e:
            print(f"ML analysis error: {e}")
            return {
                'is_scam': False,
                'confidence': 0.5,
                'method': 'rule-based (ML error)'
            }

    def rule_analysis(self, text: str) -> Dict[str, Any]:
        """Run rule-based analysis"""
        text_lower = text.lower()
        score = 0
        red_flags = []
        
        # Scam patterns
        scam_patterns = [
            ('bank credit.*click', 0.9, 'Bank credit + click pattern'),
            ('bank debit.*click', 0.9, 'Bank debit + click pattern'),
            ('credit.*inr.*click', 0.9, 'Credit + INR + click pattern'),
            ('debit.*inr.*click', 0.9, 'Debit + INR + click pattern'),
            ('urgent.*bank', 0.8, 'Urgent + bank pattern'),
            ('suspended.*account', 0.8, 'Account suspension threat'),
            ('kyc.*pending', 0.7, 'KYC pending scam'),
            ('lottery.*won', 0.9, 'Lottery scam'),
            ('inheritance.*claim', 0.9, 'Inheritance scam'),
            ('free.*money', 0.8, 'Free money scam'),
            ('processing.*fee', 0.8, 'Processing fee scam'),
            (r'bit\.ly|tinyurl|goo\.gl', 0.7, 'URL shortener'),
            ('share.*otp', 0.9, 'OTP sharing request'),
            ('provide.*otp', 0.9, 'OTP provision request')
        ]
        
        for pattern, weight, reason in scam_patterns:
            if re.search(pattern, text_lower):
                score += weight
                red_flags.append(reason)
        
        # Amount + action patterns
        if re.search(r'\d{4,}', text_lower) and any(action in text_lower for action in ['click', 'link', 'verify', 'confirm']):
            score += 0.8
            red_flags.append('Large amount + action request')
        
        # Urgency indicators
        urgency_words = ['urgent', 'immediate', 'now', 'quick', 'hurry', 'fast']
        if any(word in text_lower for word in urgency_words):
            score += 0.3
            red_flags.append('Uses urgency tactics')
        
        # Multiple exclamation marks
        exclamation_count = text.count('!')
        if exclamation_count >= 2:
            score += 0.2 * exclamation_count
            red_flags.append(f'Uses {exclamation_count} exclamation marks')
        
        # ALL CAPS
        upper_ratio = sum(1 for c in text if c.isupper()) / len(text) if text else 0
        if upper_ratio > 0.6:
            score += 0.3
            red_flags.append('Excessive capitalization')
        
        confidence = min(score, 0.95)
        is_scam = score >= 0.6
        
        return {
            'is_scam': is_scam,
            'confidence': confidence,
            'method': 'rule-based',
            'red_flags': red_flags[:5]
        }

    def gemini_verification(self, text: str, ml_result: Dict, rule_result: Dict) -> Dict[str, Any]:
        """Use Gemini to verify ML and rule results"""
        if not GOOGLE_GEMINI_API_KEY:
            return {
                'is_scam': ml_result['is_scam'] or rule_result['is_scam'],
                'confidence': max(ml_result['confidence'], rule_result['confidence']),
                'method': 'combined (no Gemini)',
                'reason': 'Gemini API not configured'
            }
        
        try:
            model = genai.GenerativeModel('gemini-pro')
            
            prompt = f"""
            Analyze this SMS message for scam detection. This is a 2-step verification system.

            MESSAGE: "{text}"

            STEP 1 RESULTS:
            - ML Model: {'SCAM' if ml_result['is_scam'] else 'SAFE'} ({ml_result['confidence']:.1%} confidence)
            - Rule-Based: {'SCAM' if rule_result['is_scam'] else 'SAFE'} ({rule_result['confidence']:.1%} confidence)
            - Red Flags: {rule_result.get('red_flags', [])}

            STEP 2: You are the final verification. Consider:
            1. Is this a legitimate message from a known service?
            2. Are there obvious scam indicators?
            3. Does the language seem natural or suspicious?
            4. Are there urgency tactics or pressure?

            Respond in JSON format:
            {{
                "final_verdict": "SAFE" or "SCAM",
                "confidence": 0.0 to 1.0,
                "reason": "brief explanation",
                "false_positive_detected": true/false,
                "confidence_adjustment": "increased" or "decreased" or "same"
            }}
            """
            
            response = model.generate_content(prompt)
            result = json.loads(response.text)
            
            return {
                'is_scam': result['final_verdict'] == 'SCAM',
                'confidence': result['confidence'],
                'method': 'Gemini 2-step verification',
                'reason': result['reason'],
                'false_positive_detected': result.get('false_positive_detected', False),
                'confidence_adjustment': result.get('confidence_adjustment', 'same')
            }
            
        except Exception as e:
            print(f"Gemini verification error: {e}")
            # Fallback to combined result
            combined_scam = ml_result['is_scam'] or rule_result['is_scam']
            combined_confidence = max(ml_result['confidence'], rule_result['confidence'])
            
            return {
                'is_scam': combined_scam,
                'confidence': combined_confidence,
                'method': 'combined (Gemini error)',
                'reason': f'Gemini error: {str(e)}'
            }

    def analyze_message(self, text: str, phone: str = None, url: str = None, sender_id: str = None) -> Dict[str, Any]:
        """Main analysis function - combines ML, rules, and Gemini with SMS sender ID analysis"""
        if not text:
            return {
                'classification': 'Safe',
                'confidence_score': '0%',
                'risk_level': 'Low',
                'red_flags': [],
                'recommended_action': 'No message provided'
            }
        
        # STEP 0: Analyze SMS Sender ID (NEW FEATURE!)
        sender_analysis = None
        if sender_id:
            sender_analysis = self.analyze_sms_sender_id(sender_id)
            print(f"📱 SMS Sender Analysis: {sender_id} → {sender_analysis['category']} ({sender_analysis['category_code']})")
        
        # STEP 1: Check legitimate providers FIRST (whitelist)
        legitimate_check = self.check_legitimate_provider(text)
        if legitimate_check:
            return {
                'classification': 'Safe',
                'confidence_score': '95%',
                'risk_level': 'Low',
                'red_flags': [],
                'recommended_action': f"This is a legitimate message from {legitimate_check['reason']}. Continue with normal caution.",
                'analysis_details': {
                    'ml_result': legitimate_check,
                    'rule_result': legitimate_check,
                    'gemini_result': legitimate_check,
                    'sender_analysis': sender_analysis,
                    'false_positive_detected': False,
                    'confidence_adjustment': 'same'
                }
            }
        
        # STEP 2: Apply SMS Sender ID logic
        if sender_analysis and sender_analysis['category_code'] in ['s', 'g', 't']:
            # Service, Government, or Transactional messages are generally safe
            if sender_analysis['trust_score'] >= 0.8:
                return {
                    'classification': 'Safe',
                    'confidence_score': f"{sender_analysis['trust_score']:.1%}",
                    'risk_level': 'Low',
                    'red_flags': [],
                    'recommended_action': f"This appears to be a legitimate {sender_analysis['category']} message. Continue with normal caution.",
                    'analysis_details': {
                        'ml_result': {'is_scam': False, 'confidence': sender_analysis['trust_score'], 'method': 'SMS Sender ID'},
                        'rule_result': {'is_scam': False, 'confidence': sender_analysis['trust_score'], 'method': 'SMS Sender ID'},
                        'gemini_result': {'is_scam': False, 'confidence': sender_analysis['trust_score'], 'method': 'SMS Sender ID'},
                        'sender_analysis': sender_analysis,
                        'false_positive_detected': False,
                        'confidence_adjustment': 'same'
                    }
                }
        
        # STEP 3: ML Analysis
        ml_result = self.ml_analysis(text)
        
        # STEP 4: Rule Analysis  
        rule_result = self.rule_analysis(text)
        
        # STEP 5: Gemini Verification
        gemini_result = self.gemini_verification(text, ml_result, rule_result)
        
        # STEP 6: Combine results with SMS Sender ID
        final_scam = gemini_result['is_scam']
        final_confidence = gemini_result['confidence']
        
        # Adjust confidence based on SMS Sender ID
        if sender_analysis:
            if sender_analysis['category_code'] == 'p':  # Promotional
                final_confidence = min(final_confidence + 0.2, 1.0)  # Increase suspicion
                if final_confidence >= 0.7:
                    final_scam = True
            elif sender_analysis['category_code'] in ['s', 'g', 't']:  # Service, Government, Transactional
                final_confidence = max(final_confidence - 0.1, 0.0)  # Reduce suspicion
                if final_confidence <= 0.3:
                    final_scam = False
        
        # Determine classification
        if final_scam:
            if final_confidence >= 0.8:
                classification = 'Scam'
                risk_level = 'High'
                action = 'BLOCKED: This is a confirmed scam. Do not interact.'
            else:
                classification = 'Suspicious'
                risk_level = 'Medium'
                action = 'This appears suspicious. Exercise extreme caution.'
        else:
            if final_confidence >= 0.7:
                classification = 'Safe'
                risk_level = 'Low'
                action = 'This appears to be safe. Continue with normal caution.'
            else:
                classification = 'Suspicious'
                risk_level = 'Medium'
                action = 'Exercise caution. Do not share personal information.'
        
        return {
            'classification': classification,
            'confidence_score': f'{final_confidence:.1%}',
            'risk_level': risk_level,
            'red_flags': rule_result.get('red_flags', []),
            'recommended_action': action,
            'sender_analysis': sender_analysis,
            'analysis_details': {
                'ml_result': ml_result,
                'rule_result': rule_result,
                'gemini_result': gemini_result,
                'sender_analysis': sender_analysis,
                'false_positive_detected': gemini_result.get('false_positive_detected', False),
                'confidence_adjustment': gemini_result.get('confidence_adjustment', 'same')
            }
        }

# Global instance
analyzer = SimpleUPIAnalyzer()

def analyze_message_simple(text: str, phone: str = None, url: str = None, sender_id: str = None) -> Dict[str, Any]:
    """Simple interface function with SMS sender ID support"""
    return analyzer.analyze_message(text, phone, url, sender_id)
