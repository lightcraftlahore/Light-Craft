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
