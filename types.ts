
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SHIPPED = 'SHIPPED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  username: string;
  password?: string; // Only used for verifying, not stored in state usually
  role: UserRole;
  fullName: string;
  clinicName?: string;
  discountTier: number; // 1.0 = standard, 0.9 = 10% off, etc.
  isActive: boolean;
  accessExpiresAt?: string; // ISO Date string
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  originCountry: string;
  certifications: string[];
  imageUrl: string;
}

export interface Product {
  id: string;
  brandId: string;
  name: string;
  specs: string; // e.g., "2x1ml Syringes"
  description: string;
  usageNotes?: string;
  basePrice: number;
  imageUrl: string;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPriceAtRequest: number;
}

export interface OrderRequest {
  id: string;
  userId: string;
  userFullName: string;
  clinicName?: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  notes?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
