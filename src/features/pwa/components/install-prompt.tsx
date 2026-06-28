'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePwaStore } from '../stores/use-pwa-store';

export function InstallPrompt() {
  const { installPromptEvent, setInstallPromptEvent } = usePwaStore();
  const [isVisible, setIsVisible] = useState(false);

  // Hook listeners for install prompts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isDismissed = localStorage.getItem('pwa_prompt_dismissed') === 'true';

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent default browser installation banner
      e.preventDefault();
      setInstallPromptEvent(e);
      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    const handleAppInstalled = () => {
      console.log('[PWA App] App installed successfully by client.');
      setInstallPromptEvent(null);
      setIsVisible(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [setInstallPromptEvent]);

  const handleInstall = async () => {
    if (!installPromptEvent) return;
    
    // Show prompt
    installPromptEvent.prompt();
    
    // Await choice
    const { outcome } = await installPromptEvent.userChoice;
    console.log(`[PWA App] Client installation outcome decision: ${outcome}`);
    
    // Clear event
    setInstallPromptEvent(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_prompt_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible || !installPromptEvent) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-80 z-40 bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl p-4 shadow-xl flex items-start gap-3 animate-fade-in">
      <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
        <Smartphone className="h-5 w-5 text-white" />
      </div>

      <div className="flex-1 text-left space-y-1.5 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="text-xs font-bold text-white">BizOS অ্যাপ ইনস্টল করুন</h4>
          <button 
            onClick={handleDismiss}
            className="p-0.5 rounded-full hover:bg-slate-800 text-slate-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
          হোম স্ক্রিন হতে সরাসরি POS অফলাইন ব্যাকআপ অ্যাক্সেস করতে বিজওএস ইনস্টল করুন।
        </p>
        <button
          onClick={handleInstall}
          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1"
        >
          <Download className="h-3 w-3" /> ইনস্টল করুন (Install PWA)
        </button>
      </div>
    </div>
  );
}
