#!/usr/bin/env python3
"""
Script to prepare render_backend directory for deployment
"""

import os
import shutil
import json

def copy_ml_files():
    """Copy ML model files to render_backend"""
    ml_files = [
        'sms_scam_model_v3.pkl',
        'sms_scam_scaler_v3.pkl', 
        'feature_names_v3.json'
    ]
    
    print("📁 Copying ML model files...")
    for file in ml_files:
        if os.path.exists(file):
            shutil.copy2(file, f'render_backend/{file}')
            print(f"✅ Copied {file}")
        else:
            print(f"⚠️ Warning: {file} not found")

def copy_engine_files():
    """Copy engine files to render_backend"""
    engine_files = [
        'engine/analyzer.py',
        'engine/rules.py',
        'engine/config.py',
        'engine/entities.py',
        'engine/phone_registry.py'
    ]
    
    print("📁 Copying engine files...")
    for file in engine_files:
        if os.path.exists(file):
            # Create engine directory if it doesn't exist
            os.makedirs('render_backend/engine', exist_ok=True)
            shutil.copy2(file, f'render_backend/{file}')
            print(f"✅ Copied {file}")
        else:
            print(f"⚠️ Warning: {file} not found")

def copy_utils():
    """Copy utility files"""
    utils_files = [
        'utils/preprocess.py'
    ]
    
    print("📁 Copying utility files...")
    for file in utils_files:
        if os.path.exists(file):
            # Create utils directory if it doesn't exist
            os.makedirs('render_backend/utils', exist_ok=True)
            shutil.copy2(file, f'render_backend/{file}')
            print(f"✅ Copied {file}")
        else:
            print(f"⚠️ Warning: {file} not found")

def create_deployment_info():
    """Create deployment info file"""
    info = {
        "deployment_date": "2025-01-27",
        "version": "2.0.0",
        "features": [
            "ML Model v3",
            "Rule-Based Analysis", 
            "Gemini 2-Step Verification",
            "Fast2SMS Whitelist"
        ],
        "files_included": [
            "app.py",
            "requirements_simple.txt",
            "runtime.txt",
            "gunicorn.conf.py",
            "engine/simple_analyzer.py",
            "ML model files (.pkl, .json)"
        ]
    }
    
    with open('render_backend/DEPLOYMENT_INFO.json', 'w') as f:
        json.dump(info, f, indent=2)
    
    print("✅ Created DEPLOYMENT_INFO.json")

def main():
    print("🚀 Preparing Render Backend for Deployment")
    print("=" * 50)
    
    # Ensure render_backend directory exists
    os.makedirs('render_backend', exist_ok=True)
    
    # Copy all necessary files
    copy_ml_files()
    copy_engine_files()
    copy_utils()
    create_deployment_info()
    
    print("\n✅ Render backend preparation complete!")
    print("\n📋 Next steps:")
    print("1. Go to render.com and create a new Web Service")
    print("2. Connect your GitHub repository")
    print("3. Set Root Directory to: render_backend")
    print("4. Set Build Command to: pip install -r requirements_simple.txt")
    print("5. Set Start Command to: gunicorn app:app")
    print("6. Add environment variable: GOOGLE_GEMINI_API_KEY")
    print("7. Deploy!")

if __name__ == "__main__":
    main()
