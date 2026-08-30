'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Building2, Globe, Phone, Mail, Award, DollarSign } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [gradeRules, setGradeRules] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.setting) setSettings(data.setting);
        if (data.sessions) setSessions(data.sessions);
        if (data.gradeRules) setGradeRules(data.gradeRules);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      alert('Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            System Administration
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            School Profile & Institutional Settings
          </h1>
          <p className="text-xs text-slate-500">
            Configure school identity, active academic sessions, grading rules, and currency parameters.
          </p>
        </div>

        {success && (
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* School Profile */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Institutional Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">School Name</label>
              <input
                type="text"
                value={settings.schoolName}
                onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Motto / Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Contact Phone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email Address</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Campus Physical Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Grading Scale */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b pb-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Official BISE Grading Scale Configuration</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-xs">
            {gradeRules.map((gr) => (
              <div key={gr.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <span className="font-extrabold text-base text-blue-900 block">{gr.grade}</span>
                <p className="text-[10px] text-slate-500">{gr.minPercentage}% - {gr.maxPercentage}%</p>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border block">
                  GPA: {gr.gpa.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Application & System Metadata (Section 50.12) */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-sm">
                💻
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">The Hayatabad Model School</h3>
                <p className="text-[11px] text-slate-400">THMS School Management System • Windows Desktop App</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-mono font-bold">
              Version 1.0.0
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Application Architecture</span>
              <p className="text-slate-200 font-semibold">Tauri Native Windows + Next.js</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">● Central Cloud Backend Connected</p>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Installer Package</span>
              <p className="text-slate-200 font-semibold">The-Hayatabad-Model-School-Setup.exe</p>
              <p className="text-[10px] text-slate-400">NSIS 64-bit Windows Installer</p>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Update Status</span>
              <p className="text-slate-200 font-semibold">Current Version: 1.0.0</p>
              <p className="text-[10px] text-slate-400">Updates are not configured yet (v1.0.0 Latest)</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all"
        >
          {saving ? <span className="animate-spin">⏳</span> : <Save className="w-4 h-4" />}
          <span>Save Settings</span>
        </button>
      </form>
    </div>
  );
}
