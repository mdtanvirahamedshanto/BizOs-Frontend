// =============================================================================
// BizOS API SDK — Expenses Module
// =============================================================================

import { apiClient, buildParams } from '../client';
import { PaginatedResponse, PaginationParams, PaymentMethod } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ExpenseFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface ExpenseCategory {
  id: string;
  shopId: string;
  name: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  shopId: string;
  title: string;
  description?: string;
  categoryId?: string;
  category?: Pick<ExpenseCategory, 'id' | 'name' | 'color' | 'icon'>;
  amountCents: number;
  paymentMethod: PaymentMethod;
  receiptUrl?: string;
  expenseDate: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringExpense {
  id: string;
  shopId: string;
  title: string;
  description?: string;
  categoryId?: string;
  category?: Pick<ExpenseCategory, 'id' | 'name' | 'color' | 'icon'>;
  amountCents: number;
  paymentMethod: PaymentMethod;
  frequency: ExpenseFrequency;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  lastProcessedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface ExpenseCategoryRequest {
  name: string;
  color?: string;
  icon?: string;
}

export interface CreateExpenseRequest {
  title: string;
  description?: string;
  categoryId?: string;
  amountCents: number;
  paymentMethod?: PaymentMethod;
  receiptUrl?: string;
  expenseDate?: string;
  isRecurring?: boolean;
}

export type UpdateExpenseRequest = Partial<CreateExpenseRequest>;

export interface CreateRecurringExpenseRequest {
  title: string;
  description?: string;
  categoryId?: string;
  amountCents: number;
  paymentMethod?: PaymentMethod;
  frequency: ExpenseFrequency;
  startDate: string;
  endDate?: string;
  isActive?: boolean;
}

export type UpdateRecurringExpenseRequest = Partial<CreateRecurringExpenseRequest>;

export interface ExpenseQueryParams extends PaginationParams {
  categoryId?: string;
  isRecurring?: boolean;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface RecurringExpenseQueryParams extends PaginationParams {
  isActive?: boolean;
  search?: string;
}

// ─── Expense Categories API ───────────────────────────────────────────────────

export async function createExpenseCategory(data: ExpenseCategoryRequest): Promise<ExpenseCategory> {
  const res = await apiClient.post<ExpenseCategory>('/expenses/categories', data);
  return res.data;
}

export async function listExpenseCategories(): Promise<ExpenseCategory[]> {
  const res = await apiClient.get<ExpenseCategory[]>('/expenses/categories');
  return res.data;
}

export async function getExpenseCategory(categoryId: string): Promise<ExpenseCategory> {
  const res = await apiClient.get<ExpenseCategory>(`/expenses/categories/${categoryId}`);
  return res.data;
}

export async function updateExpenseCategory(
  categoryId: string,
  data: ExpenseCategoryRequest,
): Promise<ExpenseCategory> {
  const res = await apiClient.put<ExpenseCategory>(`/expenses/categories/${categoryId}`, data);
  return res.data;
}

export async function deleteExpenseCategory(categoryId: string): Promise<void> {
  await apiClient.delete(`/expenses/categories/${categoryId}`);
}

// ─── Recurring Expenses API ───────────────────────────────────────────────────

/**
 * Trigger server-side processing of all due recurring expenses
 */
export async function processRecurringExpenses(): Promise<{ processed: number }> {
  const res = await apiClient.post<{ processed: number }>('/expenses/recurring/process');
  return res.data;
}

export async function createRecurringExpense(
  data: CreateRecurringExpenseRequest,
): Promise<RecurringExpense> {
  const res = await apiClient.post<RecurringExpense>('/expenses/recurring', data);
  return res.data;
}

export async function listRecurringExpenses(
  params?: RecurringExpenseQueryParams,
): Promise<PaginatedResponse<RecurringExpense>> {
  const res = await apiClient.get<PaginatedResponse<RecurringExpense>>('/expenses/recurring', {
    params: buildParams(params as Record<string, string | number | boolean | Date | undefined | null>),
  });
  return res.data;
}

export async function getRecurringExpense(recurringId: string): Promise<RecurringExpense> {
  const res = await apiClient.get<RecurringExpense>(`/expenses/recurring/${recurringId}`);
  return res.data;
}

export async function updateRecurringExpense(
  recurringId: string,
  data: UpdateRecurringExpenseRequest,
): Promise<RecurringExpense> {
  const res = await apiClient.put<RecurringExpense>(`/expenses/recurring/${recurringId}`, data);
  return res.data;
}

// ─── Daily Expenses API ───────────────────────────────────────────────────────

export async function createExpense(data: CreateExpenseRequest): Promise<Expense> {
  const res = await apiClient.post<Expense>('/expenses', data);
  return res.data;
}

export async function listExpenses(params?: ExpenseQueryParams): Promise<PaginatedResponse<Expense>> {
  const res = await apiClient.get<PaginatedResponse<Expense>>('/expenses', {
    params: buildParams(params as Record<string, string | number | boolean | Date | undefined | null>),
  });
  return res.data;
}

export async function getExpense(expenseId: string): Promise<Expense> {
  const res = await apiClient.get<Expense>(`/expenses/${expenseId}`);
  return res.data;
}

export async function updateExpense(expenseId: string, data: UpdateExpenseRequest): Promise<Expense> {
  const res = await apiClient.put<Expense>(`/expenses/${expenseId}`, data);
  return res.data;
}

export async function deleteExpense(expenseId: string): Promise<void> {
  await apiClient.delete(`/expenses/${expenseId}`);
}
