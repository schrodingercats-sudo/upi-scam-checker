#!/usr/bin/env python3
import re
import unicodedata
from typing import Tuple

# Basic homoglyph map (common lookalikes)
HOMOGLYPH_MAP = {
    # Latin lookalikes
    '\u0430': 'a',  # Cyrillic a
    '\u03BF': 'o',  # Greek omicron
    '\u03B5': 'e',  # Greek epsilon
    '\u0441': 'c',  # Cyrillic es
    '\u0440': 'p',  # Cyrillic er
    '\u0445': 'x',  # Cyrillic ha
    '\u0406': 'I',  # Cyrillic I
    '\u0399': 'I',  # Greek Iota
    '\u00A0': ' ',  # non-breaking space
}

ZERO_WIDTH_PATTERN = re.compile('[\u200B\u200C\u200D\u2060\uFEFF]')
EMOJI_PATTERN = re.compile('[\U00010000-\U0010ffff]', flags=re.UNICODE)
URL_PATTERN = re.compile(r'(https?://[^\s]+)')

LEETSPEAK_MAP = {
    '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's'
}


def remove_zero_width(text: str) -> str:
    return ZERO_WIDTH_PATTERN.sub('', text)


def strip_emojis(text: str) -> str:
    try:
        return EMOJI_PATTERN.sub('', text)
    except re.error:
        # Narrow Python builds may not support above range; fallback
        return text.encode('ascii', 'ignore').decode('ascii')


def map_homoglyphs(text: str) -> str:
    return ''.join(HOMOGLYPH_MAP.get(ch, ch) for ch in text)


def nfkc_normalize(text: str) -> str:
    return unicodedata.normalize('NFKC', text)


def normalize_text(text: str) -> Tuple[str, dict]:
    """Normalize and return metrics used as features.
    Returns (normalized_text, metrics_dict)
    """
    original = text or ''
    # Basic counts before changes
    zero_width_count = len(ZERO_WIDTH_PATTERN.findall(original))
    non_ascii = sum(1 for c in original if ord(c) > 127)
    length = len(original) or 1

    t = nfkc_normalize(original)
    t = remove_zero_width(t)
    t = map_homoglyphs(t)
    t = strip_emojis(t)

    metrics = {
        'zero_width_count': zero_width_count,
        'non_ascii_ratio': non_ascii / length,
    }
    return t, metrics


def de_leetspeak(text: str) -> str:
    return ''.join(LEETSPEAK_MAP.get(ch, ch) for ch in text)


def basic_augment(text: str) -> str:
    """Light augmentation: remove extra spaces, fix leetspeak, random punctuation spacing.
    Deterministic for pipeline stability.
    """
    t = de_leetspeak(text)
    t = re.sub(r'\s{2,}', ' ', t)
    t = re.sub(r'\s*([:,.;])\s*', r'\1 ', t).strip()
    return t
