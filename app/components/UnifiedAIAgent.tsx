'use client';

import { useState } from 'react';
import { Phone, User, MessageCircle, Loader2, CheckCircle, AlertCircle, Bot, Mic } from 'lucide-react';
import { formatPhoneNumberForVoiceGenie } from '@/utils/phoneFormatter';

interface UserInformation {
  name: string;
  phoneNumber: string;
}

interface AIAgentData {
  userInfo: UserInformation;
  selectedAgent: 'bland' | 'voicegenie' | null;
}

export default function UnifiedAIAgent() {
  const [step, setStep] = useState<'agent-selection' | 'user-info' | 'calling'>('agent-selection');
  const [formData, setFormData] = useState<AIAgentData>({
    userInfo: {
      name: '',
      phoneNumber: ''
    },
    selectedAgent: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleAgentSelection = (agent: 'bland' | 'voicegenie') => {
    setFormData(prev => ({ ...prev, selectedAgent: agent }));
    setStep('user-info');
  };

  const handleInputChange = (field: keyof UserInformation, value: string) => {
    setFormData(prev => ({
      ...prev,
      userInfo: {
        ...prev.userInfo,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // First, try to detect UPI scam
      const scamResult = await detectUpiScam(formData);

      // If it's detected as a scam, initiate customer support call
      if (scamResult.isScam) {
        // Show scam detection result
        setScamResult(scamResult);

        // Call VoiceGenie API
        let response = await fetch('/api/voicegenie', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerNumber: formatPhoneNumberForVoiceGenie(formData.userInfo.phoneNumber),
            campaignId: process.env.NEXT_PUBLIC_VOICEGENIE_CAMPAIGN_ID || 'voicegenie-support-campaign', // Use env var or fallback
            customerInformation: {
              first_name: formData.userInfo.name.split(' ')[0] || formData.userInfo.name,
              last_name: formData.userInfo.name.split(' ').slice(1).join(' ') || ''
            }
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(`${formData.selectedAgent === 'bland' ? 'Bland AI' : 'VoiceGenie'} will call you shortly!`);
          // Reset form after success
          setTimeout(() => {
            setFormData({
              userInfo: { name: '', phoneNumber: '' },
              selectedAgent: null
            });
            setStep('agent-selection');
            setStatus('idle');
            setMessage('');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to initiate call');
          setStep('user-info');
        }
      } else {
        // If not a scam, proceed with the selected agent
        let response;

        if (formData.selectedAgent === 'bland') {
          // Call Bland AI API
          response = await fetch('/api/bland-ai', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerNumber: formData.userInfo.phoneNumber,
              customerName: formData.userInfo.name,
              campaignId: 'bland-support-campaign' // You can make this configurable
            }),
          });
        } else {
          // Call VoiceGenie API
          response = await fetch('/api/voicegenie', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerNumber: formatPhoneNumberForVoiceGenie(formData.userInfo.phoneNumber),
              campaignId: process.env.NEXT_PUBLIC_VOICEGENIE_CAMPAIGN_ID || 'voicegenie-support-campaign', // Use env var or fallback
              customerInformation: {
                first_name: formData.userInfo.name.split(' ')[0] || formData.userInfo.name,
                last_name: formData.userInfo.name.split(' ').slice(1).join(' ') || ''
              }
            }),
          });
        }

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(`${formData.selectedAgent === 'bland' ? 'Bland AI' : 'VoiceGenie'} will call you shortly!`);
          // Reset form after success
          setTimeout(() => {
            setFormData({
              userInfo: { name: '', phoneNumber: '' },
              selectedAgent: null
            });
            setStep('agent-selection');
            setStatus('idle');
            setMessage('');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to initiate call');
          setStep('user-info');
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
      setStep('user-info');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'user-info') {
      setStep('agent-selection');
      setFormData(prev => ({ ...prev, selectedAgent: null }));
    } else if (step === 'calling') {
      setStep('user-info');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
          <Bot className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Agent Support</h2>
          <p className="text-gray-600">Choose your preferred AI assistant for support</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${step === 'agent-selection' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'agent-selection' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm">Choose AI</span>
          </div>
          <div className="w-8 h-1 bg-gray-200"></div>
          <div className={`flex items-center ${step === 'user-info' || step === 'calling' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'user-info' || step === 'calling' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm">Your Info</span>
          </div>
          <div className="w-8 h-1 bg-gray-200"></div>
          <div className={`flex items-center ${step === 'calling' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'calling' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm">Call</span>
          </div>
        </div>
      </div>

      {/* Agent Selection Step */}
      {step === 'agent-selection' && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Your AI Assistant</h3>
            <p className="text-gray-600">Choose between our two AI support agents</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bland AI Option */}
            <button
              onClick={() => handleAgentSelection('bland')}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Server-1: Bland AI</h4>
                  <p className="text-sm text-gray-600">Text-based AI Support</p>
                </div>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Advanced text processing</li>
                <li>• Quick response times</li>
                <li>• Detailed explanations</li>
                <li>• 24/7 availability</li>
              </ul>
            </button>

            {/* VoiceGenie Option */}
            <button
              onClick={() => handleAgentSelection('voicegenie')}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-left group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Mic className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Server-2: VoiceGenie</h4>
                  <p className="text-sm text-gray-600">Voice-based AI Support</p>
                </div>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Natural voice conversations</li>
                <li>• Human-like interactions</li>
                <li>• Multi-language support</li>
                <li>• Emotional intelligence</li>
              </ul>
            </button>
          </div>
        </div>
      )}

      {/* User Information Step */}
      {step === 'user-info' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your Information
            </h3>
            <p className="text-gray-600">
              Selected: <span className="font-medium text-blue-600">
                {formData.selectedAgent === 'bland' ? 'Server-1: Bland AI' : 'Server-2: VoiceGenie'}
              </span>
            </p>
          </div>

          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                id="name"
                value={formData.userInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This helps the AI identify and communicate with you more effectively
            </p>
          </div>

          {/* Phone Number Input */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                id="phoneNumber"
                value={formData.userInfo.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your phone number"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              The AI will call you at this number
            </p>
          </div>

          {/* Status Message */}
          {status !== 'idle' && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              status === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {status === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="text-sm font-medium">{message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={goBack}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Initiating Call...
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5" />
                  Start AI Call
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Calling Step */}
      {step === 'calling' && (
        <div className="text-center space-y-6">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Initiating AI Call...
            </h3>
            <p className="text-gray-600">
              {formData.selectedAgent === 'bland' ? 'Bland AI' : 'VoiceGenie'} is preparing to call you
            </p>
          </div>

          {status === 'success' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">{message}</span>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">{message}</span>
              </div>
              <button
                onClick={goBack}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Information Panel */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">How it works:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Choose between Bland AI (text-based) or VoiceGenie (voice-based)</li>
          <li>• Provide your name and phone number</li>
          <li>• The selected AI will call you shortly</li>
          <li>• Enjoy personalized AI-powered support</li>
        </ul>
      </div>
    </div>
  );
}
