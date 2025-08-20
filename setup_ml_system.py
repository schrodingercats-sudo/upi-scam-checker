#!/usr/bin/env python3
"""
🚀 Complete ML System Setup for SMS Scam Detection
Orchestrates the entire pipeline: data collection → training → integration
"""

import os
import sys
import subprocess
import json
import time
from pathlib import Path

def run_command(command: str, description: str) -> bool:
    """Run a command and return success status"""
    print(f"\n🔧 {description}")
    print(f"   Running: {command}")
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"   ✅ Success: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"   ❌ Failed: {e.stderr.strip()}")
        return False

def check_python_dependencies() -> bool:
    """Check if required Python packages are installed"""
    print("🔍 Checking Python dependencies...")
    
    required_packages = [
        'scikit-learn', 'pandas', 'numpy', 'requests', 
        'joblib', 'beautifulsoup4', 'lxml'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"   ✅ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"   ❌ {package} (missing)")
    
    if missing_packages:
        print(f"\n⚠️ Missing packages: {', '.join(missing_packages)}")
        print("   Installing missing packages...")
        
        install_command = f"pip install {' '.join(missing_packages)}"
        if not run_command(install_command, "Installing missing Python packages"):
            return False
    
    return True

def collect_training_data() -> bool:
    """Run the web scraper to collect training data"""
    print("\n🌐 Step 1: Collecting Training Data")
    print("=" * 50)
    
    if not run_command("python web_scraper.py", "Running web scraper"):
        print("   ⚠️ Web scraper failed, but continuing with synthetic data...")
        return True  # Continue anyway since we have synthetic data
    
    # Check if data was collected
    if os.path.exists('collected_sms_data.json'):
        with open('collected_sms_data.json', 'r') as f:
            data = json.load(f)
        print(f"   📊 Collected {len(data)} SMS samples")
        return True
    else:
        print("   ⚠️ No data file found, but continuing...")
        return True

def train_ml_model() -> bool:
    """Train the ML model with collected data"""
    print("\n🤖 Step 2: Training ML Model")
    print("=" * 50)
    
    if not run_command("python train_ml_model.py", "Training ML model"):
        return False
    
    # Check if model files were created
    required_files = ['sms_scam_model.pkl', 'sms_scam_scaler.pkl', 'feature_names.json']
    missing_files = [f for f in required_files if not os.path.exists(f)]
    
    if missing_files:
        print(f"   ❌ Missing model files: {', '.join(missing_files)}")
        return False
    
    print("   ✅ ML model training completed successfully!")
    return True

def test_ml_integration() -> bool:
    """Test the ML integration system"""
    print("\n🧪 Step 3: Testing ML Integration")
    print("=" * 50)
    
    if not run_command("python ml_integration.py", "Testing ML integration"):
        return False
    
    print("   ✅ ML integration testing completed!")
    return True

def create_nextjs_integration() -> bool:
    """Create the Next.js API integration files"""
    print("\n🔗 Step 4: Setting up Next.js Integration")
    print("=" * 50)
    
    # Check if Next.js API route exists
    api_route_path = "app/api/analyze-sms/route.ts"
    if os.path.exists(api_route_path):
        print("   ✅ Next.js API route already exists")
        return True
    else:
        print("   ❌ Next.js API route not found")
        print("   Please ensure the API route is properly created")
        return False

def run_system_tests() -> bool:
    """Run comprehensive system tests"""
    print("\n🧪 Step 5: Running System Tests")
    print("=" * 50)
    
    # Test 1: Check if model files exist
    print("   🔍 Checking model files...")
    model_files = ['sms_scam_model.pkl', 'sms_scam_scaler.pkl', 'feature_names.json']
    for file in model_files:
        if os.path.exists(file):
            size = os.path.getsize(file) / 1024  # KB
            print(f"      ✅ {file} ({size:.1f} KB)")
        else:
            print(f"      ❌ {file} (missing)")
            return False
    
    # Test 2: Check if training data exists
    print("   🔍 Checking training data...")
    if os.path.exists('collected_sms_data.json'):
        with open('collected_sms_data.json', 'r') as f:
            data = json.load(f)
        print(f"      ✅ Training data: {len(data)} samples")
    else:
        print("      ❌ Training data not found")
        return False
    
    # Test 3: Check Next.js integration
    print("   🔍 Checking Next.js integration...")
    if os.path.exists('app/api/analyze-sms/route.ts'):
        print("      ✅ Next.js API route exists")
    else:
        print("      ❌ Next.js API route missing")
        return False
    
    print("   ✅ All system tests passed!")
    return True

def create_deployment_guide() -> bool:
    """Create a deployment guide for the ML system"""
    print("\n📚 Step 6: Creating Deployment Guide")
    print("=" * 50)
    
    deployment_guide = """# 🚀 ML-Powered SMS Scam Detection System - Deployment Guide

## Overview
This system combines web scraping, machine learning, and Next.js to provide advanced SMS scam detection.

## System Components

### 1. Data Collection (`web_scraper.py`)
- Collects SMS examples from various sources
- Generates synthetic data for training
- Outputs: `collected_sms_data.json`, `collected_sms_data.csv`

### 2. ML Model Training (`train_ml_model.py`)
- Trains Random Forest classifier on collected data
- Uses 12 features for SMS analysis
- Outputs: `sms_scam_model.pkl`, `sms_scam_scaler.pkl`, `feature_names.json`

### 3. ML Integration (`ml_integration.py`)
- Provides Python interface for the trained model
- Includes testing and validation functions

### 4. Next.js API (`app/api/analyze-sms/route.ts`)
- REST API endpoint for SMS analysis
- Integrates ML model with web frontend
- Fallback to rule-based analysis if ML fails

## Deployment Steps

### Prerequisites
```bash
# Install Python dependencies
pip install -r requirements.txt

# Ensure Node.js and npm are installed
node --version
npm --version
```

### 1. Setup ML System
```bash
# Run the complete setup
python setup_ml_system.py

# Or run steps individually:
python web_scraper.py          # Collect data
python train_ml_model.py       # Train model
python ml_integration.py       # Test integration
```

### 2. Deploy to Vercel
```bash
# Build the Next.js app
npm run build

# Deploy (if using Vercel CLI)
vercel --prod

# Or push to GitHub for automatic Vercel deployment
git add -A
git commit -m "Add ML-powered SMS scam detection"
git push origin main
```

## Model Performance
- **Algorithm**: Random Forest Classifier
- **Features**: 12 engineered features
- **Training Data**: 50+ SMS samples (expandable)
- **Accuracy**: High (varies based on training data quality)

## API Usage
```javascript
// Example API call
const response = await fetch('/api/analyze-sms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sms_text: "Your SMS text here",
    type: "sms"
  })
});

const result = await response.json();
// result: { label, confidence, redFlags, advice, riskLevel }
```

## Maintenance
- Retrain model periodically with new data
- Update scam patterns and keywords
- Monitor API performance and accuracy
- Expand training dataset with real examples

## Troubleshooting
- Ensure Python 3.8+ is installed
- Check all model files exist before deployment
- Verify API route is properly configured
- Test ML integration before deploying

## Security Notes
- Model files contain trained data - keep secure
- API includes rate limiting and validation
- Fallback analysis ensures system reliability
- No sensitive data is stored or transmitted

---
Generated by setup_ml_system.py
"""
    
    try:
        with open('ML_DEPLOYMENT_GUIDE.md', 'w', encoding='utf-8') as f:
            f.write(deployment_guide)
        print("   ✅ Deployment guide created: ML_DEPLOYMENT_GUIDE.md")
        return True
    except Exception as e:
        print(f"   ❌ Failed to create deployment guide: {str(e)}")
        return False

def main():
    """Main setup function"""
    print("🚀 Complete ML System Setup for SMS Scam Detection")
    print("=" * 60)
    print("This script will set up the entire ML pipeline:")
    print("1. Data Collection (Web Scraping)")
    print("2. ML Model Training")
    print("3. Integration Testing")
    print("4. Next.js API Setup")
    print("5. System Validation")
    print("6. Deployment Guide Creation")
    print("=" * 60)
    
    # Check Python dependencies
    if not check_python_dependencies():
        print("\n❌ Python dependency check failed. Please install required packages.")
        return False
    
    # Step 1: Collect training data
    if not collect_training_data():
        print("\n❌ Data collection failed.")
        return False
    
    # Step 2: Train ML model
    if not train_ml_model():
        print("\n❌ ML model training failed.")
        return False
    
    # Step 3: Test ML integration
    if not test_ml_integration():
        print("\n❌ ML integration testing failed.")
        return False
    
    # Step 4: Check Next.js integration
    if not create_nextjs_integration():
        print("\n❌ Next.js integration setup failed.")
        return False
    
    # Step 5: Run system tests
    if not run_system_tests():
        print("\n❌ System tests failed.")
        return False
    
    # Step 6: Create deployment guide
    if not create_deployment_guide():
        print("\n❌ Deployment guide creation failed.")
        return False
    
    # Success!
    print("\n🎉 ML System Setup Completed Successfully!")
    print("=" * 60)
    print("✅ All components are ready:")
    print("   📊 Training data collected")
    print("   🤖 ML model trained and saved")
    print("   🔗 Integration tested")
    print("   🌐 Next.js API configured")
    print("   📚 Deployment guide created")
    print("\n🚀 Ready to deploy to Vercel!")
    print("\n📁 Generated files:")
    print("   - collected_sms_data.json (training data)")
    print("   - sms_scam_model.pkl (trained model)")
    print("   - sms_scam_scaler.pkl (feature scaler)")
    print("   - feature_names.json (feature definitions)")
    print("   - ML_DEPLOYMENT_GUIDE.md (deployment guide)")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
