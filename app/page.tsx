'use client'

import { useState } from 'react'
import { Shield, MessageSquare, Link, Phone, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import ScamAnalyzer from '@/components/ScamAnalyzer'
import ResultCard from '@/components/ResultCard'
import ComplaintGenerator from '@/components/ComplaintGenerator'
import LatestScams from '@/components/LatestScams'

export type AnalysisResult = {
  label: 'Safe' | 'Suspicious' | 'Scam'
  confidence: number
  redFlags: string[]
  advice: string
  riskLevel: 'Low' | 'Medium' | 'High'
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'sms' | 'url' | 'call'>('sms')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalysis = async (input: string, type: 'sms' | 'url' | 'call') => {
    setIsAnalyzing(true)
    
    try {
      // Simulate AI analysis with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // AI-powered analysis logic
      const result = await analyzeContent(input, type)
      setAnalysisResult(result)
      
      toast.success('Analysis completed!')
    } catch (error) {
      toast.error('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeContent = async (input: string, type: 'sms' | 'url' | 'call'): Promise<AnalysisResult> => {
    // This is a simplified AI analysis - in production, you'd integrate with actual AI models
    const suspiciousKeywords = [
      'KYC expired', 'prize', 'urgent', 'verify account', 'bank account blocked',
      'OTP', 'click here', 'limited time', 'free money', 'lottery', 'inheritance'
    ]
    
    const scamKeywords = [
      'your account has been suspended', 'immediate action required',
      'click to verify', 'confirm your details', 'security alert'
    ]
    
    const inputLower = input.toLowerCase()
    let score = 0
    const redFlags: string[] = []
    
    // Check for suspicious patterns
    suspiciousKeywords.forEach(keyword => {
      if (inputLower.includes(keyword.toLowerCase())) {
        score += 0.3
        redFlags.push(`Contains suspicious keyword: "${keyword}"`)
      }
    })
    
    // Check for scam patterns
    scamKeywords.forEach(keyword => {
      if (inputLower.includes(keyword.toLowerCase())) {
        score += 0.5
        redFlags.push(`Contains scam keyword: "${keyword}"`)
      }
    })
    
    // Check for urgency indicators
    if (/\b(urgent|immediate|now|quick|hurry)\b/i.test(input)) {
      score += 0.2
      redFlags.push('Uses urgency tactics')
    }
    
    // Check for suspicious URLs
    if (type === 'url' && /(bit\.ly|tinyurl|goo\.gl)/i.test(input)) {
      score += 0.4
      redFlags.push('Uses URL shortener (potential redirection)')
    }
    
    // Determine result
    let label: 'Safe' | 'Suspicious' | 'Scam'
    let riskLevel: 'Low' | 'Medium' | 'High'
    
    if (score >= 0.7) {
      label = 'Scam'
      riskLevel = 'High'
    } else if (score >= 0.3) {
      label = 'Suspicious'
      riskLevel = 'Medium'
    } else {
      label = 'Safe'
      riskLevel = 'Low'
    }
    
    const confidence = Math.min(0.95, Math.max(0.6, score + 0.6))
    
    // Generate advice based on risk level
    let advice = ''
    if (label === 'Safe') {
      advice = 'This appears to be safe. Continue with normal caution.'
    } else if (label === 'Suspicious') {
      advice = 'Exercise caution. Do not share personal information or click suspicious links.'
    } else {
      advice = 'This is likely a scam. Do not respond, click, or share any information. Report immediately.'
    }
    
    return {
      label,
      confidence,
      redFlags,
      advice,
      riskLevel
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gradient">UPI Scam Checker</h1>
            </div>
            <div className="text-sm text-gray-600">
              Powered by AI • Protect Yourself
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
                  <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Detect Digital Scams with AI
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Analyze SMS messages, URLs, and call transcripts to identify potential UPI fraud, 
              phishing attempts, and other digital scams. Get instant results and actionable advice.
            </p>
            <div className="mt-6">
              <a
                href="/demo"
                className="btn-secondary inline-flex items-center space-x-2"
              >
                <span>🎯</span>
                <span>See Demo</span>
              </a>
            </div>
          </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input Forms */}
          <div className="lg:col-span-2">
            <ScamAnalyzer 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onAnalyze={handleAnalysis}
              isAnalyzing={isAnalyzing}
            />
            
            {analysisResult && (
              <div className="mt-8 animate-fade-in">
                <ResultCard result={analysisResult} />
              </div>
            )}
            
            {analysisResult && analysisResult.riskLevel === 'High' && (
              <div className="mt-6 animate-fade-in">
                <ComplaintGenerator result={analysisResult} />
              </div>
            )}
          </div>

          {/* Right Column - Latest Scams & Info */}
          <div className="space-y-6">
            <LatestScams />
            
            {/* Quick Tips */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 text-warning-500 mr-2" />
                Safety Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                  Never share OTP or PIN with anyone
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                  Banks never ask for personal details via SMS
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                  Verify UPI handles before making payments
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                  Report suspicious activity immediately
                </li>
              </ul>
            </div>

            {/* Emergency Contacts */}
            <div className="card bg-red-50 border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                Emergency Contacts
              </h3>
              <div className="space-y-2 text-sm text-red-800">
                <p><strong>Cyber Crime:</strong> 1930</p>
                <p><strong>RBI Helpline:</strong> 1800-425-3800</p>
                <p><strong>NPCI:</strong> 1800-425-3800</p>
                <p><strong>Website:</strong> cybercrime.gov.in</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 UPI Scam Checker. Built with ❤️ for digital safety in India.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This tool uses AI to analyze content but should not replace professional advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
