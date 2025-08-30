'use client';

import React from 'react';
import { Bot, Phone, MessageCircle, Mic, User, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function AIAgentSupport() {
  const [step, setStep] = React.useState<'agent-selection' | 'user-info' | 'calling'>('agent-selection');
  const [selectedAgent, setSelectedAgent] = React.useState<'bland' | 'voicegenie' | null>(null);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);

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
            customerNumber: phone.trim(),
            campaignId: 'voicegenie-support-campaign',
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
        }, 3000);
      } else {
        // Provide more detailed error message for VoiceGenie
        if (selectedAgent === 'voicegenie' && data.details?.message) {
          setStatus(`VoiceGenie Error: ${data.details.message}. Please check your VoiceGenie account setup.`);
        } else if (selectedAgent === 'voicegenie' && data.error?.includes('VoiceGenie API not properly configured')) {
          setStatus('VoiceGenie API not properly configured.');
          setMessage('Please check your .env file and add your actual VoiceGenie credentials. Refer to VOICEGENIE_SETUP.md for detailed instructions.');
        } else {
          setStatus(data.error || 'Failed to initiate call');
        }
        setStep('user-info');
      }
    } catch (error) {
      setStatus('Network error. Please check your connection and try again.');
      setStep('user-info');
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

  return (
    <div className="bg-white/10 backdrop-blur border border-white/20 p-8 rounded-lg">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">AI Agent Support</h2>
      </div>

             {/* Step Indicator */}
       <div className="flex items-center justify-center mb-8">
         <div className="flex items-center space-x-4">
           <div className={`flex items-center ${step === 'agent-selection' ? 'text-white' : 'text-white/40'}`}>
             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
               step === 'agent-selection' ? 'bg-white text-black' : 'bg-white/20 text-white/60'
             }`}>
               1
             </div>
             <span className="ml-2 text-sm">Choose AI</span>
           </div>
           <div className="w-8 h-1 bg-white/20"></div>
           <div className={`flex items-center ${step === 'user-info' || step === 'calling' ? 'text-white' : 'text-white/40'}`}>
             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
               step === 'user-info' || step === 'calling' ? 'bg-white text-black' : 'bg-white/20 text-white/60'
             }`}>
               2
             </div>
             <span className="ml-2 text-sm">Your Info</span>
           </div>
           <div className="w-8 h-1 bg-white/20"></div>
           <div className={`flex items-center ${step === 'calling' ? 'text-white' : 'text-white/40'}`}>
             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
               step === 'calling' ? 'bg-white text-black' : 'bg-white/20 text-white/60'
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
             <h3 className="text-lg font-semibold text-white mb-2">Select Your AI Assistant</h3>
             <p className="text-white/80">Choose between our two AI support agents</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Bland AI Option */}
             <button
               onClick={() => handleAgentSelection('bland')}
               className="p-6 border-2 border-white/20 rounded-lg hover:border-white/40 hover:bg-white/5 transition-all duration-200 text-left group bg-white/5"
             >
               <div className="flex items-center gap-3 mb-3">
                 <div className="p-2 bg-white/15 rounded-lg group-hover:bg-white/25 transition-colors">
                   <MessageCircle className="w-5 h-5 text-white" />
                 </div>
                 <div>
                   <h4 className="font-semibold text-white">Server-1: Bland AI</h4>
                   <p className="text-sm text-white/80">Text-based AI Support</p>
                 </div>
               </div>
               <ul className="text-sm text-white/80 space-y-1">
                 <li>• Advanced text processing</li>
                 <li>• Quick response times</li>
                 <li>• Detailed explanations</li>
                 <li>• 24/7 availability</li>
               </ul>
             </button>

             {/* VoiceGenie Option */}
             <button
               onClick={() => handleAgentSelection('voicegenie')}
               className="p-6 border-2 border-white/20 rounded-lg hover:border-white/40 hover:bg-white/5 transition-all duration-200 text-left group bg-white/5"
             >
               <div className="flex items-center gap-3 mb-3">
                 <div className="p-2 bg-white/15 rounded-lg group-hover:bg-white/25 transition-colors">
                   <Mic className="w-5 h-5 text-white" />
                 </div>
                 <div>
                   <h4 className="font-semibold text-white">Server-2: VoiceGenie</h4>
                   <p className="text-sm text-white/80">Voice-based AI Support</p>
                 </div>
               </div>
               <ul className="text-sm text-white/80 space-y-1">
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
             <h3 className="text-lg font-semibold text-white mb-2">
               Your Information
             </h3>
             <p className="text-white/80">
               Selected: <span className="font-medium text-white">
                 {selectedAgent === 'bland' ? 'Server-1: Bland AI' : 'Server-2: VoiceGenie'}
               </span>
             </p>
           </div>

           {/* Name Input */}
           <div>
             <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
               Your Full Name *
             </label>
             <div className="relative">
               <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
               <input
                 type="text"
                 id="name"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 className="w-full pl-10 pr-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent bg-white/10 text-white placeholder-white/50"
                 placeholder="Enter your full name"
                 required
               />
             </div>
             <p className="text-xs text-white/60 mt-1">
               This helps the AI identify and communicate with you more effectively
             </p>
           </div>

           {/* Phone Number Input */}
           <div>
             <label htmlFor="phoneNumber" className="block text-sm font-medium text-white mb-2">
               Phone Number *
             </label>
             <div className="relative">
               <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
               <input
                 type="tel"
                 id="phoneNumber"
                 value={phone}
                 onChange={(e) => setPhone(e.target.value)}
                 className="w-full pl-10 pr-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent bg-white/10 text-white placeholder-white/50"
                 placeholder="Enter your phone number"
                 required
               />
             </div>
             <p className="text-xs text-white/60 mt-1">
               The AI will call you at this number
             </p>
           </div>

           {/* Status Message */}
           {status && (
             <div className={`p-4 rounded-lg flex items-center gap-3 ${
               status.includes('will call you shortly') 
                 ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
                 : 'bg-red-500/20 border border-red-500/30 text-red-300'
             }`}>
               {status.includes('will call you shortly') ? (
                 <CheckCircle className="w-5 h-5 text-green-400" />
               ) : (
                 <AlertCircle className="w-5 h-5 text-red-400" />
               )}
               <span className="text-sm font-medium">{status}</span>
             </div>
           )}

           {/* Action Buttons */}
           <div className="flex gap-3">
             <button
               type="button"
               onClick={goBack}
               className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 border border-white/20"
             >
               Back
             </button>
             <button
               type="submit"
               disabled={loading}
               className="flex-1 bg-white hover:bg-white/90 disabled:bg-white/50 text-black font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
             >
               {loading ? (
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
             <div className="w-16 h-16 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-4">
               <Phone className="w-8 h-8 text-white" />
             </div>
             <h3 className="text-lg font-semibold text-white mb-2">
               Initiating AI Call...
             </h3>
             <p className="text-white/80">
               {selectedAgent === 'bland' ? 'Bland AI' : 'VoiceGenie'} is preparing to call you
             </p>
           </div>

           {status && (
             <div className={`p-4 rounded-lg ${
               status.includes('will call you shortly') 
                 ? 'bg-green-500/20 border border-green-500/30' 
                 : 'bg-red-500/20 border border-red-500/30'
             }`}>
               <div className="flex items-center gap-3">
                 {status.includes('will call you shortly') ? (
                   <CheckCircle className="w-5 h-5 text-green-400" />
                 ) : (
                   <AlertCircle className="w-5 h-5 text-red-400" />
                 )}
                 <span className={`text-sm font-medium ${
                   status.includes('will call you shortly') ? 'text-green-300' : 'text-red-300'
                 }`}>{status}</span>
               </div>
             </div>
           )}
         </div>
       )}
    </div>
  );
}
