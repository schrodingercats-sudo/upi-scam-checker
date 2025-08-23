#!/usr/bin/env python3
"""
Deployment script for Render Python backend
"""

import os
import shutil
import subprocess

def setup_render_backend():
    """Set up the Render backend directory"""
    print("🚀 Setting up Render Python backend...")
    
    # Create necessary directories
    os.makedirs('render_backend', exist_ok=True)
    
    # Copy engine files to render_backend
    engine_files = [
        'engine/analyzer.py',
        'engine/entities.py', 
        'engine/rules.py',
        'engine/config.py',
        'engine/phone_registry.py',
        'utils/preprocess.py'
    ]
    
    for file_path in engine_files:
        if os.path.exists(file_path):
            # Create directory structure
            dest_dir = os.path.join('render_backend', os.path.dirname(file_path))
            os.makedirs(dest_dir, exist_ok=True)
            
            # Copy file
            shutil.copy2(file_path, os.path.join('render_backend', file_path))
            print(f"✅ Copied {file_path}")
        else:
            print(f"⚠️  Warning: {file_path} not found")
    
    # Copy ML model files
    ml_files = [
        'sms_scam_model_v3.pkl',
        'sms_scam_scaler_v3.pkl', 
        'feature_names_v3.json'
    ]
    
    for file_path in ml_files:
        if os.path.exists(file_path):
            shutil.copy2(file_path, os.path.join('render_backend', file_path))
            print(f"✅ Copied {file_path}")
        else:
            print(f"⚠️  Warning: {file_path} not found")
    
    print("\n🎯 Render backend setup complete!")
    print("\n📋 Next steps:")
    print("1. Go to render.com and create a new Web Service")
    print("2. Connect your GitHub repository")
    print("3. Set root directory to: render_backend")
    print("4. Set build command to: pip install -r requirements.txt")
    print("5. Set start command to: gunicorn app:app")
    print("6. Deploy!")
    print("\n🔗 Your backend will be available at: https://your-app-name.onrender.com")

if __name__ == "__main__":
    setup_render_backend()
