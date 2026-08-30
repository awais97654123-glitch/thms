'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  Sliders, 
  FileText, 
  History,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function EmailSettingsPage() {
  const [config, setConfig] = useState<any>({
    providerType: 'SMTP',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    authEmail: '',
    authPassword: '',
    senderName: 'The Hayatabad Model School',
    senderEmail: 'notifications@hayatabadmodel.edu.pk',
    isEnabled: true,
    notifyHomework: true,
    notifyFee: true,
    notifyAttendance: true,
    notifyExam: true,
    notifyAdmission: true,
    notifyAnnounce: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/settings/email');
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/settings/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert(data.error || 'Failed to save configuration');
      }
    } catch {
      alert('Error connecting to email service');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSend = async () => {
    if (!testEmail) {
      alert('Please enter a target test email');
      return;
    }
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/settings/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({ success: false, message: 'Failed to dispatch test email' });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Email & Gmail Automation Gateway</h1>
            <p className="text-xs text-slate-500">
              Configure outgoing SMTP / Google Workspace integration, notification triggers, and channel toggles.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/settings/email-templates"
            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Templates</span>
          </Link>
          <Link
            href="/admin/settings/email-logs"
            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 transition-all"
          >
            <History className="w-3.5 h-3.5" />
            <span>Queue & Logs</span>
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          {/* Provider Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Server className="w-4 h-4 text-blue-600" />
                <span>Email Provider & Credentials</span>
              </div>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                config.isConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {config.isConfigured ? 'Service Configured' : 'Email Service Not Configured'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Provider Type</label>
                <select
                  value={config.providerType}
                  onChange={(e) => setConfig({ ...config, providerType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                >
                  <option value="SMTP">Custom SMTP</option>
                  <option value="GMAIL">Google Workspace / Gmail SMTP</option>
                  <option value="SENDGRID">SendGrid</option>
                  <option value="POSTMARK">Postmark</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={config.host || ''}
                  onChange={(e) => setConfig({ ...config, host: e.target.value })}
                  placeholder="smtp.gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Port</label>
                <input
                  type="number"
                  value={config.port || 587}
                  onChange={(e) => setConfig({ ...config, port: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sender Email Address *</label>
                <input
                  type="email"
                  required
                  value={config.senderEmail || ''}
                  onChange={(e) => setConfig({ ...config, senderEmail: e.target.value })}
                  placeholder="notifications@hayatabadmodel.edu.pk"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Authentication User / Email</label>
                <input
                  type="text"
                  value={config.authEmail || ''}
                  onChange={(e) => setConfig({ ...config, authEmail: e.target.value })}
                  placeholder="admin@hayatabadmodel.edu.pk"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Authentication App Password</label>
                <input
                  type="password"
                  value={config.authPassword || ''}
                  onChange={(e) => setConfig({ ...config, authPassword: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Sender Display Name</label>
                <input
                  type="text"
                  value={config.senderName || ''}
                  onChange={(e) => setConfig({ ...config, senderName: e.target.value })}
                  placeholder="The Hayatabad Model School"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Trigger Toggles Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Automated Event Notification Triggers</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <span className="font-semibold text-slate-800">Homework Assignments</span>
                <input
                  type="checkbox"
                  checked={config.notifyHomework}
                  onChange={(e) => setConfig({ ...config, notifyHomework: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <span className="font-semibold text-slate-800">Fee Invoices & Receipts</span>
                <input
                  type="checkbox"
                  checked={config.notifyFee}
                  onChange={(e) => setConfig({ ...config, notifyFee: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <span className="font-semibold text-slate-800">Attendance Alerts (Late / Absent)</span>
                <input
                  type="checkbox"
                  checked={config.notifyAttendance}
                  onChange={(e) => setConfig({ ...config, notifyAttendance: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <span className="font-semibold text-slate-800">Admission Confirmations</span>
                <input
                  type="checkbox"
                  checked={config.notifyAdmission}
                  onChange={(e) => setConfig({ ...config, notifyAdmission: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <span className="font-semibold text-slate-800">Exam Schedules & Results</span>
                <input
                  type="checkbox"
                  checked={config.notifyExam}
                  onChange={(e) => setConfig({ ...config, notifyExam: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <span className="font-semibold text-slate-800">School Announcements</span>
                <input
                  type="checkbox"
                  checked={config.notifyAnnounce}
                  onChange={(e) => setConfig({ ...config, notifyAnnounce: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-all"
            >
              {saving ? 'Saving Settings...' : 'Save Configuration'}
            </button>
            {saveSuccess && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings saved successfully!</span>
              </span>
            )}
          </div>
        </form>

        {/* Test Connection Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
              <Send className="w-4 h-4 text-blue-600" />
              <span>Test Email Gateway</span>
            </div>

            <p className="text-xs text-slate-500">
              Dispatch an instant test email to verify SMTP handshake and recipient delivery.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Test Email</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="principal@hayatabadmodel.edu.pk"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={handleTestSend}
                disabled={testLoading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                {testLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Send Test Email</span>
              </button>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  <p className="font-bold">{testResult.success ? 'Success' : 'Failed'}</p>
                  <p className="text-[11px] mt-0.5">{testResult.message}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Safe Email Queuing</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              All automated emails are processed asynchronously through a background queue with idempotency keys to guarantee zero duplicate deliveries and prevent UI blocking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
