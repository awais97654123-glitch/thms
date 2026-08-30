/**
 * The Hayatabad Model School - Offline Sync & Multi-Portal Replication Engine
 * Provides offline operation caching and automatic sync to Teacher & Student portals.
 */

export interface QueuedAction {
  id: string;
  type: string; // e.g. "ADMISSION_APPLICATION", "FEE_PAYMENT", "ATTENDANCE_RECORD", "MARKS_ENTRY", "HOMEWORK_CREATE"
  payload: any;
  timestamp: string;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  retryCount: number;
}

export interface SyncStatus {
  isOnline: boolean;
  isManualOffline: boolean;
  effectiveStatus: 'ONLINE' | 'OFFLINE';
  pendingCount: number;
  lastSyncTime: string | null;
}

const STORAGE_QUEUE_KEY = 'thms_offline_queue_v1';
const STORAGE_MANUAL_OFFLINE_KEY = 'thms_manual_offline_mode';
const STORAGE_LAST_SYNC_KEY = 'thms_last_sync_timestamp';

// Retrieve pending queue from local storage
export function getQueuedActions(): QueuedAction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading offline queue:', err);
    return [];
  }
}

// Save queue to local storage
export function saveQueuedActions(queue: QueuedAction[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(queue));
    // Dispatch storage event for other tabs/portals
    window.dispatchEvent(new Event('thms_queue_updated'));
  } catch (err) {
    console.error('Error writing offline queue:', err);
  }
}

// Record an action to the offline queue
export function recordOfflineAction(type: string, payload: any): QueuedAction {
  const item: QueuedAction = {
    id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
    type,
    payload,
    timestamp: new Date().toISOString(),
    status: 'PENDING',
    retryCount: 0,
  };

  const current = getQueuedActions();
  current.push(item);
  saveQueuedActions(current);

  // If online and not in manual offline mode, attempt immediate background auto-sync
  if (isCurrentlyOnline() && !isManualOfflineMode()) {
    triggerAutoSync();
  }

  return item;
}

// Check if browser has internet / network
export function isCurrentlyOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

// Check if admin manually forced Offline Mode
export function isManualOfflineMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_MANUAL_OFFLINE_KEY) === 'true';
}

// Toggle manual Offline Mode
export function setManualOfflineMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_MANUAL_OFFLINE_KEY, enabled ? 'true' : 'false');
  window.dispatchEvent(new Event('thms_sync_state_changed'));

  if (!enabled && isCurrentlyOnline()) {
    triggerAutoSync();
  }
}

// Get comprehensive status
export function getSyncStatus(): SyncStatus {
  const online = isCurrentlyOnline();
  const manualOffline = isManualOfflineMode();
  const queue = getQueuedActions();
  const lastSync = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_LAST_SYNC_KEY) : null;

  return {
    isOnline: online,
    isManualOffline: manualOffline,
    effectiveStatus: online && !manualOffline ? 'ONLINE' : 'OFFLINE',
    pendingCount: queue.filter((q) => q.status === 'PENDING').length,
    lastSyncTime: lastSync,
  };
}

// Automatic / Manual Sync Execution
export async function triggerAutoSync(): Promise<{ success: boolean; syncedCount: number; error?: string }> {
  if (typeof window === 'undefined') return { success: false, syncedCount: 0 };

  const queue = getQueuedActions();
  const pending = queue.filter((q) => q.status === 'PENDING');

  if (pending.length === 0) {
    localStorage.setItem(STORAGE_LAST_SYNC_KEY, new Date().toISOString());
    window.dispatchEvent(new Event('thms_sync_completed'));
    return { success: true, syncedCount: 0 };
  }

  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actions: pending }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      // Mark actions as synced or clear them
      const remaining = queue.filter((q) => !pending.some((p) => p.id === q.id));
      saveQueuedActions(remaining);

      localStorage.setItem(STORAGE_LAST_SYNC_KEY, new Date().toISOString());
      
      // Dispatch sync event so Teacher & Student Portals re-fetch data instantly
      window.dispatchEvent(new CustomEvent('thms_sync_completed', { detail: { syncedCount: pending.length } }));
      
      return { success: true, syncedCount: pending.length };
    } else {
      return { success: false, syncedCount: 0, error: data.error || 'Server rejected sync' };
    }
  } catch (err: any) {
    console.warn('Sync attempt postponed (network offline or server unreachable):', err.message);
    return { success: false, syncedCount: 0, error: err.message };
  }
}

// Register global listeners for window online / offline events
export function registerOfflineSyncListeners(onStateChange?: (status: SyncStatus) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = () => {
    const status = getSyncStatus();
    if (onStateChange) onStateChange(status);

    // If back online, auto-sync pending data to portals
    if (status.effectiveStatus === 'ONLINE' && status.pendingCount > 0) {
      triggerAutoSync().then(() => {
        if (onStateChange) onStateChange(getSyncStatus());
      });
    }
  };

  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);
  window.addEventListener('thms_queue_updated', handler);
  window.addEventListener('thms_sync_state_changed', handler);
  window.addEventListener('thms_sync_completed', handler);

  // Periodic heartbeat every 15 seconds to sync if online
  const interval = setInterval(() => {
    const status = getSyncStatus();
    if (status.effectiveStatus === 'ONLINE' && status.pendingCount > 0) {
      triggerAutoSync().then(() => {
        if (onStateChange) onStateChange(getSyncStatus());
      });
    }
  }, 15000);

  return () => {
    window.removeEventListener('online', handler);
    window.removeEventListener('offline', handler);
    window.removeEventListener('thms_queue_updated', handler);
    window.removeEventListener('thms_sync_state_changed', handler);
    window.removeEventListener('thms_sync_completed', handler);
    clearInterval(interval);
  };
}
