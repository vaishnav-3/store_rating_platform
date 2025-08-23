import apiService from "./api";

class AdminService {
  // Dashboard stats
  async getDashboard() {
    return apiService.get("/admin/dashboard");
  }

  // Users
  async getUsers(filters = {}) {
    return apiService.get("/admin/users/search", filters ); // supports ?email=...&role=... etc.
  }

    async getALLUsers(filters = {}) {
    return apiService.get("/admin/users", filters ); // supports ?email=...&role=... etc.
  }

  async createUser(userData) {
    return apiService.post("/admin/users", userData);
  }

  async updateUser(userId, userData) {
    return apiService.put(`/admin/users/${userId}`, userData);
  }

  async deleteUser(userId) {
    return apiService.delete(`/admin/users/${userId}`);
  }

  async changeUserRole(userId, role) {
    return apiService.put(`/admin/users/${userId}/role`, { role });
  }

  async getPublicStores(page = 1, limit = 20) {
    return apiService.get(`/stores?page=${page}&limit=${limit}`);
  }

  // Stores
  async createStore(storeData) {
    return apiService.post("/admin/stores", storeData);
  }

  async deleteStore(storeId) {
    return apiService.delete(`/admin/stores/${storeId}`);
}
}

export default new AdminService();
