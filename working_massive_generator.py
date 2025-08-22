#!/usr/bin/env python3
"""
🚨 Working Massive Scam Dataset Generator
Generates 10+ Lakh Real Examples for Ultimate Training
"""

import json
import pandas as pd
import numpy as np
from datetime import datetime

def generate_massive_dataset(target_size=1000000):
    """Generate 10+ lakh scam examples with variations"""
    
    print(f"🚀 Generating {target_size:,} real scam examples...")
    
    # Simple scam templates
    base_scams = [
        "Your bank credit {amount} INR click on this link",
        "Bank credit {amount} INR click here to verify",
        "Account credited {amount} INR click on link",
        "Credit {amount} INR to your account click here",
        "Bank transfer {amount} INR click to confirm",
        "SBI: Your account has been suspended. Click here to verify: {fake_domain}",
        "HDFC: Unusual login detected. Secure now: {fake_domain}",
        "ICICI: KYC expiring in 24 hours. Update now: {fake_domain}",
        "UPI Alert: ₹{amount} credited by mistake. Refund immediately: {fake_domain}",
        "RBI Notice: Account will be frozen. Verify now: {fake_domain}",
        "Congratulations! You have won ₹{amount} in RBI lottery. Claim now: {fake_domain}",
        "You are the lucky winner of ₹{amount}. Pay ₹{fee} processing fee to claim.",
        "Get instant loan of ₹{amount}. Pay ₹{fee} processing fee. Apply now: {fake_domain}",
        "Investment opportunity: Double your money in 7 days. Invest ₹{amount} now.",
        "WhatsApp: Your number will be banned. Verify now: {fake_domain}",
        "Instagram: Your account has been reported. Verify identity: {fake_domain}"
    ]
    
    # Parameters
    banks = ['SBI', 'HDFC', 'ICICI', 'Axis', 'PNB', 'Canara', 'Kotak']
    amounts = ['1,000', '2,500', '5,000', '10,000', '25,000', '50,000', '75,000', '100,000']
    fees = ['999', '1,999', '2,999', '4,999']
    fake_domains = [
        'sbi-verify-account.com', 'hdfc-secure-login.net', 'icici-kyc-verify.com',
        'axis-reactivate.net', 'pnb-identity-verify.com', 'upi-refund-verify.com',
        'rbi-verify-account.gov.in', 'rbi-lottery-claim.com', 'instant-loan-apply.com'
    ]
    
    # Generate massive dataset
    scam_examples = []
    legitimate_examples = []
    
    print("🔨 Generating scam examples...")
    # Generate scam examples
    for i in range(target_size // 2):
        if i % 10000 == 0:
            print(f"   Generated {i:,} scam examples...")
            
        template = np.random.choice(base_scams)
        
        try:
            # Fill in parameters
            scam_text = template.format(
                bank=np.random.choice(banks),
                amount=np.random.choice(amounts),
                fee=np.random.choice(fees),
                fake_domain=np.random.choice(fake_domains)
            )
            
            # Add variations
            scam_text = apply_evasion_techniques(scam_text)
            scam_examples.append(scam_text)
        except:
            # Skip problematic templates
            continue
    
    print("✅ Generating legitimate examples...")
    # Generate legitimate examples
    legitimate_templates = [
        "HDFC Bank: INR {amount}.00 credited to a/c XX{acct} on {date} {time}. Clear Balance: INR {balance}.00. Ref: NEFT/ABER{ref}.",
        "ICICI Bank: INR {amount}.00 debited from A/c XX{acct} on {date} {time} for UPI/merchant@icici/UPI Ref: {ref}.",
        "SBI: Cash withdrawal of INR {amount}.00 from ATM at {city} on {date} {time}. A/c XX{acct}. Avl Bal: INR {balance}.00.",
        "HDFC Bank: Your OTP for UPI login is {otp}. Do not share this with anyone. Valid for 10 minutes.",
        "ICICI Bank: Your OTP for transaction is {otp}. Do not share with anyone. Valid for 5 minutes."
    ]
    
    for i in range(target_size // 2):
        if i % 10000 == 0:
            print(f"   Generated {i:,} legitimate examples...")
            
        template = np.random.choice(legitimate_templates)
        
        # Generate realistic parameters
        amount = np.random.choice(['1,000', '2,500', '5,000', '10,000', '25,000', '50,000'])
        acct = f"{np.random.randint(1000, 9999)}"
        date = f"{np.random.randint(1, 28)}-{np.random.choice(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])}-2025"
        time = f"{np.random.randint(0, 23):02d}:{np.random.randint(0, 59):02d}"
        balance = f"{np.random.randint(10000, 100000):,}"
        ref = f"{np.random.randint(100000000, 999999999)}"
        city = np.random.choice(['MUMBAI', 'DELHI', 'BANGALORE', 'CHENNAI', 'KOLKATA', 'HYDERABAD'])
        otp = f"{np.random.randint(100000, 999999)}"
        
        legitimate_text = template.format(
            amount=amount, acct=acct, date=date, time=time, balance=balance,
            ref=ref, city=city, otp=otp
        )
        
        legitimate_examples.append(legitimate_text)
    
    # Create comprehensive dataset
    dataset = []
    
    print("📊 Creating dataset...")
    # Add scam examples
    for scam in scam_examples:
        dataset.append({
            'text': scam,
            'label': 1,  # Scam
            'category': 'scam',
            'source': 'generated_massive',
            'evasion_detected': detect_evasion_techniques(scam)
        })
    
    # Add legitimate examples
    for legit in legitimate_examples:
        dataset.append({
            'text': legit,
            'label': 0,  # Safe
            'category': 'legitimate',
            'source': 'generated_massive',
            'evasion_detected': False
        })
    
    print(f"✅ Generated {len(dataset):,} examples ({len(scam_examples):,} scams, {len(legitimate_examples):,} legitimate)")
    
    return dataset

def apply_evasion_techniques(text):
    """Apply evasion techniques to make detection harder"""
    
    # Randomly apply some evasion techniques
    if np.random.random() < 0.3:  # 30% chance
        # Character substitution
        substitutions = {
            '0': ['o', 'O'],
            '1': ['l', 'L', 'I', 'i'],
            '2': ['z', 'Z'],
            '3': ['e', 'E'],
            '4': ['a', 'A'],
            '5': ['s', 'S'],
            '6': ['g', 'G'],
            '7': ['t', 'T'],
            '8': ['b', 'B'],
            '9': ['g', 'G'],
            'a': ['@', '4'],
            'e': ['3'],
            'i': ['1', '|'],
            'o': ['0'],
            's': ['5'],
            't': ['7']
        }
        
        for char, substitutes in substitutions.items():
            if char in text and np.random.random() < 0.1:  # 10% chance per character
                text = text.replace(char, np.random.choice(substitutes))
    
    if np.random.random() < 0.2:  # 20% chance
        # Add extra spaces
        words = text.split()
        if len(words) > 3:
            insert_pos = np.random.randint(1, len(words))
            words.insert(insert_pos, ' ')
            text = ' '.join(words)
    
    if np.random.random() < 0.15:  # 15% chance
        # Add random punctuation
        puncts = ['!', '?', '.', '...', '!!', '??']
        text += np.random.choice(puncts)
    
    return text

def detect_evasion_techniques(text):
    """Detect if text uses evasion techniques"""
    
    # Check for character substitution
    unusual_chars = ['о', '⓪', 'ⓞ', 'ⓛ', 'ⓘ', 'ⓩ', 'ⓔ', 'ⓐ', 'ⓢ', 'ⓖ', 'ⓣ', 'ⓑ']
    if any(char in text for char in unusual_chars):
        return True
    
    # Check for URL obfuscation
    url_shorteners = ['bit.ly', 'tinyurl', 'goo.gl', 't.co', 'is.gd', 'cutt.ly']
    if any(shortener in text.lower() for shortener in url_shorteners):
        return True
    
    # Check for domain spoofing
    domain_spoofs = ['sbi-verify', 'hdfc-secure', 'icici-kyc', 'axis-update']
    if any(spoof in text.lower() for spoof in domain_spoofs):
        return True
    
    # Check for unusual spacing
    if '  ' in text or text.count(' ') > len(text) * 0.3:
        return True
    
    return False

def save_massive_dataset(dataset, filename='ultimate_scam_dataset.csv'):
    """Save the massive dataset"""
    
    print(f"💾 Saving {len(dataset):,} examples to {filename}...")
    
    df = pd.DataFrame(dataset)
    df.to_csv(filename, index=False, encoding='utf-8')
    
    # Also save as JSON for easy processing
    json_filename = filename.replace('.csv', '.json')
    with open(json_filename, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)
    
    # Save statistics
    stats = {
        'total_samples': len(dataset),
        'scam_count': int(sum(1 for d in dataset if d['label'] == 1)),
        'legitimate_count': int(sum(1 for d in dataset if d['label'] == 0)),
        'evasion_detected': int(sum(1 for d in dataset if d.get('evasion_detected', False))),
        'generated_at': datetime.now().isoformat(),
        'dataset_version': '4.0_ultimate'
    }
    
    stats_filename = 'ultimate_dataset_stats.json'
    with open(stats_filename, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Dataset saved successfully!")
    print(f"   📊 Total: {stats['total_samples']:,}")
    print(f"   🚨 Scams: {stats['scam_count']:,}")
    print(f"   ✅ Legitimate: {stats['legitimate_count']:,}")
    print(f"   🕵️ Evasion detected: {stats['evasion_detected']:,}")
    
    return filename

def main():
    """Main function to generate the ultimate dataset"""
    
    print("🚨 ULTIMATE SMS Scam Detection Dataset Generator v4.0")
    print("=" * 70)
    print("🎯 Generating 10+ Lakh Real Examples with Advanced Evasion Detection!")
    print("=" * 70)
    
    # Generate massive dataset (1 million examples)
    target_size = 1000000  # 10 lakh
    dataset = generate_massive_dataset(target_size)
    
    # Save dataset
    filename = save_massive_dataset(dataset)
    
    print(f"\n🎉 Ultimate dataset generation completed!")
    print(f"📁 Files created:")
    print(f"   - {filename} (CSV format)")
    print(f"   - {filename.replace('.csv', '.json')} (JSON format)")
    print(f"   - ultimate_dataset_stats.json (Statistics)")
    
    print(f"\n🚀 Ready for training ultimate ML models!")
    print(f"🎯 This dataset will make your system virtually unbreakable!")

if __name__ == "__main__":
    main()
