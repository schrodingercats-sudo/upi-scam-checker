"""
Train a basic call-audio scam classifier using classical features (MFCC/chroma + prosodic)
and scikit-learn. This script expects a dataset directory structure:

data/calls/
  safe/
    *.wav
  scam/
    *.wav

Add as many recordings as possible. You can also expand with augmentation (speed/pitch shift).
"""

import os
import random
from typing import List, Tuple
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score
import pickle

from engine.call_analyzer import _load_audio, _extract_features, MODEL_PATH, SCALER_PATH


def list_audio_files(root: str) -> Tuple[List[str], List[int]]:
  safe_dir = os.path.join(root, 'safe')
  scam_dir = os.path.join(root, 'scam')
  files: List[str] = []
  labels: List[int] = []
  for d, label in [(safe_dir, 0), (scam_dir, 1)]:
    if not os.path.isdir(d):
      continue
    for name in os.listdir(d):
      if name.lower().endswith(('.wav', '.mp3', '.m4a', '.flac', '.ogg')):
        files.append(os.path.join(d, name))
        labels.append(label)
  return files, labels


def extract_feature_matrix(files: List[str]) -> np.ndarray:
  feats: List[np.ndarray] = []
  for p in files:
    y, sr = _load_audio(p)
    feats.append(_extract_features(y, sr))
  return np.vstack(feats)


def train(root: str = 'data/calls') -> None:
  files, labels = list_audio_files(root)
  if len(files) < 10:
    print('Not enough call recordings found in data/calls/{safe,scam}. Add more audio.')
    return

  X = extract_feature_matrix(files)
  y = np.array(labels)

  X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
  )

  scaler = StandardScaler()
  X_train_scaled = scaler.fit_transform(X_train)
  X_test_scaled = scaler.transform(X_test)

  model = RandomForestClassifier(n_estimators=400, max_depth=None, random_state=42, n_jobs=-1)
  model.fit(X_train_scaled, y_train)

  preds = model.predict(X_test_scaled)
  probas = model.predict_proba(X_test_scaled)[:, 1]
  print(classification_report(y_test, preds, target_names=['safe', 'scam']))
  try:
    print('ROC AUC:', roc_auc_score(y_test, probas))
  except Exception:
    pass

  with open(MODEL_PATH, 'wb') as f:
    pickle.dump(model, f)
  with open(SCALER_PATH, 'wb') as f:
    pickle.dump(scaler, f)
  print('Saved model to', MODEL_PATH, 'and scaler to', SCALER_PATH)


if __name__ == '__main__':
  train()


