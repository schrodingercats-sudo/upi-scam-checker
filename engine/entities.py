import re
from typing import Dict, Any, List
from urllib.parse import urlparse

OTP_PATTERN = re.compile(r'\b(\d{4,8})\b.*?(otp|valid|minutes|min)', re.IGNORECASE)
UPI_PATTERN = re.compile(r'\b[a-zA-Z0-9._%+-]+@(?:upi|okicici|okaxis|ybl|ibl|paytm|axl|apl|okhdfcbank)\b', re.IGNORECASE)
AMOUNT_PATTERN = re.compile(r'(₹|rs\.?|inr)\s?\d{1,3}(?:[,\s]?\d{3})*(?:\.\d{1,2})?', re.IGNORECASE)
PHONE_PATTERN = re.compile(r'\b(?:\+?91[-\s]?|0)?[6-9]\d{9}\b')
URL_PATTERN = re.compile(r'(https?://[^\s]+)', re.IGNORECASE)
SENDER_ID_PATTERN = re.compile(r'^[A-Z]{2,4}-[A-Z0-9]{2,8}$')  # e.g., VM-HDFCBK


def extract_entities(text: str) -> Dict[str, Any]:
    otps = [m.group(1) for m in OTP_PATTERN.finditer(text)]
    upis = UPI_PATTERN.findall(text)
    amounts = [m.group(0) for m in AMOUNT_PATTERN.finditer(text)]
    phones = PHONE_PATTERN.findall(text)
    urls = URL_PATTERN.findall(text)
    return {
        'otp_codes': otps,
        'upi_ids': upis,
        'amounts': amounts,
        'phones': phones,
        'urls': urls,
    }


def parse_domains(urls: List[str]) -> List[str]:
    doms = []
    for u in urls:
        try:
            d = urlparse(u).netloc.lower()
            if d:
                doms.append(d)
        except Exception:
            pass
    return doms


def sender_heuristics(text: str) -> str:
    """
    Extract a probable sender identifier only when a real sender ID pattern
    is present (e.g., VM-HDFCBK). We deliberately avoid returning matches
    based solely on brand names appearing in the body to prevent spoofed
    messages (e.g., "ICICI" mentioned in text) from being whitelisted.
    """
    # Common sender ID formats used by Indian DLT (e.g., VM-ICICIB, AX-HDFCBK)
    m = re.search(r'\b[A-Z]{2,4}-([A-Z0-9]{3,10})\b', text)
    if m:
        return m.group(1).lower()
    # No reliable sender token found
    return ''
