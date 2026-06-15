// =============================================================================
// BizOS API SDK — Customers Module
// =============================================================================

import { apiClient, buildParams } from '../client';
import { PaginatedResponse, PaginationParams } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CustomerAddress {
  street?: string;
  area?: string;
  city?: string;
  district?: string;
}

export interface CustomerAttachment {
  fileName: string;
  url: string;
  sizeBytes?: number;
  mimeType?: string;
  uploadedAt?: string;
}

export interface Customer {
  id: string;
  shopId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: CustomerAddress;
  tags: string[];
  notes?: string;
  attachments: CustomerAttachment[];
  createdAt: string;
  updatedAt: string;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreateCustomerRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: CustomerAddress;
  tags?: string[];
  notes?: string;
  attachments?: CustomerAttachment[];
}

export type UpdateCustomerRequest = Partial<CreateCustomerRequest>;

export interface CustomerQueryParams extends PaginationParams {
  search?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * List customers with optional search and cursor-based pagination
 */
export async function listCustomers(
  params?: CustomerQueryParams,
): Promise<PaginatedResponse<Customer>> {
  const res = await apiClient.get<PaginatedResponse<Customer>>('/customers', {
    params: buildParams(params),
  });
  return res.data;
}

/**
 * Get a single customer by ID
 */
export async function getCustomer(customerId: string): Promise<Customer> {
  const res = await apiClient.get<Customer>(`/customers/${customerId}`);
  return res.data;
}

/**
 * Create a new customer
 */
export async function createCustomer(data: CreateCustomerRequest): Promise<Customer> {
  const res = await apiClient.post<Customer>('/customers', data);
  return res.data;
}

/**
 * Update an existing customer's details
 */
export async function updateCustomer(
  customerId: string,
  data: UpdateCustomerRequest,
): Promise<Customer> {
  const res = await apiClient.put<Customer>(`/customers/${customerId}`, data);
  return res.data;
}

/**
 * Delete a customer by ID
 */
export async function deleteCustomer(customerId: string): Promise<void> {
  await apiClient.delete(`/customers/${customerId}`);
}
