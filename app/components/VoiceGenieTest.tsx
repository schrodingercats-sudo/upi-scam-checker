'use client';

import { useState } from 'react';
import { Phone, TestTube, CheckCircle, AlertCircle } from 'lucide-react';

export default function VoiceGenieTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testVoiceGenieAPI = async () => {
    setIsLoading(true);
    setResult(null);
    setError('');

    try {
      const response = await fetch('/api/voicegenie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerNumber: '1234567890', // Test number
          campaignId: 'test-campaign-123',
          customerInformation: {
            first_name: 'Test',
            last_name: 'User'
          }
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'API test failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <TestTube className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">VoiceGenie API Test</h2>
          <p className="text-gray-600">Test the VoiceGenie integration</p>
        </div>
      </div>

      <button
        onClick={testVoiceGenieAPI}
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Testing API...
          </>
        ) : (
          <>
            <Phone className="w-5 h-5" />
            Test VoiceGenie API
          </>
        )}
      </button>

      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">API Test Successful</span>
          </div>
          <pre className="text-sm text-green-700 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800">API Test Failed</span>
          </div>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          This test will attempt to call the VoiceGenie API with test data. 
          Check the response to verify the integration is working correctly.
        </p>
      </div>
    </div>
  );
}
