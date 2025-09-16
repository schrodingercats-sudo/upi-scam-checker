'use client';

import { useState } from 'react';
import { Phone, User, MessageCircle, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface CustomerInformation {
  first_name: string;
  last_name: string;
}

interface VoiceGenieFormData {
  customerNumber: string;
  // Remove campaignId from the form data since we'll use the environment variable
  customerInformation: CustomerInformation;
}

export default function VoiceGenieSupport() {
  const [formData, setFormData] = useState<VoiceGenieFormData>({
    customerNumber: '',
    customerInformation: {
      first_name: '',
      last_name: ''
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          // Fix the TypeScript error by properly typing the parent object
          ...(prev[parent as keyof VoiceGenieFormData] as Partial<CustomerInformation>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      // Use the campaign ID from environment variables
      const campaignId = process.env.NEXT_PUBLIC_VOICEGENIE_CAMPAIGN_ID || 'voicegenie-support-campaign';

      const response = await fetch('/api/voicegenie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerNumber: formData.customerNumber,
          campaignId: campaignId,
          customerInformation: formData.customerInformation
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Call initiated successfully! VoiceGenie will contact the customer shortly.');
        // Reset form
        setFormData({
          customerNumber: '',
          customerInformation: {
            first_name: '',
            last_name: ''
          }
        });
      } else {
        setStatus('error');
        // Provide more detailed error message
        if (data.details?.message) {
          setMessage(`VoiceGenie Error: ${data.details.message}. Please check your VoiceGenie account setup.`);
        } else if (data.error?.includes('VoiceGenie API not properly configured')) {
          setMessage('VoiceGenie API not properly configured. Please check your .env file and add your actual VoiceGenie credentials. Refer to VOICEGENIE_SETUP.md for detailed instructions.');
        } else {
          setMessage(data.error || 'Failed to initiate call');
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Phone className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">VoiceGenie Customer Support</h2>
          <p className="text-gray-600">AI-powered customer support call initiation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Phone Number */}
        <div>
          <label htmlFor="customerNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Customer Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              id="customerNumber"
              value={formData.customerNumber}
              onChange={(e) => handleInputChange('customerNumber', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter customer phone number"
              required
            />
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                id="firstName"
                value={formData.customerInformation.first_name}
                onChange={(e) => handleInputChange('customerInformation.first_name', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Customer first name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                id="lastName"
                value={formData.customerInformation.last_name}
                onChange={(e) => handleInputChange('customerInformation.last_name', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Customer last name"
              />
            </div>
          </div>
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Initiating Call...
            </>
          ) : (
            <>
              <Phone className="w-5 h-5" />
              Initiate Support Call
            </>
          )}
        </button>
      </form>

      {/* Information Panel */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">How it works:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Enter the customer's phone number</li>
          <li>• Optionally add customer information</li>
          <li>• VoiceGenie AI will automatically call the customer</li>
          <li>• The AI agent will handle the support conversation</li>
        </ul>
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-700">
            <strong>Note:</strong> This feature requires valid VoiceGenie account credentials. 
            If you encounter errors, please verify your VoiceGenie setup in the .env file.
          </p>
        </div>
      </div>
    </div>
  );
}