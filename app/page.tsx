// UPI Scam Checker - Version 3.0.0
// Last Updated: 2025-01-27 17:10 UTC
// Advanced Update: 100K AI Model + SMS Sender ID + Gemini AI
// This version uses the most advanced SMS scam detection system
// Original UI/UX Restored with TypeScript fixes

'use client'

import { useState } from 'react'
import ScamAnalyzer from '../components/ScamAnalyzer'
import LatestScams from '../components/LatestScams'
import PhoneTracker from '../components/PhoneTracker'
import ComplaintGenerator from '../components/ComplaintGenerator'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'scams' | 'phone' | 'complaint'>('analyzer')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleAnalyze = async (input: string, type: 'sms' | 'url' | 'call' | 'track') => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/analyze-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input })
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Analysis failed:', error)
      setResult({ error: 'Analysis failed. Please try again.' })
    } finally {
      setIsAnalyzing(false)
    }
  }

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
              { id: 'analyzer', label: '🔍 Content Analyzer', icon: '🔍' },
              { id: 'scams', label: '📋 Latest Scams', icon: '📋' },
              { id: 'phone', label: '📞 Phone Tracker', icon: '📞' },
              { id: 'complaint', label: '📝 Complaint Generator', icon: '📝' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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
        {activeTab === 'analyzer' && (
          <ScamAnalyzer
            activeTab="sms"
            onTabChange={(tab) => setActiveTab(tab)}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        )}
        {activeTab === 'scams' && <LatestScams />}
        {activeTab === 'phone' && <PhoneTracker />}
        {activeTab === 'complaint' && result && <ComplaintGenerator result={result} />}
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
  )
}
