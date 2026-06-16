import { apiClient } from '../client';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  userRoles: Array<{
    role: {
      id: string;
      name: string;
    };
  }>;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export async function listUsers(): Promise<User[]> {
  const res = await apiClient.get<User[]>('/users');
  return res.data;
}

export async function listRoles(): Promise<Role[]> {
  const res = await apiClient.get<Role[]>('/users/roles');
  return res.data;
}

export async function inviteUser(data: {
  name: string;
  email: string;
  phone?: string;
  roleId: string;
}): Promise<User> {
  const res = await apiClient.post<User>('/users', data);
  return res.data;
}

export async function updateUser(
  userId: string,
  data: {
    name?: string;
    phone?: string;
    roleId?: string;
  }
): Promise<User> {
  const res = await apiClient.put<User>(`/users/${userId}`, data);
  return res.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/users/${userId}`);
}
