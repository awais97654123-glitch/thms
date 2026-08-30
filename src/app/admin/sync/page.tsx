'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Users, 
  GraduationCap, 
  UserCheck, 
  ShieldCheck, 
  Trash2, 
  Send,
  Zap,
  Server,
  Layers
} from 'lucide-react';
import { 
  getSyncStatus, 
  getQueuedActions, 
  setManualOfflineMode, 
  triggerAutoSync, 
  saveQueuedActions, 
  registerOfflineSyncListeners,
  recordOfflineAction,
  QueuedAction, 
  SyncStatus 
} from '@/lib/offline-sync';

export default function AdminSyncHubPage() {
  const [syncState, setSyncState] = useState<SyncStatus>({
    isOnline: true,
    isManualOffline: false,
    effectiveStatus: 'ONLINE',
    pendingCount: 0,
    lastSyncTime: null,
  });

  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [serverTelemetry, setServerTelemetry] = useState<any | null>(null);

  const refreshAll = () => {
    setSyncState(getSyncStatus());
    setQueue(getQueuedActions());

    fetch('/api/sync')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setServerTelemetry(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    refreshAll();
    const cleanup = registerOfflineSyncListeners(() => {
      refreshAll();
    });
    return cleanup;
  }, []);

  const handleToggleOffline = () => {
    const nextVal = !syncState.isManualOffline;
    setManualOfflineMode(nextVal);
    refreshAll();
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const res = await triggerAutoSync();
      if (res.success) {
        setSyncResult(`Synchronization successful! ${res.syncedCount} item(s) pushed to central DB and portal clients.`);
      } else {
        setSyncResult(`Sync warning: ${res.error || 'Server not reachable'}`);
      }
      refreshAll();
    } catch (err: any) {
      setSyncResult(`Sync error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearQueue = () => {
    if (confirm('Are you sure you want to clear the local outbox queue?')) {
      saveQueuedActions([]);
      refreshAll();
    }
  };

  const handleAddSampleOfflineAction = () => {
    recordOfflineAction('OFFLINE_ATTENDANCE_BATCH', {
      markedCount: 24,
      classCode: 'C08-A',
      mode: 'OFFLINE_GATE_SCANNER',
      notes: 'Recorded in disconnected field mode',
    });
    refreshAll();
  };

  const isOffline = syncState.effectiveStatus === 'OFFLINE';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/admin" className="hover:text-blue-600">Admin</Link>
            <span>/</span>
            <span className="text-blue-600 font-bold">Offline & Portal Sync Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            <span>Central Synchronization & Multi-Portal Distribution</span>
          </h1>
          <p className="text-xs text-slate-500">
            Operate completely offline with local storage caching. Automatically broadcast changes to Teacher and Student portals when reconnected.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleOffline}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              syncState.isManualOffline
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            {syncState.isManualOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4 text-emerald-600" />}
            <span>{syncState.isManualOffline ? 'Offline Mode Active' : 'Online Mode'}</span>
          </button>

          <button
            onClick={handleSyncNow}
            disabled={isSyncing || (isOffline && !syncState.isOnline)}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-blue-600/25 flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : '⚡ Sync All Now'}</span>
          </button>
        </div>
      </div>

      {/* Sync Result Alert Toast */}
      {syncResult && (
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl text-blue-900 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{syncResult}</span>
          </div>
          <button onClick={() => setSyncResult(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* KPI Cards: Sync Health & Multi-Portal Replication Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sync State</span>
            <div className={`p-2 rounded-xl ${isOffline ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {isOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
            </div>
          </div>
          <h3 className={`text-xl font-extrabold ${isOffline ? 'text-amber-600' : 'text-emerald-600'}`}>
            {isOffline ? 'Offline Mode' : 'Online & Live'}
          </h3>
          <p className="text-[11px] text-slate-500">
            {syncState.isManualOffline ? 'Admin manual offline override' : 'Browser network: Connected'}
          </p>
        </div>

        {/* Pending Queue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Outbox</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            {syncState.pendingCount} <span className="text-xs font-normal text-slate-500">records</span>
          </h3>
          <p className="text-[11px] text-slate-500">
            Local mutations waiting for sync
          </p>
        </div>

        {/* Last Sync */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Broadcast</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-base font-bold text-slate-900 truncate">
            {syncState.lastSyncTime ? new Date(syncState.lastSyncTime).toLocaleTimeString('en-GB') : 'Ready to Sync'}
          </h3>
          <p className="text-[11px] text-slate-500">
            {syncState.lastSyncTime ? new Date(syncState.lastSyncTime).toLocaleDateString('en-GB') : 'No previous sync recorded'}
          </p>
        </div>

        {/* Database Health */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Central Database</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-teal-700">
            Operational
          </h3>
          <p className="text-[11px] text-slate-500">
            SQLite local & central parity
          </p>
        </div>

      </div>

      {/* Portal Live Broadcast Channel Status Cards */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-6 rounded-3xl text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Multi-Portal Real-Time Propagation Status</span>
            </h2>
            <p className="text-xs text-slate-300">
              When admin syncs offline data, all connected portals automatically refresh with updated information.
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/30">
            Auto-Replication Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          
          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <strong className="font-bold">Student Portal</strong>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Auto-syncs fee invoices, homework, attendance records, exam results, and certificates.
            </p>
            <Link href="/student" className="text-[11px] text-blue-300 hover:underline inline-flex items-center gap-1 font-semibold">
              <span>Open Student Portal</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <strong className="font-bold">Teacher Portal</strong>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Auto-syncs student rosters, assigned subjects, timetables, and class attendance registers.
            </p>
            <Link href="/teacher" className="text-[11px] text-emerald-300 hover:underline inline-flex items-center gap-1 font-semibold">
              <span>Open Teacher Portal</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <strong className="font-bold">Parent Portal</strong>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Auto-syncs child daily gate check-in times, paid receipts, and quarterly report cards.
            </p>
            <Link href="/parent" className="text-[11px] text-amber-300 hover:underline inline-flex items-center gap-1 font-semibold">
              <span>Open Parent Portal</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>
      </div>

      {/* Outbox Queue Inspector Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Local Outbox Mutation Queue</h3>
            <p className="text-xs text-slate-500">Items recorded locally while working disconnected</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddSampleOfflineAction}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              + Add Sample Offline Action
            </button>
            {queue.length > 0 && (
              <button
                onClick={handleClearQueue}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Outbox</span>
              </button>
            )}
          </div>
        </div>

        {queue.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800">All Changes Fully Synchronized</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              There are no pending offline mutations. When you create admissions, record fees, or mark attendance without internet, they will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Tx ID</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">Recorded Time</th>
                  <th className="p-3">Payload Summary</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {queue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-blue-900">{item.id}</td>
                    <td className="p-3">
                      <span className="font-sans px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 font-sans">
                      {new Date(item.timestamp).toLocaleString('en-GB')}
                    </td>
                    <td className="p-3 text-slate-700 max-w-xs truncate font-sans">
                      {JSON.stringify(item.payload)}
                    </td>
                    <td className="p-3 text-right font-sans">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
