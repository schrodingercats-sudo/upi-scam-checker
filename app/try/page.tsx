"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

type AnalysisResult = {
  label: "Safe" | "Suspicious" | "Scam";
  confidence: number;
  redFlags?: string[];
  advice?: string;
  riskLevel?: "Low" | "Medium" | "High";
  number?: string;
  spamScore?: number;
  notes?: string;
  mlAnalysis?: {
    success: boolean;
    model: string;
    risk_score: {
      overall_score: number;
      risk_level: string;
      confidence: number;
      red_flags: string[];
      explanation: string;
      component_scores: Record<string, number>;
      recommended_action: string;
    };
    processing_time_ms: number;
    model_version: string;
  };
  deepseekAnalysis?: string;
  geminiAnalysis?: string;
  finalAnalysis?: Record<string, unknown>;
  analysisSteps?: {
    advancedML: string;
    deepseekReasoning: string;
    geminiFinalization: string;
  };
};

type TabKey = "sms" | "url" | "call" | "track";

type ResultMeta = { type: "sms" | "url" | "call" | "track"; input?: string };

type ScamNews = {
  id: string;
  title: string;
  summary: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  source: string;
  timestamp: string;
  category: "Phishing" | "UPI Fraud" | "SMS Scam" | "Call Scam" | "WhatsApp" | "General";
};

const mockScamNews: ScamNews[] = [
  {
    id: "1",
    title: "New UPI Handle Impersonation Attack",
    summary: "Scammers creating fake UPI handles similar to legitimate banks with slight variations",
    severity: "High",
    source: "NPCI Alert",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    category: "UPI Fraud"
  },
  {
    id: "2", 
    title: "Fake KYC Expiry SMS Surge",
    summary: "Massive increase in SMS claiming KYC has expired requiring immediate verification",
    severity: "Critical",
    source: "RBI Advisory",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    category: "SMS Scam"
  },
  {
    id: "3",
    title: "WhatsApp Investment Scam Alert",
    summary: "Fake investment schemes promising high returns on cryptocurrency",
    severity: "Medium",
    source: "CERT-In",
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    category: "WhatsApp"
  },
  {
    id: "4",
    title: "Bank Account Blocking Call Scam",
    summary: "Automated calls claiming accounts are blocked due to suspicious activity",
    severity: "High",
    source: "Bank Alerts",
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    category: "Call Scam"
  },
  {
    id: "5",
    title: "Phishing Links in Job Offers",
    summary: "Fake job offers containing malicious links to steal credentials",
    severity: "Medium",
    source: "Cyber Crime Portal",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    category: "Phishing"
  }
];

