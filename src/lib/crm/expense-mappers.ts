import type { Expense, ExpenseCategory, RecurringExpense, PaymentMethod } from '@/lib/api';
import { centsToTaka, takaToCents } from './money';

export interface ExpenseView {
  id: string;
  title: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  expenseDate: string;
  isRecurring: boolean;
  receiptUrl?: string;
  createdAt: string;
}

export interface ExpenseCategoryView {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface RecurringExpenseView {
  id: string;
  title: string;
  amount: number;
  frequency: RecurringExpense['frequency'];
  paymentMethod: PaymentMethod;
  isActive: boolean;
  startDate: string;
  categoryName?: string;
}

export interface ExpenseInput {
  title: string;
  description?: string;
  categoryId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  expenseDate?: string;
}

export function toExpenseView(expense: Expense): ExpenseView {
  return {
    id: expense.id,
    title: expense.title,
    description: expense.description,
    categoryId: expense.categoryId,
    categoryName: expense.category?.name,
    amount: centsToTaka(expense.amountCents),
    paymentMethod: expense.paymentMethod,
    expenseDate: expense.expenseDate,
    isRecurring: expense.isRecurring,
    receiptUrl: expense.receiptUrl,
    createdAt: expense.createdAt,
  };
}

export function toExpenseCategoryView(category: ExpenseCategory): ExpenseCategoryView {
  return {
    id: category.id,
    name: category.name,
    color: category.color,
    icon: category.icon,
  };
}

export function toRecurringExpenseView(expense: RecurringExpense): RecurringExpenseView {
  return {
    id: expense.id,
    title: expense.title,
    amount: centsToTaka(expense.amountCents),
    frequency: expense.frequency,
    paymentMethod: expense.paymentMethod,
    isActive: expense.isActive,
    startDate: expense.startDate,
    categoryName: expense.category?.name,
  };
}

export function expenseInputToRequest(input: ExpenseInput) {
  return {
    title: input.title,
    description: input.description,
    categoryId: input.categoryId || undefined,
    amountCents: takaToCents(input.amount),
    paymentMethod: input.paymentMethod,
    expenseDate: input.expenseDate,
  };
}
