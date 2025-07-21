import React, { createContext, useState, useEffect, useContext } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  updateProfile as apiUpdateProfile,
  initAuthToken,
  UserProfile,
  LoginData,
  RegisterData,
} from "../api/authApi";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginData) => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => false,
  logout: () => {},
  updateProfile: async () => {},
  clearError: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        // Initialize token from localStorage
        const token = initAuthToken();

        if (token) {
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Error loading user:", err);
        setError("Session expired. Please login again.");
        apiLogout();
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (credentials: LoginData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiLogin(credentials);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRegister(userData);

      if (response.user && response.token) {
        setUser(response.user);
        localStorage.setItem("token", response.token);
        setIsAuthenticated(true);
        setLoading(false);
        return true;
      } else {
        throw new Error("Registration response missing user or token");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Registration failed";
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    apiLogout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update profile function
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await apiUpdateProfile(profileData);
      setUser(updatedUser);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to update profile.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
