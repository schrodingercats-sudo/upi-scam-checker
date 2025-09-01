'use client'

import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Copy, ThumbsUp, ThumbsDown } from 'lucide-react'

interface ResultCardProps {
  result: {
    classification?: string
    confidence_score?: number
    risk_level?: string
    red_flags?: string[]
    recommended_action?: string
    is_scam?: boolean
    confidence?: number
    recommendations?: string[]
    message_id?: number
  }
}

export default function ResultCard({ result }: ResultCardProps) {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackSending, setFeedbackSending] = useState(false);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const copyToClipboard = () => {
    const text = `Analysis Result: ${result.classification || result.is_scam ? 'Scam' : 'Safe'} - Confidence: ${result.confidence_score || result.confidence} - Risk Level: ${result.risk_level}`
    navigator.clipboard.writeText(text)
  }

  const handleReportScam = () => {
    // Create a comprehensive scam report
    const scamReport = {
      timestamp: new Date().toISOString(),
      analysis: {
        classification: result.classification || (result.is_scam ? 'Scam' : 'Safe'),
        confidence: result.confidence_score || result.confidence,
        riskLevel: result.risk_level,
        redFlags: result.red_flags || [],
        recommendations: result.recommendations || []
      },
      userAgent: navigator.userAgent,
      platform: navigator.platform
    }

    // Open cybercrime.gov.in in a new tab for official reporting
    const cybercrimeUrl = 'https://cybercrime.gov.in/'
    window.open(cybercrimeUrl, '_blank')

    // Also show a local confirmation
    alert(`Scam Report Generated!\n\nReport has been prepared and National Cyber Crime Portal opened.\n\nPlease complete the official report at cybercrime.gov.in\n\nReport Details:\n- Classification: ${scamReport.analysis.classification}\n- Risk Level: ${scamReport.analysis.riskLevel}\n- Red Flags: ${scamReport.analysis.redFlags.length} detected\n\nReport saved locally for your records.`)

    // Save report to local storage for user's records
    const existingReports = JSON.parse(localStorage.getItem('scamReports') || '[]')
    existingReports.push(scamReport)
    localStorage.setItem('scamReports', JSON.stringify(existingReports))
  }

  const handleFeedback = async (isReal: boolean) => {
    if (!result.message_id || feedbackSubmitted) return;
    
    setFeedbackSending(true);
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_id: result.message_id,
          is_real: isReal
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFeedbackSubmitted(true);
      } else {
        console.error('Feedback submission failed:', data.error);
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
    } finally {
      setFeedbackSending(false);
    }
  }

  if (!result) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">Analysis Result</h3>
            <p className="text-sm text-gray-600">AI-powered scam detection completed</p>
          </div>
        </div>
        <button 
          onClick={copyToClipboard}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
        >
          <Copy className="w-4 h-4" />
          <span>Copy</span>
        </button>
      </div>

      {/* Three Metric Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {result.classification || (result.is_scam ? 'Scam' : 'Safe')}
          </div>
          <div className="text-sm text-gray-500">Risk Classification</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className={`text-2xl font-bold mb-1 ${getConfidenceColor(result.confidence_score || result.confidence || 0)}`}>
            {result.confidence_score || result.confidence || 0}
          </div>
          <div className="text-sm text-gray-500">Confidence Score</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {result.risk_level || 'Unknown'}
          </div>
          <div className="text-sm text-gray-500">Risk Level</div>
        </div>
      </div>

      {/* Red Flags Section */}
      {result.red_flags && result.red_flags.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h4 className="font-semibold text-gray-900">Red Flags Detected</h4>
          </div>
          <div className="space-y-2">
            {result.red_flags.map((flag, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Action Section */}
      {result.recommended_action && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Recommended Action</h4>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">{result.recommended_action}</p>
          </div>
        </div>
      )}

      {/* Feedback Collection Section */}
      {result.message_id && !feedbackSubmitted && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="w-5 h-5 text-yellow-600" />
            <h4 className="font-semibold text-gray-900">Help Improve Our Detection</h4>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            Was this analysis correct? Your feedback helps us improve scam detection for everyone.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => handleFeedback(true)}
              disabled={feedbackSending}
              className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Real Message</span>
            </button>
            <button
              onClick={() => handleFeedback(false)}
              disabled={feedbackSending}
              className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 disabled:opacity-50"
            >
              <ThumbsDown className="w-4 h-4" />
              <span>Fake/Scam</span>
            </button>
          </div>
        </div>
      )}

      {feedbackSubmitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700">
              Thank you for your feedback! This helps improve our scam detection system.
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Shield className="w-5 h-5 text-purple-600" />
          <h4 className="font-semibold text-gray-900">Quick Actions</h4>
        </div>
        <div className="flex justify-center">
          <button 
            onClick={handleReportScam}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center space-x-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report Scam</span>
          </button>
        </div>
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            Click to report this scam to National Cyber Crime Portal
          </p>
        </div>
      </div>
    </div>
  )
}