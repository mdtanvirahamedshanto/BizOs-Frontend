import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'প্রাইভেসি পলিসি | BizOS',
  description: 'BizOS এর প্রাইভেসি পলিসি সম্পর্কে জানুন। আমরা কীভাবে আপনার তথ্য সংগ্রহ ও সুরক্ষা করি।',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="mb-8 text-3xl font-bold text-slate-900 sm:text-4xl">প্রাইভেসি পলিসি</h1>
      
      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <p>সর্বশেষ আপডেট: {new Date().toLocaleDateString('en-BD')}</p>
        
        <section>
          <h2 className="text-xl font-bold text-slate-800">১. আমরা কী ধরনের তথ্য সংগ্রহ করি</h2>
          <p>BizOS ব্যবহারের সময় আমরা আপনার নাম, ইমেইল, ফোন নম্বর, এবং আপনার দোকানের তথ্য সংগ্রহ করতে পারি। এই তথ্যগুলো মূলত আপনার অ্যাকাউন্ট তৈরি এবং সেবা প্রদানের জন্য ব্যবহৃত হয়।</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800">২. তথ্যের ব্যবহার</h2>
          <p>আমরা আপনার প্রদান করা তথ্য শুধুমাত্র নিচের কাজগুলোতে ব্যবহার করি:</p>
          <ul className="list-disc pl-5">
            <li>সিস্টেমে আপনার অ্যাকাউন্ট পরিচালনা করা।</li>
            <li>আপনার জন্য ইনভয়েস এবং রিপোর্ট জেনারেট করা।</li>
            <li>যেকোনো সমস্যা বা কাস্টমার সাপোর্টের জন্য আপনার সাথে যোগাযোগ করা।</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800">৩. তথ্য সুরক্ষা</h2>
          <p>আপনার এবং আপনার কাস্টমারের ডেটার গোপনীয়তা রক্ষায় আমরা সর্বোচ্চ স্তরের ক্লাউড সিকিউরিটি এবং এনক্রিপশন ব্যবহার করি। আপনার বিনা অনুমতিতে আমরা কোনো তৃতীয় পক্ষের কাছে আপনার তথ্য বিক্রি বা হস্তান্তর করি না।</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800">৪. কুকিজ</h2>
          <p>আপনাকে আরও ভালো অভিজ্ঞতা দিতে আমাদের ওয়েবসাইট কুকিজ ব্যবহার করে। আপনি চাইলে ব্রাউজার সেটিংস থেকে কুকিজ বন্ধ করতে পারেন, তবে সেক্ষেত্রে কিছু ফিচার সঠিকভাবে কাজ নাও করতে পারে।</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800">৫. পলিসি পরিবর্তন</h2>
          <p>আমরা যেকোনো সময় এই পলিসি আপডেট করার অধিকার সংরক্ষণ করি। কোনো পরিবর্তন হলে তা এই পেজেই জানিয়ে দেওয়া হবে।</p>
        </section>
      </div>
    </div>
  );
}