function ScamNewsFeed(): React.ReactElement {
  const [news] = useState<ScamNews[]>(mockScamNews);
  const [geminiStatus, setGeminiStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // Check Gemini API status
  React.useEffect(() => {
    const checkGeminiStatus = async () => {
      try {
        setGeminiStatus('checking');
        // Test Gemini API endpoint
        const response = await fetch('/api/analyze-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'test' })
        });
        
        if (response.ok) {
          setGeminiStatus('online');
        } else {
          setGeminiStatus('offline');
        }
      } catch {
        setGeminiStatus('offline');
      }
    };

    checkGeminiStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkGeminiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Add custom scrollbar styles for webkit browsers
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .scam-news-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .scam-news-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .scam-news-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
      }
      .scam-news-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const getSeverityColor = (severity: ScamNews["severity"]) => {
    switch (severity) {
      case "Critical": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "High": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "Medium": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "Low": return "text-green-400 bg-green-500/10 border-green-500/20";
    }
  };

  const getCategoryIcon = (category: ScamNews["category"]) => {
    switch (category) {
      case "UPI Fraud": return "mdi:credit-card";
      case "SMS Scam": return "mdi:message-text";
      case "Call Scam": return "mdi:phone";
      case "WhatsApp": return "mdi:whatsapp";
      case "Phishing": return "mdi:fish";
      default: return "mdi:shield-alert";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return time.toLocaleDateString();
  };

  return (
    <div className="w-full max-w-sm xl:w-80 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <Icon icon="mdi:newspaper-variant" className="h-5 w-5 sm:h-6 sm:w-6 text-white/70" />
          <h3 className="text-sm sm:text-base font-medium text-white/90">Live Scam Alerts</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
          <span className="text-xs text-white/50">Live</span>
        </div>
      </div>

      {/* AI Models Live Indicators */}
      <div className="mb-4 sm:mb-6 flex flex-col items-center gap-3">
        {/* DeepSeek-R1 Indicator */}
        <div className="inline-flex items-center gap-2 sm:gap-3 rounded-full border border-white/20 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5">
          <span className="text-xs font-bold text-white/80">DS</span>
          <span className="text-xs sm:text-sm text-white/80 font-medium">DeepSeek-R1</span>
          <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-red-400"></div>
        </div>
        
        {/* Gemini AI Indicator */}
        <div className="inline-flex items-center gap-2 sm:gap-3 rounded-full border border-white/20 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5">
          <Icon icon="logos:google-gemini" className="h-4 w-4 sm:h-5 sm:w-5 text-white/80" />
          <span className="text-xs sm:text-sm text-white/80 font-medium">Gemini AI</span>
          <div 
            className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${
              geminiStatus === 'online' 
                ? 'bg-green-400 animate-pulse' 
                : geminiStatus === 'offline' 
                ? 'bg-red-400' 
                : 'bg-yellow-400 animate-spin'
            }`}
          ></div>
        </div>
      </div>
      
      <div 
        className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-96 overflow-y-auto scam-news-scrollbar px-1"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.1) transparent',
        }}
      >
        <AnimatePresence>
          {news.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Icon icon={getCategoryIcon(item.category)} className="h-4 w-4 sm:h-5 sm:w-5 text-white/60" />
                  <span className="text-xs sm:text-sm font-medium text-white/80">{item.category}</span>
                </div>
                <span className={`text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border ${getSeverityColor(item.severity)}`}>
                  {item.severity}
                </span>
              </div>
              
              <h4 className="text-xs sm:text-sm font-medium text-white/90 mb-1 sm:mb-2">{item.title}</h4>
              <p className="text-xs text-white/60 mb-2 sm:mb-3 line-clamp-2 leading-relaxed">{item.summary}</p>
              
              <div className="flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/5">
                <span className="truncate">{item.source}</span>
                <span className="ml-2 flex-shrink-0">{formatTimeAgo(item.timestamp)}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10">
        <button className="w-full rounded-xl border border-white/15 bg-white/10 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-white/80 hover:bg-white/15 transition-colors">
          View All Alerts
        </button>
      </div>
    </div>
  );
}

export default function TryNow(): React.ReactElement {
  const [active, setActive] = useState<TabKey>("sms");

  return (
    <section
      className="relative flex min-h-screen w-full items-center justify-center"
      style={{
        backgroundImage:
          "linear-gradient(111.4deg, rgba(7,7,9,1) 6.5%, rgba(27,24,113,1) 93.2%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.08),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.06),transparent_45%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-stretch px-4 pt-28">
        <h1 className="text-center text-[clamp(24px,5vw,40px)] font-medium tracking-tight text-white">
          Analyze Content for Scams
        </h1>
        <p className="mt-2 text-center text-sm text-white/80">
          SMS/Text, URL/Link, Call Audio, or Track Number — all in one place.
        </p>

        <div className="mt-8 flex flex-col xl:flex-row gap-4 xl:gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([
                { key: "sms", label: "SMS / Text", icon: "material-symbols:message" },
                { key: "url", label: "URL / Link", icon: "material-symbols:link" },
                { key: "call", label: "Call Audio", icon: "material-symbols:call" },
                { key: "track", label: "Track Number", icon: "material-symbols:phone-enabled" },
              ] as { key: TabKey; label: string; icon: string }[]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors ${
                    active === t.key
                      ? "border-white/20 bg-white/15 text-white"
                      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  <Icon icon={t.icon} width={16} height={16} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              {active === "sms" && <SmsForm />}
              {active === "url" && <UrlForm />}
              {active === "call" && <CallForm />}
              {active === "track" && <TrackForm />}
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden xl:block">
            <ScamNewsFeed />
          </div>
        </div>

        {/* Mobile/Tablet Sidebar */}
        <div className="mt-6 xl:hidden">
          <ScamNewsFeed />
        </div>
      </div>
    </section>
  );
}

function AnalysisPipeline({ step }: { step: 'idle' | 'processing' | 'complete' }): React.ReactElement {
  const [currentStep, setCurrentStep] = React.useState(0);

  const steps = [
    { id: 'input', label: 'Input', icon: 'mdi:message-text', color: 'text-blue-400' },
    { id: 'ml', label: 'Advanced ML', icon: 'mdi:brain', color: 'text-purple-400' },
    { id: 'deepseek', label: 'DeepSeek-R1', icon: 'mdi:robot', color: 'text-orange-400' },
    { id: 'gemini', label: 'Gemini AI', icon: 'logos:google-gemini', color: 'text-green-400' },
    { id: 'result', label: 'Result', icon: 'mdi:shield-check', color: 'text-emerald-400' }
  ];

  React.useEffect(() => {
    if (step === 'processing') {
      // Start from step 0 and animate through all steps
      setCurrentStep(0);
      
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < 4) { // Changed to 4 for 5 steps
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 1000); // Move to next step every 1000ms for 5 steps

      return () => clearInterval(interval);
    } else if (step === 'complete') {
      setCurrentStep(4); // Show all steps completed (5 steps total)
    } else {
      setCurrentStep(-1); // Reset to show no steps active
    }
  }, [step]);

  return (
    <div className="mb-4 p-4 rounded-xl border border-white/10 bg-white/5">
      <div className="text-xs text-white/60 mb-3 text-center">Analysis Pipeline</div>
      <div className="flex items-center justify-between relative">
        {/* Connecting lines background */}
        <div className="absolute top-4 left-8 right-8 h-0.5 bg-white/10"></div>
        
        {steps.map((stepItem, index) => (
          <div key={stepItem.id} className="flex flex-col items-center relative z-10">
            <div className="relative">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${
                index <= currentStep 
                  ? 'border-white/30 bg-white/10 scale-110' 
                  : 'border-white/10 bg-white/5 scale-100'
              }`}>
                <Icon 
                  icon={stepItem.icon} 
                  className={`w-4 h-4 transition-all duration-700 ${
                    index <= currentStep ? stepItem.color : 'text-white/40'
                  } ${index === currentStep && step === 'processing' ? 'animate-pulse' : ''} ${
                    step === 'complete' && index === 4 ? 'animate-bounce' : ''
                  }`} 
                />
              </div>
              
              {/* Animated progress line */}
              {index < steps.length - 1 && (
                <div className="absolute top-1/2 -right-4 w-8 h-0.5 overflow-hidden">
                  <div className={`h-full transition-all duration-700 ${
                    index < currentStep 
                      ? 'bg-gradient-to-r from-white/40 to-white/20' 
                      : 'bg-white/10'
                  }`}>
                    {index === currentStep - 1 && step === 'processing' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse"></div>
                    )}
                    {index < currentStep && step === 'processing' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" style={{ animationDelay: `${index * 0.2}s` }}></div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className={`text-xs mt-2 transition-all duration-700 ${
              index <= currentStep ? 'text-white/80' : 'text-white/40'
            }`}>
              {stepItem.label}
            </div>
          </div>
        ))}
      </div>
      
      {step === 'processing' && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-white/60">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
            <span className="animate-pulse">Analyzing with AI...</span>
          </div>
        </div>
      )}
      
      {step === 'complete' && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-emerald-400">
            <Icon icon="mdi:check-circle" className="w-4 h-4" />
            <span>Analysis Complete!</span>
          </div>
        </div>
      )}
    </div>
  );
}

function downloadReport(result: AnalysisResult, meta?: ResultMeta): void {
  const payload = {
    generated_at: new Date().toISOString(),
    source: "UPI Guard /try",
    context: meta ?? null,
    result
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `upi-guard-report-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function complainToCyberCrime(result: AnalysisResult, meta?: ResultMeta): void {
  const summary = `Classification: ${result.label}\nRisk: ${result.riskLevel ?? 'N/A'}\nConfidence: ${Math.round((result.confidence ?? 0) * 100)}%`;
  const input = meta?.input ? `\nInput: ${meta.input}` : '';
  const flags = result.redFlags && result.redFlags.length ? `\nRed flags:\n- ${result.redFlags.join('\n- ')}` : '';
  const advice = result.advice ? `\nAdvice: ${result.advice}` : '';
  const text = `I would like to report a suspected cyber fraud/phishing attempt.\n\n${summary}${input}${flags}${advice}\n\nReported via UPI Guard.`;

  navigator.clipboard?.writeText(text).catch(() => {});
  window.open('https://cybercrime.gov.in/Webform/Crime_AuthoLogin.aspx', '_blank', 'noopener,noreferrer');
}

// Helper function to parse the final analysis text
function parseFinalAnalysis(analysisText: string) {
  if (!analysisText) return {
    finalClassification: '',
    riskLevel: '',
    confidence: 0,
    keyEvidence: '',
    immediateAction: ''
  };
  
  const result: {
    finalClassification: string;
    riskLevel: string;
    confidence: number;
    keyEvidence: string;
    immediateAction: string;
  } = {
    finalClassification: '',
    riskLevel: '',
    confidence: 0,
    keyEvidence: '',
    immediateAction: ''
  };
  
  try {
    // Extract Final Classification
    const classificationMatch = analysisText.match(/Final Classification[:\s]+([^0-9\n]+)/i);
    if (classificationMatch) {
      result.finalClassification = classificationMatch[1].trim();
    }
    
    // Extract Risk Level
    const riskMatch = analysisText.match(/Risk Level[:\s]+([^0-9\n]+)/i);
    if (riskMatch) {
      result.riskLevel = riskMatch[1].trim();
    }
    
    // Extract Confidence
    const confidenceMatch = analysisText.match(/Confidence[:\s]*(\d+)%/i);
    if (confidenceMatch) {
      result.confidence = parseInt(confidenceMatch[1]) / 100;
    }
    
    // Extract Key Evidence
    const evidenceMatch = analysisText.match(/Key Evidence[:\s]+([^0-9\n]+?)(?=\n|$)/i);
    if (evidenceMatch) {
      result.keyEvidence = evidenceMatch[1].trim();
    }
    
    // Extract Immediate Action
    const actionMatch = analysisText.match(/Immediate Action[:\s]+([^0-9\n]+?)(?=\n|$)/i);
    if (actionMatch) {
      result.immediateAction = actionMatch[1].trim();
    }
  } catch (error) {
    console.error('Error parsing final analysis:', error);
  }
  
  return result;
}

function ResultView({ result, meta }: { result: AnalysisResult; meta?: ResultMeta }): React.ReactElement {
  // Parse the final analysis to get proper values
  const finalAnalysis = parseFinalAnalysis(result.advice || result.geminiAnalysis);
  
  // Use final analysis values if available, otherwise fallback to ML results
  const finalLabel = finalAnalysis.finalClassification || result.label;
  const finalRisk = finalAnalysis.riskLevel || result.riskLevel;
  const finalConfidence = finalAnalysis.confidence || result.confidence;
  
  const pct = Math.round((finalConfidence * 100) as number);
  const risk = finalRisk;

  const icon =
    finalLabel === "Safe"
      ? "mdi:shield-check"
      : finalLabel === "Scam"
      ? "mdi:alert-octagon"
      : "mdi:alert";

  const badgeStyles =
    finalLabel === "Safe"
      ? "bg-emerald-400/20 text-emerald-300 border-emerald-300/20"
      : finalLabel === "Scam"
      ? "bg-rose-400/20 text-rose-300 border-rose-300/20"
      : "bg-amber-400/20 text-amber-300 border-amber-300/20";

  const riskStyles =
    risk === "Low"
      ? "bg-emerald-400/10 text-emerald-200 border-emerald-200/20"
      : risk === "High" || risk === "Critical"
      ? "bg-rose-400/10 text-rose-200 border-rose-200/20"
      : risk === "Medium"
      ? "bg-amber-400/10 text-amber-200 border-amber-200/20"
      : "bg-emerald-400/10 text-emerald-200 border-emerald-200/20";

  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/90">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${badgeStyles}`}>
            <Icon icon={icon} width={16} height={16} />
            <span>{result.label}</span>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${riskStyles}`}>
            <Icon icon="mdi:fire" width={14} height={14} />
            <span>Risk: {risk}</span>
          </div>
        </div>
        <div className="text-xs text-white/70">Confidence: {pct}%</div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-200 to-white"
          style={{ width: `${pct}%` }}
        />
      </div>

      {Array.isArray(result.redFlags) && result.redFlags.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-xs uppercase tracking-wide text-white/60">Red Flags</div>
          <div className="space-y-1">
            {result.redFlags.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-white/85">
                <span className="text-rose-400 mt-0.5">•</span>
                <span className="leading-relaxed">{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Always show the main analysis */}
      <div className="mt-4">
        <div className="mb-3 text-sm font-medium text-white/90">ANALYSIS RESULTS</div>
        
        {/* Advanced ML Analysis (Priority 1) */}
        {result.mlAnalysis && result.mlAnalysis.risk_score && (
          <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
              <div className="text-sm font-medium text-white/90">Advanced ML Analysis (HEFDS)</div>
              <div className="text-xs text-blue-400/80">v{result.mlAnalysis.model_version}</div>
            </div>
            
            {/* Risk Level Badge */}
            <div className="mb-3">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                result.mlAnalysis.risk_score.risk_level === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                result.mlAnalysis.risk_score.risk_level === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                result.mlAnalysis.risk_score.risk_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                result.mlAnalysis.risk_score.risk_level === 'Low' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}>
                {result.mlAnalysis.risk_score.risk_level} Risk
              </span>
            </div>
            
            {/* Confidence Score */}
            <div className="mb-3">
              <div className="text-xs text-white/60 mb-1">Confidence: {Math.round(result.mlAnalysis.risk_score.confidence * 100)}%</div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" 
                  style={{ width: `${result.mlAnalysis.risk_score.confidence * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Red Flags */}
            {result.mlAnalysis.risk_score.red_flags && result.mlAnalysis.risk_score.red_flags.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-white/60 mb-2">Red Flags Detected:</div>
                <div className="space-y-1">
                  {result.mlAnalysis.risk_score.red_flags.map((flag: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/85">
                      <span className="text-red-400 mt-0.5">⚠️</span>
                      <span className="leading-relaxed">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Explanation */}
            {result.mlAnalysis.risk_score.explanation && (
              <div className="mb-3">
                <div className="text-xs text-white/60 mb-1">Analysis:</div>
                <div className="text-sm text-white/85 leading-relaxed">
                  {result.mlAnalysis.risk_score.explanation}
                </div>
              </div>
            )}
            
            {/* Recommended Action */}
            {result.mlAnalysis.risk_score.recommended_action && (
              <div className="mb-3">
                <div className="text-xs text-white/60 mb-1">Recommended Action:</div>
                <div className="text-sm font-medium text-white/90">
                  {result.mlAnalysis.risk_score.recommended_action}
                </div>
              </div>
            )}
            
            {/* Component Scores */}
            {result.mlAnalysis.risk_score.component_scores && (
              <div className="mb-3">
                <div className="text-xs text-white/60 mb-2">Risk Components:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(result.mlAnalysis.risk_score.component_scores).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-white/70 capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="text-white/90">{Math.round(Number(value) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Processing Info */}
            <div className="text-xs text-white/50">
              Model: {result.mlAnalysis.model} • Processing: {result.mlAnalysis.processing_time_ms}ms
            </div>
          </div>
        )}
        
        {/* Main Advice/Results (Fallback) */}
        {(!result.mlAnalysis || !result.mlAnalysis.risk_score) && result.advice && (
          <div className="mb-3">
            <div className="text-xs uppercase tracking-wide text-white/60 mb-1">Analysis</div>
            <div className="text-white/85 text-sm leading-relaxed p-3 rounded-lg bg-white/5">
              {result.advice}
            </div>
          </div>
        )}
        
        {/* DeepSeek Analysis if available */}
        {result.deepseekAnalysis && result.deepseekAnalysis !== 'Analysis failed' && (
          <div className="mb-3">
            <div className="text-xs uppercase tracking-wide text-white/60 mb-1">DeepSeek Analysis</div>
            <div className="text-sm text-white/75 leading-relaxed max-h-32 overflow-y-auto p-2 rounded-lg bg-white/5">
              {result.deepseekAnalysis}
            </div>
          </div>
        )}
        
        {/* Gemini Analysis if available */}
        {result.geminiAnalysis && result.geminiAnalysis !== 'Finalization failed' && (
          <div className="mb-3">
            <div className="text-xs uppercase tracking-wide text-white/60 mb-1">Gemini Analysis</div>
            <div className="text-sm text-white/75 leading-relaxed max-h-32 overflow-y-auto p-2 rounded-lg bg-white/5">
              {result.geminiAnalysis}
            </div>
          </div>
        )}
      </div>



      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => downloadReport(result, meta)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/15"
        >
          <Icon icon="mdi:file-download" width={16} height={16} />
          <span>Download report</span>
        </button>
        <button
          onClick={() => complainToCyberCrime(result, meta)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500/90 px-3 py-2 text-xs font-medium text-white hover:bg-rose-500"
        >
          <Icon icon="mdi:shield-alert" width={16} height={16} />
          <span>Complain to cyber crime</span>
        </button>
      </div>
    </div>
  );
}

function SmsForm(): React.ReactElement {
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [analysisStep, setAnalysisStep] = React.useState<'idle' | 'processing' | 'complete'>('idle');
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm text-white/80">Paste SMS/Text</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the message here..."
        className="min-h-32 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
      />
      
      {analysisStep !== 'idle' && <AnalysisPipeline step={analysisStep} />}
      
      <div className="flex gap-2">
        <button
          onClick={async () => {
            if (!text.trim()) return;
            setLoading(true);
            setResult(null);
            setAnalysisStep('processing');
            
            try {
              // Step 1: ML Model Analysis
              await new Promise(resolve => setTimeout(resolve, 1200));
              
              const mlRes = await fetch('/api/analyze-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
              });
              const mlData = await mlRes.json();
              
              // Step 2: DeepSeek Reasoning
              await new Promise(resolve => setTimeout(resolve, 1200));
              
              const deepseekRes = await fetch('/api/analyze-deepseek', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  text,
                  mlResult: mlData
                })
              });
              const deepseekData = await deepseekRes.json();
              
              // Step 3: Gemini Finalization
              await new Promise(resolve => setTimeout(resolve, 1200));
              
              const geminiRes = await fetch('/api/analyze-gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  text,
                  mlResult: mlData,
                  deepseekAnalysis: deepseekData.deepseekAnalysis
                })
              });
              const geminiData = await geminiRes.json();
              
              // Combine all results
              const finalResult = {
                ...mlData,
                deepseekAnalysis: deepseekData.deepseekAnalysis,
                geminiAnalysis: geminiData.analysis,
                finalAnalysis: geminiData.finalAnalysis || mlData
              };
              
              setResult(finalResult);
              setAnalysisStep('complete');
            } catch (error) {
              console.error('Analysis error:', error);
              setAnalysisStep('idle');
            } finally {
              setLoading(false);
            }
          }}
          className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Analyzing…' : 'Analyze SMS'}
        </button>
      </div>
      {result && <ResultView result={result} meta={{ type: "sms", input: text }} />}
    </div>
  );
}

