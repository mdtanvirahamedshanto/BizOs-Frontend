import type { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'যোগাযোগ | BizOS',
  description: 'যেকোনো প্রয়োজনে BizOS টিমের সাথে যোগাযোগ করুন।',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="mb-8 text-3xl font-bold text-slate-900 sm:text-4xl text-center">যোগাযোগ</h1>
      <p className="text-center text-slate-500 mb-12 max-w-2xl mx-auto">আপনার যেকোনো জিজ্ঞাসা, পরামর্শ বা সমস্যার কথা আমাদের জানান। আমরা দ্রুততম সময়ের মধ্যে আপনার সাথে যোগাযোগ করব।</p>
      
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">ফোন</h3>
          <p className="text-slate-600">+8801614081441</p>
          <p className="text-xs text-slate-400 mt-1">সকাল ১০টা - সন্ধ্যা ৬টা</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">ইমেইল</h3>
          <p className="text-slate-600">hello@tashanto.com</p>
          <p className="text-xs text-slate-400 mt-1">যেকোনো সময় ইমেইল করুন</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">ঠিকানা</h3>
          <p className="text-slate-600">ঢাকা, বাংলাদেশ</p>
        </div>
      </div>
    </div>
  );
}
