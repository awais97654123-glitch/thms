'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Clock, User, FileText } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audit-logs?limit=50')
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            System Security & Compliance
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Enterprise Audit Trail Logs
          </h1>
          <p className="text-xs text-slate-500">
            Immutable log of user logins, student enrollments, fee payment recordings, and marks entry.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User & Role</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Details / Audit Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono text-slate-500">
                    {new Date(log.createdAt).toLocaleString('en-GB')}
                  </td>
                  <td className="p-3">
                    <strong className="text-slate-900 block font-bold">{log.userName}</strong>
                    <span className="text-[10px] font-semibold text-slate-500">{log.role || 'System'}</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 font-bold text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-700">{log.entity}</td>
                  <td className="p-3 text-slate-600 font-mono text-[11px] max-w-md truncate">
                    {log.details || 'Audit record'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
