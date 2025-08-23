# 🚀 Google Gemini API Integration Setup

This guide explains how to integrate Google Gemini AI with your UPI Scam Detector for enhanced scam detection capabilities.

## 🔑 Getting Your Google Gemini API Key

### Step 1: Visit Google AI Studio
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click on "Get API key" or "Create API key"

### Step 2: Create API Key
1. Click "Create API Key"
2. Give your key a name (e.g., "UPI Scam Detector")
3. Copy the generated API key (starts with `AIza...`)

### Step 3: Set Environment Variable

#### For Local Development:
```bash
# Windows PowerShell
$env:GOOGLE_GEMINI_API_KEY="your-api-key-here"

# Windows Command Prompt
set GOOGLE_GEMINI_API_KEY=your-api-key-here

# Linux/Mac
export GOOGLE_GEMINI_API_KEY="your-api-key-here"
```

#### For Render Backend:
1. Go to your Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add new variable:
   - **Key**: `GOOGLE_GEMINI_API_KEY`
   - **Value**: `your-api-key-here`
5. Click "Save Changes"
6. Redeploy your service

#### For Vercel Frontend:
1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add new variable:
   - **Name**: `GOOGLE_GEMINI_API_KEY`
   - **Value**: `your-api-key-here`
5. Click "Save"
6. Redeploy

## 🧪 Testing the Integration

### Test 1: Local Testing
```bash
# Set your API key
export GOOGLE_GEMINI_API_KEY="your-api-key-here"

# Run the enhanced analyzer test
python test_enhanced_analyzer.py
```

### Test 2: Backend Testing
```bash
# Test your Render backend directly
curl -X POST https://your-app.onrender.com/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Your bank credit 12000 INR click on this link", "type": "sms"}'
```

### Test 3: Frontend Testing
1. Go to your live Vercel website
2. Enter the test message: "Your bank credit 12000 INR click on this link"
3. Click analyze
4. Should show: **SCAM with 99% confidence** 🚨

## 🔍 How It Works

### 1. **Immediate Blocking** (Highest Priority)
- Catches obvious scam patterns instantly
- 99% confidence, cannot be bypassed
- Examples: "your bank credit", "click on this link"

### 2. **ML Model Analysis**
- Uses your trained ML model
- 40% weight in final decision
- Detects patterns from training data

### 3. **Rule-based Analysis**
- Applies security rules
- 30% weight in final decision
- Checks for suspicious patterns

### 4. **Google Gemini AI Analysis**
- Advanced AI-powered analysis
- 30% weight in final decision
- Provides detailed insights and recommendations

### 5. **Combined Decision**
- Weights all three analyses
- Provides comprehensive risk assessment
- Includes detailed explanations

## 📊 Expected Results

### With Gemini API Key:
```
🎯 Final Result: Critical (99.0%)
⚡ Method: enhanced_hybrid
🧠 Gemini Summary: This message contains multiple scam indicators...
📊 ML Confidence: 95.2%
📋 Rule Confidence: 98.0%
🧠 Gemini Confidence: 100.0%
```

### Without Gemini API Key:
```
🎯 Final Result: Critical (96.7%)
⚡ Method: enhanced_hybrid
📊 ML Confidence: 95.2%
📋 Rule Confidence: 98.0%
⚠️ Gemini Analysis: Unavailable
```

## 🛡️ Security Features

### Immediate Blocking Patterns:
- Bank credit/debit messages with links
- Urgent action requests
- Account suspension notices
- OTP verification requests
- Suspicious URLs with action words

### Enhanced Detection:
- Character substitution attempts
- URL obfuscation
- Domain spoofing
- Unusual spacing/punctuation
- Social engineering tactics

## 💰 Cost Considerations

- **Google Gemini API**: 
  - Free tier: 15 requests/minute
  - Paid: $0.0005 per 1K characters input
  - Typical UPI message: ~100 characters = $0.00005 per message

- **Estimated monthly cost**:
  - 1000 messages/day = ~$1.50/month
  - 100 messages/day = ~$0.15/month

## 🚨 Troubleshooting

### Common Issues:

1. **"Gemini analysis failed"**
   - Check API key is correct
   - Verify API key has proper permissions
   - Check internet connectivity

2. **"Enhanced analyzer not available"**
   - Ensure all dependencies are installed
   - Check Python path and imports
   - Verify engine modules are accessible

3. **"No JSON found in Gemini response"**
   - Gemini sometimes includes extra text
   - The system automatically extracts JSON
   - If persistent, check API key validity

### Debug Commands:
```bash
# Check if Gemini package is installed
pip list | grep google-generativeai

# Test Gemini API directly
python -c "
import google.generativeai as genai
genai.configure(api_key='your-key')
model = genai.GenerativeModel('gemini-1.5-flash')
response = model.generate_content('Hello')
print('Gemini working:', response.text)
"
```

## 🎯 Next Steps

1. **Get your Gemini API key** from Google AI Studio
2. **Set environment variables** in Render and Vercel
3. **Test the integration** with the test script
4. **Deploy and test** on your live website
5. **Monitor performance** and adjust weights if needed

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your API key is valid
3. Test with the provided test scripts
4. Check Render and Vercel logs for errors

---

**🎉 Congratulations!** You now have a state-of-the-art UPI scam detector combining ML, rules, and Google's latest AI technology!
