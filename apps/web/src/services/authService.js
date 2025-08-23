import apiService from "./api";

class AuthService {
  async login(email, password) {
    const res = await apiService.post("/auth/login", { email, password });
    // Debug log to inspect backend response
    if (typeof window !== "undefined") {
      console.log("LOGIN RESPONSE:", res);
    }
    // Support both { token, user } and { data: { token, user } }
    const data = res && res.token && res.user ? res : res?.data;
    if (!data || !data.token || !data.user) {
      throw new Error("Invalid login response from server");
    }
    if (typeof window !== "undefined") {
      console.log("LOGIN USER:", data.user);
      console.log("LOGIN TOKEN:", data.token);
    }
    apiService.setAuthToken(data.token);
    return data.user;
  } 

  async register(userData) {
    return await apiService.post("/auth/register", userData);
  }

  async getCurrentUser() {
    return await apiService.get("/auth/me");
  }

  async logout() {
    try {
      await apiService.post("/auth/logout"); // ✅ backend is POST
    } finally {
      apiService.removeAuthToken();
    }
  }

  isAuthenticated() {
    return !!apiService.getAuthToken();
  }
}

export default new AuthService();
