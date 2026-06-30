import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'আমাদের সম্পর্কে | BizOS',
  description: 'BizOS এর পেছনের গল্প এবং আমাদের মিশন সম্পর্কে জানুন।',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="mb-8 text-3xl font-bold text-slate-900 sm:text-4xl text-center">আমাদের সম্পর্কে</h1>
      
      <div className="prose prose-slate max-w-none space-y-6 text-slate-600 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <p className="text-lg leading-relaxed text-slate-700 font-medium text-center mb-8">
          বাংলাদেশের ক্ষুদ্র ও মাঝারি ব্যবসায়ীদের (SME) দৈনন্দিন হিসাব-নিকাশ সহজ ও ডিজিটাল করার লক্ষ্যেই তৈরি হয়েছে BizOS।
        </p>
        
        <div className="grid sm:grid-cols-2 gap-8 items-center mt-12">
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">আমাদের মিশন</h2>
            <p>
              আমরা বিশ্বাস করি যে প্রতিটি ব্যবসারই ডিজিটাল হওয়ার অধিকার আছে, তা সেই ব্যবসা যত ছোটই হোক না কেন। 
              অনেক সময় দামি সফটওয়্যার বা ইন্টারনেট কানেকশনের অভাবে ক্ষুদ্র ব্যবসায়ীরা ডিজিটাল হিসাব রাখতে পারেন না। 
              তাই আমরা এমন একটি অফলাইন-ফার্স্ট এবং সহজে ব্যবহারযোগ্য সিস্টেম তৈরি করেছি যা দিয়ে ইন্টারনেট ছাড়াও নির্ভুলভাবে হিসাব রাখা সম্ভব।
            </p>
          </div>
          <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
            <h3 className="font-bold text-primary mb-2">কেন BizOS?</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>সম্পূর্ণ বাংলায় তৈরি, বুঝতে সহজ।</li>
              <li>ইন্টারনেট ছাড়াও বিক্রি করা যায় (Offline-first)।</li>
              <li>কোনো ভারী কম্পিউটার লাগে না, মোবাইল বা ট্যাবলেটেই চলে।</li>
              <li>খাতা, স্টক, ক্রয়-বিক্রয় সব একসাথে।</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
