'use client'

import { useState } from 'react'
import { FileText, Copy, Download, AlertTriangle, Shield, User, Calendar, MapPin } from 'lucide-react'

interface ComplaintGeneratorProps {
  result: {
    classification?: string
    is_scam?: boolean
    red_flags?: string[]
    recommendations?: string[]
    confidence?: number
    risk_level?: string
  }
}

export default function ComplaintGenerator({ result }: ComplaintGeneratorProps) {
  const [complaint, setComplaint] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateComplaint = async () => {
    if (!result) return
    
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/generate-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result })
      })
      
      if (response.ok) {
        const data = await response.json()
        setComplaint(data.complaint)
      } else {
        // Fallback to local generation
        setComplaint(generateComplaintText())
      }
    } catch {
      // Fallback to local generation
      setComplaint(generateComplaintText())
    } finally {
      setIsGenerating(false)
    }
  }

  const generateComplaintText = () => {
    const scamType = result.is_scam ? 'SMS Scam' : 'Suspicious Message'
    const riskLevel = result.risk_level || 'Medium'
    const redFlags = result.red_flags?.join(', ') || 'Suspicious content detected'
    
    return `CYBERCRIME COMPLAINT

Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
Complaint Type: ${scamType}
Risk Level: ${riskLevel}

DETAILS:
The complainant has received a suspicious message that has been analyzed by the UPI Scam Checker AI system and classified as potentially fraudulent.

ANALYSIS RESULTS:
- Classification: ${result.classification || (result.is_scam ? 'Scam' : 'Safe')}
- Confidence Level: ${result.confidence || 0}
- Risk Assessment: ${riskLevel}
- Red Flags Identified: ${redFlags}

RECOMMENDATIONS:
${result.recommendations?.map(rec => `- ${rec}`).join('\n') || '- Exercise caution with this message\n- Do not share personal information\n- Report to authorities if necessary'}

COMPLAINANT STATEMENT:
I hereby lodge this complaint regarding the suspicious message received. The message has been analyzed by AI-powered scam detection systems and identified as potentially fraudulent. I request appropriate action to be taken against the perpetrators and to prevent similar incidents in the future.

I am willing to provide additional information or evidence if required for investigation purposes.

Signature: _________________
Date: _____________________

Contact Information:
Name: [Your Name]
Phone: [Your Phone Number]
Email: [Your Email]
Address: [Your Address]

This complaint is filed under the Information Technology Act, 2000 and relevant cybercrime laws.`
  }

  const copyToClipboard = () => {
    if (complaint) {
      navigator.clipboard.writeText(complaint)
    }
  }

  const downloadComplaint = () => {
    if (!complaint) return
    
    const blob = new Blob([complaint], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cybercrime-complaint.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!result) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <FileText className="w-6 h-6 text-red-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Generate Complaint</h3>
          <p className="text-sm text-gray-600">Create a formal cybercrime complaint based on analysis results</p>
        </div>
      </div>

      {/* Generate Button */}
      <div className="mb-4">
        <button
          onClick={generateComplaint}
          disabled={isGenerating}
          className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Generating Complaint...</span>
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              <span>Generate Cybercrime Complaint</span>
            </>
          )}
        </button>
      </div>

      {/* Complaint Preview */}
      {complaint && (
        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 text-sm"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Complaint</span>
            </button>
            <button
              onClick={downloadComplaint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Complaint</span>
            </button>
          </div>

          {/* Complaint Content */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">Generated Complaint</h4>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                {complaint}
              </pre>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Next Steps</h4>
            </div>
            
            <div className="space-y-2 text-sm text-blue-800">
              <div>• Review the generated complaint and customize it with your personal details</div>
              <div>• Print the complaint and sign it manually</div>
              <div>• Submit to your local cybercrime police station or online portal</div>
              <div>• Keep a copy for your records</div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-2 mb-3">
              <User className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-900">Important Contacts</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800 text-sm">Cybercrime Portal</span>
                </div>
                <p className="text-green-700 text-xs">https://cybercrime.gov.in</p>
              </div>
              
              <div className="bg-white border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800 text-sm">Helpline</span>
                </div>
                <p className="text-green-700 text-xs">1930 (24/7 Support)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
