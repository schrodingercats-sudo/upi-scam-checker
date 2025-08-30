import { Phone, MessageCircle, Shield, Users, Bot } from 'lucide-react';
import AIAgentSupport from '../components/AIAgentSupport';

export default function SupportPage() {
  return (
    <div className="min-h-screen py-12" style={{
      backgroundImage: "linear-gradient(111.4deg, rgba(7,7,9,1) 6.5%, rgba(27,24,113,1) 93.2%)"
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Customer Support Center
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Get help with UPI Guard and access our AI-powered customer support system powered by VoiceGenie.
          </p>
        </div>

                  {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur border border-white/20 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Dual AI System</h3>
              <p className="text-sm text-white/80">
                Choose between Bland AI (Server-1) and VoiceGenie (Server-2)
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur border border-white/20 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Smart Routing</h3>
              <p className="text-sm text-white/80">
                Intelligent routing based on your preference and needs
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur border border-white/20 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Secure & Private</h3>
              <p className="text-sm text-white/80">
                Your conversations are protected and confidential
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur border border-white/20 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Personalized Support</h3>
              <p className="text-sm text-white/80">
                AI agents know your name for better communication
              </p>
            </div>
          </div>



                                   {/* AI Agent Support Component */}
          <div className="mb-12">
            <AIAgentSupport />
          </div>

                                   {/* Additional Support Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* FAQ Section */}
            <div className="bg-white/10 backdrop-blur border border-white/20 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-2">How does the dual AI system work?</h3>
                  <p className="text-sm text-white/80">
                    We offer two AI agents: Bland AI (Server-1) for text-based support and VoiceGenie (Server-2) for voice conversations. 
                    Choose your preferred agent and provide your information to get started.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">What's the difference between the two AI agents?</h3>
                  <p className="text-sm text-white/80">
                    Bland AI specializes in text processing and quick responses, while VoiceGenie provides natural voice conversations 
                    with human-like interactions and emotional intelligence.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">What information do I need to provide?</h3>
                  <p className="text-sm text-white/80">
                    You'll need to provide your full name and phone number. The AI agents use your name to personalize 
                    the conversation and call you at the provided number.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Is the service available 24/7?</h3>
                  <p className="text-sm text-white/80">
                    Yes! Both AI agents are available 24/7, providing round-the-clock support whenever you need assistance.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white/10 backdrop-blur border border-white/20 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">Other Support Options</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Email Support</h3>
                    <p className="text-sm text-white/80">support@upiguard.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Phone Support</h3>
                    <p className="text-sm text-white/80">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Live Chat</h3>
                    <p className="text-sm text-white/80">Available on our main website</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
