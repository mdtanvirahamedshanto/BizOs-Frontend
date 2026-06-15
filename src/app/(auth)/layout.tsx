import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      {/* Decorative top grid canvas */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main card viewport */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {children}
      </div>
      
      {/* Footer copyright */}
      <div className="relative z-10 mt-8 text-center text-xs text-slate-400 font-medium">
        © {new Date().getFullYear()} BizOS Bangladesh. সর্বস্বত্ব সংরক্ষিত।
      </div>
    </div>
  );
}
