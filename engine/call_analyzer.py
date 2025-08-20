import os
import json
from typing import Dict, Any, Tuple

import numpy as np

try:
    import librosa  # type: ignore
except Exception:  # pragma: no cover
    librosa = None

import pickle

MODEL_PATH = 'call_scam_model.pkl'
SCALER_PATH = 'call_scam_scaler.pkl'


def _load_audio(path: str, sr: int = 16000) -> Tuple[np.ndarray, int]:
    if librosa is None:
        raise RuntimeError('librosa is not installed. Install librosa to analyze audio.')
    y, sr = librosa.load(path, sr=sr, mono=True)
    # Trim silence
    y, _ = librosa.effects.trim(y)
    return y, sr


def _extract_features(y: np.ndarray, sr: int) -> np.ndarray:
    if librosa is None:
        raise RuntimeError('librosa is not installed. Install librosa to analyze audio.')
    # Basic spectral features
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
    mfcc_mean = mfcc.mean(axis=1)
    chroma = librosa.feature.chroma_stft(y=y, sr=sr).mean(axis=1)
    spec_centroid = librosa.feature.spectral_centroid(y=y, sr=sr).mean()
    spec_bw = librosa.feature.spectral_bandwidth(y=y, sr=sr).mean()
    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr).mean()
    zcr = librosa.feature.zero_crossing_rate(y).mean()

    # Prosodic: RMS energy and tempo
    rms = librosa.feature.rms(y=y).mean()
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)

    features = np.concatenate([
        mfcc_mean,
        chroma,
        np.array([spec_centroid, spec_bw, rolloff, zcr, rms, tempo], dtype=float),
    ])
    return features


_MODEL = None
_SCALER = None


def _load_model():
    global _MODEL, _SCALER
    if _MODEL is None and os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, 'rb') as f:
            _MODEL = pickle.load(f)
    if _SCALER is None and os.path.exists(SCALER_PATH):
        with open(SCALER_PATH, 'rb') as f:
            _SCALER = pickle.load(f)


def analyze_call_file(path: str) -> Dict[str, Any]:
    """Return call scam analysis given a local audio file path."""
    _load_model()
    if _MODEL is None or _SCALER is None:
        return {
            'classification': 'Unknown',
            'confidence_score': '0%',
            'risk_level': 'Medium',
            'red_flags': ['Call model not trained yet. Run train_call_model.py'],
            'recommended_action': 'Upload training data and train the model.'
        }

    y, sr = _load_audio(path)
    feats = _extract_features(y, sr)
    X = _SCALER.transform([feats])
    proba = float(_MODEL.predict_proba(X)[0][1])

    if proba >= 0.7:
        cls = 'Scam'
        level = 'High'
    elif proba >= 0.4:
        cls = 'Suspicious'
        level = 'Medium'
    else:
        cls = 'Safe'
        level = 'Low'

    return {
        'classification': cls,
        'confidence_score': f"{int(proba*100)}%",
        'risk_level': level,
        'red_flags': [
            'Acoustic pattern analysis via MFCC/chroma/tempo features',
        ],
        'recommended_action': 'Be cautious. Do not share OTP/PIN. Hang up if asked for sensitive info.'
    }


