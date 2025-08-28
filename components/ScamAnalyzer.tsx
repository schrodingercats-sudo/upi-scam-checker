'use client'

import { useState } from 'react'
import { MessageSquare, Link, Phone, Upload, Loader2 } from 'lucide-react'
import PhoneTracker from '@/components/PhoneTracker'
import { motion } from 'framer-motion'

interface AnalysisResult {
  error?: string;
  classification?: string;
  confidence_score?: string;
  risk_level?: string;
  recommended_action?: string;
  sender_analysis?: {
    category: string;
    category_code: string;
    trust_score: number;
  };
  red_flags?: string[];
}

interface ScamAnalyzerProps {
  activeTab: 'sms' | 'url' | 'call' | 'track'
  onTabChange: (tab: 'sms' | 'url' | 'call' | 'track') => void
  isAnalyzing: boolean
}

export default function ScamAnalyzer({ 
  activeTab, 
  onTabChange, 
  isAnalyzing 
}: ScamAnalyzerProps) {
  const [input, setInput] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (activeTab === 'call') {
      if (!audioFile) return
      const form = new FormData()
      form.append('file', audioFile)
      try {
        const response = await fetch('/api/analyze-call', { method: 'POST', body: form })
        const res = await response.json()
        setResult(res)
      } catch {
        setResult({ error: 'Audio analysis failed' })
      }
      return
    }
    
    if (input.trim()) {
      try {
        const response = await fetch('/api/analyze-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: input })
        })
        const data = await response.json()
        setResult(data)
      } catch {
        setResult({ error: 'Analysis failed' })
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file)
      setInput(`Audio file: ${file.name}`)
    }
  }

  const tabs = [
    { id: 'sms', label: 'SMS/WhatsApp', icon: MessageSquare, description: 'Paste message text' },
    { id: 'url', label: 'URL/Link', icon: Link, description: 'Check suspicious links' },
    { id: 'call', label: 'Call Audio', icon: Phone, description: 'Upload audio file' },
    { id: 'track', label: 'Track Number', icon: Phone, description: 'Track phone number & complaints' }
  ] as const

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Analyze Content for Scams
        </h3>
        <p className="text-gray-600">
          Choose the type of content you want to analyze and paste or upload it below.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <motion.div
              key={tab.id}
              initial={false}
              animate={isActive ? 'active' : 'inactive'}
              variants={{
                active: { opacity: 1, display: 'block' },
                inactive: { opacity: 0, display: 'none' }
              }}
              transition={{ duration: 0.2 }}
            >
              {isActive && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Icon className="h-5 w-5" />
                    <span>{tab.description}</span>
                  </div>

                  {tab.id === 'track' ? (
                    <PhoneTracker />
                  ) : tab.id === 'call' ? (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="audio-upload"
                        />
                        <label
                          htmlFor="audio-upload"
                          className="cursor-pointer flex flex-col items-center space-y-2"
                        >
                          <Upload className="h-8 w-8 text-gray-400" />
                          <div>
                            <span className="text-blue-600 font-medium">Click to upload</span>
                            <span className="text-gray-500"> or drag and drop</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Audio files up to 60 seconds (MP3, WAV, M4A)
                          </p>
                        </label>
                      </div>
                      
                      {audioFile && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-green-800 text-sm">
                            <strong>File selected:</strong> {audioFile.name}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={
                        tab.id === 'sms' 
                          ? 'Paste the SMS or WhatsApp message here...'
                          : 'Paste the URL or link here...'
                      }
                      className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      disabled={isAnalyzing}
                    />
                  )}

                  {tab.id !== 'track' && (
                    <button
                      onClick={handleSubmit}
                      disabled={isAnalyzing || (!input.trim() && !audioFile)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        `Analyze ${tab.label}`
                      )}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Results Display */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-lg border"
        >
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
        </motion.div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 How it works:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Our AI analyzes the content for suspicious patterns and keywords</li>
          <li>• Get instant risk assessment with confidence scores</li>
          <li>• Receive actionable advice and red flag warnings</li>
          <li>• Generate complaint drafts for high-risk cases</li>
        </ul>
      </div>
    </div>
  )
}
