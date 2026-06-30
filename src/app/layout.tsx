import type { Metadata, Viewport } from "next";
import { Inter, Hind_Siliguri } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  variable: "--font-bengali",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BizOS | SME Business Operating System & POS in Bangladesh",
  description: "বাংলাদেশের ক্ষুদ্র ও মাঝারি ব্যবসার (SME) জন্য সেরা অফলাইন-ফার্স্ট পস (POS), স্টক ম্যানেজমেন্ট এবং হিসাব-নিকাশ সফটওয়্যার। All-in-one operating system and offline-first POS for retail, wholesale, and ledgers in Bangladesh.",
  keywords: ["POS Bangladesh", "SME Software", "Inventory Management", "Point of Sale", "BizOS", "Ta-Shanto", "Retail Software Bangladesh", "Wholesale Management", "হিসাব খাতা", "স্টক ম্যানেজমেন্ট"],
  authors: [{ name: "Ta-Shanto", url: "https://tashanto.com" }],
  creator: "Ta-Shanto",
  publisher: "BizOS Bangladesh",
  manifest: "/manifest.json",
  openGraph: {
    title: "BizOS | SME Business Operating System",
    description: "বাংলাদেশের ক্ষুদ্র ও মাঝারি ব্যবসার জন্য সেরা অফলাইন-ফার্স্ট পস ও স্টক ম্যানেজমেন্ট সিস্টেম।",
    url: "https://bizos.app", // Adjust if actual domain is different
    siteName: "BizOS",
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BizOS | SME Business Operating System",
    description: "বাংলাদেশের ক্ষুদ্র ও মাঝারি ব্যবসার জন্য সেরা অফলাইন-ফার্স্ট পস ও স্টক ম্যানেজমেন্ট সিস্টেম।",
    creator: "@tashanto",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BizOS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  }>) {
  return (
    <html
      lang="bn"
      className={`${inter.variable} ${hindSiliguri.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

