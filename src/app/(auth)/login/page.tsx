import React, { Suspense } from 'react';
import { LoginForm } from '@/features/authentication/components/login-form';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
          <p className="text-sm text-slate-500 font-medium">লোডিং...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
