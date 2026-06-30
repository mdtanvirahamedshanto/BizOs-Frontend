import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'শর্তাবলী (Terms & Conditions) | BizOS',
  description: 'BizOS সফটওয়্যার ব্যবহারের শর্তাবলী ও নিয়মনীতি।',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="mb-8 text-3xl font-bold text-slate-900 sm:text-4xl">শর্তাবলী (Terms & Conditions)</h1>
      
      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <p>সর্বশেষ আপডেট: {new Date().toLocaleDateString('en-BD')}</p>
        
        <section>
          <h2 className="text-xl font-bold text-slate-800">১. ব্যবহারের শর্ত</h2>
          <p>BizOS এ অ্যাকাউন্ট খোলার মাধ্যমে আপনি এই শর্তাবলীর সাথে একমত পোষণ করছেন। এই সফটওয়্যারটি শুধুমাত্র আপনার নিজের বা আপনার বৈধ ব্যবসার হিসাব ও ম্যানেজমেন্টের কাজে ব্যবহার করা যাবে।</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800">২. ব্যবহারকারীর দায়িত্ব</h2>
          <p>আপনার অ্যাকাউন্টের পাসওয়ার্ড এবং তথ্যের গোপনীয়তা রক্ষার দায়িত্ব সম্পূর্ণ আপনার। আপনার অ্যাকাউন্টে হওয়া যেকোনো অননুমোদিত অ্যাক্সেসের জন্য BizOS কর্তৃপক্ষ দায়ী থাকবে না।</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800">৩. নিষিদ্ধ কার্যকলাপ</h2>
          <p>সিস্টেমে কোনো ক্ষতিকর কোড বা ভাইরাস আপলোড করা, সিস্টেমের দুর্বলতা খোঁজার চেষ্টা করা বা স্প্যামিং করা সম্পূর্ণ নিষিদ্ধ। এই ধরনের কোনো কাজের প্রমাণ পেলে তাৎক্ষণিকভাবে অ্যাকাউন্ট বাতিল করা হবে।</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800">৪. সেবার প্রাপ্যতা</h2>
          <p>আমরা সবসময় সিস্টেম সচল রাখার চেষ্টা করি (99.9% আপটাইম গ্যারান্টি)। তবে মেইনটেন্যান্স বা অপ্রত্যাশিত টেকনিক্যাল কারণে সাময়িক সময়ের জন্য সেবা ব্যাহত হতে পারে। এর ফলে ব্যবসার কোনো ক্ষতির জন্য BizOS কে দায়ী করা যাবে না।</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800">৫. একাউন্ট বাতিল</h2>
          <p>যেকোনো সময় আপনি আপনার অ্যাকাউন্ট বাতিল বা ডিলিট করার অনুরোধ করতে পারেন। বাতিল হওয়ার পর আপনার সকল ডেটা স্থায়ীভাবে মুছে ফেলা হতে পারে।</p>
        </section>
      </div>
    </div>
  );
}
