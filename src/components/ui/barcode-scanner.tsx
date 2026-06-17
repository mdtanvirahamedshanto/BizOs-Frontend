'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import { X, Loader2, ScanLine, CameraOff, Zap, ZapOff } from 'lucide-react';

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onDetected: (code: string) => void;
  /** Keep scanning after a hit (e.g. POS rapid add). Default: close on first hit. */
  continuous?: boolean;
  title?: string;
}

type ScannerStatus = 'starting' | 'scanning' | 'error';

function cameraErrorMessage(err: unknown): string {
  const name = (err as { name?: string })?.name ?? '';
  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'ক্যামেরা ব্যবহারের অনুমতি দেওয়া হয়নি। ব্রাউজার সেটিংস থেকে অনুমতি দিন।';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'কোনো ক্যামেরা খুঁজে পাওয়া যায়নি।';
    case 'NotReadableError':
      return 'ক্যামেরা চালু করা যায়নি। অন্য অ্যাপ এটি ব্যবহার করছে কিনা দেখুন।';
    default:
      return 'ক্যামেরা চালু করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
  }
}

export function BarcodeScanner({
  open,
  onClose,
  onDetected,
  continuous = false,
  title = 'বারকোড স্ক্যান করুন',
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const lastHitRef = useRef<{ code: string; at: number } | null>(null);

  // Keep latest callbacks in refs so the camera effect stays stable
  const onDetectedRef = useRef(onDetected);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onDetectedRef.current = onDetected;
    onCloseRef.current = onClose;
  });

  const [status, setStatus] = useState<ScannerStatus>('starting');
  const [errorMsg, setErrorMsg] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const reader = new BrowserMultiFormatReader();
    setStatus('starting');
    setErrorMsg('');
    setTorchOn(false);

    const stop = () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
    };

    reader
      .decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current!,
        (result) => {
          if (cancelled || !result) return;

          const code = result.getText();
          const now = Date.now();
          // Debounce repeated reads of the same code
          if (
            lastHitRef.current &&
            lastHitRef.current.code === code &&
            now - lastHitRef.current.at < 1500
          ) {
            return;
          }
          lastHitRef.current = { code, at: now };

          try {
            navigator.vibrate?.(80);
          } catch {
            /* vibration not supported */
          }

          onDetectedRef.current(code);

          if (!continuous) {
            stop();
            onCloseRef.current();
          }
        },
      )
      .then((controls) => {
        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setStatus('scanning');

        // Detect torch capability on the active video track
        const stream = videoRef.current?.srcObject as MediaStream | null;
        const track = stream?.getVideoTracks?.()[0];
        const capabilities = track?.getCapabilities?.() as
          | (MediaTrackCapabilities & { torch?: boolean })
          | undefined;
        if (capabilities?.torch) setTorchSupported(true);
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus('error');
        setErrorMsg(cameraErrorMessage(err));
      });

    return () => {
      cancelled = true;
      stop();
    };
  }, [open, continuous]);

  const toggleTorch = async () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    const track = stream?.getVideoTracks?.()[0];
    if (!track) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({
        advanced: [{ torch: next } as MediaTrackConstraintSet & { torch: boolean }],
      });
      setTorchOn(next);
    } catch {
      setTorchSupported(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 pt-safe text-white">
        <div className="flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold">{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {torchSupported && (
            <button
              onClick={toggleTorch}
              className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="টর্চ"
            >
              {torchOn ? <Zap className="h-5 w-5 text-amber-300" /> : <ZapOff className="h-5 w-5" />}
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="বন্ধ করুন"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Camera viewport */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          playsInline
          muted
        />

        {status === 'scanning' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {/* Dim mask with clear center window */}
            <div className="relative h-56 w-72 max-w-[80vw]">
              <div className="absolute inset-0 rounded-2xl border-2 border-white/80 shadow-[0_0_0_100vmax_rgba(0,0,0,0.55)]" />
              {/* Corner accents */}
              <span className="absolute -left-0.5 -top-0.5 h-6 w-6 rounded-tl-2xl border-l-4 border-t-4 border-primary" />
              <span className="absolute -right-0.5 -top-0.5 h-6 w-6 rounded-tr-2xl border-r-4 border-t-4 border-primary" />
              <span className="absolute -bottom-0.5 -left-0.5 h-6 w-6 rounded-bl-2xl border-b-4 border-l-4 border-primary" />
              <span className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-br-2xl border-b-4 border-r-4 border-primary" />
              {/* Animated scan line */}
              <span className="absolute left-3 right-3 top-1/2 h-0.5 animate-pulse bg-primary/90 shadow-[0_0_12px_2px_rgba(124,58,237,0.8)]" />
            </div>
          </div>
        )}

        {status === 'starting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-semibold">ক্যামেরা চালু হচ্ছে...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center text-white">
            <CameraOff className="h-10 w-10 text-red-400" />
            <p className="text-sm font-semibold">{errorMsg}</p>
            <button
              onClick={onClose}
              className="mt-2 rounded-lg bg-white/15 px-5 py-2 text-sm font-bold hover:bg-white/25"
            >
              বন্ধ করুন
            </button>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-6 py-4 pb-safe text-center">
        <p className="text-xs font-medium text-white/70">
          পণ্যের বারকোড ফ্রেমের ভেতরে রাখুন — স্বয়ংক্রিয়ভাবে স্ক্যান হবে
        </p>
      </div>
    </div>
  );
}
