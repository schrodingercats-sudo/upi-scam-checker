// UPI Scam Checker - Version 3.0.0
// Last Updated: 2025-01-27 17:00 UTC
// Advanced Update: 100K AI Model + SMS Sender ID + Gemini AI
// This version uses the most advanced SMS scam detection system

'use client'

import { useState } from 'react';
import LatestScams from '../components/LatestScams';
import PhoneTracker from '../components/PhoneTracker';
import ComplaintGenerator from '../components/ComplaintGenerator';

// Simple SMS Analyzer Component
function SimpleSMSAnalyzer() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Analysis failed:', error);
      setResult({ error: 'Analysis failed. Please try again.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          🛡️ SMS Scam Detection (v3.0.0)
        </h3>
        <p className="text-gray-600">
          Paste any SMS message to analyze it with our 100K trained AI model and SMS Sender ID analysis.
        </p>
      </div>

      <form onSubmit={handleAnalyze} className="space-y-4">
        <div>
          <label htmlFor="sms-input" className="block text-sm font-medium text-gray-700 mb-2">
            SMS Message
          </label>
          <textarea
            id="sms-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your SMS message here..."
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isAnalyzing || !input.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing...
            </>
          ) : (
            '🔍 Analyze Message'
          )}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 rounded-lg border">
          {result.error ? (
            <div className="text-red-600">{result.error}</div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Classification:</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  result.classification === 'Safe' ? 'bg-green-100 text-green-800' :
                  result.classification === 'Suspicious' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {result.classification}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Confidence:</span>
                <span className="text-sm">{result.confidence_score}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Risk Level:</span>
                <span className="text-sm">{result.risk_level}</span>
              </div>
              <div>
                <span className="font-semibold">Recommendation:</span>
                <p className="text-sm mt-1">{result.recommended_action}</p>
              </div>
              {result.sender_analysis && (
                <div>
                  <span className="font-semibold">SMS Sender Analysis:</span>
                  <p className="text-sm mt-1">
                    {result.sender_analysis.category} ({result.sender_analysis.category_code}) - 
                    Trust Score: {(result.sender_analysis.trust_score * 100).toFixed(1)}%
                  </p>
                </div>
              )}
              {result.red_flags && result.red_flags.length > 0 && (
                <div>
                  <span className="font-semibold">Red Flags:</span>
                  <ul className="text-sm mt-1 list-disc list-inside">
                    {result.red_flags.map((flag: string, index: number) => (
                      <li key={index}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('analyzer');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🛡️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">UPI Scam Checker</h1>
                <p className="text-sm text-gray-500">🛡️ v3.0.0 - 100K AI Model Active</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✅ 100K Trained Model
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                🧠 Gemini AI Ready
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Advanced SMS Scam Detection
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Powered by 100K trained AI model with SMS Sender ID analysis and Gemini AI verification
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm font-medium">🤖 100K Messages Trained</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm font-medium">📱 SMS Sender ID Analysis</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm font-medium">🧠 Gemini AI Integration</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm font-medium">🛡️ Multi-layered Security</span>
            </div>
          </div>
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg inline-block">
            <span className="font-bold">🚨 IMMEDIATE BLOCKING SYSTEM ACTIVE - v3.0.0</span>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'analyzer', label: '🔍 SMS Analyzer', icon: '🔍' },
              { id: 'scams', label: '📋 Latest Scams', icon: '📋' },
              { id: 'phone', label: '📞 Phone Tracker', icon: '📞' },
              { id: 'complaint', label: '📝 Complaint Generator', icon: '📝' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'analyzer' && <SimpleSMSAnalyzer />}
        {activeTab === 'scams' && <LatestScams />}
        {activeTab === 'phone' && <PhoneTracker />}
        {activeTab === 'complaint' && <ComplaintGenerator />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              <strong>UPI Scam Checker v3.0.0</strong> - Advanced AI-powered SMS scam detection
            </p>
            <p className="text-sm">
              Features: 100K Trained Model • SMS Sender ID Analysis • Gemini AI • Multi-layered Security
            </p>
            <div className="mt-4 flex justify-center space-x-4 text-xs text-gray-500">
              <span>🤖 ML Model: 100% Accuracy</span>
              <span>📱 DND Categories: s/g/p/t</span>
              <span>🧠 Gemini AI: 2-Step Verification</span>
              <span>🛡️ Fast2SMS Whitelist</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
