"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { formatPhoneNumberForVoiceGenie } from '@/utils/phoneFormatter';

export default function BlandSupport(): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<'agent-selection' | 'user-info' | 'calling'>('agent-selection');
  const [selectedAgent, setSelectedAgent] = React.useState<'bland' | 'voicegenie' | null>(null);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [errorDetail, setErrorDetail] = React.useState<any>(null);

  const handleAgentSelection = (agent: 'bland' | 'voicegenie') => {
    setSelectedAgent(agent);
    setStep('user-info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim()) {
      setStatus("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setStatus(null);
    setStep('calling');

    try {
      let response;
      
      if (selectedAgent === 'bland') {
        // Call Bland AI API
        response = await fetch('/api/bland-ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerNumber: phone.trim(),
            customerName: name.trim(),
            campaignId: 'bland-support-campaign'
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
            customerNumber: formatPhoneNumberForVoiceGenie(phone.trim()),
            campaignId: process.env.NEXT_PUBLIC_VOICEGENIE_CAMPAIGN_ID || 'voicegenie-support-campaign',
            customerInformation: {
              first_name: name.trim().split(' ')[0] || name.trim(),
              last_name: name.trim().split(' ').slice(1).join(' ') || ''
            }
          }),
        });
      }

      const data = await response.json();

      if (response.ok) {
        setStatus(`${selectedAgent === 'bland' ? 'Bland AI' : 'VoiceGenie'} will call you shortly!`);
        // Reset form after success
        setTimeout(() => {
          setName('');
          setPhone('');
          setSelectedAgent(null);
          setStep('agent-selection');
          setStatus(null);
          setOpen(false);
        }, 3000);
      } else {
        // Provide more detailed error message for VoiceGenie
        if (selectedAgent === 'voicegenie' && data.details?.message) {
          setStatus(`VoiceGenie Error: ${data.details.message}. Please check your VoiceGenie account setup.`);
        } else if (selectedAgent === 'voicegenie' && data.error?.includes('VoiceGenie API not properly configured')) {
          setStatus('VoiceGenie API not properly configured.');
          setErrorDetail('Please check your .env file and add your actual VoiceGenie credentials. Refer to VOICEGENIE_SETUP.md for detailed instructions.');
        } else {
          setStatus(data.error || 'Failed to initiate call');
        }
      }
    } catch (error) {
      setStatus('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'user-info') {
      setStep('agent-selection');
      setSelectedAgent(null);
    } else if (step === 'calling') {
      setStep('user-info');
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setSelectedAgent(null);
    setStep('agent-selection');
    setStatus(null);
    setErrorDetail(null);
    setOpen(false);
  };

  return (
    <>
      <div className="fixed right-4 bottom-16 z-[60] pointer-events-auto">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <Icon icon="mdi:headset" className="w-5 h-5" />
          <span>AI agent customer support</span>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !loading && resetForm()} />
          <div className="relative z-[71] w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            
            {/* Header */}
            <div className="mb-4 flex items-center gap-2 text-white">
              <Icon icon="mdi:headset" className="w-5 h-5" />
              <div className="text-sm font-medium">AI Agent Support</div>
            </div>

            {/* Step Indicator */}
            <div className="mb-6 flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className={`flex items-center ${step === 'agent-selection' ? 'text-white' : 'text-white/50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    step === 'agent-selection' ? 'bg-indigo-600 text-white' : 'bg-white/20 text-white/60'
                  }`}>
                    1
                  </div>
                  <span className="ml-2 text-xs">Choose AI</span>
                </div>
                <div className="w-6 h-1 bg-white/20"></div>
                <div className={`flex items-center ${step === 'user-info' || step === 'calling' ? 'text-white' : 'text-white/50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    step === 'user-info' || step === 'calling' ? 'bg-indigo-600 text-white' : 'bg-white/20 text-white/60'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 text-xs">Your Info</span>
                </div>
                <div className="w-6 h-1 bg-white/20"></div>
                <div className={`flex items-center ${step === 'calling' ? 'text-white' : 'text-white/50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    step === 'calling' ? 'bg-indigo-600 text-white' : 'bg-white/20 text-white/60'
                  }`}>
                    3
                  </div>
                  <span className="ml-2 text-xs">Call</span>
                </div>
              </div>
            </div>

            {/* Agent Selection Step */}
            {step === 'agent-selection' && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Select Your AI Assistant</h3>
                  <p className="text-xs text-white/70">Choose between our two AI support agents</p>
                </div>

                <div className="space-y-3">
                  {/* Bland AI Option */}
                  <button
                    onClick={() => handleAgentSelection('bland')}
                    className="w-full p-4 border border-white/20 rounded-lg hover:border-indigo-400 hover:bg-white/5 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Icon icon="mdi:message-text" className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">Server-1: Bland AI</h4>
                        <p className="text-xs text-white/70">Text-based AI Support</p>
                      </div>
                    </div>
                    <ul className="text-xs text-white/60 space-y-1">
                      <li>• Advanced text processing</li>
                      <li>• Quick response times</li>
                      <li>• Detailed explanations</li>
                    </ul>
                  </button>

                  {/* VoiceGenie Option */}
                  <button
                    onClick={() => handleAgentSelection('voicegenie')}
                    className="w-full p-4 border border-white/20 rounded-lg hover:border-purple-400 hover:bg-white/5 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Icon icon="mdi:microphone" className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">Server-2: VoiceGenie</h4>
                        <p className="text-xs text-white/70">Voice-based AI Support</p>
                      </div>
                    </div>
                    <ul className="text-xs text-white/60 space-y-1">
                      <li>• Natural voice conversations</li>
                      <li>• Human-like interactions</li>
                      <li>• Multi-language support</li>
                    </ul>
                  </button>
                </div>
              </div>
            )}

            {/* User Information Step */}
            {step === 'user-info' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Your Information</h3>
                  <p className="text-xs text-white/70">
                    Selected: <span className="font-medium text-indigo-400">
                      {selectedAgent === 'bland' ? 'Server-1: Bland AI' : 'Server-2: VoiceGenie'}
                    </span>
                  </p>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-xs text-white/70 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
                    placeholder="Enter your full name"
                    required
                  />
                  <p className="text-xs text-white/50 mt-1">
                    This helps the AI identify and communicate with you more effectively
                  </p>
                </div>

                {/* Phone Number Input */}
                <div>
                  <label className="block text-xs text-white/70 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
                    placeholder="e.g. +91 98xxxxxx"
                    required
                  />
                  <p className="text-xs text-white/50 mt-1">
                    The AI will call you at this number
                  </p>
                </div>

                {/* Status Message */}
                {status && (
                  <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-xs text-red-300">
                    {status}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white/80 font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-xs"
                  >
                    {loading ? (
                      <>
                        <Icon icon="eos-icons:three-dots-loading" className="w-4 h-4" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Icon icon="mdi:phone" className="w-4 h-4" />
                        Start AI Call
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Calling Step */}
            {step === 'calling' && (
              <div className="text-center space-y-4">
                <div className="animate-pulse">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon icon="mdi:phone" className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">
                    Initiating AI Call...
                  </h3>
                  <p className="text-xs text-white/70">
                    {selectedAgent === 'bland' ? 'Bland AI' : 'VoiceGenie'} is preparing to call you
                  </p>
                </div>

                {status && (
                  <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-xs text-green-300">
                    {status}
                  </div>
                )}

                {errorDetail && (
                  <pre className="max-h-32 overflow-auto rounded-lg border border-white/10 bg-black/30 p-2 text-[10px] text-white/80">{JSON.stringify(errorDetail, null, 2)}</pre>
                )}
              </div>
            )}

            {/* Close Button */}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                disabled={loading}
                onClick={resetForm}
                className="rounded-full px-3 py-2 text-xs text-white/80 hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


