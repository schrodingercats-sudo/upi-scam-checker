'use client'

import { useState } from 'react'
import ScamAnalyzer from '../components/ScamAnalyzer'
import LatestScams from '../components/LatestScams'
import PhoneTracker from '../components/PhoneTracker'
import ComplaintGenerator from '../components/ComplaintGenerator'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'sms' | 'url' | 'call' | 'track'>('sms')
  const [result, setResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async (input: string, type: 'sms' | 'url' | 'call' | 'track') => {
    setIsAnalyzing(true)
    try {
      if (type === 'sms') {
        const response = await fetch('/api/analyze-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: input })
        })
        const data = await response.json()
        setResult(data)
      }
    } catch (error) {
      setResult({ error: 'Analysis failed' })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      {/* Hero Section */}
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
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Content Analyzer */}
          <div>
            <ScamAnalyzer
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
            />
            {result && <ComplaintGenerator result={result} />}
          </div>

          {/* Right Column: Latest Scam Patterns */}
          <div>
            <LatestScams />
          </div>
        </div>
      </main>

      {/* Footer */}
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
