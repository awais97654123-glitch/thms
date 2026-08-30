'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Eye, 
  Send, 
  Save, 
  ArrowLeft, 
  CheckCircle2, 
  Code2, 
  Sparkles,
  Info
} from 'lucide-react';

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/settings/email-templates');
      const data = await res.json();
      if (data.success && data.templates) {
        setTemplates(data.templates);
        if (data.templates.length > 0) {
          selectTemplate(data.templates[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = (tmpl: any) => {
    setSelectedTemplate(tmpl);
    setSubject(tmpl.subject);
    setBodyHtml(tmpl.bodyHtml);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/settings/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedTemplate.id,
          subject,
          bodyHtml,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(data.error || 'Failed to save template');
      }
    } catch {
      alert('Error updating template');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSend = async () => {
    if (!testEmail) {
      alert('Please enter a recipient email');
      return;
    }
    setTestLoading(true);
    try {
      const res = await fetch('/api/settings/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testEmail,
          subject,
          bodyHtml,
          sampleVariables: {
            school_name: 'The Hayatabad Model School',
            student_name: 'Hamza Tariq',
            class_name: 'Class 8',
            section_name: 'Section A',
            subject_name: 'Mathematics',
            teacher_name: 'Engr. Farooq Ahmad',
            homework_title: 'Chapter 4 — Factorization',
            homework_desc: 'Complete problems 1 through 15',
            due_date: '2 September 2026',
            invoice_number: 'INV-2026-000001',
            amount: '10,000',
            receipt_number: 'REC-2026-000001',
            portal_url: 'http://localhost:3000/parent',
          },
        }),
      });
      const data = await res.json();
      alert(data.message || (data.success ? 'Test email dispatched' : 'Failed to dispatch'));
    } catch {
      alert('Failed to send test email');
    } finally {
      setTestLoading(false);
    }
  };

  const parsedVariables = selectedTemplate?.variablesJson
    ? JSON.parse(selectedTemplate.variablesJson)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/settings/email"
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Email Notification Templates</h1>
            <p className="text-xs text-slate-500">
              Customize dynamic email layouts with live preview and variable interpolation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Template'}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template Selector List */}
        <div className="lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Available Templates</h2>
          <div className="space-y-1">
            {templates.map((tmpl) => {
              const isSelected = selectedTemplate?.id === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => selectTemplate(tmpl)}
                  className={`w-full text-left p-3 rounded-xl text-xs transition-all ${
                    isSelected
                      ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <p className="truncate">{tmpl.name}</p>
                  <span className="text-[10px] text-slate-400 uppercase">{tmpl.category}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor & Preview Area */}
        <div className="lg:col-span-3 space-y-4">
          {selectedTemplate && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              {/* Subject Line Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Variables Chips */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-700 text-[11px]">
                  <Code2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Available Dynamic Variables (Click to copy)</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {parsedVariables.map((v: any) => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => navigator.clipboard.writeText(`{{${v.key}}}`)}
                      className="px-2 py-0.5 bg-white border border-slate-300 rounded-md text-[11px] font-mono text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all"
                      title={`${v.label}: Example "${v.example}"`}
                    >
                      {`{{${v.key}}}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Switcher */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                      activeTab === 'preview' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live HTML Preview</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('editor')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                      activeTab === 'editor' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>HTML Code Editor</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@domain.com"
                    className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg outline-none"
                  />
                  <button
                    onClick={handleTestSend}
                    disabled={testLoading}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>{testLoading ? 'Sending...' : 'Test Send'}</span>
                  </button>
                </div>
              </div>

              {/* Tab Contents */}
              {activeTab === 'editor' ? (
                <div>
                  <textarea
                    rows={16}
                    value={bodyHtml}
                    onChange={(e) => setBodyHtml(e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-300 text-xs font-mono bg-slate-900 text-slate-100 outline-none leading-relaxed"
                  />
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 min-h-[400px]">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: bodyHtml
                        .replace(/{{school_name}}/g, 'The Hayatabad Model School')
                        .replace(/{{student_name}}/g, 'Hamza Tariq')
                        .replace(/{{class_name}}/g, 'Class 8')
                        .replace(/{{section_name}}/g, 'Section A')
                        .replace(/{{subject_name}}/g, 'Mathematics')
                        .replace(/{{teacher_name}}/g, 'Engr. Farooq Ahmad')
                        .replace(/{{homework_title}}/g, 'Chapter 4 — Exercise 4.2 Proofs')
                        .replace(/{{homework_desc}}/g, 'Solve questions 1 through 15 with complete proofs.')
                        .replace(/{{due_date}}/g, '2 September 2026')
                        .replace(/{{amount}}/g, '10,000')
                        .replace(/{{invoice_number}}/g, 'INV-2026-000001')
                        .replace(/{{receipt_number}}/g, 'REC-2026-000001')
                        .replace(/{{portal_url}}/g, '#'),
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
