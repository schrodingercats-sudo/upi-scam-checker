import sqlite3
import os
import json
from datetime import datetime
from typing import Dict, List, Optional, Tuple

class FeedbackDatabase:
    def __init__(self, db_path: str = "feedback.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the database with required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create messages table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_text TEXT NOT NULL,
                analysis_result TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                user_id TEXT,
                session_id TEXT
            )
        ''')
        
        # Create feedback table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id INTEGER,
                feedback TEXT NOT NULL,  -- 'yes', 'no', or 'uncertain'
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (message_id) REFERENCES messages (id)
            )
        ''')
        
        # Create training_data table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS training_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_text TEXT NOT NULL,
                label BOOLEAN NOT NULL,  -- True for scam, False for real
                added_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                source TEXT DEFAULT 'user_feedback'
            )
        ''')
        
        # Create hold_data table for uncertain samples
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS hold_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_text TEXT NOT NULL,
                analysis_result TEXT,
                feedback_id INTEGER,
                added_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (feedback_id) REFERENCES feedback (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def store_message(self, message_text: str, analysis_result: Optional[Dict] = None, user_id: Optional[str] = None, session_id: Optional[str] = None) -> int:
        """Store a message and return its ID"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO messages (message_text, analysis_result, user_id, session_id)
            VALUES (?, ?, ?, ?)
        ''', (message_text, json.dumps(analysis_result) if analysis_result else None, user_id, session_id))
        
        message_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Handle case where lastrowid might be None
        if message_id is None:
            raise RuntimeError("Failed to insert message into database")
        
        return message_id
    
    def store_user_feedback(self, message_id: int, feedback: str) -> bool:
        """Store user feedback for a message"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO feedback (message_id, feedback)
                VALUES (?, ?)
            ''', (message_id, feedback))
            
            conn.commit()
            conn.close()
            return True
        except sqlite3.Error as e:
            print(f"Error storing feedback: {e}")
            conn.close()
            return False
    
    def add_to_training_data(self, message_text: str, label: bool) -> bool:
        """Add a verified message to training data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO training_data (message_text, label)
                VALUES (?, ?)
            ''', (message_text, label))
            
            conn.commit()
            conn.close()
            return True
        except sqlite3.Error as e:
            print(f"Error adding to training data: {e}")
            conn.close()
            return False
    
    def add_to_hold_data(self, message_text: str, analysis_result: Dict, feedback_id: int) -> bool:
        """Add uncertain message to hold data for active learning"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO hold_data (message_text, analysis_result, feedback_id)
                VALUES (?, ?, ?)
            ''', (message_text, json.dumps(analysis_result), feedback_id))
            
            conn.commit()
            conn.close()
            return True
        except sqlite3.Error as e:
            print(f"Error adding to hold data: {e}")
            conn.close()
            return False
    
    def get_feedback_count(self) -> Dict[str, int]:
        """Get count of different feedback types"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT feedback, COUNT(*) 
            FROM feedback 
            GROUP BY feedback
        ''')
        
        results = cursor.fetchall()
        conn.close()
        
        return {row[0]: row[1] for row in results}
    
    def get_training_data(self) -> List[Tuple[str, bool]]:
        """Get all training data for model retraining"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT message_text, label 
            FROM training_data
        ''')
        
        results = cursor.fetchall()
        conn.close()
        
        return [(row[0], bool(row[1])) for row in results]
    
    def get_hold_data(self) -> List[Tuple[str, Dict, int]]:
        """Get all hold data for active learning"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT message_text, analysis_result, feedback_id
            FROM hold_data
        ''')
        
        results = cursor.fetchall()
        conn.close()
        
        return [(row[0], json.loads(row[1]) if row[1] else {}, row[2]) for row in results]
    
    def get_recent_messages(self, limit: int = 10) -> List[Dict]:
        """Get recent messages for monitoring"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, message_text, analysis_result, timestamp
            FROM messages
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (limit,))
        
        results = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in results]

# Global database instance
db = FeedbackDatabase()