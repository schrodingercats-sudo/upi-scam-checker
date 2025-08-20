'use client'

import { useState } from 'react'
import { Shield, CheckCircle, AlertTriangle, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function DemoPage() {
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null)

  const demoExamples = [
    {
      id: 'sms-scam',
      title: 'Fake KYC Expiry SMS',
      type: 'SMS',
      content: 'URGENT: Your KYC has expired. Click here to verify: bit.ly/kyc-verify-now. Your account will be blocked in 2 hours if not verified immediately.',
      risk: 'Scam',
      confidence: 92,
      redFlags: [
        'Contains suspicious keyword: "KYC expired"',
        'Uses urgency tactics',
        'Uses URL shortener (potential redirection)',
        'Contains scam keyword: "click to verify"'
      ],
      advice: 'This is likely a scam. Do not respond, click, or share any information. Report immediately.'
    },
    {
      id: 'url-phishing',
      title: 'Fake Bank Login',
      type: 'URL',
      content: 'https://icicibank-secure-login.verify-account.com/login',
      risk: 'Scam',
      confidence: 89,
      redFlags: [
        'Suspicious domain structure',
        'Contains suspicious keyword: "verify account"',
        'Uses urgency tactics'
      ],
      advice: 'This is likely a phishing attempt. Do not click the link or enter any credentials. Report to your bank immediately.'
    },
    {
      id: 'whatsapp-fraud',
      title: 'Fake Prize Notification',
      type: 'WhatsApp',
      content: '🎉 CONGRATULATIONS! You have won ₹50,000 in our lucky draw! Click here to claim your prize: tinyurl.com/prize-claim. Limited time offer!',
      risk: 'Scam',
      confidence: 95,
      redFlags: [
        'Contains suspicious keyword: "prize"',
        'Contains suspicious keyword: "free money"',
        'Uses urgency tactics',
        'Uses URL shortener (potential redirection)',
        'Contains suspicious keyword: "limited time"'
      ],
      advice: 'This is definitely a scam. No legitimate company gives away money like this. Do not click any links or provide personal information.'
    },
    {
      id: 'safe-message',
      title: 'Legitimate Bank OTP',
      type: 'SMS',
      content: 'Your OTP for transaction of ₹500 to merchant XYZ is 123456. Valid for 10 minutes. Do not share this OTP with anyone.',
      risk: 'Safe',
      confidence: 85,
      redFlags: [],
      advice: 'This appears to be safe. Continue with normal caution.'
    }
  ]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Safe':
        return 'text-success-600 bg-success-50 border-success-200'
      case 'Suspicious':
        return 'text-warning-600 bg-warning-50 border-warning-200'
      case 'Scam':
        return 'text-danger-600 bg-danger-50 border-danger-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Safe':
        return <CheckCircle className="h-5 w-5 text-success-600" />
      case 'Suspicious':
        return <AlertTriangle className="h-5 w-5 text-warning-600" />
      case 'Scam':
        return <XCircle className="h-5 w-5 text-danger-600" />
      default:
        return <Shield className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3 text-primary-600 hover:text-primary-700">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <div className="text-sm text-gray-600">
              Demo Mode • See How It Works
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            See UPI Scam Checker in Action
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore real-world examples of how our AI detects different types of scams. 
            Click on any example below to see the detailed analysis.
          </p>
        </div>

        {/* Demo Examples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {demoExamples.map((example) => (
            <div
              key={example.id}
              className="card cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedDemo(example.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {example.type === 'SMS' ? '📱' : example.type === 'URL' ? '🔗' : '💬'}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {example.type}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${getRiskColor(example.risk)}`}>
                  {example.risk}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">
                {example.title}
              </h3>
              
              <div className="bg-gray-50 p-3 rounded border text-sm text-gray-700 mb-3 max-h-20 overflow-y-auto">
                {example.content}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Confidence: {example.confidence}%</span>
                <span>{example.redFlags.length} red flags</span>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Analysis */}
        {selectedDemo && (
          <div className="card animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Detailed Analysis
              </h2>
              <button
                onClick={() => setSelectedDemo(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {(() => {
              const example = demoExamples.find(ex => ex.id === selectedDemo)
              if (!example) return null

              return (
                <div className="space-y-6">
                  {/* Risk Assessment */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {example.risk}
                      </div>
                      <div className="text-sm text-gray-600">Risk Classification</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold mb-1 ${
                        example.confidence >= 80 ? 'text-success-600' : 
                        example.confidence >= 60 ? 'text-warning-600' : 'text-danger-600'
                      }`}>
                        {example.confidence}%
                      </div>
                      <div className="text-sm text-gray-600">Confidence Score</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold mb-1">
                        {example.redFlags.length}
                      </div>
                      <div className="text-sm text-gray-600">Red Flags Detected</div>
                    </div>
                  </div>

                  {/* Red Flags */}
                  {example.redFlags.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <AlertTriangle className="h-5 w-5 text-warning-500 mr-2" />
                        Red Flags Detected
                      </h4>
                      <div className="space-y-2">
                        {example.redFlags.map((flag, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                          >
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-red-800">{flag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Advice */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Shield className="h-5 w-5 text-primary-500 mr-2" />
                      Recommended Action
                    </h4>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-900">{example.advice}</p>
                    </div>
                  </div>

                  {/* Try It Yourself */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">🎯 Try It Yourself:</h4>
                    <p className="text-sm text-green-800 mb-3">
                      Want to test with your own content? Go back to the main page and paste your own SMS, URL, or upload audio files for analysis.
                    </p>
                    <Link href="/" className="btn-primary inline-block">
                      Go to Main Page
                    </Link>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Features Overview */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Key Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Detection</h3>
              <p className="text-sm text-gray-600">
                Advanced pattern recognition to identify scams with high accuracy
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-success-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Results</h3>
              <p className="text-sm text-gray-600">
                Get risk assessment and actionable advice in seconds
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-warning-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Red Flag Alerts</h3>
              <p className="text-sm text-gray-600">
                Detailed breakdown of suspicious patterns and keywords
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-danger-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Complaint Generation</h3>
              <p className="text-sm text-gray-600">
                Auto-generate formal complaints for authorities
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
