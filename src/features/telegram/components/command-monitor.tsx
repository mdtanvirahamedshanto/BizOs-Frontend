'use client';

import React, { useState } from 'react';
import { Terminal, Edit, Eye, MessageSquare, ToggleLeft, ToggleRight, X, Save, RefreshCw } from 'lucide-react';
import { TelegramCommand } from '../types';
import { useTelegramCommandsQuery, useUpdateCommandMutation } from '../api/telegram-api';

export function CommandMonitor() {
  const { data: commands, isLoading } = useTelegramCommandsQuery();
  const updateCommandMutation = useUpdateCommandMutation();

  const [selectedCommand, setSelectedCommand] = useState<TelegramCommand | null>(null);
  const [templateText, setTemplateText] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);

  const handleEditClick = (cmd: TelegramCommand) => {
    setSelectedCommand(cmd);
    setTemplateText(cmd.replyTemplate);
    setIsEnabled(cmd.enabled);
  };

  const handleSave = async () => {
    if (!selectedCommand) return;
    try {
      await updateCommandMutation.mutateAsync({
        key: selectedCommand.key,
        replyTemplate: templateText,
        enabled: isEnabled
      });
      setSelectedCommand(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 text-left">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
          <Terminal className="h-4.5 w-4.5 text-indigo-600" /> ৩. কম্যান্ড রেসপন্স ও মনিটরিং (Command Templates & Stats)
        </h3>
        <p className="text-[10px] text-slate-400 mt-0.5">বটে ব্যবহৃত কম্যান্ডসমূহ এবং তাদের স্বয়ংক্রিয় উত্তর কনফিগারেশন</p>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commands?.map((cmd) => (
            <div 
              key={cmd.key}
              className={`p-4 border rounded-2xl flex flex-col justify-between space-y-3 transition-all ${
                cmd.enabled 
                  ? 'border-indigo-100 bg-slate-50/20 hover:border-indigo-200' 
                  : 'border-slate-200 bg-slate-100/50 opacity-60'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-black text-indigo-600 text-sm">{cmd.command}</span>
                  <span className="text-[10px] font-bold text-slate-400 bg-white border px-2 py-0.5 rounded-full">
                    মোট ব্যবহার: {cmd.usageCount} বার
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-700">{cmd.description}</h4>
                
                {/* Reply template preview */}
                <div className="bg-slate-900 text-indigo-200 font-mono text-[10px] p-2.5 rounded-xl whitespace-pre-line border border-slate-800 leading-relaxed max-h-[100px] overflow-y-auto">
                  {cmd.replyTemplate}
                </div>
              </div>

              <div className="flex justify-end gap-1.5 pt-1.5 border-t border-slate-100">
                <button
                  onClick={() => handleEditClick(cmd)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-[10px] font-bold transition-all flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" /> উত্তর সাজান (Edit Template)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Command Template Dialog */}
      {selectedCommand && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-800 text-xs">কম্যান্ড কনফিগারেশন: <span className="font-mono text-indigo-600 text-sm">{selectedCommand.command}</span></h4>
                <p className="text-[9px] text-slate-400 mt-0.5">বটের স্বয়ংক্রিয় মেসেজ টেমপ্লেট কাস্টমাইজ করুন</p>
              </div>
              <button 
                onClick={() => setSelectedCommand(null)}
                className="p-1 rounded-full hover:bg-slate-200 text-slate-400"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 flex-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">কম্যান্ড সক্রিয় স্ট্যাটাস:</span>
                <button 
                  onClick={() => setIsEnabled(!isEnabled)}
                  className="focus:outline-none"
                >
                  {isEnabled ? (
                    <ToggleRight className="h-9 w-9 text-indigo-600 cursor-pointer" />
                  ) : (
                    <ToggleLeft className="h-9 w-9 text-slate-300 hover:text-slate-400 cursor-pointer" />
                  )}
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">স্বয়ংক্রিয় উত্তর টেমপ্লেট (Reply Message Template)</label>
                <textarea
                  value={templateText}
                  onChange={(e) => setTemplateText(e.target.value)}
                  rows={6}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono leading-relaxed bg-slate-50/50"
                  placeholder="মেসেজ টেমপ্লেট লিখুন..."
                />
              </div>

              {/* Template instruction tip */}
              <div className="p-3 bg-indigo-50 border border-indigo-100/50 rounded-xl text-[10px] text-indigo-700 leading-relaxed font-semibold">
                💡 টিপস: আপনি <span className="font-mono text-slate-800 bg-white px-1 border rounded">{'{date}'}</span> ট্যাগটি ব্যবহার করতে পারেন যা চ্যাটের সময় অটোমেটিক আজকের বর্তমান তারিখে কনভার্ট হবে।
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-1.5">
              <button
                onClick={() => setSelectedCommand(null)}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-500"
              >
                বাতিল (Cancel)
              </button>
              <button
                onClick={handleSave}
                disabled={updateCommandMutation.isPending}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
              >
                {updateCommandMutation.isPending ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> সেভিং...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" /> সংরক্ষণ করুন (Save Template)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
