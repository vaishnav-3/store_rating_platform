import apiService from './api';
import { buildQueryString } from '../utils/helpers';

class StoreService {
  async getAllStores(params = {}) {
    return apiService.get('/stores', params);
  }

  async getStoreById(id) {
    return apiService.get(`/stores/${id}`);
  }

  async searchStores(query) {
    return apiService.get(`/stores/search?${buildQueryString(query)}`);
  }

  async filterStores(filters) {
    return apiService.get(`/stores/filter?${buildQueryString(filters)}`);
  }

  async getOwnerDashboard() {
    return apiService.get('/stores/owner/dashboard');
  }

  async getOwnerRatings(params = {}) {
    return apiService.get(`/stores/owner/ratings?${buildQueryString(params)}`);
  }

  async updateStore(id, storeData) {
    return apiService.put(`/stores/${id}`, storeData);
  }

  async updateStoreInfo(storeData) {
    return apiService.put('/stores/owner/info', storeData);
  }

  async updatePassword(passwordData) {
    return apiService.put('/stores/owner/password', passwordData);
  }
}

export default new StoreService();