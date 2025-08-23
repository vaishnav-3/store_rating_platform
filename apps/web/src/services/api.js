import { API_BASE_URL } from "../utils/constants";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.onUnauthorized = null; // Callback for 401 errors
  }

  // Method to set unauthorized callback
  setUnauthorizedCallback(callback) {
    this.onUnauthorized = callback;
  }

  getAuthToken() {
    return localStorage.getItem("token");
  }
 
  setAuthToken(token) {
    localStorage.setItem("token", token);
  }

  removeAuthToken() {
    localStorage.removeItem("token");
  }

  getHeaders(includeAuth = true) {
    const headers = { "Content-Type": "application/json" };
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        // Remove invalid token
        this.removeAuthToken();
        
        // Call unauthorized callback if set
        if (this.onUnauthorized) {
          this.onUnauthorized();
        }
        
        // Create a proper error object
        const error = new Error("Unauthorized");
        error.response = { 
          status: 401, 
          data: { message: "Session expired" } 
        };
        throw error;
      }

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || `HTTP error! status: ${response.status}`);
        error.response = { 
          status: response.status, 
          data 
        };
        throw error;
      }

      // Unwrap data if backend uses { success, message, data }
      if (data && typeof data === "object" && "data" in data) return data.data;
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      
      // Re-throw with proper structure if it doesn't have one
      if (!error.response) {
        error.response = { 
          status: 0, 
          data: { message: error.message } 
        };
      }
      
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    let url = endpoint;
    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }
    return this.makeRequest(url, { method: "GET" });
  }

  async post(endpoint, data = {}) {
    return this.makeRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.makeRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.makeRequest(endpoint, { method: "DELETE" });
  }
}

export default new ApiService();