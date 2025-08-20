#!/usr/bin/env python3
"""
🧪 Quick Test Script for Real Dataset
Tests the ML system with your upi_sms_whatsapp_dataset_seed.csv
"""

import pandas as pd
import json
import os

def test_dataset_loading():
    """Test if the real dataset can be loaded correctly"""
    
    print("🧪 Testing Real Dataset Loading")
    print("=" * 50)
    
    try:
        # Check if dataset exists
        if not os.path.exists('upi_sms_whatsapp_dataset_seed.csv'):
            print("❌ Dataset file not found: upi_sms_whatsapp_dataset_seed.csv")
            return False
        
        # Load dataset
        df = pd.read_csv('upi_sms_whatsapp_dataset_seed.csv')
        
        print(f"✅ Dataset loaded successfully!")
        print(f"📊 Total samples: {len(df)}")
        print(f"🏷️ Columns: {list(df.columns)}")
        
        # Check data quality
        print(f"\n📈 Data Quality Check:")
        print(f"   Labels: {df['label'].value_counts().to_dict()}")
        print(f"   Channels: {df['channel'].value_counts().to_dict()}")
        print(f"   Categories: {df['category'].value_counts().to_dict()}")
        
        # Show sample messages
        print(f"\n📱 Sample Messages:")
        for i, (_, row) in enumerate(df.head(3).iterrows(), 1):
            status = "✅ LEGITIMATE" if row['label'] == 'legit' else "🚨 SCAM"
            print(f"   {i}. {status} ({row['channel']} - {row['category']})")
            print(f"      {row['text'][:80]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading dataset: {str(e)}")
        return False

def test_feature_extraction():
    """Test feature extraction with real dataset examples"""
    
    print(f"\n🔍 Testing Feature Extraction")
    print("=" * 50)
    
    try:
        # Load dataset
        df = pd.read_csv('upi_sms_whatsapp_dataset_seed.csv')
        
        # Test feature extraction (simplified version)
        def extract_basic_features(text):
            text_lower = text.lower()
            
            features = {
                'length': len(text),
                'word_count': len(text.split()),
                'contains_bank': any(bank in text_lower for bank in ['sbi', 'icici', 'hdfc', 'axis', 'pnb', 'canara']),
                'contains_gov': any(gov in text_lower for gov in ['rbi', 'npci', 'upi', 'gov.in']),
                'contains_url': 'http' in text_lower or 'www.' in text_lower,
                'contains_otp': 'otp' in text_lower,
                'contains_amount': '₹' in text or 'inr' in text_lower,
                'urgency_words': sum(1 for word in ['urgent', 'immediate', 'now', 'quick'] if word in text_lower)
            }
            
            return features
        
        # Test with a few examples
        test_examples = df.head(5)
        
        for i, (_, row) in enumerate(test_examples.iterrows(), 1):
            features = extract_basic_features(row['text'])
            
            print(f"\n   Example {i}: {row['label'].upper()} ({row['channel']})")
            print(f"      Text: {row['text'][:60]}...")
            print(f"      Features: Length={features['length']}, Words={features['word_count']}")
            print(f"      Bank: {features['contains_bank']}, Gov: {features['contains_gov']}")
            print(f"      URL: {features['contains_url']}, OTP: {features['contains_otp']}")
            print(f"      Amount: {features['contains_amount']}, Urgency: {features['urgency_words']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in feature extraction: {str(e)}")
        return False

def test_ml_pipeline():
    """Test the complete ML pipeline"""
    
    print(f"\n🤖 Testing ML Pipeline")
    print("=" * 50)
    
    try:
        # Check if ML files exist
        required_files = ['sms_scam_model.pkl', 'sms_scam_scaler.pkl', 'feature_names.json']
        missing_files = [f for f in required_files if not os.path.exists(f)]
        
        if missing_files:
            print(f"⚠️ ML model files missing: {missing_files}")
            print("   Run 'python train_ml_model.py' to train the model first")
            return False
        
        print("✅ ML model files found")
        
        # Try to import and test ML integration
        try:
            from ml_integration import MLScamDetector
            
            detector = MLScamDetector()
            if detector.model:
                print("✅ ML detector initialized successfully")
                
                # Test with a sample from dataset
                df = pd.read_csv('upi_sms_whatsapp_dataset_seed.csv')
                sample_text = df.iloc[0]['text']
                
                result = detector.predict_sms(sample_text)
                if 'error' not in result:
                    print(f"✅ ML prediction successful")
                    print(f"   Sample: {sample_text[:60]}...")
                    print(f"   Prediction: {result['label']} (Confidence: {result['confidence']})")
                else:
                    print(f"❌ ML prediction failed: {result['error']}")
                    return False
            else:
                print("❌ ML detector not properly initialized")
                return False
                
        except ImportError as e:
            print(f"❌ Error importing ML integration: {str(e)}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error in ML pipeline: {str(e)}")
        return False

def main():
    """Main test function"""
    
    print("🧪 Real Dataset ML System Test")
    print("=" * 60)
    print("Testing your upi_sms_whatsapp_dataset_seed.csv with our ML system")
    print("=" * 60)
    
    tests = [
        ("Dataset Loading", test_dataset_loading),
        ("Feature Extraction", test_feature_extraction),
        ("ML Pipeline", test_ml_pipeline)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n🔧 Running: {test_name}")
        try:
            result = test_func()
            results.append((test_name, result))
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"   {status}")
        except Exception as e:
            print(f"   ❌ ERROR: {str(e)}")
            results.append((test_name, False))
    
    # Summary
    print(f"\n📊 Test Summary")
    print("=" * 40)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"   {test_name}: {status}")
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your real dataset is ready for ML training!")
        print("\n🚀 Next steps:")
        print("   1. Run: python train_ml_model.py")
        print("   2. Test: python ml_integration.py")
        print("   3. Deploy: npm run build")
    else:
        print("⚠️ Some tests failed. Please check the errors above.")
        print("\n🔧 Troubleshooting:")
        print("   1. Ensure upi_sms_whatsapp_dataset_seed.csv exists")
        print("   2. Check file permissions and format")
        print("   3. Install required dependencies: pip install -r requirements.txt")

if __name__ == "__main__":
    main()
