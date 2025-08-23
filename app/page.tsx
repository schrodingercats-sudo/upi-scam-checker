// UPI Scam Checker - Version 3.0.0
// Last Updated: 2025-01-27 17:20 UTC
// Advanced Update: 100K AI Model + SMS Sender ID + Gemini AI
// This version uses the most advanced SMS scam detection system
// EXACT Original Website Design Restored

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
      {/* Original Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🛡️</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-blue-800">UPI Scam Checker</h1>
                <p className="text-sm text-gray-600">Powered by AI • Protect Yourself</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                v3.0.0 - Security Active
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Original Hero Section */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full inline-block text-sm font-medium mb-6">
            🚨 IMMEDIATE BLOCKING SYSTEM ACTIVE - v3.0.0
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Detect Digital Scams with AI
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Analyze SMS messages, URLs, and call transcripts to identify potential UPI fraud, phishing attempts, and other digital scams. Get instant results and actionable advice.
          </p>
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center mx-auto space-x-2">
            <span className="w-4 h-4 bg-red-500 rounded-full"></span>
            <span>See Demo</span>
          </button>
        </div>
      </section>

      {/* Original Two-Column Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Content Analyzer */}
          <div>
            {activeTab === 'analyzer' && (
              <ScamAnalyzer
                activeTab="sms"
                onTabChange={(tab) => {
                  console.log('ScamAnalyzer tab changed to:', tab)
                }}
                onAnalyze={() => {}}
                isAnalyzing={false}
              />
            )}
            {activeTab === 'scams' && <LatestScams />}
            {activeTab === 'phone' && <PhoneTracker />}
            {activeTab === 'complaint' && result && <ComplaintGenerator result={result} />}
          </div>

          {/* Right Column: Latest Scam Patterns */}
          <div>
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-blue-600">📈</span>
                <h3 className="text-xl font-semibold text-gray-900">Latest Scam Patterns</h3>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
                <span>🕐</span>
                <span>Updated daily</span>
              </div>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">📱</span>
                      <h4 className="font-medium text-gray-900">Fake KYC Expiry SMS</h4>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">High</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Scammers sending SMS claiming KYC has expired and asking for immediate verification
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Source: RBI Advisory</span>
                    <span>1/27/2025</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-gray-600">Red Flags: </span>
                    <span className="inline-flex space-x-1">
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Urgency tactics</span>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">KYC expiry threat</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">+1 more</span>
                    </span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">💳</span>
                      <h4 className="font-medium text-gray-900">UPI Handle Impersonation</h4>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">High</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Fraudsters creating fake UPI handles similar to legitimate businesses
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Source: NPCI Alert</span>
                    <span>1/26/2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
