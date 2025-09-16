#!/usr/bin/env python3
"""
Script to trigger model retraining with feedback data
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'render_backend'))

from render_backend.engine.retrain_model import ModelRetrainer

def trigger_retraining():
    """Trigger model retraining with feedback data"""
    print("Triggering Model Retraining")
    print("=" * 30)
    
    # Create model retrainer
    retrainer = ModelRetrainer()
    
    # Retrain model
    print("Starting model retraining...")
    success = retrainer.retrain_model()
    
    if success:
        print("Model retraining completed successfully!")
        print("Updating simple analyzer model...")
        update_success = retrainer.update_simple_analyzer_model()
        if update_success:
            print("Simple analyzer model updated successfully!")
        else:
            print("Failed to update simple analyzer model")
    else:
        print("Model retraining failed!")
        print("This might be because there's not enough training data or not enough samples from both classes.")

if __name__ == "__main__":
    trigger_retraining()