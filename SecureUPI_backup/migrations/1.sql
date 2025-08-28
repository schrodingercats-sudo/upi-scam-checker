
CREATE TABLE message_analyses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_content TEXT NOT NULL,
  message_type TEXT NOT NULL, -- 'sms', 'whatsapp', 'email'
  analysis_result TEXT NOT NULL, -- JSON string with detailed analysis
  risk_score INTEGER NOT NULL, -- 1-10 scale
  is_scam BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
