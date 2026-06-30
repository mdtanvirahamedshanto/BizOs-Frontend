'use client';
import { useRouter } from 'next/navigation';
import { AdminOverview } from '@/features/admin/components/admin-overview';
import { AdminView } from '@/features/admin/components/admin-sidebar';

export default function OverviewPage() {
  const router = useRouter();
  return <AdminOverview onNavigate={(view: AdminView) => router.push(`/admin/${view}`)} />;
}
