'use client'

import { Shield, AlertTriangle, CheckCircle, XCircle, Copy, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { AnalysisResult } from '@/app/page'
import toast from 'react-hot-toast'

interface ResultCardProps {
  result: AnalysisResult
}

export default function ResultCard({ result }: ResultCardProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'text-success-600 bg-success-50 border-success-200'
      case 'Medium':
        return 'text-warning-600 bg-warning-50 border-warning-200'
      case 'High':
        return 'text-danger-600 bg-danger-50 border-danger-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Low':
        return <CheckCircle className="h-5 w-5 text-success-600" />
      case 'Medium':
        return <AlertTriangle className="h-5 w-5 text-warning-600" />
      case 'High':
        return <XCircle className="h-5 w-5 text-danger-600" />
      default:
        return <Shield className="h-5 w-5 text-gray-600" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success-600'
    if (confidence >= 0.6) return 'text-warning-600'
    return 'text-danger-600'
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadReport = () => {
    const report = `
UPI Scam Analysis Report
========================

Risk Assessment: ${result.label}
Confidence: ${(result.confidence * 100).toFixed(1)}%
Risk Level: ${result.riskLevel}

Red Flags:
${result.redFlags.map(flag => `• ${flag}`).join('\n')}

Advice: ${result.advice}

Generated on: ${new Date().toLocaleString()}
    `.trim()

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'scam-analysis-report.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Report downloaded!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {getRiskIcon(result.riskLevel)}
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Analysis Result
            </h3>
            <p className="text-sm text-gray-600">
              AI-powered scam detection completed
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={downloadReport}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {result.label}
          </div>
          <div className="text-sm text-gray-600">Risk Classification</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className={`text-2xl font-bold mb-1 ${getConfidenceColor(result.confidence)}`}>
            {(result.confidence * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Confidence Score</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className={`text-2xl font-bold mb-1 ${getRiskColor(result.riskLevel).split(' ')[0]}`}>
            {result.riskLevel}
          </div>
          <div className="text-sm text-gray-600">Risk Level</div>
        </div>
      </div>

      {/* Red Flags */}
      {result.redFlags.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <AlertTriangle className="h-5 w-5 text-warning-500 mr-2" />
            Red Flags Detected
          </h4>
          <div className="space-y-2">
            {result.redFlags.map((flag, index) => (
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
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Shield className="h-5 w-5 text-primary-500 mr-2" />
          Recommended Action
        </h4>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-900">{result.advice}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => copyToClipboard(result.advice)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Copy className="h-4 w-4" />
            <span>Copy Advice</span>
          </button>
          
          {result.riskLevel === 'High' && (
            <button className="btn-primary flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Generate Complaint</span>
            </button>
          )}
          
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center space-x-2"
          >
            <Shield className="h-4 w-4" />
            <span>Report to Cyber Crime</span>
          </a>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Disclaimer:</strong> This analysis is based on AI pattern recognition and should not replace 
          professional advice. Always exercise caution and report suspicious activity to authorities.
        </p>
      </div>
    </motion.div>
  )
}
