export interface Business {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  business_id: string;
}

export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  WAITER = 'waiter',
}

export interface Section {
  id: string;
  name: string;
}

export interface TableSeat {
  id: string;
  name: string;
  status: TableStatus;
  section_id: string;
}

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
}

export interface Session {
  id: string;
  total_price: number;
  status: SessionStatus;
  opened_at: string;
  closed_at: string | null;
  table_id: string;
  table?: {
    id: string;
    name: string;
    section?: {
      id: string;
      name: string;
    };
  };
}

export enum SessionStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  PAID = 'paid',
}

export interface Category {
  id: string;
  name: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category_id: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  session_id: string;
  product_id: string;
  product?: Product;
}

export interface Expense {
  id: string;
  name: string;
  expenseCategoryId: string;
  unit: string;
  quantity: number;
  amount: number;
  date: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}
