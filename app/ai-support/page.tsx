import UnifiedAIAgent from '../components/UnifiedAIAgent';
import { Bot, Phone, MessageCircle, Shield, Users } from 'lucide-react';

export default function AISupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 AI Agent Support System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose between our two powerful AI assistants: Bland AI (Server-1) or VoiceGenie (Server-2)
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Dual AI System</h3>
            <p className="text-sm text-gray-600">
              Choose between Bland AI (Server-1) and VoiceGenie (Server-2)
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Routing</h3>
            <p className="text-sm text-gray-600">
              Intelligent routing based on your preference and needs
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
            <p className="text-sm text-gray-600">
              Your conversations are protected and confidential
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Personalized Support</h3>
            <p className="text-sm text-gray-600">
              AI agents know your name for better communication
            </p>
          </div>
        </div>

        {/* Unified AI Agent Component */}
        <div className="mb-12">
          <UnifiedAIAgent />
        </div>

        {/* AI Agents Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Bland AI Details */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Server-1: Bland AI</h2>
                <p className="text-gray-600">Text-based AI Support</p>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Strengths:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Advanced text processing capabilities</li>
                <li>• Quick response times</li>
                <li>• Detailed explanations</li>
                <li>• 24/7 availability</li>
                <li>• Cost-effective solution</li>
              </ul>
              <h3 className="font-semibold text-gray-900 mt-4">Best For:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Technical support queries</li>
                <li>• Detailed explanations</li>
                <li>• Quick information retrieval</li>
                <li>• Users who prefer text-based interactions</li>
              </ul>
            </div>
          </div>

          {/* VoiceGenie Details */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Phone className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Server-2: VoiceGenie</h2>
                <p className="text-gray-600">Voice-based AI Support</p>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Strengths:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Natural voice conversations</li>
                <li>• Human-like interactions</li>
                <li>• Multi-language support</li>
                <li>• Emotional intelligence</li>
                <li>• Personalized voice experience</li>
              </ul>
              <h3 className="font-semibold text-gray-900 mt-4">Best For:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Complex problem solving</li>
                <li>• Emotional support</li>
                <li>• Users who prefer voice interactions</li>
                <li>• Multi-language support needs</li>
              </ul>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Choose Your AI</h3>
              <p className="text-sm text-gray-600">
                Select between Bland AI (Server-1) for text-based support or VoiceGenie (Server-2) for voice conversations
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Provide Information</h3>
              <p className="text-sm text-gray-600">
                Enter your full name and phone number so the AI can personalize the conversation and call you
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get AI Support</h3>
              <p className="text-sm text-gray-600">
                The selected AI agent will call you shortly and provide personalized support based on your needs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
