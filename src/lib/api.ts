const API_BASE_URL = "https://light-craft-backend.vercel.app/api";

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

interface ApiError {
  message: string;
}

// Helper to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

// Helper for authenticated requests
const authHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Login user
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

// Get all users
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

// Create new user
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

// Delete user
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
