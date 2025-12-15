
import { User, Brand, Product, OrderRequest, UserRole, OrderStatus } from '../types';

/**
 * This service simulates a backend database + API.
 * In a production environment, this would be replaced by API calls (REST/GraphQL).
 */

const STORAGE_KEYS = {
  USERS: 'aesthetix_users',
  BRANDS: 'aesthetix_brands',
  PRODUCTS: 'aesthetix_products',
  ORDERS: 'aesthetix_orders',
  CURRENT_USER: 'aesthetix_session'
};

// --- Seeding Data ---

const seedData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const admin: User = {
      id: 'admin-1',
      username: 'admin',
      password: 'password123', // In real app, hash this
      role: UserRole.ADMIN,
      fullName: 'System Administrator',
      discountTier: 1,
      isActive: true
    };
    const doctor: User = {
      id: 'user-1',
      username: 'doctor',
      password: 'password123',
      role: UserRole.USER,
      fullName: 'Dr. Sarah Smith',
      clinicName: 'Elite Aesthetics',
      discountTier: 0.85, // 15% off
      isActive: true
    };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([admin, doctor]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.BRANDS)) {
    const brands: Brand[] = [
      {
        id: 'b-1',
        name: 'LuminaTox',
        description: 'Premium Botulinum Toxin Type A for superior smoothing.',
        originCountry: 'South Korea',
        certifications: ['FDA Approved', 'CE Certified'],
        imageUrl: 'https://picsum.photos/id/10/800/600'
      },
      {
        id: 'b-2',
        name: 'VelourFill',
        description: 'Hyaluronic Acid fillers with advanced cross-linking technology.',
        originCountry: 'France',
        certifications: ['CE Certified', 'ISO 13485'],
        imageUrl: 'https://picsum.photos/id/20/800/600'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(brands));
  }

  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    const products: Product[] = [
      {
        id: 'p-1',
        brandId: 'b-1',
        name: 'LuminaTox 100U',
        specs: '100 Units / Vial',
        description: 'Standard vial for glabellar lines.',
        basePrice: 150000,
        imageUrl: 'https://picsum.photos/id/30/400/400',
        stockStatus: 'IN_STOCK'
      },
      {
        id: 'p-2',
        brandId: 'b-1',
        name: 'LuminaTox 200U',
        specs: '200 Units / Vial',
        description: 'Larger volume for body contouring applications.',
        basePrice: 280000,
        imageUrl: 'https://picsum.photos/id/31/400/400',
        stockStatus: 'LOW_STOCK'
      },
      {
        id: 'p-3',
        brandId: 'b-2',
        name: 'VelourFill Deep',
        specs: '2 x 1.1ml Syringes',
        description: 'Ideal for nasolabial folds and deep wrinkles.',
        basePrice: 120000,
        imageUrl: 'https://picsum.photos/id/40/400/400',
        stockStatus: 'IN_STOCK'
      },
      {
        id: 'p-4',
        brandId: 'b-2',
        name: 'VelourFill Kiss',
        specs: '1 x 1.1ml Syringe',
        description: 'Designed specifically for lip augmentation.',
        basePrice: 95000,
        imageUrl: 'https://picsum.photos/id/41/400/400',
        stockStatus: 'IN_STOCK'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }
};

// Initialize DB
seedData();

// --- API Methods ---

export const MockAPI = {
  // Auth
  login: async (username: string, password: string): Promise<User | null> => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 500));
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find((u: any) => u.username === username && u.password === password);
    
    if (user && user.isActive) {
      if (user.accessExpiresAt && new Date(user.accessExpiresAt) < new Date()) {
        throw new Error("Account access expired.");
      }
      // Don't return password
      const { password, ...safeUser } = user;
      return safeUser as User;
    }
    return null;
  },

  // Brands
  getBrands: async (): Promise<Brand[]> => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BRANDS) || '[]');
  },
  
  saveBrand: async (brand: Brand): Promise<void> => {
    const brands = await MockAPI.getBrands();
    const index = brands.findIndex(b => b.id === brand.id);
    if (index >= 0) brands[index] = brand;
    else brands.push(brand);
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(brands));
  },

  // Products
  getProducts: async (brandId?: string): Promise<Product[]> => {
    const products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    if (brandId) return products.filter(p => p.brandId === brandId);
    return products;
  },

  saveProduct: async (product: Product): Promise<void> => {
    const products = await MockAPI.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) products[index] = product;
    else products.push(product);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  deleteProduct: async (id: string): Promise<void> => {
    const products = await MockAPI.getProducts();
    const newProducts = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(newProducts));
  },

  // Users (Admin only)
  getUsers: async (): Promise<User[]> => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    return users.map((u: any) => {
      const { password, ...rest } = u; 
      return rest;
    });
  },

  saveUser: async (user: User & { password?: string }): Promise<void> => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const index = users.findIndex((u: User) => u.id === user.id);
    if (index >= 0) {
      // Keep existing password if not provided
      const existing = users[index];
      users[index] = { ...existing, ...user, password: user.password || existing.password };
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // Orders
  getOrders: async (): Promise<OrderRequest[]> => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
  },

  createOrder: async (order: OrderRequest): Promise<void> => {
    const orders = await MockAPI.getOrders();
    orders.unshift(order); // Newest first
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<void> => {
    const orders = await MockAPI.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
  }
};
