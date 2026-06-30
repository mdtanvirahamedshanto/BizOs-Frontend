'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Package, 
  Barcode, 
  Tag, 
  Landmark, 
  DollarSign, 
  Boxes, 
  Scale, 
  List, 
  Layers, 
  Loader2 
} from 'lucide-react';
import { productSchema, ProductInput } from '../types';
import { 
  useCreateProductMutation, 
  useUpdateProductMutation, 
  useCategoriesQuery,
  useCreateCategoryMutation,
  useProductUnitsQuery,
  Product 
} from '../api/inventory-api';
import { BarcodeScanner } from '@/components/ui/barcode-scanner';
import { Scan } from 'lucide-react';
import { useBarcode } from '@/hooks/use-barcode';

interface ProductFormProps {
  product?: Product; // If provided, we are in Edit mode
  onSuccess: () => void;
  onCancel: () => void;
}

function CategoryModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: (id: string) => void;
}) {
  const [name, setName] = React.useState('');
  const { mutate: createCategory, isPending } = useCreateCategoryMutation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-sm">নতুন ক্যাটাগরি যোগ করুন</h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ক্যাটাগরির নাম <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: ইলেকট্রনিক্স"
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="h-9 px-4 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              বাতিল
            </button>
            <button
              type="button"
              disabled={!name.trim() || isPending}
              onClick={() => {
                createCategory({ name }, {
                  onSuccess: (cat) => {
                    setName('');
                    onSuccess(cat.id);
                  }
                });
              }}
              className="h-9 px-4 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/95 disabled:bg-primary/50 flex items-center gap-1.5"
            >
              {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              সংরক্ষণ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_UNITS = [
  { value: 'pcs', label: 'পিস (Pcs)' },
  { value: 'kg', label: 'কেজি (Kg)' },
  { value: 'litre', label: 'লিটার (Litre)' },
  { value: 'packet', label: 'প্যাকেট (Packet)' },
  { value: 'bag', label: 'বস্তা (Bag)' },
  { value: 'carton', label: 'কার্টন (Carton)' },
] as const;

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const isEdit = !!product;
  const [showCategoryModal, setShowCategoryModal] = React.useState(false);
  const [showScanner, setShowScanner] = React.useState(false);

  const { mutate: createProduct, isPending: isCreating } = useCreateProductMutation();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProductMutation();
  const { data: categories } = useCategoriesQuery();
  const { data: apiUnits } = useProductUnitsQuery();

  const unitOptions = React.useMemo(() => {
    const merged: { value: string; label: string }[] = [...DEFAULT_UNITS];
    for (const u of apiUnits ?? []) {
      if (!merged.some((m) => m.value === u)) {
        merged.push({ value: u, label: u });
      }
    }
    return merged;
  }, [apiUnits]);

  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      sku: product?.sku || '',
      barcode: product?.barcode || '',
      price: product?.price || undefined,
      costPrice: product?.costPrice || undefined,
      stockCount: product?.stockCount || 0,
      unit: product?.unit || 'pcs',
      categoryId: product?.categoryId || '',
      brand: product?.brand || '',
    },
  });

  // Listen for hardware barcode scanner
  useBarcode({
    onScan: (barcode) => {
      setValue('barcode', barcode, { shouldValidate: true, shouldDirty: true });
    },
  });

  const onSubmit = (data: ProductInput) => {
    if (isEdit && product) {
      updateProduct(
        { id: product.id, input: data },
        {
          onSuccess: () => {
            onSuccess();
          },
        }
      );
    } else {
      createProduct(data, {
        onSuccess: () => {
          onSuccess();
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="border-b border-slate-100 pb-2 mb-3">
        <h3 className="text-sm font-bold text-slate-800">
          {isEdit ? 'প্রোডাক্টের তথ্য পরিবর্তন করুন' : 'নতুন প্রোডাক্ট যোগ করুন'}
        </h3>
        <p className="text-[10px] text-slate-400 font-medium">
          {isEdit ? 'Edit Product Parameters' : 'Add New Item to Inventory'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="md:col-span-2">
          <label htmlFor="prod-name" className="block text-xs font-semibold text-slate-700 mb-1">
            প্রোডাক্টের নাম <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Package className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="prod-name"
              type="text"
              placeholder="যেমন: তীর সয়াবিন তেল ৫ লিটার"
              {...register('name')}
              className={`h-10 w-full rounded-lg border pl-9 pr-3 text-xs outline-none transition-all ${
                errors.name
                  ? 'border-destructive focus:ring-1 focus:ring-destructive'
                  : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-[10px] text-destructive mt-1 font-semibold">{errors.name.message}</p>
          )}
        </div>

        {/* Barcode */}
        <div>
          <label htmlFor="prod-barcode" className="block text-xs font-semibold text-slate-700 mb-1">
            বারকোড (Barcode)
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Barcode className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="prod-barcode"
              type="text"
              placeholder="স্ক্যান করুন বা কোড লিখুন"
              {...register('barcode')}
              className="h-10 w-full rounded-lg border pl-9 pr-10 text-xs border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-primary transition-colors"
              title="ক্যামেরা দিয়ে স্ক্যান করুন"
            >
              <Scan className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* SKU */}
        <div>
          <label htmlFor="prod-sku" className="block text-xs font-semibold text-slate-700 mb-1">
            এসকেইউ (SKU Code)
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Tag className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="prod-sku"
              type="text"
              placeholder="যেমন: OIL-SOY-5"
              {...register('sku')}
              className="h-10 w-full rounded-lg border pl-9 pr-3 text-xs border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        {/* Cost Price */}
        <div>
          <label htmlFor="prod-cost" className="block text-xs font-semibold text-slate-700 mb-1">
            ক্রয় মূল্য (Cost Price) <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Landmark className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="prod-cost"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              {...register('costPrice', { valueAsNumber: true })}
              className={`h-10 w-full rounded-lg border pl-9 pr-3 text-xs outline-none transition-all ${
                errors.costPrice
                  ? 'border-destructive focus:ring-1 focus:ring-destructive'
                  : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
          </div>
          {errors.costPrice && (
            <p className="text-[10px] text-destructive mt-1 font-semibold">{errors.costPrice.message}</p>
          )}
        </div>

        {/* Selling Price */}
        <div>
          <label htmlFor="prod-price" className="block text-xs font-semibold text-slate-700 mb-1">
            বিক্রয় মূল্য (Sale Price) <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <DollarSign className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="prod-price"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              {...register('price', { valueAsNumber: true })}
              className={`h-10 w-full rounded-lg border pl-9 pr-3 text-xs outline-none transition-all ${
                errors.price
                  ? 'border-destructive focus:ring-1 focus:ring-destructive'
                  : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
          </div>
          {errors.price && (
            <p className="text-[10px] text-destructive mt-1 font-semibold">{errors.price.message}</p>
          )}
        </div>

        {/* Stock Count (disabled/hidden on edit) */}
        {!isEdit && (
          <div>
            <label htmlFor="prod-stock" className="block text-xs font-semibold text-slate-700 mb-1">
              প্রারম্ভিক স্টক (Stock Qty) <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Boxes className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="prod-stock"
                type="number"
                inputMode="numeric"
                placeholder="0"
                {...register('stockCount', { valueAsNumber: true })}
                className={`h-10 w-full rounded-lg border pl-9 pr-3 text-xs outline-none transition-all ${
                  errors.stockCount
                    ? 'border-destructive focus:ring-1 focus:ring-destructive'
                    : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
                }`}
              />
            </div>
            {errors.stockCount && (
              <p className="text-[10px] text-destructive mt-1 font-semibold">{errors.stockCount.message}</p>
            )}
          </div>
        )}

        {/* Unit */}
        <div>
          <label htmlFor="prod-unit" className="block text-xs font-semibold text-slate-700 mb-1">
            পরিমাপের একক <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Scale className="h-4 w-4 text-slate-400" />
            </div>
            <select
              id="prod-unit"
              {...register('unit')}
              className="h-10 w-full rounded-lg border pl-9 pr-3 text-xs bg-white border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            >
              {unitOptions.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="prod-category" className="block text-xs font-semibold text-slate-700">
              প্রোডাক্ট ক্যাটাগরি
            </label>
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="text-[10px] font-bold text-primary hover:underline"
            >
              + নতুন ক্যাটাগরি
            </button>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <List className="h-4 w-4 text-slate-400" />
            </div>
            <select
              id="prod-category"
              {...register('categoryId')}
              className="h-10 w-full rounded-lg border pl-9 pr-3 text-xs bg-white border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            >
              <option value="">নির্বাচন করুন</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Brand */}
        <div>
          <label htmlFor="prod-brand" className="block text-xs font-semibold text-slate-700 mb-1">
            ব্র্যান্ড (Brand)
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Layers className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="prod-brand"
              type="text"
              placeholder="যেমন: ফ্রেশ, তীর, স্কয়ার"
              {...register('brand')}
              className="h-10 w-full rounded-lg border pl-9 pr-3 text-xs border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-4 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          বাতিল করুন
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="h-9 px-5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/95 transition-colors flex items-center justify-center gap-1.5 disabled:bg-primary/50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>সংরক্ষণ হচ্ছে...</span>
            </>
          ) : (
            <span>{isEdit ? 'আপডেট করুন' : 'প্রোডাক্ট সংরক্ষণ'}</span>
          )}
        </button>
      </div>

      <CategoryModal 
        isOpen={showCategoryModal} 
        onClose={() => setShowCategoryModal(false)}
        onSuccess={(newCatId) => {
          // React Hook Form set value directly
          setValue('categoryId', newCatId, { shouldValidate: true });
          setShowCategoryModal(false);
        }}
      />

      <BarcodeScanner
        open={showScanner}
        onClose={() => setShowScanner(false)}
        onDetected={(code) => {
          setValue('barcode', code, { shouldValidate: true, shouldDirty: true });
          setShowScanner(false);
        }}
      />
    </form>
  );
}
