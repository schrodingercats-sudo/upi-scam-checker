#!/usr/bin/env python3
"""
🌐 Web Scraper for SMS Data Collection
Collects real SMS examples from various sources for ML training
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import random
import re
from urllib.parse import urljoin, urlparse
import pandas as pd
from typing import List, Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SMSDataScraper:
    """Web scraper for collecting SMS data from various sources"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.collected_data = []
        
    def load_real_dataset(self) -> List[Dict[str, Any]]:
        """Load the real SMS/WhatsApp dataset as primary source"""
        
        try:
            # Load the CSV dataset
            df = pd.read_csv('upi_sms_whatsapp_dataset_seed.csv')
            
            logger.info(f"📊 Loaded real dataset: {len(df)} samples")
            
            # Convert to our format
            for _, row in df.iterrows():
                self.collected_data.append({
                    'text': row['text'],
                    'source': row['source'],
                    'type': row['channel'],
                    'label': 'safe' if row['label'] == 'legit' else 'scam',
                    'category': row['category']
                })
            
            logger.info(f"✅ Loaded {len(self.collected_data)} real examples")
            return self.collected_data
            
        except FileNotFoundError:
            logger.warning("⚠️ Real dataset not found, will generate synthetic data")
            return []
        except Exception as e:
            logger.error(f"❌ Error loading real dataset: {str(e)}")
            return []
    
    def scrape_sms_examples(self) -> List[Dict[str, Any]]:
        """Main method to scrape SMS examples from various sources"""
        
        logger.info("🚀 Starting SMS data collection from web sources")
        
        # Step 1: Load real dataset first
        real_data = self.load_real_dataset()
        if real_data:
            logger.info(f"📊 Primary dataset loaded: {len(real_data)} samples")
        
        # Step 2: Try web scraping for additional data
        sources = [
            {
                'name': 'SMS Scam Database',
                'url': 'https://www.cybercrime.gov.in/',
                'type': 'government'
            },
            {
                'name': 'Banking SMS Examples',
                'url': 'https://www.rbi.org.in/',
                'type': 'banking'
            },
            {
                'name': 'UPI Transaction Examples',
                'url': 'https://www.npci.org.in/',
                'type': 'upi'
            }
        ]
        
        for source in sources:
            try:
                logger.info(f"📡 Scraping from: {source['name']}")
                self._scrape_source(source)
                time.sleep(random.uniform(1, 3))  # Be respectful to servers
            except Exception as e:
                logger.error(f"❌ Failed to scrape {source['name']}: {str(e)}")
                continue
        
        # Step 3: Generate additional synthetic data to complement real data
        self._generate_complementary_data()
        
        logger.info(f"✅ Data collection completed. Total samples: {len(self.collected_data)}")
        return self.collected_data
    
    def _scrape_source(self, source: Dict[str, str]):
        """Scrape data from a specific source"""
        
        try:
            response = self.session.get(source['url'], timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract text content that might contain SMS examples
            text_content = soup.get_text()
            
            # Look for SMS-like patterns
            sms_patterns = self._extract_sms_patterns(text_content, source['type'])
            
            for pattern in sms_patterns:
                self.collected_data.append({
                    'text': pattern,
                    'source': source['name'],
                    'type': source['type'],
                    'label': self._classify_sms(pattern),
                    'category': 'web_scraped'
                })
                
        except requests.RequestException as e:
            logger.warning(f"⚠️ Request failed for {source['name']}: {str(e)}")
        except Exception as e:
            logger.error(f"❌ Scraping error for {source['name']}: {str(e)}")
    
    def _extract_sms_patterns(self, text: str, source_type: str) -> List[str]:
        """Extract SMS-like patterns from text content"""
        
        patterns = []
        
        # Common SMS patterns
        sms_regex_patterns = [
            r'[A-Z]{2,4}:\s*[^.]*',  # SBI: message
            r'Your\s+OTP\s+is\s+\d+',  # OTP messages
            r'Account\s+(credited|debited|blocked|suspended)',  # Account messages
            r'KYC\s+(expired|pending|update)',  # KYC messages
            r'₹\d+',  # Amount messages
            r'Click\s+here\s+to\s+verify',  # Verification messages
        ]
        
        for pattern in sms_regex_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            patterns.extend(matches)
        
        # Filter and clean patterns
        cleaned_patterns = []
        for pattern in patterns:
            if len(pattern) > 10 and len(pattern) < 200:  # Reasonable SMS length
                cleaned_patterns.append(pattern.strip())
        
        return cleaned_patterns[:10]  # Limit to 10 patterns per source
    
    def _classify_sms(self, text: str) -> str:
        """Classify SMS as safe, suspicious, or scam"""
        
        text_lower = text.lower()
        
        # Scam indicators
        scam_indicators = [
            'urgent', 'immediate', 'click here', 'verify now', 'account blocked',
            'kyc expired', 'prize', 'lottery', 'inheritance', 'free money'
        ]
        
        # Safe indicators
        safe_indicators = [
            'otp', 'transaction successful', 'balance', 'credited', 'debited',
            'welcome', 'thank you', 'successful'
        ]
        
        # Count indicators
        scam_score = sum(1 for indicator in scam_indicators if indicator in text_lower)
        safe_score = sum(1 for indicator in safe_indicators if indicator in text_lower)
        
        # Determine classification
        if scam_score > safe_score and scam_score >= 2:
            return 'scam'
        elif safe_score > scam_score and safe_score >= 2:
            return 'safe'
        else:
            return 'suspicious'
    
    def _generate_complementary_data(self):
        """Generate additional synthetic data to complement real dataset"""
        
        logger.info("🔧 Generating complementary synthetic data")
        
        # Additional legitimate SMS examples based on real patterns
        additional_legitimate = [
            "HDFC: Your credit card payment of ₹15,000 received. Thank you. -HDFCBNK",
            "Axis Bank: Your FD of ₹100,000 has matured. Amount credited to your account. -AXISBNK",
            "PNB: Your cheque for ₹25,000 has been cleared. Available balance: ₹75,000. -PNBBNK",
            "Canara Bank: Your loan EMI of ₹8,500 has been debited. Next EMI due: 15th Dec. -CANARABK",
            "Union Bank: Your account statement is ready. Download from mobile app. -UNIONBNK",
            "Deutsche Bank: Welcome! Your account has been activated successfully. -DEUTBNK",
            "Kotak Bank: Your UPI transaction of ₹2,500 to merchant@upi successful. -KOTAKBNK",
            "Yes Bank: Your mobile banking registration is complete. -YESBNK",
            "IDFC Bank: Your account verification is successful. Welcome aboard! -IDFCBNK"
        ]
        
        # Additional sophisticated scam examples
        additional_scams = [
            "Amazon: Your order #12345 has been cancelled. Click here to reactivate: amzn-order-verify.com",
            "PayPal: Account suspended due to suspicious activity. Verify now: paypal-secure-verify.com",
            "Netflix: Payment failed. Update payment method: netflix-payment-update.com",
            "Google: Your account will be deleted in 24 hours. Verify now: google-account-verify.com",
            "Microsoft: Unusual login detected. Secure your account: microsoft-secure-verify.com",
            "Apple: Your iCloud storage is full. Upgrade now: apple-storage-upgrade.com",
            "WhatsApp: Your number will be banned. Verify now: whatsapp-verify-account.com",
            "Telegram: Account suspended. Appeal here: telegram-appeal-verify.com",
            "Instagram: Your account has been reported. Verify identity: instagram-verify-id.com"
        ]
        
        # Add complementary data
        for sms in additional_legitimate:
            self.collected_data.append({
                'text': sms,
                'source': 'Synthetic - Complementary',
                'type': 'banking',
                'label': 'safe',
                'category': 'complementary_legitimate'
            })
        
        for sms in additional_scams:
            self.collected_data.append({
                'text': sms,
                'source': 'Synthetic - Complementary',
                'type': 'scam',
                'label': 'scam',
                'category': 'complementary_scam'
            })
    
    def save_data(self, filename: str = 'collected_sms_data.json'):
        """Save collected data to JSON file"""
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.collected_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"💾 Data saved to {filename}")
            
            # Also save as CSV for easy analysis
            df = pd.DataFrame(self.collected_data)
            csv_filename = filename.replace('.json', '.csv')
            df.to_csv(csv_filename, index=False, encoding='utf-8')
            logger.info(f"📊 Data also saved as CSV: {csv_filename}")
            
            # Save dataset statistics
            stats = self.get_statistics()
            stats_filename = 'dataset_statistics.json'
            with open(stats_filename, 'w', encoding='utf-8') as f:
                json.dump(stats, f, indent=2, ensure_ascii=False)
            logger.info(f"📈 Statistics saved to {stats_filename}")
            
        except Exception as e:
            logger.error(f"❌ Failed to save data: {str(e)}")
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get comprehensive statistics about collected data"""
        
        if not self.collected_data:
            return {}
        
        df = pd.DataFrame(self.collected_data)
        
        stats = {
            'total_samples': len(self.collected_data),
            'by_label': df['label'].value_counts().to_dict(),
            'by_source': df['source'].value_counts().to_dict(),
            'by_type': df['type'].value_counts().to_dict(),
            'by_category': df['category'].value_counts().to_dict() if 'category' in df.columns else {},
            'avg_length': df['text'].str.len().mean(),
            'min_length': df['text'].str.len().min(),
            'max_length': df['text'].str.len().max(),
            'real_data_count': len([d for d in self.collected_data if 'upi_sms_whatsapp_dataset_seed.csv' in str(d.get('source', ''))]),
            'synthetic_data_count': len([d for d in self.collected_data if 'Synthetic' in str(d.get('source', ''))]),
            'web_scraped_count': len([d for d in self.collected_data if d.get('category') == 'web_scraped'])
        }
        
        return stats

def main():
    """Main function to run the scraper"""
    
    print("🌐 Enhanced SMS Data Scraper for ML Training")
    print("=" * 60)
    print("This scraper now uses your real dataset as primary source!")
    print("=" * 60)
    
    # Initialize scraper
    scraper = SMSDataScraper()
    
    # Collect data
    data = scraper.scrape_sms_examples()
    
    # Save data
    scraper.save_data()
    
    # Show comprehensive statistics
    stats = scraper.get_statistics()
    print("\n📊 Enhanced Data Collection Statistics:")
    print(f"   Total Samples: {stats.get('total_samples', 0)}")
    print(f"   Real Dataset: {stats.get('real_data_count', 0)} samples")
    print(f"   Synthetic Data: {stats.get('synthetic_data_count', 0)} samples")
    print(f"   Web Scraped: {stats.get('web_scraped_count', 0)} samples")
    print(f"   By Label: {stats.get('by_label', {})}")
    print(f"   By Source: {stats.get('by_source', {})}")
    print(f"   Average Length: {stats.get('avg_length', 0):.1f} characters")
    
    print("\n✅ Enhanced data collection completed successfully!")
    print("📁 Files created:")
    print("   - collected_sms_data.json (enhanced dataset)")
    print("   - collected_sms_data.csv (CSV format)")
    print("   - dataset_statistics.json (comprehensive stats)")
    print("\n🚀 Ready to train ML model with enhanced dataset!")
    print("🎯 Your real dataset is now the primary training source!")

if __name__ == "__main__":
    main()
