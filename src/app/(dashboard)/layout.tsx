import React from 'react';
import { DashboardShell } from '@/components/layouts/dashboard-shell';

interface LayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  return <DashboardShell>{children}</DashboardShell>;
}
