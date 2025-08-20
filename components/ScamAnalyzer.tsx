'use client'

import { useState } from 'react'
import { MessageSquare, Link, Phone, Upload, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface ScamAnalyzerProps {
  activeTab: 'sms' | 'url' | 'call'
  onTabChange: (tab: 'sms' | 'url' | 'call') => void
  onAnalyze: (input: string, type: 'sms' | 'url' | 'call') => void
  isAnalyzing: boolean
}

export default function ScamAnalyzer({ 
  activeTab, 
  onTabChange, 
  onAnalyze, 
  isAnalyzing 
}: ScamAnalyzerProps) {
  const [input, setInput] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() || audioFile) {
      onAnalyze(input.trim() || 'Audio file uploaded', activeTab)
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
    { id: 'call', label: 'Call Audio', icon: Phone, description: 'Upload audio file' }
  ]

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
              onClick={() => onTabChange(tab.id as 'sms' | 'url' | 'call')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white text-primary-600 shadow-sm'
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

                  {tab.id === 'call' ? (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
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
                            <span className="text-primary-600 font-medium">Click to upload</span>
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
                      className="input-field min-h-[120px] resize-none"
                      disabled={isAnalyzing}
                    />
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={isAnalyzing || (!input.trim() && !audioFile)}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
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
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

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
