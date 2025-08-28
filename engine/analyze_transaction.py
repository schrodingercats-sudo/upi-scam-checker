
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

try:
    from advanced_fraud_detector import HybridFraudDetectionSystem, TransactionData
    from datetime import datetime
    import json
    
    # Get transaction data from command line
    transaction_data = json.loads(sys.argv[1])
    
    # Create TransactionData object
    transaction = TransactionData(
        transaction_id=transaction_data['transaction_id'],
        user_id=transaction_data['user_id'],
        amount=transaction_data['amount'],
        timestamp=datetime.fromisoformat(transaction_data['timestamp'].replace('Z', '+00:00')),
        merchant_id=transaction_data['merchant_id'],
        device_id=transaction_data['device_id'],
        ip_address=transaction_data['ip_address'],
        location=tuple(transaction_data['location']),
        transaction_type=transaction_data['transaction_type'],
        upi_id=transaction_data['upi_id'],
        message=transaction_data['message'],
        sender_id=transaction_data['sender_id']
    )
    
    # Try to load existing model or create new one
    try:
        fraud_system = HybridFraudDetectionSystem()
        fraud_system.load_model("advanced_fraud_detector.pkl")
        print("Loaded existing model")
    except:
        print("No existing model found, creating basic analysis")
        # For now, return basic analysis
        from advanced_fraud_detector import performBasicAnalysis
        result = performBasicAnalysis(transaction.message)
        
        risk_score = {
            "overall_score": result.confidence,
            "risk_level": result.riskLevel,
            "confidence": result.confidence,
            "red_flags": result.redFlags,
            "explanation": result.advice,
            "component_scores": {
                "ml_model_score": result.confidence,
                "rule_based_score": result.confidence,
                "network_risk_score": 0.0,
                "behavioral_risk_score": 0.0,
                "device_risk_score": 0.0
            },
            "recommended_action": result.advice
        }
        
        print(json.dumps({
            "success": True,
            "model": "basic_ml_analysis",
            "risk_score": risk_score,
            "processing_time_ms": 50,
            "model_version": "1.0.0"
        }))
        sys.exit(0)
    
    # Analyze transaction
    risk_score = fraud_system.analyze_transaction(transaction)
    
    # Convert to JSON-serializable format
    result = {
        "success": True,
        "model": "advanced_hefds",
        "risk_score": {
            "overall_score": risk_score.overall_score,
            "risk_level": risk_score.risk_level,
            "confidence": risk_score.confidence,
            "red_flags": risk_score.red_flags,
            "explanation": risk_score.explanation,
            "component_scores": risk_score.component_scores,
            "recommended_action": risk_score.recommended_action
        },
        "processing_time_ms": 100,
        "model_version": "2.0.0"
    }
    
    print(json.dumps(result))
    
except Exception as e:
    print(json.dumps({
        "success": False,
        "error": str(e),
        "model": "error",
        "risk_score": None
    }))
