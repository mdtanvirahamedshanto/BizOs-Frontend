import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'রিফান্ড পলিসি | BizOS',
  description: 'BizOS এর সাবস্ক্রিপশন এবং ফি সংক্রান্ত রিফান্ড পলিসি।',
};

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="mb-8 text-3xl font-bold text-slate-900 sm:text-4xl">রিফান্ড পলিসি</h1>
      
      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <p>সর্বশেষ আপডেট: {new Date().toLocaleDateString('en-BD')}</p>
        
        <section>
          <h2 className="text-xl font-bold text-slate-800">১. ১৪ দিনের ফ্রি ট্রায়াল</h2>
          <p>আমরা সব নতুন ব্যবহারকারীকে ১৪ দিনের সম্পূর্ণ ফ্রি ট্রায়াল প্রদান করি। এই সময়ে আপনি কোনো রকম পেমেন্ট বা ক্রেডিট কার্ড অ্যাড করা ছাড়াই BizOS এর সকল প্রিমিয়াম ফিচার ব্যবহার করে দেখতে পারবেন।</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800">২. সাবস্ক্রিপশন ফি রিফান্ড</h2>
          <p>যেহেতু আমরা প্রথম ১৪ দিন ব্যবহারের সুযোগ দিচ্ছি, তাই সাধারণত সাবস্ক্রিপশন কেনার পর কোনো ফি রিফান্ড বা ফেরত দেওয়া হয় না। তবে বিশেষ কোনো কারিগরি ত্রুটির কারণে যদি আপনি সিস্টেম ব্যবহার করতে না পারেন, তবে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করতে পারেন।</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800">৩. সাবস্ক্রিপশন বাতিল (Cancellation)</h2>
          <p>আপনি যেকোনো সময় আপনার সাবস্ক্রিপশন বাতিল করতে পারেন। বাতিল করলে আপনার অ্যাকাউন্ট পরবর্তী বিলিং সাইকেল পর্যন্ত সচল থাকবে। এরপর অ্যাকাউন্টটি ফ্রি প্ল্যানে নেমে যাবে বা সাসপেন্ড হতে পারে।</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800">৪. রিফান্ড প্রক্রিয়া</h2>
          <p>যদি আমাদের সাপোর্ট টিম কোনো যৌক্তিক কারণে রিফান্ড অনুমোদন করে, তবে তা আপনার পেমেন্ট মেথড (যেমন- কার্ড বা MFS) অনুযায়ী ৩-৭ কার্যদিবসের মধ্যে প্রসেস করা হবে।</p>
        </section>
      </div>
    </div>
  );
}
