'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Send, 
  Smartphone, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Users, 
  Sparkles, 
  Radio, 
  BookOpen, 
  DollarSign, 
  Calendar, 
  Megaphone,
  Check
} from 'lucide-react';
import { requestNotificationPermissionAndGetToken } from '@/lib/firebase/web-client';

export default function AdminFCMConsolePage() {
  const [telemetry, setTelemetry] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [browserPermission, setBrowserPermission] = useState<string>('default');
  const [requestingPerm, setRequestingPerm] = useState(false);

  // Send form state
  const [targetType, setTargetType] = useState('BROADCAST');
  const [category, setCategory] = useState('ANNOUNCEMENT');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [link, setLink] = useState('/student');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any | null>(null);

  const fetchHealth = () => {
    fetch('/api/notifications/health')
      .then((res) => res.json())
      .then(setTelemetry)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHealth();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const handleEnableBrowserPush = async () => {
    setRequestingPerm(true);
    try {
      const res = await requestNotificationPermissionAndGetToken();
      if (res.permission) setBrowserPermission(res.permission);
      fetchHealth();
    } catch (err) {
      console.error(err);
    } finally {
      setRequestingPerm(false);
    }
  };

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          title,
          body,
          link,
          category,
        }),
      });
      const data = await res.json();
      setSendResult(data);
      if (data.success) {
        setTitle('');
        setBody('');
      }
    } catch (err: any) {
      setSendResult({ error: err.message });
    } finally {
      setSending(false);
      fetchHealth();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/admin" className="hover:text-blue-600">Admin</Link>
            <span>/</span>
            <span className="text-blue-600 font-bold">Push Notifications</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-500" />
            <span>Firebase FCM Push Broadcast & Device Hub</span>
          </h1>
          <p className="text-xs text-slate-500">
            Real-time push delivery to Android, iOS, and Web browsers powered by Firebase Cloud Messaging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {browserPermission !== 'granted' ? (
            <button
              onClick={handleEnableBrowserPush}
              disabled={requestingPerm}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
            >
              <Bell className="w-4 h-4" />
              <span>{requestingPerm ? 'Enabling Push...' : 'Enable This Browser Push'}</span>
            </button>
          ) : (
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Browser Push Enabled</span>
            </span>
          )}
          <button
            onClick={fetchHealth}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            title="Refresh Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">FCM Service</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Radio className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-emerald-700">
            {telemetry?.firebase?.isHealthy ? 'Live & Connected' : 'Ready'}
          </h3>
          <p className="text-[11px] text-slate-500 truncate" title={telemetry?.firebase?.projectId}>
            Project: {telemetry?.firebase?.projectId || 'thms-8273f'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Devices</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-blue-900">
            {telemetry?.deviceRegistry?.totalActiveDevices || 0} Registered
          </h3>
          <p className="text-[11px] text-slate-500">
            Push tokens in Neon PostgreSQL
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Web Browsers</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-teal-700">
            {telemetry?.deviceRegistry?.webBrowsers || 0} Active
          </h3>
          <p className="text-[11px] text-slate-500">
            VAPID Web Push Certified
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile Apps</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-purple-900">
            {telemetry?.deviceRegistry?.mobileApps || 0} Android/iOS
          </h3>
          <p className="text-[11px] text-slate-500">
            google-services.json Active
          </p>
        </div>
      </div>

      {/* Broadcast Dispatcher Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                <span>Instant Push Notification Dispatcher</span>
              </h2>
              <p className="text-xs text-slate-500">Broadcast message directly to registered parent, student, and teacher devices.</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
              FCM Multicast Ready
            </span>
          </div>

          <form onSubmit={handleSendPush} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="BROADCAST">📢 All Registered Devices (Broadcast)</option>
                  <option value="CLASS">🏫 Entire Class (Class 8)</option>
                  <option value="STUDENT">🎓 Specific Enrolled Student</option>
                  <option value="PARENT">👨‍👩‍👦 Linked Parents</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notification Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="ANNOUNCEMENT">📢 General School Announcement</option>
                  <option value="HOMEWORK">📚 Homework & Assignment Published</option>
                  <option value="EXAM">📝 Examination Schedule / Result</option>
                  <option value="FEE">💳 Fee Voucher Due & Payment</option>
                  <option value="ATTENDANCE">Gate Attendance Check-in Alert</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notification Title</label>
              <input
                type="text"
                placeholder="e.g. Important Announcement — Annual Sports Gala 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message Body</label>
              <textarea
                rows={3}
                placeholder="Enter notification message text that will display on Android/iOS/Web devices..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Click Action URL / Deep Link</label>
              <input
                type="text"
                placeholder="/student or /parent"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {sendResult && (
              <div className={`p-3 rounded-xl text-xs font-bold ${
                sendResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {sendResult.success
                  ? `✓ Push dispatched successfully! Sent to ${sendResult.result?.totalTokens || 0} registered devices.`
                  : `❌ Error: ${sendResult.error || 'Failed to dispatch'}`}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{sending ? 'Dispatching Push...' : '🚀 Send Push Notification'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Configuration Summary Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">FCM Cloud Credentials</h3>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px] font-sans">Firebase Project ID</span>
              <strong className="text-amber-300">{telemetry?.firebase?.projectId || 'thms-8273f'}</strong>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px] font-sans">Admin Service Account</span>
              <strong className="text-emerald-300 text-[11px] truncate block">
                {telemetry?.firebase?.clientEmail || 'firebase-adminsdk-fbsvc@thms-8273f.iam.gserviceaccount.com'}
              </strong>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px] font-sans">VAPID Public Key</span>
              <strong className="text-blue-300 text-[10px] truncate block">
                BCO7ha278MAg_9DjZgh85VX1_IqaGzg-znVzuDSACx... [ACTIVE]
              </strong>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px] font-sans">Android Mobile Package</span>
              <strong className="text-purple-300">Thms.app (google-services.json)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
