'use client';

import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface CameraScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export function CameraScanner({ onScan, onClose }: CameraScannerProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Delay slightly to ensure the DOM element exists
    const timer = setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          'reader',
          { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.0 },
          false
        );

        scanner.render(
          (decodedText) => {
            scanner.clear();
            onScan(decodedText);
          },
          (err) => {
            // Ignore normal scanning errors as it fires continuously when nothing is found
            console.debug(err);
          }
        );

        return () => {
          scanner.clear().catch(console.error);
        };
      } catch (err: any) {
        setError('ক্যামেরা চালু করতে সমস্যা হয়েছে। দয়া করে ক্যামেরা পারমিশন চেক করুন।');
        console.error(err);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            বারকোড স্ক্যান করুন
          </h3>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          {error ? (
            <p className="text-sm text-red-500 text-center font-medium p-4">{error}</p>
          ) : (
            <div id="reader" className="w-full overflow-hidden rounded-xl border-2 border-primary/20 bg-slate-100"></div>
          )}
          
          <p className="text-xs text-slate-500 text-center mt-4">
            আপনার মোবাইলের ক্যামেরা বারকোডের উপর ধরুন। এটি স্বয়ংক্রিয়ভাবে স্ক্যান করে নেবে।
          </p>
        </div>
      </div>
    </div>
  );
}
