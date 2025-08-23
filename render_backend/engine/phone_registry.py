import os
import json
from datetime import datetime
from typing import Dict, Any
from engine.config import DATA_DIR, PHONE_REGISTRY_FILE


def _ensure_dirs():
    os.makedirs(DATA_DIR, exist_ok=True)


def load_registry() -> Dict[str, Any]:
    _ensure_dirs()
    if not os.path.exists(PHONE_REGISTRY_FILE):
        return {}
    try:
        with open(PHONE_REGISTRY_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}


def save_registry(reg: Dict[str, Any]):
    _ensure_dirs()
    with open(PHONE_REGISTRY_FILE, 'w', encoding='utf-8') as f:
        json.dump(reg, f, indent=2, ensure_ascii=False)


def record_observation(phone: str, category: str, message_excerpt: str):
    """Record a sighting of a phone number with classification result."""
    if not phone:
        return
    reg = load_registry()
    entry = reg.get(phone, {
        'reports': 0,
        'scam_reports': 0,
        'suspicious_reports': 0,
        'safe_reports': 0,
        'last_seen': None,
        'samples': []
    })
    entry['reports'] += 1
    if category.lower() == 'scam':
        entry['scam_reports'] += 1
    elif category.lower() == 'suspicious':
        entry['suspicious_reports'] += 1
    else:
        entry['safe_reports'] += 1
    entry['last_seen'] = datetime.utcnow().isoformat()
    if message_excerpt:
        sample = message_excerpt.strip()
        # keep up to 5 samples
        if sample not in entry['samples']:
            entry['samples'] = (entry['samples'] + [sample])[-5:]
    reg[phone] = entry
    save_registry(reg)


def export_complaint(phone: str) -> str:
    """Generate a complaint payload for cyber authorities."""
    reg = load_registry()
    entry = reg.get(phone)
    if not entry:
        return "No records found for this number."
    lines = [
        "CYBER CRIME COMPLAINT - PHONE NUMBER FRAUD",
        f"Number: {phone}",
        f"Total Reports: {entry['reports']}",
        f"Scam Reports: {entry['scam_reports']}",
        f"Suspicious Reports: {entry['suspicious_reports']}",
        f"Last Seen: {entry['last_seen']}",
        "Samples:",
    ]
    for i, s in enumerate(entry.get('samples', []), 1):
        lines.append(f"  {i}. {s[:200]}")
    lines.append("Recommended Action: Block number and submit to cybercrime.gov.in portal.")
    return "\n".join(lines)
