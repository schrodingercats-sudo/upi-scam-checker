#!/usr/bin/env python3
"""
Model Retraining Module
Retrains the HEFDS model with user feedback data
"""

import numpy as np
import pandas as pd
import joblib
import json
import sqlite3
from typing import List, Tuple, Optional
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from .database import db
from .simple_analyzer import SimpleUPIAnalyzer

class ModelRetrainer:
    def __init__(self, db_path: str = "feedback.db"):
        self.db_path = db_path
        self.simple_analyzer = SimpleUPIAnalyzer()
    
    def extract_features_from_text(self, text: str) -> List[float]:
        """Extract features from text using the simple analyzer's feature extraction"""
        return self.simple_analyzer.extract_features(text)
    
    def get_training_data(self) -> Tuple[Optional[np.ndarray], Optional[np.ndarray]]:
        """Get training data from database"""
        # Get feedback data from database
        training_data = db.get_training_data()
        
        if not training_data:
            print("No training data available")
            return None, None
        
        # Extract features for each text
        features_list = []
        labels = []
        
        for text, label in training_data:
            try:
                features = self.extract_features_from_text(text)
                features_list.append(features)
                labels.append(int(label))
            except Exception as e:
                print(f"Error extracting features from text: {e}")
                continue
        
        if not features_list:
            print("No valid training data after feature extraction")
            return None, None
        
        # Convert to numpy arrays
        X = np.array(features_list)
        y = np.array(labels)
        
        return X, y
    
    def retrain_model(self, model_path: str = "retrained_model.pkl") -> bool:
        """Retrain the model with feedback data"""
        try:
            print("Starting model retraining...")
            
            # Get training data
            X, y = self.get_training_data()
            
            if X is None or y is None:
                print("No training data available for retraining")
                return False
            
            print(f"Training data shape: {X.shape}, Labels shape: {y.shape}")
            
            # Check if we have enough data for both classes
            unique_labels, counts = np.unique(y, return_counts=True)
            print(f"Label distribution: {dict(zip(unique_labels, counts))}")
            
            if len(unique_labels) < 2:
                print("Not enough data for both classes, skipping retraining")
                return False
            
            # Split data for training and validation
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            # Create and train model
            model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                class_weight='balanced'
            )
            
            print("Training model...")
            model.fit(X_train, y_train)
            
            # Evaluate model
            y_pred = model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            print(f"Model retraining completed!")
            print(f"Accuracy: {accuracy:.4f}")
            print("Classification Report:")
            print(classification_report(y_test, y_pred))
            
            # Save model
            joblib.dump(model, model_path)
            print(f"Model saved to {model_path}")
            
            return True
            
        except Exception as e:
            print(f"Error during model retraining: {e}")
            return False
    
    def update_simple_analyzer_model(self, retrained_model_path: str = "retrained_model.pkl"):
        """Update the simple analyzer with the retrained model"""
        try:
            # Load the retrained model
            retrained_model = joblib.load(retrained_model_path)
            
            # Save it as the new model for the simple analyzer
            import pickle
            with open('sms_scam_model_v3.pkl', 'wb') as f:
                pickle.dump(retrained_model, f)
            
            print("Simple analyzer model updated successfully")
            return True
            
        except Exception as e:
            print(f"Error updating simple analyzer model: {e}")
            return False
    
    def process_hold_data(self):
        """Process hold data for active learning - this would be called periodically"""
        try:
            # Get hold data
            hold_data = db.get_hold_data()
            
            print(f"Processing {len(hold_data)} uncertain samples for active learning")
            
            # For now, we'll just log them
            # In a real implementation, you might want to:
            # 1. Manually review these samples
            # 2. Use a more sophisticated active learning strategy
            # 3. Periodically re-evaluate with updated model
            
            for text, analysis_result, feedback_id in hold_data:
                print(f"Hold sample: {text[:50]}...")
                
            return True
        except Exception as e:
            print(f"Error processing hold data: {e}")
            return False

def main():
    """Main function to retrain the model"""
    retrainer = ModelRetrainer()
    
    # Retrain model
    success = retrainer.retrain_model()
    
    if success:
        # Update the simple analyzer model
        retrainer.update_simple_analyzer_model()
        print("Model retraining and update completed successfully!")
    else:
        print("Model retraining failed!")

if __name__ == "__main__":
    main()