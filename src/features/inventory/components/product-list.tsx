'use client';

import React, { useState, useEffect } from 'react';
import {
  useProductsQuery,
  useCategoriesQuery,
  useProductBrandsQuery,
  Product,
} from '../api/inventory-api';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { ProductForm } from './product-form';
import { AdjustmentForm } from './adjustment-form';
import { useCursorPagination } from '@/lib/crm/pagination';
import { CursorPagination } from '@/components/ui/cursor-pagination';
import { BarcodeScanner } from '@/components/ui/barcode-scanner';
import { 
  Search, 
  Plus, 
  Edit, 
  ArrowLeftRight, 
  FolderDown,
  Boxes,
  Barcode,
  History,
  Loader2,
  ScanLine
} from 'lucide-react';

interface ProductListProps {
  onSelectProduct: (productId: string) => void;
  selectedProductId?: string | null;
}

export function ProductList({ onSelectProduct, selectedProductId }: ProductListProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const { cursor, reset, next, prev, hasPrev } = useCursorPagination();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    reset();
  }, [debouncedSearch, categoryId, brand, lowStockOnly, reset]);

  const { data: products, meta, isLoading, refetch } = useProductsQuery(
    debouncedSearch,
    categoryId,
    lowStockOnly,
    brand,
    '',
    cursor,
    20,
  );
  const { data: categories } = useCategoriesQuery();
  const { data: brands } = useProductBrandsQuery();

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs w-full space-y-4">
      {/* Create Product Modal overlay */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
            <ProductForm
              onSuccess={() => {
                setShowAddModal(false);
                refetch();
              }}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Product Modal overlay */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
            <ProductForm
              product={editingProduct}
              onSuccess={() => {
                setEditingProduct(null);
                refetch();
              }}
              onCancel={() => setEditingProduct(null)}
            />
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal overlay */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <AdjustmentForm
              productId={adjustingProduct.id}
              onSuccess={() => {
                setAdjustingProduct(null);
                refetch();
              }}
              onCancel={() => setAdjustingProduct(null)}
            />
          </div>
        </div>
      )}

      {/* Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
            <Boxes className="h-5 w-5 text-primary" />
            <span>প্রোডাক্ট ইনভেন্টরি ও স্টক</span>
          </h2>
          <p className="text-[10px] text-slate-400 font-medium">Manage Stock Catalog & Quantities</p>
        </div>

        {/* Add Product Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="h-10 px-4 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 self-start sm:self-center shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন প্রোডাক্ট যোগ</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Search + camera scan */}
        <div className="flex items-center gap-2 flex-1">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="নাম, বারকোড বা এসকেইউ (SKU) দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
          />
        </div>
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-all hover:border-primary hover:text-primary active:scale-[0.97]"
            title="Scan barcode with camera"
          >
            <ScanLine className="h-4 w-4" />
            <span className="hidden sm:inline">স্ক্যান</span>
          </button>
        </div>

        {/* Brand filter */}
        <div className="relative w-full md:w-44">
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="h-10 w-full rounded-lg border px-3 text-xs bg-white border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          >
            <option value="">সব ব্র্যান্ড</option>
            {brands?.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Categories select dropdown */}
        <div className="relative w-full md:w-56">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-10 w-full rounded-lg border px-3 text-xs bg-white border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          >
            <option value="">সব ক্যাটাগরি</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Low Stock Checkbox toggle */}
        <button
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className={`h-10 px-3.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 shrink-0 ${
            lowStockOnly
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <span>কম স্টক (Low Stock)</span>
        </button>
      </div>

      {/* Table grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
          <p className="text-xs text-slate-400 font-semibold">প্রোডাক্ট তালিকা লোড হচ্ছে...</p>
        </div>
      ) : !products || products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-slate-100 rounded-xl bg-slate-50/20">
          <FolderDown className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-xs text-slate-400 font-bold">কোনো প্রোডাক্টের স্টক পাওয়া যায়নি।</p>
        </div>
      ) : (
        <>
        {/* Mobile card list */}
        <div className="md:hidden space-y-2.5">
          {products.map((p) => {
            const isSelected = p.id === selectedProductId;
            const isLowStock = p.stockCount <= p.lowStockThreshold;
            return (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p.id)}
                className={`rounded-xl border p-3 transition-colors ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm leading-tight">{p.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400 font-bold leading-none">
                      {p.sku && <span>SKU: {p.sku}</span>}
                      {p.barcode && (
                        <span className="flex items-center gap-0.5">
                          <Barcode className="h-3 w-3 shrink-0" />
                          {p.barcode}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-xs font-extrabold font-sans leading-none ${
                      isLowStock
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {p.stockCount} {p.unit}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between border-t border-slate-50 pt-2.5">
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400">
                    <span>
                      ক্রয়: <span className="text-slate-600">{formatTaka(p.costPrice)}</span>
                    </span>
                    <span>
                      বিক্রয়: <span className="text-slate-800 font-extrabold">{formatTaka(p.price)}</span>
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setAdjustingProduct(p)}
                      className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-primary hover:border-primary flex items-center justify-center transition-all"
                      title="স্টক সমন্বয়"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingProduct(p)}
                      className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all"
                      title="এডিট"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onSelectProduct(p.id)}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-primary border-primary text-white'
                          : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800'
                      }`}
                      title="স্টক লেজার"
                    >
                      <History className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                <th className="py-2.5 px-3">প্রোডাক্ট নাম / বিবরণ</th>
                <th className="py-2.5 px-3">ক্রয় মূল্য</th>
                <th className="py-2.5 px-3">বিক্রয় মূল্য</th>
                <th className="py-2.5 px-3 text-right">স্টক পরিমাণ</th>
                <th className="py-2.5 px-3 text-center">ব্যবস্থাপনা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
              {products.map((p) => {
                const isSelected = p.id === selectedProductId;
                const isLowStock = p.stockCount <= p.lowStockThreshold;
                
                return (
                  <tr 
                    key={p.id} 
                    className={`hover:bg-slate-50/40 cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/5 hover:bg-primary/5' : ''
                    }`}
                    onClick={() => onSelectProduct(p.id)}
                  >
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-bold text-slate-800 leading-tight mb-1">{p.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold leading-none">
                          {p.sku && <span>SKU: {p.sku}</span>}
                          {p.barcode && (
                            <span className="flex items-center gap-0.5">
                              <Barcode className="h-3 w-3 shrink-0" />
                              {p.barcode}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-500">{formatTaka(p.costPrice)}</td>
                    <td className="py-3 px-3 font-extrabold text-slate-700">{formatTaka(p.price)}</td>
                    <td className="py-3 px-3 text-right font-extrabold text-sm">
                      <span className={`inline-block rounded px-2 py-0.5 font-sans leading-none ${
                        isLowStock 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {p.stockCount} {p.unit}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5 justify-center">
                        {/* Adjust stock button */}
                        <button
                          onClick={() => setAdjustingProduct(p)}
                          className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-primary hover:border-primary flex items-center justify-center transition-all"
                          title="Record stock-in/out adjustment"
                        >
                          <ArrowLeftRight className="h-4 w-4" />
                        </button>
                        
                        {/* Edit product button */}
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all"
                          title="Edit product parameters"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        {/* Audit ledger trigger */}
                        <button
                          onClick={() => onSelectProduct(p.id)}
                          className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-primary border-primary text-white' 
                              : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800'
                          }`}
                          title="View inventory ledger"
                        >
                          <History className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}

      {/* Pagination footer */}
      <CursorPagination
        meta={meta}
        hasPrev={hasPrev}
        onPrev={prev}
        onNext={() => next(meta?.nextCursor)}
        currentCount={products?.length ?? 0}
        itemLabel="প্রোডাক্ট"
      />

      {/* Camera barcode scanner → fills the search box */}
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={(code) => {
          setSearch(code);
          setScannerOpen(false);
        }}
        title="প্রোডাক্ট খুঁজুন — বারকোড স্ক্যান"
      />
    </div>
  );
}
