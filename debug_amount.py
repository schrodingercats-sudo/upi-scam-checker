#!/usr/bin/env python3
import re

def test_amount_detection():
    text = "Your bank credit 12000 INR click on this link"
    text_lower = text.lower()
    
    print(f"Text: {text}")
    print(f"Lower: {text_lower}")
    
    # Test both patterns
    pattern1 = re.search(r'(₹|rs\.?|inr)\s?\d+[\d,]*(?:\.\d+)?', text_lower)
    pattern2 = re.search(r'\d+[\d,]*(?:\.\d+)?\s*(?:inr|rs\.?|₹)', text_lower)
    
    print(f"Pattern 1 (₹|rs|inr + number): {pattern1}")
    print(f"Pattern 2 (number + inr|rs|₹): {pattern2}")
    
    # Test the exact logic from feature extraction
    amount_detected = bool(re.search(r'(₹|rs\.?|inr)\s?\d+[\d,]*(?:\.\d+)?', text_lower)) or bool(re.search(r'\d+[\d,]*(?:\.\d+)?\s*(?:inr|rs\.?|₹)', text_lower))
    print(f"Combined amount detection: {amount_detected}")
    
    # Test individual parts
    print(f"Contains '12000': {'12000' in text_lower}")
    print(f"Contains 'inr': {'inr' in text_lower}")
    print(f"Both present: {'12000' in text_lower and 'inr' in text_lower}")

if __name__ == "__main__":
    test_amount_detection()
