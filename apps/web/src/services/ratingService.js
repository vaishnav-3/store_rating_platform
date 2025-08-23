import apiService from './api';
 
class RatingService {
  async submitRating(ratingData) {
    return apiService.post('/ratings', ratingData);
  }

  async updateRating(id, ratingData) {
    return apiService.put(`/ratings/${id}`, ratingData);
  }

  async deleteRating(id) {
    return apiService.delete(`/ratings/${id}`);
  }

  async getUserRatings(userId) {
    return apiService.get(`/ratings/user/${userId}`);
  }

  async getStoreRatings(storeId) {
    return apiService.get(`/ratings/store/${storeId}`);
  }
}

export default new RatingService();

  // Mock implementations
  // async mockGetUserRatings(userId) {
  //   await new Promise(resolve => setTimeout(resolve, 600));
    
  //   return [
  //     {
  //       id: 4,
  //       rating: 5,
  //       createdAt: "2025-08-22T17:41:39.353Z",
  //       updatedAt: "2025-08-22T17:41:39.353Z",
  //       store: {
  //         id: 2,
  //         name: "Tech Paradise Store",
  //         address: "100 Tech Avenue, Bangalore",
  //         averageRating: "5.00"
  //       },
  //       user: {
  //         id: 13,
  //         name: "Vaishnav Patil user Long Name"
  //       }
  //     },
  //     {
  //       id: 5,
  //       rating: 4,
  //       createdAt: "2025-08-22T16:30:15.123Z",
  //       updatedAt: "2025-08-22T16:30:15.123Z",
  //       store: {
  //         id: 1,
  //         name: "Electronics Plus Store",
  //         address: "123 Main Street, Mumbai",
  //         averageRating: "4.50"
  //       },
  //       user: {
  //         id: 13,
  //         name: "Vaishnav Patil user Long Name"
  //       }
  //     }
  //   ];
  // }

  // async mockSubmitRating(ratingData) {
  //   await new Promise(resolve => setTimeout(resolve, 800));
  //   return { message: 'Rating submitted successfully' };
  // }

  // async mockUpdateRating(id, ratingData) {
  //   await new Promise(resolve => setTimeout(resolve, 800));
  //   return { message: 'Rating updated successfully' };
  // }
