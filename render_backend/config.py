import os

class Config:
    """Configuration for the Render backend"""
    
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    # Google Gemini API
    GOOGLE_GEMINI_API_KEY = os.environ.get('GOOGLE_GEMINI_API_KEY')
    
    # Database settings (if needed later)
    DATABASE_URL = os.environ.get('DATABASE_URL')
    
    # Security settings
    CORS_ORIGINS = [
        "https://your-vercel-app.vercel.app",  # Replace with your Vercel URL
        "http://localhost:3000",  # Local development
        "http://localhost:3001"   # Alternative local port
    ]
    
    # Analysis settings
    MAX_MESSAGE_LENGTH = 1000
    ENABLE_GEMINI = bool(GOOGLE_GEMINI_API_KEY)
    
    @classmethod
    def validate(cls):
        """Validate configuration"""
        if not cls.GOOGLE_GEMINI_API_KEY:
            print("⚠️  Warning: No Google Gemini API key found")
            print("   Set GOOGLE_GEMINI_API_KEY environment variable to enable Gemini analysis")
        else:
            print("✅ Google Gemini API key configured")
        
        return True
