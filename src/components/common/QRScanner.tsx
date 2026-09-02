'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Camera, 
  Keyboard, 
  RefreshCw, 
  UserCheck, 
  Upload, 
  X,
  SwitchCamera,
  Volume2,
  VolumeX
} from 'lucide-react';

interface ScanResult {
  success: boolean;
  message: string;
  student?: {
    id: string;
    studentId: string;
    fullName: string;
    rollNo: string;
    className: string;
    sectionName: string;
    time: string;
    status: string;
  };
}

interface QRScannerModalProps {
  onAttendanceMarked?: () => void;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
}

export default function QRScannerModal({ 
  onAttendanceMarked,
  onClose,
  title = "Automated Smart QR Attendance Scanner",
  subtitle = "Hold student ID card in front of camera or optical scanner"
}: QRScannerModalProps) {
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  
  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [activeCameraIndex, setActiveCameraIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const scannerRef = useRef<any>(null);
  const scannerContainerId = useRef(`thms-qr-reader-${Math.random().toString(36).substring(2, 9)}`);
  const isProcessingRef = useRef(false);
  const lastScannedTokenRef = useRef('');
  const lastScannedTimeRef = useRef(0);

  // Play audio beep on successful scan
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Audio not permitted or failed
    }
  };

  // Process raw token or URL
  const processQrToken = async (rawInput: string) => {
    if (!rawInput || rawInput.trim() === '') return;

    // Cooldown check (prevent re-scanning same card within 3 seconds)
    const cleanInput = rawInput.trim();
    const now = Date.now();
    if (lastScannedTokenRef.current === cleanInput && (now - lastScannedTimeRef.current < 3000)) {
      return;
    }

    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    lastScannedTokenRef.current = cleanInput;
    lastScannedTimeRef.current = now;

    setLoading(true);
    setResult(null);

    try {
      // Extract token if user scanned a full institutional URL
      let token = cleanInput;
      const verifyMatch = cleanInput.match(/\/verify\/student\/([^/?#]+)/i);
      if (verifyMatch && verifyMatch[1]) {
        token = decodeURIComponent(verifyMatch[1]);
      }

      const res = await fetch('/api/attendance/qr-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: token, method: 'QR' }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playBeep();
        setResult({
          success: true,
          message: data.message || 'Attendance verified & recorded successfully.',
          student: data.student,
        });
        if (data.student) {
          setRecentScans((prev) => [data.student, ...prev.slice(0, 6)]);
        }
        if (onAttendanceMarked) onAttendanceMarked();
        setManualToken('');
      } else {
        setResult({
          success: false,
          message: data.error || 'Invalid, inactive, or unassigned student QR card.',
        });
      }
    } catch (err) {
      setResult({
        success: false,
        message: 'Network error connecting to school attendance gateway.',
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1500);
    }
  };

  // Start live HTML5 camera
  const startCamera = async (cameraId?: string) => {
    setCameraLoading(true);
    setCameraError(null);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');

      // Stop previous instance if running
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          await scannerRef.current.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId.current);
      scannerRef.current = html5QrCode;

      // Get available video devices
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        throw new Error('No video cameras found on this device.');
      }
      setCameras(devices);

      const targetCamera = cameraId || devices[0].id;

      const qrCodeSuccessCallback = (decodedText: string) => {
        processQrToken(decodedText);
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        targetCamera,
        config,
        qrCodeSuccessCallback,
        undefined // silent on frame parse errors
      );

      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera initialization error:', err);
      setIsCameraActive(false);
      setCameraError(
        err.message?.includes('Permission') || err.name === 'NotAllowedError'
          ? 'Camera access permission denied. Please allow camera access in your browser address bar.'
          : 'Unable to start camera video stream. You can upload an image or enter student ID/token manually.'
      );
    } finally {
      setCameraLoading(false);
    }
  };

  // Switch between front and rear cameras
  const handleSwitchCamera = () => {
    if (cameras.length <= 1) return;
    const nextIndex = (activeCameraIndex + 1) % cameras.length;
    setActiveCameraIndex(nextIndex);
    startCamera(cameras[nextIndex].id);
  };

  // Handle local image file upload scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const tempScanner = scannerRef.current || new Html5Qrcode(scannerContainerId.current);
      const decodedText = await tempScanner.scanFile(file, true);
      if (decodedText) {
        processQrToken(decodedText);
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: 'Could not detect a valid QR code in the uploaded image. Please ensure good lighting.',
      });
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Mount camera lifecycle
  useEffect(() => {
    startCamera();

    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
          scannerRef.current.clear().catch(() => {});
        } catch (e) {}
      }
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processQrToken(manualToken);
  };

  const scannerContent = (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-w-3xl w-full mx-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F2A5F] via-[#173B7A] to-[#0A192F] p-5 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-300 shadow-inner">
            <QrCode className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white font-serif">{title}</h3>
            <p className="text-xs text-blue-200">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Beep Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={soundEnabled ? 'Mute Beep' : 'Unmute Beep'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Switch Camera Button (if multiple cameras available) */}
          {cameras.length > 1 && (
            <button
              type="button"
              onClick={handleSwitchCamera}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 text-xs font-bold"
              title="Switch Camera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          )}

          {/* Close button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close Scanner"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* CAMERA VIEWER & SCANNER */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Live Camera Viewport */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-300 aspect-square sm:aspect-video flex items-center justify-center">
              
              {/* HTML5 QR Container */}
              <div 
                id={scannerContainerId.current} 
                className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
              />

              {/* Scanning Target Reticle Overlay */}
              {isCameraActive && !cameraLoading && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-blue-400/70 rounded-2xl relative shadow-2xl">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-lg"></div>
                    
                    {/* Animated Scanning Line */}
                    <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-bounce"></div>
                  </div>
                </div>
              )}

              {/* Camera Loading State */}
              {cameraLoading && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-white space-y-2.5 p-4 text-center">
                  <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                  <p className="text-xs font-bold">Initializing optical camera...</p>
                  <p className="text-[11px] text-slate-400">Requesting webcam permissions</p>
                </div>
              )}

              {/* Camera Error / Fallback State */}
              {!cameraLoading && cameraError && (
                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <p className="text-xs font-bold text-amber-300">Camera Inactive or Blocked</p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{cameraError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Camera</span>
                  </button>
                </div>
              )}

            </div>

            {/* Quick Actions Strip: File Upload & Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-600 font-bold">
                  <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                  {isCameraActive ? 'Camera Live' : 'Camera Standby'}
                </span>
              </div>

              {/* Scan from Image File */}
              <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload QR Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Manual Token Fallback */}
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Keyboard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Or enter token / ID manually (e.g. THMS-QR-...)"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !manualToken.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                <span>Verify</span>
              </button>
            </form>

            {/* Quick Test Demo Cards */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">Quick Test:</span>
              <button
                type="button"
                onClick={() => processQrToken('THMS-QR-2026-000001-a1b2c3d4')}
                className="px-2.5 py-1 text-[11px] font-mono bg-white hover:bg-blue-50 text-blue-700 rounded-lg border border-slate-200 transition-colors"
              >
                Hamza Tariq (08-A-001)
              </button>
              <button
                type="button"
                onClick={() => processQrToken('THMS-QR-2026-000003-i9j0k1l2')}
                className="px-2.5 py-1 text-[11px] font-mono bg-white hover:bg-blue-50 text-blue-700 rounded-lg border border-slate-200 transition-colors"
              >
                Usman Zafar (08-A-002)
              </button>
            </div>

          </div>

          {/* SCAN RESULT & RECENT ROSTER FEED */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            
            {/* Live Feedback Banner */}
            {result ? (
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in zoom-in-95 ${
                  result.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                {result.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-xs space-y-1">
                  <p className="font-bold text-sm leading-tight">{result.message}</p>
                  
                  {result.student && (
                    <div className="mt-2 space-y-1.5 bg-white/90 p-3 rounded-xl border border-emerald-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-slate-900">{result.student.fullName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                          {result.student.status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Roll {result.student.rollNo} • {result.student.className} ({result.student.sectionName})
                      </p>
                      <p className="text-blue-700 font-mono text-[10px]">
                        Recorded at {result.student.time}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-blue-900 text-xs flex items-center gap-3">
                <QrCode className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="font-bold">Scan Optical Barcode / QR</p>
                  <p className="text-[11px] text-blue-700">Point your camera directly at the student identity card.</p>
                </div>
              </div>
            )}

            {/* Session Scans Activity Feed */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Session Check-ins
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {recentScans.length} logged
                  </span>
                </div>

                <div className="divide-y divide-slate-200/60 mt-2 max-h-48 overflow-y-auto">
                  {recentScans.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No cards scanned in this session yet.
                    </div>
                  ) : (
                    recentScans.map((scan, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{scan.fullName}</p>
                          <p className="text-[10px] text-slate-500">
                            {scan.rollNo} • {scan.className}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                            ✓ {scan.status}
                          </span>
                          <p className="text-[10px] font-mono text-slate-400">{scan.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-400 text-center">
                The Hayatabad Model School • Smart Gateway
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Footer */}
      {onClose && (
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">Press Esc or click Done to close</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0F2A5F] hover:bg-[#173B7A] text-white font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      )}

    </div>
  );

  // If used with onClose, wrap inside a fixed modal overlay
  if (onClose) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
        {scannerContent}
      </div>
    );
  }

  return scannerContent;
}
