const API_BASE_URL = "https://light-craft-backend.vercel.app/api";

// ============ Types ============

interface LoginResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

interface UserResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface ProductImage {
  url: string;
  public_id: string;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  description?: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  image?: ProductImage;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsResponse {
  products: Product[];
  page: number;
  pages: number;
}

interface ApiError {
  message: string;
}

// ============ Auth Helpers ============

const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

const authHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const authHeadersMultipart = (): HeadersInit => {
  const token = getAuthToken();
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ============ Auth API ============

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || "Login failed");
  }

  return response.json();
};

export const getAllUsers = async (): Promise<UserResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/auth/users`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || "Failed to fetch users");
  }

  return response.json();
};

export const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<UserResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/create-user`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || "Failed to create user");
  }

  return response.json();
};

export const deleteUser = async (userId: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || "Failed to delete user");
  }

  return response.json();
};

// ============ Product API ============

export const getProducts = async (keyword?: string, pageNumber?: number): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  if (keyword) params.append("keyword", keyword);
  if (pageNumber) params.append("pageNumber", pageNumber.toString());

  const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || "Failed to fetch products");
  }

  return response.json();
};

export const getProductById = async (id: string): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || "Product not found");
  }

  return response.json();
};

export const createProduct = async (formData: FormData): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: authHeadersMultipart(),
    body: formData,
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || "Failed to create product");
  }

  return response.json();
};

export const updateProduct = async (id: string, formData: FormData): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: authHeadersMultipart(),
    body: formData,
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || "Failed to update product");
  }

  return response.json();
};

export const deleteProduct = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || "Failed to delete product");
  }

  return response.json();
};

// ============ Invoice Types ============

export interface InvoiceItem {
  product: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  items: InvoiceItem[];
  subTotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentMethod: "Cash" | "Card" | "Bank Transfer";
  paymentStatus: "Paid" | "Pending";
  creator?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface CreateInvoicePayload {
  customerName: string;
  customerPhone?: string;
  items: {
    product: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  taxRate?: number;
  discountAmount?: number;
  paymentMethod: "Cash" | "Card" | "Bank Transfer";
}

// ============ Invoice API ============

export const createInvoice = async (payload: CreateInvoicePayload): Promise<Invoice> => {
  const response = await fetch(`${API_BASE_URL}/invoices`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || "Failed to create invoice");
  }

  return response.json();
};

export const getInvoices = async (filters?: {
  startDate?: string;
  endDate?: string;
  customerName?: string;
}): Promise<Invoice[]> => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.customerName) params.append("customerName", filters.customerName);

  const response = await fetch(`${API_BASE_URL}/invoices?${params.toString()}`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || "Failed to fetch invoices");
  }

  return response.json();
};

export const getInvoiceById = async (id: string): Promise<Invoice> => {
  const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || "Invoice not found");
  }

  return response.json();
};

// ============ Dashboard Types ============

export interface LowStockProduct {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  image?: ProductImage;
}

export interface RecentInvoice {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  grandTotal: number;
  createdAt: string;
  creator?: {
    _id: string;
    name: string;
  };
}

export interface DashboardStats {
  totalSalesToday: number;
  totalInvoicesToday: number;
  totalItemsSold: number;
  lowStockAlerts: LowStockProduct[];
  recentActivity: RecentInvoice[];
}

// ============ Dashboard API ============

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch(`${API_BASE_URL}/dashboard`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || "Failed to fetch dashboard stats");
  }

  return response.json();
};

// ============ Settings Types ============

export interface SettingsLogo {
  url: string;
  public_id: string;
}

export interface CompanySettings {
  _id?: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  logo?: SettingsLogo;
  taxRate: number;
  currencySymbol: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============ Settings API ============

export const getSettings = async (): Promise<CompanySettings> => {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || "Failed to fetch settings");
  }

  return response.json();
};

export const updateSettings = async (formData: FormData): Promise<CompanySettings> => {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: "PUT",
    headers: authHeadersMultipart(),
    body: formData,
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || "Failed to update settings");
  }

  return response.json();
};
