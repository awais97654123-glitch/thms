'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Code, 
  Layers, 
  ShieldCheck, 
  Server, 
  ArrowLeft, 
  CheckCircle2,
  Copy,
  ExternalLink
} from 'lucide-react';
import Header from '@/components/common/Header';

export default function ApiDocsExplorerPage() {
  const [spec, setSpec] = useState<any | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/openapi.json')
      .then((res) => res.json())
      .then(setSpec)
      .catch(console.error);
  }, []);

  if (!spec) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading API documentation...</div>;
  }

  const paths = Object.entries(spec.paths || {});
  const tags = ['All', 'Authentication', 'Admissions', 'Attendance', 'Students', 'Fees & Payments', 'Examinations', 'Academics', 'Certificates'];

  const filteredPaths = paths.filter(([path, methods]: any) => {
    if (selectedTag === 'All') return true;
    const firstMethod = Object.values(methods)[0] as any;
    return firstMethod?.tags?.includes(selectedTag);
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              OpenAPI 3.0.3 Specification
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Central REST API Documentation
            </h1>
            <p className="text-xs text-slate-300">
              Complete endpoint reference for The Hayatabad Model School Management ERP & Mobile Clients.
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href="/api/openapi.json"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Raw OpenAPI JSON</span>
            </a>
          </div>
        </div>

        {/* Filter tags */}
        <div className="flex flex-wrap gap-1.5 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-xs">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedTag === t
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Endpoints List */}
        <div className="space-y-4">
          {filteredPaths.map(([path, methods]: any) => {
            return Object.entries(methods).map(([method, details]: any) => {
              const methodColor =
                method === 'get'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : method === 'post'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : method === 'put'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-red-100 text-red-800 border-red-300';

              return (
                <div
                  key={`${path}-${method}`}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase border ${methodColor}`}>
                        {method}
                      </span>
                      <code className="font-mono text-sm font-bold text-slate-900">
                        /api{path}
                      </code>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {details.tags?.[0] || 'General'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-semibold">{details.summary}</p>
                  {details.description && (
                    <p className="text-[11px] text-slate-500 leading-relaxed">{details.description}</p>
                  )}

                  {details.parameters && details.parameters.length > 0 && (
                    <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Parameters:</span>
                      <div className="flex flex-wrap gap-2">
                        {details.parameters.map((param: any, idx: number) => (
                          <span key={idx} className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border text-slate-700">
                            {param.name} ({param.in})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            });
          })}
        </div>
      </main>
    </div>
  );
}
