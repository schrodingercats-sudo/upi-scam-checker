import os
import json
import pickle
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
import google.generativeai as genai
from .analyzer import SMSAnalyzer
from .rules import RuleEngine
from .config import WEIGHTS

class EnhancedUPIAnalyzer:
    """
    Enhanced UPI Scam Detector combining ML model, rule-based analysis, and Google Gemini AI
    with 2-step verification system
    """
    
    def __init__(self, gemini_api_key: str = None):
        """
        Initialize the enhanced analyzer
        
        Args:
            gemini_api_key: Google Gemini API key (optional)
        """
        # Initialize existing ML analyzer
        self.ml_analyzer = SMSAnalyzer()
        
        # Initialize rule engine
        self.rule_engine = RuleEngine()
        
        # Initialize Google Gemini if API key is provided
        self.gemini_available = False
        if gemini_api_key:
            try:
                genai.configure(api_key=gemini_api_key)
                self.gemini_available = True
                print("✅ Google Gemini API initialized successfully")
            except Exception as e:
                print(f"❌ Failed to initialize Google Gemini: {e}")
                self.gemini_available = False
        
        # Load Gemini model if available
        self.gemini_model = None
        if self.gemini_available:
            try:
                self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
                print("✅ Gemini model loaded successfully")
            except Exception as e:
                print(f"❌ Failed to load Gemini model: {e}")
                self.gemini_available = False
    
    def analyze_message(self, message: str, message_type: str = "sms") -> Dict[str, Any]:
        """
        Analyze message using 2-step verification system
        
        Args:
            message: Message content to analyze
            message_type: Type of message (sms, whatsapp, email)
            
        Returns:
            Dictionary containing comprehensive analysis results
        """
        print(f"🔍 Analyzing message: {message[:50]}...")
        
        # 1. IMMEDIATE HARD-CODED BLOCKING (Highest Priority)
        immediate_result = self._immediate_blocking_check(message)
        if immediate_result["is_scam"]:
            print("🚨 IMMEDIATE BLOCKING: Obvious scam detected!")
            return {
                **immediate_result,
                "analysis_method": "immediate_blocking",
                "confidence": 99.0,
                "risk_level": "Critical",
                "message_type": message_type,
                "timestamp": pd.Timestamp.now().isoformat()
            }
        
        # 2. ML Model Analysis (Step 1)
        ml_result = self._ml_analysis(message)
        print(f"🤖 ML Analysis (Step 1): {ml_result['risk_level']} ({ml_result['confidence']:.1f}%)")
        
        # 3. Rule-based Analysis
        rule_result = self._rule_analysis(message)
        print(f"📋 Rule Analysis: {rule_result['risk_level']} ({rule_result['confidence']:.1f}%)")
        
        # 4. Google Gemini AI Analysis with 2-Step Verification (Step 2)
        gemini_result = None
        if self.gemini_available and self.gemini_model:
            try:
                # Pass BOTH original message AND our model's response to Gemini
                gemini_result = self._gemini_2step_verification(message, message_type, ml_result, rule_result)
                print(f"🧠 Gemini 2-Step Verification (Step 2): {gemini_result['risk_level']} ({gemini_result['confidence']:.1f}%)")
            except Exception as e:
                print(f"⚠️ Gemini 2-step verification failed: {e}")
                gemini_result = None
        
        # 5. Combine all results for final decision
        final_result = self._combine_analyses(
            ml_result, rule_result, gemini_result, message_type
        )
        
        print(f"🎯 Final Result: {final_result['risk_level']} ({final_result['confidence']:.1f}%)")
        
        return final_result
    
    def _immediate_blocking_check(self, message: str) -> Dict[str, Any]:
        """
        Check for immediate obvious scam patterns
        """
        message_lower = message.lower()
        
        # Critical scam patterns that should be blocked immediately
        critical_patterns = [
            "your bank credit",
            "click on this link",
            "urgent action required",
            "account suspended",
            "verify immediately",
            "unusual activity detected",
            "payment failed",
            "refund available",
            "prize won",
            "lottery winner",
            "inheritance",
            "government refund",
            "tax refund",
            "bank transfer",
            "upi payment",
            "otp verification",
            "account verification"
        ]
        
        # Check for critical patterns
        for pattern in critical_patterns:
            if pattern in message_lower:
                return {
                    "is_scam": True,
                    "risk_level": "Critical",
                    "confidence": 99.0,
                    "blocked_reason": f"Critical pattern detected: '{pattern}'",
                    "risk_factors": [f"Contains critical scam pattern: {pattern}"],
                    "recommendations": [
                        "DO NOT click any links",
                        "DO NOT provide personal information",
                        "DO NOT call any numbers",
                        "Report to authorities if needed"
                    ]
                }
        
        # Check for suspicious URLs or phone numbers
        if any(char in message for char in ['http://', 'https://', 'www.']):
            if any(word in message_lower for word in ['click', 'verify', 'login', 'secure']):
                return {
                    "is_scam": True,
                    "risk_level": "Critical",
                    "confidence": 95.0,
                    "blocked_reason": "Suspicious URL with action words",
                    "risk_factors": ["Contains suspicious URL with action words"],
                    "recommendations": [
                        "DO NOT click the link",
                        "Verify the sender independently",
                        "Check official website directly"
                    ]
                }
        
        return {
            "is_scam": False,
            "risk_level": "Safe",
            "confidence": 0.0,
            "blocked_reason": None,
            "risk_factors": [],
            "recommendations": []
        }
    
    def _ml_analysis(self, message: str) -> Dict[str, Any]:
        """
        Analyze message using our trained ML model (Step 1)
        """
        try:
            # Use existing ML analyzer
            result = self.ml_analyzer.analyze_message(message)
            
            # Convert to our format
            confidence = result.get('confidence', 0) * 100
            risk_level = self._get_risk_level(confidence)
            
            return {
                "is_scam": result.get('is_scam', False),
                "risk_level": risk_level,
                "confidence": confidence,
                "ml_score": result.get('ml_score', 0),
                "rule_score": result.get('rule_score', 0),
                "risk_factors": result.get('risk_factors', []),
                "recommendations": result.get('recommendations', [])
            }
        except Exception as e:
            print(f"ML analysis failed: {e}")
            return {
                "is_scam": False,
                "risk_level": "Unknown",
                "confidence": 0.0,
                "ml_score": 0,
                "rule_score": 0,
                "risk_factors": ["ML analysis failed"],
                "recommendations": ["Manual review required"]
            }
    
    def _rule_analysis(self, message: str) -> Dict[str, Any]:
        """
        Analyze message using rule-based engine
        """
        try:
            # Use existing rule engine
            score = self.rule_engine.analyze_message(message)
            
            # Convert score to confidence and risk level
            confidence = min(score / 100 * 100, 100)  # Normalize to 0-100
            risk_level = self._get_risk_level(confidence)
            
            return {
                "is_scam": confidence > 70,
                "risk_level": risk_level,
                "confidence": confidence,
                "rule_score": score,
                "risk_factors": self._extract_rule_factors(message),
                "recommendations": self._get_rule_recommendations(confidence)
            }
        except Exception as e:
            print(f"Rule analysis failed: {e}")
            return {
                "is_scam": False,
                "risk_level": "Unknown",
                "confidence": 0.0,
                "rule_score": 0,
                "risk_factors": ["Rule analysis failed"],
                "recommendations": ["Manual review required"]
            }
    
    def _gemini_2step_verification(self, message: str, message_type: str, 
                                  ml_result: Dict, rule_result: Dict) -> Dict[str, Any]:
        """
        2-Step Verification: Gemini analyzes both original message AND our model's response
        """
        try:
            # Create detailed prompt for 2-step verification
            prompt = f"""You are a highly specialized UPI (Unified Payments Interface) scam detection AI designed for deployment in fintech applications. You are performing a 2-step verification analysis.

**STEP 1 ANALYSIS RESULTS FROM OUR ML MODEL:**
- ML Model Classification: {ml_result.get('is_scam', False)}
- ML Confidence: {ml_result.get('confidence', 0):.1f}%
- ML Risk Level: {ml_result.get('risk_level', 'Unknown')}
- ML Risk Factors: {ml_result.get('risk_factors', [])}

**STEP 1 ANALYSIS RESULTS FROM OUR RULE ENGINE:**
- Rule Engine Classification: {rule_result.get('is_scam', False)}
- Rule Confidence: {rule_result.get('confidence', 0):.1f}%
- Rule Risk Level: {rule_result.get('risk_level', 'Unknown')}
- Rule Risk Factors: {rule_result.get('risk_factors', [])}

**ORIGINAL MESSAGE TO ANALYZE:**
Message Type: {message_type}
Message Content:
\"\"\"
{message}
\"\"\"

**YOUR TASK - 2-STEP VERIFICATION:**
1. Analyze the original message independently
2. Compare your analysis with our ML model's results
3. Identify if our model made a false positive/negative
4. Provide final verification with explanation

You must respond with ONLY a valid JSON object in this exact format (no additional text before or after):
{{
  "summary": "Brief 2-3 sentence summary of the 2-step verification analysis",
  "original_message_analysis": "Your independent analysis of the original message",
  "ml_model_verification": "Whether our ML model was correct or made an error",
  "false_positive_detected": true/false,
  "false_negative_detected": true/false,
  "risk_factors": ["Array of specific red flags found"],
  "legitimacy_indicators": ["Array of signs that suggest legitimacy"],
  "recommendations": ["Array of specific actions the user should take"],
  "technical_analysis": "Detailed technical explanation of findings",
  "risk_score": 1-10,
  "is_scam": true/false,
  "confidence_adjustment": "Explanation of any confidence adjustments made"
}}

CRITICAL: Respond with ONLY the JSON object above. No markdown, no explanations, no extra text.

JSON response:"""

            # Call Google Gemini API
            response = self.gemini_model.generate_content(prompt)
            analysis_text = response.text
            
            # Extract JSON from the response
            try:
                # First try direct parsing
                analysis = json.loads(analysis_text)
            except json.JSONDecodeError:
                # Try to extract JSON from within the response
                import re
                json_match = re.search(r'\{[\s\S]*\}', analysis_text)
                if json_match:
                    analysis = json.loads(json_match.group())
                else:
                    raise ValueError("No JSON found in Gemini response")
            
            # Convert Gemini risk score (1-10) to confidence (0-100)
            gemini_risk_score = analysis.get('risk_score', 5)
            confidence = (gemini_risk_score / 10) * 100
            risk_level = self._get_risk_level(confidence)
            
            # Check for false positives/negatives
            false_positive = analysis.get('false_positive_detected', False)
            false_negative = analysis.get('false_negative_detected', False)
            
            return {
                "is_scam": analysis.get('is_scam', False) or confidence > 70,
                "risk_level": risk_level,
                "confidence": confidence,
                "gemini_score": gemini_risk_score,
                "summary": analysis.get('summary', ''),
                "original_message_analysis": analysis.get('original_message_analysis', ''),
                "ml_model_verification": analysis.get('ml_model_verification', ''),
                "false_positive_detected": false_positive,
                "false_negative_detected": false_negative,
                "confidence_adjustment": analysis.get('confidence_adjustment', ''),
                "risk_factors": analysis.get('risk_factors', []),
                "legitimacy_indicators": analysis.get('legitimacy_indicators', []),
                "recommendations": analysis.get('recommendations', []),
                "technical_analysis": analysis.get('technical_analysis', '')
            }
            
        except Exception as e:
            print(f"Gemini 2-step verification failed: {e}")
            return {
                "is_scam": False,
                "risk_level": "Unknown",
                "confidence": 0.0,
                "gemini_score": 5,
                "summary": "Gemini 2-step verification failed",
                "original_message_analysis": "",
                "ml_model_verification": "",
                "false_positive_detected": False,
                "false_negative_detected": False,
                "confidence_adjustment": "",
                "risk_factors": ["AI analysis unavailable"],
                "legitimacy_indicators": [],
                "recommendations": ["Manual review recommended"],
                "technical_analysis": f"Gemini 2-step verification failed: {str(e)}"
            }
    
    def _combine_analyses(self, ml_result: Dict, rule_result: Dict, 
                          gemini_result: Optional[Dict], message_type: str) -> Dict[str, Any]:
        """
        Combine all analysis results for final decision with 2-step verification
        """
        # Calculate weighted confidence
        weights = {
            'ml': 0.3,      # ML model weight (reduced due to 2-step verification)
            'rule': 0.2,    # Rule-based weight (reduced due to 2-step verification)
            'gemini': 0.5   # Gemini AI weight (increased due to 2-step verification)
        }
        
        total_confidence = 0
        total_weight = 0
        
        # ML confidence
        if ml_result and ml_result['confidence'] > 0:
            total_confidence += ml_result['confidence'] * weights['ml']
            total_weight += weights['ml']
        
        # Rule confidence
        if rule_result and rule_result['confidence'] > 0:
            total_confidence += rule_result['confidence'] * weights['rule']
            total_weight += weights['rule']
        
        # Gemini confidence (with 2-step verification bonus)
        if gemini_result and gemini_result['confidence'] > 0:
            # Bonus for 2-step verification
            verification_bonus = 1.1 if gemini_result.get('false_positive_detected') else 1.0
            adjusted_confidence = min(gemini_result['confidence'] * verification_bonus, 100)
            
            total_confidence += adjusted_confidence * weights['gemini']
            total_weight += weights['gemini']
        
        # Calculate final confidence
        if total_weight > 0:
            final_confidence = total_confidence / total_weight
        else:
            final_confidence = 0
        
        # Determine final risk level and scam status
        final_risk_level = self._get_risk_level(final_confidence)
        
        # Check for false positives detected by Gemini
        false_positive_detected = gemini_result.get('false_positive_detected', False) if gemini_result else False
        
        # If Gemini detected a false positive, adjust the final decision
        if false_positive_detected:
            print("🔍 Gemini detected false positive - adjusting confidence")
            final_confidence = max(final_confidence * 0.7, 30)  # Reduce confidence but don't go below 30%
            final_risk_level = self._get_risk_level(final_confidence)
        
        final_is_scam = final_confidence > 70 and not false_positive_detected
        
        # Combine risk factors and recommendations
        all_risk_factors = []
        all_recommendations = []
        
        if ml_result:
            all_risk_factors.extend(ml_result.get('risk_factors', []))
            all_recommendations.extend(ml_result.get('recommendations', []))
        
        if rule_result:
            all_risk_factors.extend(rule_result.get('risk_factors', []))
            all_recommendations.extend(rule_result.get('recommendations', []))
        
        if gemini_result:
            all_risk_factors.extend(gemini_result.get('risk_factors', []))
            all_recommendations.extend(gemini_result.get('recommendations', []))
        
        # Remove duplicates
        all_risk_factors = list(set(all_risk_factors))
        all_recommendations = list(set(all_recommendations))
        
        return {
            "is_scam": final_is_scam,
            "risk_level": final_risk_level,
            "confidence": round(final_confidence, 1),
            "message_type": message_type,
            "timestamp": pd.Timestamp.now().isoformat(),
            "analysis_method": "enhanced_2step_verification",
            "ml_result": ml_result,
            "rule_result": rule_result,
            "gemini_result": gemini_result,
            "false_positive_detected": false_positive_detected,
            "risk_factors": all_risk_factors,
            "recommendations": all_recommendations,
            "summary": gemini_result.get('summary', '') if gemini_result else '',
            "technical_analysis": gemini_result.get('technical_analysis', '') if gemini_result else '',
            "ml_model_verification": gemini_result.get('ml_model_verification', '') if gemini_result else '',
            "confidence_adjustment": gemini_result.get('confidence_adjustment', '') if gemini_result else ''
        }
    
    def _get_risk_level(self, confidence: float) -> str:
        """
        Convert confidence score to risk level
        """
        if confidence >= 90:
            return "Critical"
        elif confidence >= 70:
            return "High"
        elif confidence >= 50:
            return "Medium"
        elif confidence >= 30:
            return "Low"
        else:
            return "Safe"
    
    def _extract_rule_factors(self, message: str) -> List[str]:
        """
        Extract risk factors based on rule analysis
        """
        factors = []
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['urgent', 'immediate', 'now']):
            factors.append("Contains urgency indicators")
        
        if any(word in message_lower for word in ['verify', 'confirm', 'login']):
            factors.append("Contains verification requests")
        
        if any(word in message_lower for word in ['bank', 'upi', 'payment']):
            factors.append("Contains financial terms")
        
        if any(char in message for char in ['http://', 'https://', 'www.']):
            factors.append("Contains URLs")
        
        return factors
    
    def _get_rule_recommendations(self, confidence: float) -> List[str]:
        """
        Get recommendations based on rule confidence
        """
        if confidence > 80:
            return [
                "DO NOT respond to this message",
                "DO NOT click any links",
                "DO NOT provide personal information",
                "Report to authorities if needed"
            ]
        elif confidence > 60:
            return [
                "Exercise extreme caution",
                "Verify sender independently",
                "DO NOT click suspicious links"
            ]
        elif confidence > 40:
            return [
                "Be cautious",
                "Verify information independently"
            ]
        else:
            return [
                "Continue with normal caution",
                "Verify if unsure"
            ]

# Convenience function for easy usage
def analyze_message_enhanced(message: str, message_type: str = "sms", 
                            gemini_api_key: str = None) -> Dict[str, Any]:
    """
    Convenience function to analyze a message with enhanced 2-step verification
    
    Args:
        message: Message content to analyze
        message_type: Type of message (sms, whatsapp, email)
        gemini_api_key: Google Gemini API key (optional)
        
    Returns:
        Dictionary containing comprehensive analysis results with 2-step verification
    """
    analyzer = EnhancedUPIAnalyzer(gemini_api_key)
    return analyzer.analyze_message(message, message_type)
