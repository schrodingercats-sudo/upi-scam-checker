'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, TrendingUp, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

interface ScamPattern {
  id: string
  title: string
  description: string
  type: 'UPI' | 'SMS' | 'Call' | 'WhatsApp'
  severity: 'High' | 'Medium' | 'Low'
  date: string
  source: string
  redFlags: string[]
}

export default function LatestScams() {
  const [scamPatterns, setScamPatterns] = useState<ScamPattern[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching latest scam patterns
    const fetchScamPatterns = async () => {
      setIsLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data - in production, this would come from your knowledge feed
      const mockPatterns: ScamPattern[] = [
        {
          id: '1',
          title: 'Fake KYC Expiry SMS',
          description: 'Scammers sending SMS claiming KYC has expired and asking for immediate verification',
          type: 'SMS',
          severity: 'High',
          date: '2024-01-15',
          source: 'RBI Advisory',
          redFlags: ['Urgency tactics', 'KYC expiry threat', 'Click to verify links']
        },
        {
          id: '2',
          title: 'UPI Handle Impersonation',
          description: 'Fraudsters creating fake UPI handles similar to legitimate businesses',
          type: 'UPI',
          severity: 'High',
          date: '2024-01-14',
          source: 'NPCI Alert',
          redFlags: ['Similar UPI handles', 'Slight spelling variations', 'Unverified sources']
        },
        {
          id: '3',
          title: 'Fake Prize Notifications',
          description: 'WhatsApp messages claiming lottery wins or prize money',
          type: 'WhatsApp',
          severity: 'Medium',
          date: '2024-01-13',
          source: 'CERT-In',
          redFlags: ['Too good to be true', 'Payment processing fees', 'Personal details required']
        },
        {
          id: '4',
          title: 'Bank Account Blocking Calls',
          description: 'Automated calls claiming bank accounts are blocked due to suspicious activity',
          type: 'Call',
          severity: 'High',
          date: '2024-01-12',
          source: 'Bank Alerts',
          redFlags: ['Automated voice', 'Account blocking threats', 'OTP requests']
        },
        {
          id: '5',
          title: 'Fake Investment Schemes',
          description: 'Promises of high returns on cryptocurrency or stock investments',
          type: 'SMS',
          severity: 'Medium',
          date: '2024-01-11',
          source: 'SEBI Warning',
          redFlags: ['Guaranteed returns', 'Limited time offers', 'Investment pressure']
        }
      ]
      
      setScamPatterns(mockPatterns)
      setIsLoading(false)
    }

    fetchScamPatterns()
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'Low':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'UPI':
        return '💳'
      case 'SMS':
        return '📱'
      case 'Call':
        return '📞'
      case 'WhatsApp':
        return '💬'
      default:
        return '⚠️'
    }
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Latest Scam Patterns
          </h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Latest Scam Patterns
          </h3>
        </div>
        <div className="text-xs text-gray-500 flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Updated daily
        </div>
      </div>

      <div className="space-y-4">
        {scamPatterns.slice(0, 3).map((pattern, index) => (
          <motion.div
            key={pattern.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getTypeIcon(pattern.type)}</span>
                <span className="text-sm font-medium text-gray-900">
                  {pattern.title}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full border ${getSeverityColor(pattern.severity)}`}>
                {pattern.severity}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              {pattern.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Source: {pattern.source}</span>
              <span>{new Date(pattern.date).toLocaleDateString()}</span>
            </div>
            
            {pattern.redFlags.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs font-medium text-gray-700 mb-2">Red Flags:</div>
                <div className="flex flex-wrap gap-1">
                  {pattern.redFlags.slice(0, 2).map((flag, flagIndex) => (
                    <span
                      key={flagIndex}
                      className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded"
                    >
                      {flag}
                    </span>
                  ))}
                  {pattern.redFlags.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{pattern.redFlags.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full btn-secondary text-sm">
          View All Patterns
        </button>
      </div>

      {/* Sources */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Information Sources:</h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <a
            href="https://rbi.org.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 flex items-center"
          >
            RBI
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
          <a
            href="https://ncci.org.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 flex items-center"
          >
            NPCI
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
          <a
            href="https://cert-in.org.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 flex items-center"
          >
            CERT-In
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      </div>

      {/* Alert Subscription */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">Stay Updated</p>
            <p>Get real-time alerts about new scam patterns and security threats.</p>
          </div>
        </div>
        <button className="w-full mt-2 btn-primary text-xs py-1">
          Subscribe to Alerts
        </button>
      </div>
    </div>
  )
}
