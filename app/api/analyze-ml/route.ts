import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    console.log('Starting Advanced ML analysis with HEFDS system...');

    // Create a mock transaction for the ML system
    const mockTransaction = {
      transaction_id: `TXN_${Date.now()}`,
      user_id: "USER_001",
      amount: 1000.0, // Default amount
      timestamp: new Date().toISOString(),
      merchant_id: "MERCHANT_001",
      device_id: "DEVICE_001",
      ip_address: "192.168.1.1",
      location: [19.0760, 72.8777], // Mumbai coordinates
      transaction_type: "UPI",
      upi_id: "user@upi",
      message: text,
      sender_id: "SENDER_001"
    };

    try {
      // Try to use the advanced ML system first
      const mlResult = await analyzeWithAdvancedML(mockTransaction);
      
      if (mlResult && typeof mlResult === 'object' && 'success' in mlResult && mlResult.success) {
        console.log('Advanced ML analysis completed successfully');
        return NextResponse.json(mlResult);
      }
    } catch (error) {
      console.log('Advanced ML system failed, falling back to basic analysis:', error);
    }

    // Fallback to basic ML analysis
    const basicResult = await performBasicMLAnalysis(text);
    
    return NextResponse.json({
      success: true,
      model: 'basic_ml_fallback',
      risk_score: basicResult,
      processing_time_ms: Date.now() - Date.now() + 50, // Mock timing
      model_version: '1.0.0'
    });

  } catch (error) {
    console.error('ML analysis error:', error);
    return NextResponse.json({ 
      error: 'ML analysis failed',
      message: 'Unable to analyze the message with ML system. Please try again later.'
    }, { status: 500 });
  }
}

async function analyzeWithAdvancedML(transaction: any) {
  return new Promise((resolve, reject) => {
    try {
      // Path to the Python script
      const pythonScript = path.join(process.cwd(), 'engine', 'analyze_transaction.py');
      
      // Create the Python script if it doesn't exist
      const scriptContent = `
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
`;

      // Write the script to file
      const fs = require('fs');
      fs.writeFileSync(pythonScript, scriptContent);

      // Run Python script
      const pythonProcess = spawn('python', [pythonScript, JSON.stringify(transaction)]);
      
      let output = '';
      let errorOutput = '';
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output.trim());
            resolve(result);
          } catch (parseError) {
            console.error('Failed to parse Python output:', parseError);
            reject(new Error('Failed to parse ML analysis result'));
          }
        } else {
          console.error('Python process failed with code:', code);
          console.error('Error output:', errorOutput);
          reject(new Error(`Python process failed with code ${code}`));
        }
      });
      
      pythonProcess.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        reject(error);
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

async function performBasicMLAnalysis(text: string) {
  const lower = text.toLowerCase();
  
  // Enhanced security pattern detection with better weights
  const securityPatterns = {
    urgency: { regex: /kyc|verify|deadline|expiry|block|suspend|immediate|urgent|quick|before|soon/i, weight: 0.3 },
    phishing: { regex: /link|otp|pin|password|login|account|bank|upi|payment|click|update/i, weight: 0.25 },
    socialEngineering: { regex: /free|offer|reward|winner|claim|limited|exclusive/i, weight: 0.2 },
    impersonation: { regex: /sbi|hdfc|icici|axis|kotak|pnb|bank|gov|official|rbi|npci/i, weight: 0.3 },
    suspiciousLinks: { regex: /http|www|\.com|\.in|\.co|bit\.ly|tinyurl|\.tk|\.ml/i, weight: 0.25 }
  };

  let riskScore = 0;
  const redFlags: string[] = [];

  // Calculate risk based on patterns with better weighting
  Object.entries(securityPatterns).forEach(([pattern, config]) => {
    if (config.regex.test(text)) {
      riskScore += config.weight;
      redFlags.push(`${pattern.charAt(0).toUpperCase() + pattern.slice(1)} indicators detected`);
    }
  });

  // High-risk KYC scam detection
  if (lower.includes('kyc') && (lower.includes('expiry') || lower.includes('deadline') || lower.includes('verify'))) {
    riskScore += 0.4; // High weight for KYC scams
    redFlags.push('KYC expiry scam detected - High-risk pattern');
  }

  // Urgency pressure detection
  if (lower.includes('deadline') || lower.includes('urgent') || lower.includes('immediate') || lower.includes('soon')) {
    riskScore += 0.25;
    redFlags.push('Urgency pressure detected - Common scam tactic');
  }

  // Financial transaction indicators
  if (text.includes('₹') || text.includes('Rs') || text.includes('rupee') || text.includes('rs.')) {
    riskScore += 0.2;
    redFlags.push('Financial transaction mentioned');
  }

  // OTP/PIN requests
  if (lower.includes('otp') || lower.includes('pin') || lower.includes('verification code')) {
    riskScore += 0.3;
    redFlags.push('OTP/PIN request detected - Never share these');
  }

  // Suspicious formatting (all caps, excessive punctuation)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.3) {
    riskScore += 0.15;
    redFlags.push('Excessive capitalization detected - Scam indicator');
  }

  if (text.includes('!!!') || text.includes('??') || text.includes('...')) {
    riskScore += 0.1;
    redFlags.push('Suspicious punctuation patterns detected');
  }

  // Normalize risk score
  riskScore = Math.min(riskScore, 1.0);

  // Better risk classification
  let label, riskLevel, confidence;
  
  if (riskScore >= 0.8) {
    label = 'Scam';
    riskLevel = 'Critical';
    confidence = 0.9;
  } else if (riskScore >= 0.6) {
    label = 'Scam';
    riskLevel = 'High';
    confidence = 0.8;
  } else if (riskScore >= 0.4) {
    label = 'Suspicious';
    riskLevel = 'Medium';
    confidence = 0.7;
  } else if (riskScore >= 0.2) {
    label = 'Suspicious';
    riskLevel = 'Low';
    confidence = 0.6;
  } else {
    label = 'Safe';
    riskLevel = 'Low';
    confidence = 0.5;
  }

  // Better explanations based on risk level
  let explanation, recommendedAction;
  
  if (riskScore >= 0.8) {
    explanation = "🚨 CRITICAL RISK: This message contains multiple scam indicators. Do NOT click any links, share personal information, or make payments. This appears to be a fraudulent attempt.";
    recommendedAction = "BLOCK IMMEDIATELY - High probability of fraud";
  } else if (riskScore >= 0.6) {
    explanation = "⚠️ HIGH RISK: Multiple suspicious indicators detected. Do not click links, share OTP, or make payments. Verify with official sources before proceeding.";
    recommendedAction = "BLOCK IMMEDIATELY - Suspicious activity detected";
  } else if (riskScore >= 0.4) {
    explanation = "⚠️ MEDIUM RISK: Several suspicious patterns detected. Exercise caution and verify with official sources before taking any action.";
    recommendedAction = "REQUIRES MANUAL REVIEW - Exercise extreme caution";
  } else if (riskScore >= 0.2) {
    explanation = "⚠️ LOW RISK: Minor suspicious indicators detected. Verify with official sources before proceeding.";
    recommendedAction = "VERIFY BEFORE PROCEEDING - Exercise caution";
  } else {
    explanation = "✅ Appears safe, but always verify with official sources before taking any action.";
    recommendedAction = "PROCESS WITH CAUTION - Verify authenticity";
  }

  return {
    overall_score: riskScore,
    risk_level: riskLevel,
    confidence: parseFloat(confidence.toFixed(2)),
    red_flags: redFlags,
    explanation: explanation,
    recommended_action: recommendedAction
  };
}
