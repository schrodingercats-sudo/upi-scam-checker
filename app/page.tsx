// UPI Scam Checker - Version 3.0.0
// Last Updated: 2025-01-27 17:15 UTC
// Advanced Update: 100K AI Model + SMS Sender ID + Gemini AI
// This version uses the most advanced SMS scam detection system
// Complete Original Website Design Restored

'use client'

import { useState } from 'react'
import ScamAnalyzer from '../components/ScamAnalyzer'
import LatestScams from '../components/LatestScams'
import PhoneTracker from '../components/PhoneTracker'
import ComplaintGenerator from '../components/ComplaintGenerator'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'scams' | 'phone' | 'complaint'>('analyzer')
  const [result, setResult] = useState<any>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🛡️</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">UPI Scam Checker</h1>
                <p className="text-xs text-gray-500">v3.0.0 - 100K AI Model</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✅ 100K Model
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                🧠 Gemini AI
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Simple Hero Section */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI-Powered UPI Scam Detection
          </h2>
          <p className="text-gray-600 mb-4">
            Analyze SMS messages, URLs, and calls to identify potential scams
          </p>
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-md inline-block text-sm font-medium">
            🚨 IMMEDIATE BLOCKING SYSTEM ACTIVE - v3.0.0
          </div>
        </div>
      </section>

      {/* Simple Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'analyzer', label: '🔍 Content Analyzer' },
              { id: 'scams', label: '📋 Latest Scams' },
              { id: 'phone', label: '📞 Phone Tracker' },
              { id: 'complaint', label: '📝 Complaint Generator' }
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
        {activeTab === 'analyzer' && (
          <ScamAnalyzer
            activeTab="sms"
            onTabChange={(tab) => {
              // Handle internal ScamAnalyzer tab changes
              console.log('ScamAnalyzer tab changed to:', tab)
            }}
            onAnalyze={() => {}} // Not used anymore, ScamAnalyzer handles its own analysis
            isAnalyzing={false} // Not used anymore, ScamAnalyzer manages its own state
          />
        )}
        {activeTab === 'scams' && <LatestScams />}
        {activeTab === 'phone' && <PhoneTracker />}
        {activeTab === 'complaint' && result && <ComplaintGenerator result={result} />}
      </main>

      {/* Simple Footer */}
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              <strong>UPI Scam Checker v3.0.0</strong> - AI-powered scam detection
            </p>
            <p className="text-sm text-gray-500">
              100K Trained Model • SMS Sender ID Analysis • Gemini AI • Multi-layered Security
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
