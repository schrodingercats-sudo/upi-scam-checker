import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Loader2, MessageSquare, Mail, Smartphone } from 'lucide-react';
import type { MessageAnalysisRequest, MessageAnalysisResponse } from '@/shared/types';

export default function MessageAnalyzer() {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'sms' | 'whatsapp' | 'email'>('sms');
  const [analysis, setAnalysis] = useState<MessageAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeMessage = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const request: MessageAnalysisRequest = {
        message_content: message.trim(),
        message_type: messageType,
      };

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Analysis failed');
      }

      const result: MessageAnalysisResponse = await response.json();
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-600';
    if (score <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskBg = (score: number) => {
    if (score <= 3) return 'bg-green-100 border-green-200';
    if (score <= 6) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'sms': return <Smartphone className="w-4 h-4" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SecureUPI</h1>
        <p className="text-gray-600">AI-powered UPI scam detection engine</p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Type
          </label>
          <div className="flex gap-3">
            {['sms', 'whatsapp', 'email'].map((type) => (
              <button
                key={type}
                onClick={() => setMessageType(type as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  messageType === type
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {getMessageTypeIcon(type)}
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Content
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste the suspicious message here..."
            className="w-full h-32 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        <button
          onClick={analyzeMessage}
          disabled={loading || !message.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Analyze Message
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          {/* Risk Score Header */}
          <div className={`p-4 rounded-lg border-2 mb-6 ${getRiskBg(analysis.risk_score)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {analysis.is_scam ? (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {analysis.is_scam ? 'POTENTIAL SCAM DETECTED' : 'APPEARS LEGITIMATE'}
                  </h3>
                  <p className="text-sm text-gray-600">Risk Score: {analysis.risk_score}/10</p>
                </div>
              </div>
              <div className={`text-2xl font-bold ${getRiskColor(analysis.risk_score)}`}>
                {analysis.risk_score}/10
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
            <p className="text-gray-700 leading-relaxed">{analysis.analysis_result.summary}</p>
          </div>

          {/* Risk Factors */}
          {analysis.analysis_result.risk_factors.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Risk Factors
              </h4>
              <ul className="space-y-2">
                {analysis.analysis_result.risk_factors.map((factor, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legitimacy Indicators */}
          {analysis.analysis_result.legitimacy_indicators.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Legitimacy Indicators
              </h4>
              <ul className="space-y-2">
                {analysis.analysis_result.legitimacy_indicators.map((indicator, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{indicator}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              Recommendations
            </h4>
            <ul className="space-y-2">
              {analysis.analysis_result.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technical Analysis */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Technical Analysis</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {analysis.analysis_result.technical_analysis}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
