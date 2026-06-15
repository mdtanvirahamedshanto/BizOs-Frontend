'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '@/lib/api';

interface CursorPaginationProps {
  meta?: PaginationMeta;
  hasPrev: boolean;
  onPrev: () => void;
  onNext: () => void;
  itemLabel?: string;
  currentCount?: number;
}

export function CursorPagination({
  meta,
  hasPrev,
  onPrev,
  onNext,
  itemLabel = 'আইটেম',
  currentCount = 0,
}: CursorPaginationProps) {
  const total = meta?.total ?? currentCount;
  const hasMore = meta?.hasMore ?? false;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-400 font-semibold">
      <span>
        মোট {itemLabel}: {total} • দেখানো: {currentCount}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          className="h-7 px-2 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-0.5"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          পূর্ববর্তী
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasMore}
          className="h-7 px-2 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-0.5"
        >
          পরবর্তী
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
