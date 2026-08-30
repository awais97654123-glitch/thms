'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  DollarSign, 
  Users, 
  GraduationCap, 
  Calendar,
  ShieldCheck
} from 'lucide-react';
import PortalCircularLoader from '@/components/common/PortalCircularLoader';

export default function AdminAIInsightsPage() {
  const [activeTab, setActiveTab] = useState<'NOTICE' | 'FEES' | 'ATTENDANCE' | 'CHAT'>('NOTICE');
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [promptInput, setPromptInput] = useState('');
  const [noticeTopic, setNoticeTopic] = useState('Mid-Term Examination Schedule & Preparation Guidelines');
  const [copied, setCopied] = useState(false);

  const handleRunAI = async (mode: string, customPrompt?: string) => {
    setLoading(true);
    setResultText(null);

    try {
      const res = await fetch('/api/admin/ai-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          prompt: customPrompt || promptInput,
          targetNotice: noticeTopic,
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setResultText(data.result);
      }
    } catch {
      setResultText('Failed to generate AI insights. Please verify network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (resultText) {
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-orange-950/80 text-white p-6 sm:p-8 shadow-2xl border border-orange-500/20">
        <div className="absolute right-0 top-0 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-black border border-orange-400/30">
              <Bot className="w-4 h-4 text-orange-400 animate-pulse" />
              <span>THMS School Intelligence Engine • Cloud AI Copilot</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Admin AI Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Autonomous circular generator, fee recovery risk analysis, and attendance forecast.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('NOTICE'); handleRunAI('GENERATE_NOTICE'); }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                activeTab === 'NOTICE' ? 'bg-orange-500 text-white shadow-md' : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              📢 Circular Generator
            </button>
            <button
              onClick={() => { setActiveTab('FEES'); handleRunAI('ANALYZE_FEES'); }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                activeTab === 'FEES' ? 'bg-orange-500 text-white shadow-md' : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              💰 Fee Recovery
            </button>
            <button
              onClick={() => { setActiveTab('ATTENDANCE'); handleRunAI('ANALYZE_ATTENDANCE'); }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                activeTab === 'ATTENDANCE' ? 'bg-orange-500 text-white shadow-md' : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              📊 Attendance Forecast
            </button>
          </div>
        </div>
      </div>

      {/* Main AI Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Tool Parameters */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {activeTab === 'NOTICE' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-base font-black text-slate-900">Official Notice & Circular Generator</h2>
                <p className="text-xs text-slate-500">Draft professional administrative letters in seconds</p>
              </div>

              <div className="space-y-1 text-xs">
                <label className="block text-slate-700 font-bold">Select or Type Notice Topic</label>
                <input
                  type="text"
                  value={noticeTopic}
                  onChange={(e) => setNoticeTopic(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  'Annual Sports Gala & Athletics Day',
                  'Winter Vacation & School Reopening Notice',
                  '100% Merit Scholarship Award Ceremony',
                  'Parent Teacher Meeting & Report Card Day',
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setNoticeTopic(sample); handleRunAI('GENERATE_NOTICE', sample); }}
                    className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-[11px] font-bold border border-orange-200 text-left transition-colors"
                  >
                    + {sample}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleRunAI('GENERATE_NOTICE')}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs rounded-2xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'AI Drafting Circular...' : 'Generate Official Notice'}</span>
              </button>
            </div>
          )}

          {activeTab === 'FEES' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-base font-black text-slate-900">Fee Recovery & Default Risk AI</h2>
                <p className="text-xs text-slate-500">Live scanning of unpaid student vouchers from database</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Our AI analyzes unpaid invoices, groups sibling discounts, and prepares targeted follow-up plans to optimize school fee recovery.
              </p>

              <button
                onClick={() => handleRunAI('ANALYZE_FEES')}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs rounded-2xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <DollarSign className="w-4 h-4" />
                <span>{loading ? 'Analyzing Vouchers...' : 'Run Financial Risk Scan'}</span>
              </button>
            </div>
          )}

          {activeTab === 'ATTENDANCE' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-base font-black text-slate-900">Student Attendance & Dropout Forecast</h2>
                <p className="text-xs text-slate-500">Predictive analysis before board examination cutoffs</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Scans daily morning QR gate check-ins to highlight students at risk of falling below the 80% board examination attendance threshold.
              </p>

              <button
                onClick={() => handleRunAI('ANALYZE_ATTENDANCE')}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs rounded-2xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <TrendingUp className="w-4 h-4" />
                <span>{loading ? 'Forecasting Attendance...' : 'Run Attendance Forecast'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: AI Output & Copy/Export Card */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-orange-600" />
                Generated AI Intelligence Result
              </span>

              {resultText && (
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="p-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-700">AI Intelligence Engine is processing live records...</p>
              </div>
            ) : resultText ? (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-wrap max-h-[480px] overflow-y-auto">
                {resultText}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <FileText className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-700">Ready to run AI operations</p>
                <p className="text-[11px] text-slate-400">Select a tool from the left panel and click run to generate live intelligence.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
