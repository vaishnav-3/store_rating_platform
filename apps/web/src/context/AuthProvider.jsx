import { useReducer, useEffect } from "react";
import authService from "../services/authService";
import apiService from "../services/api";
import { AuthContext } from "./AuthContext";

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return { ...state, loading: false, isAuthenticated: true, user: action.payload };
    case "LOGIN_FAILURE":
      return { ...state, loading: false, isAuthenticated: false, user: null, error: action.payload };
    case "LOGOUT":
      return { ...state, isAuthenticated: false, user: null, loading: false, error: null }; 
    case "SET_USER":
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "AUTH_CHECK_COMPLETE":
      return { ...state, loading: false };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true, // Start with loading true to prevent flash of unauthenticated content
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up unauthorized callback for API service
  useEffect(() => {
    apiService.setUnauthorizedCallback(() => {
      dispatch({ type: "LOGOUT" });
    });
  }, []);

  // Restore session
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        dispatch({ type: "AUTH_CHECK_COMPLETE" });
        return;
      }

      try {
        // Set the token in the API service before making the request
        apiService.setAuthToken(token);
        
        const response = await authService.getCurrentUser();
        console.log("Auth check - received user data:", response); // Debug log
        
        // Extract the actual user object from the response
        const userData = response.user || response;
        console.log("Extracted user:", userData); // Debug log
        dispatch({ type: "SET_USER", payload: userData });
      } catch (err) {
        console.error("Auth check failed:", err);
        
        // Clean up invalid token
        localStorage.removeItem("token");
        apiService.removeAuthToken();
        
        // Reset auth state to logged out
        dispatch({ type: "LOGOUT" });
        
        // Optional: Only show error message if it's not a simple token expiration
        if (err.response?.status !== 401) {
          dispatch({ type: "SET_ERROR", payload: "Session expired. Please log in again." });
        }
      } finally {
        dispatch({ type: "AUTH_CHECK_COMPLETE" });
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: "LOGIN_START" });
      const user = await authService.login(email, password);
      dispatch({ type: "LOGIN_SUCCESS", payload: user });
      
      // Return a promise that resolves after state update
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(user);
        }, 50);
      });
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE", payload: error.response?.data?.message || "Login failed" });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem("token");
      apiService.removeAuthToken();
      dispatch({ type: "LOGOUT" });
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await authService.register(userData);
      dispatch({ type: "SET_LOADING", payload: false });
      return { message: "Registration successful" };
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.response?.data?.message || "Registration failed" });
      throw error;
    }
  };

  const clearError = () => dispatch({ type: "CLEAR_ERROR" });
  const updateUser = (userData) => dispatch({ type: "SET_USER", payload: userData });

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register, clearError, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};