function UrlForm(): React.ReactElement {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [analysisStep, setAnalysisStep] = React.useState<'idle' | 'processing' | 'complete'>('idle');
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm text-white/80">Enter URL/Link</label>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
      />
      
      {analysisStep !== 'idle' && <AnalysisPipeline step={analysisStep} />}
      
      <div>
        <button
          onClick={async () => {
            if (!url.trim()) return;
            setLoading(true);
            setResult(null);
            setAnalysisStep('processing');
            
            try {
              // Simulate processing steps
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              const res = await fetch('/api/analyze-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
              });
              const data = await res.json();
              setResult(data);
              setAnalysisStep('complete');
            } catch {
              setAnalysisStep('idle');
            } finally {
              setLoading(false);
            }
          }}
          className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Analyzing…' : 'Analyze URL'}
        </button>
      </div>
      {result && <ResultView result={result} meta={{ type: "url", input: url }} />}
    </div>
  );
}

function CallForm(): React.ReactElement {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [analysisStep, setAnalysisStep] = React.useState<'idle' | 'processing' | 'complete'>('idle');
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm text-white/80">Upload Call Audio (MP3/WAV)</label>
      <input
        type="file"
        accept="audio/*"
        className="w-full rounded-xl border border-white/10 bg-white/5 p-2 text-sm text-white outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-medium file:text-indigo-700 hover:file:bg-indigo-50"
      />
      
      {analysisStep !== 'idle' && <AnalysisPipeline step={analysisStep} />}
      
      <div>
        <button
          onClick={async () => {
            setLoading(true);
            setResult(null);
            setAnalysisStep('processing');
            
            try {
              // Simulate processing steps
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              const res = await fetch('/api/analyze-call', { method: 'POST' });
              const data = await res.json();
              setResult(data);
              setAnalysisStep('complete');
            } catch {
              setAnalysisStep('idle');
            } finally {
              setLoading(false);
            }
          }}
          className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Analyzing…' : 'Analyze Audio'}
        </button>
      </div>
      {result && <ResultView result={result} meta={{ type: "call" }} />}
    </div>
  );
}

