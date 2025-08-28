# Environment Configuration Guide

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

### OpenRouter DeepSeek Configuration
```bash
# Your OpenRouter API key for DeepSeek-R1
OPENROUTER_API_KEY=your_openrouter_api_key_here

# DeepSeek model (free tier)
DEEPSEEK_MODEL=deepseek/deepseek-r1-0528:free
```

### Google Gemini API
```bash
# Your Google Gemini API key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Optional APIs (for enhanced features)
```bash
# Truecaller API for phone number lookup
TRUECALLER_API_KEY=your_truecaller_api_key_here

# Google Safe Browsing API for URL threat detection
GOOGLE_SAFE_BROWSING_API_KEY=your_safe_browsing_api_key_here

# VirusTotal API for URL threat intelligence
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
```

## How to Get API Keys

### 1. OpenRouter API Key
1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up/Login to your account
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy the key to your `.env.local` file

### 2. Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env.local` file

## File Structure
```
upi-checker/
├── .env.local          # Create this file
├── app/
├── components/
└── ...
```

## Important Notes
- **Never commit** `.env.local` to version control
- The file is already in `.gitignore`
- Restart your development server after adding environment variables
- Test the APIs individually before running the full pipeline

## Testing Your Setup
1. Add the environment variables
2. Restart your dev server: `npm run dev`
3. Try analyzing a test SMS message
4. Check the console for API call logs
5. Verify DeepSeek and Gemini are working

## Troubleshooting
- **401 Unauthorized**: Check your API key is correct
- **Model not found**: Verify the model name matches exactly
- **Rate limits**: Check your OpenRouter usage limits
- **CORS issues**: Ensure you're calling from the correct domain
