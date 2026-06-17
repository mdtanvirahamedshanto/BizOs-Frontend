import type { Metadata } from 'next';
import { LandingPage } from '@/features/marketing/components/landing-page';

export const metadata: Metadata = {
  title: 'BizOS | বাংলাদেশের SME-দের জন্য POS ও ব্যবসা ব্যবস্থাপনা',
  description:
    'POS, ইনভেন্টরি, খাতা, ক্রয়, ক্যাশবুক ও রিপোর্ট — অফলাইন-ফার্স্ট, বাংলা UI সহ সম্পূর্ণ ব্যবসা অপারেটিং সিস্টেম।',
  openGraph: {
    title: 'BizOS — SME Business Operating System',
    description: 'All-in-one POS and business management for Bangladesh retail & wholesale.',
    type: 'website',
  },
};

export default function Home() {
  return <LandingPage />;
}