function TrackForm(): React.ReactElement {
  const [num, setNum] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [analysisStep, setAnalysisStep] = React.useState<'idle' | 'processing' | 'complete'>('idle');
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm text-white/80">Enter Phone Number</label>
      <input
        value={num}
        onChange={(e) => setNum(e.target.value)}
        placeholder="e.g. +91 98xxxxxx"
        className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
      />
      
      {analysisStep !== 'idle' && <AnalysisPipeline step={analysisStep} />}
      
      <div>
        <button
          onClick={async () => {
            if (!num.trim()) return;
            setLoading(true);
            setResult(null);
            setAnalysisStep('processing');
            
            try {
              // Simulate processing steps
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              const res = await fetch(`/api/phone?number=${encodeURIComponent(num)}`);
              const data = await res.json();
              setResult(data);
              setAnalysisStep('complete');
            } catch {
              setAnalysisStep('idle');
            } finally {
              setLoading(false);
            }
          }}
          className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Looking up…' : 'Track Number'}
        </button>
      </div>
      {result && (
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/90">
          <div className="flex items-center justify-between">
            <div className="font-medium">Number: {result.number ?? num}</div>
            {typeof result.spamScore === 'number' && (
              <div className="text-white/70">Spam score: {Math.round(result.spamScore * 100)}%</div>
            )}
          </div>
          {typeof result.spamScore === 'number' && (
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-200 to-white" style={{ width: `${Math.round(result.spamScore * 100)}%` }} />
            </div>
          )}
          {result.notes && <div className="mt-3 text-white/85">{result.notes}</div>}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => downloadReport({ label: 'Suspicious', confidence: (result.spamScore ?? 0) as number, riskLevel: (result.spamScore ?? 0) > 0.66 ? 'High' : (result.spamScore ?? 0) > 0.33 ? 'Medium' : 'Low' }, { type: 'track', input: num })}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/15"
            >
              <Icon icon="mdi:file-download" width={16} height={16} />
              <span>Download report</span>
            </button>
            <button
              onClick={() => complainToCyberCrime({ label: 'Suspicious', confidence: (result.spamScore ?? 0) as number, riskLevel: (result.spamScore ?? 0) > 0.66 ? 'High' : (result.spamScore ?? 0) > 0.33 ? 'Medium' : 'Low' }, { type: 'track', input: num })}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500/90 px-3 py-2 text-xs font-medium text-white hover:bg-rose-500"
            >
              <Icon icon="mdi:shield-alert" width={16} height={16} />
              <span>Complain to cyber crime</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


