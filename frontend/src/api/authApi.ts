import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Types for auth operations
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  address?: string;
  phoneNumber?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  address?: string;
  phoneNumber?: string;
  defaultLocation?: {
    lat: number;
    lng: number;
  };
  notificationRadius?: number;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

// Set auth token for future requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

// Initialize token from localStorage on app load
export const initAuthToken = () => {
  const token = localStorage.getItem("token");
  if (token) {
    setAuthToken(token);
    return token;
  }
  return null;
};

// Register a new user
export const register = async (userData: RegisterData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);

    // Set the token in localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      setAuthToken(response.data.token);
    }

    return response.data;
  } catch (error: any) {
    console.error(
      "Registration error in API:",
      error.response || error.message
    );
    throw error;
  }
};

// Login user
export const login = async (loginData: LoginData): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, loginData);

    // Set token in local storage and axios defaults
    setAuthToken(response.data.token);

    return response.data;
  } catch (error: any) {
    console.error("Login error:", error);
    throw error;
  }
};

// Logout user
export const logout = (): void => {
  setAuthToken(null);
};

// Get current user profile
export const getCurrentUser = async (): Promise<UserProfile> => {
  try {
    const response = await axios.get(`${API_URL}/auth/profile`);
    return response.data;
  } catch (error: any) {
    console.error("Get profile error:", error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (
  profileData: Partial<UserProfile>
): Promise<UserProfile> => {
  try {
    const response = await axios.put(`${API_URL}/auth/profile`, profileData);
    return response.data;
  } catch (error: any) {
    console.error("Update profile error:", error);
    throw error;
  }
};

// Change password
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  try {
    const response = await axios.put(`${API_URL}/auth/change-password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error: any) {
    console.error("Change password error:", error);
    throw error;
  }
};
