'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { 
  getSyncStatus, 
  setManualOfflineMode, 
  triggerAutoSync, 
  registerOfflineSyncListeners,
  SyncStatus 
} from '@/lib/offline-sync';

export default function OfflineSyncBar() {
  const [syncState, setSyncState] = useState<SyncStatus>({
    isOnline: true,
    isManualOffline: false,
    effectiveStatus: 'ONLINE',
    pendingCount: 0,
    lastSyncTime: null,
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessToast, setSyncSuccessToast] = useState(false);

  useEffect(() => {
    setSyncState(getSyncStatus());
    const cleanup = registerOfflineSyncListeners((newStatus) => {
      setSyncState(newStatus);
    });
    return cleanup;
  }, []);

  const handleToggleOffline = () => {
    const nextVal = !syncState.isManualOffline;
    setManualOfflineMode(nextVal);
    setSyncState(getSyncStatus());
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await triggerAutoSync();
      if (res.success) {
        setSyncState(getSyncStatus());
        setSyncSuccessToast(true);
        setTimeout(() => setSyncSuccessToast(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const isOffline = syncState.effectiveStatus === 'OFFLINE';

  return (
    <div className="w-full bg-slate-900 text-white text-xs border-b border-slate-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Status Badge */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] border shadow-sm ${
            isOffline 
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              isOffline ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
            }`}></span>
            {isOffline ? (
              <span className="flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                <span>OFFLINE MODE (Local Cache)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                <span>ONLINE (Auto-Sync Active)</span>
              </span>
            )}
          </div>

          {/* Pending Count */}
          {syncState.pendingCount > 0 ? (
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-extrabold text-[10px]">
              {syncState.pendingCount} Change(s) Pending Sync
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 hidden sm:inline-block">
              All records synchronized with Student & Teacher Portals
            </span>
          )}
        </div>

        {/* Right: Controls & Hub Link */}
        <div className="flex items-center gap-2">
          {/* Sync Success Toast Indicator */}
          {syncSuccessToast && (
            <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Portals Updated!</span>
            </span>
          )}

          {/* Instant Sync Button */}
          <button
            onClick={handleManualSync}
            disabled={isSyncing || (isOffline && !syncState.isOnline)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-[11px] rounded-lg shadow flex items-center gap-1.5 transition-all"
            title="Push local offline changes to Student and Teacher portals"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>

          {/* Work Offline Toggle */}
          <button
            onClick={handleToggleOffline}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors border ${
              syncState.isManualOffline
                ? 'bg-amber-600/30 text-amber-200 border-amber-500/50 hover:bg-amber-600/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {syncState.isManualOffline ? 'Go Online' : 'Work Offline'}
          </button>

          {/* Sync Hub Link */}
          <Link
            href="/admin/sync"
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
          >
            <Database className="w-3 h-3 text-blue-400" />
            <span className="hidden md:inline">Sync Hub</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
