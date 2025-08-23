import apiService from './api';
  
class UserService { 
  async getProfile() {
    return apiService.get('/users/profile');
  }
 
  async updateProfile(profileData) {
    return apiService.put('/users/profile', profileData);
  }

  async updatePassword(passwordData) {
    return apiService.put('/users/password', passwordData);
  }
}

export default new UserService();

 
  // // Mock implementation
  // async mockGetProfile() {
  //   await new Promise(resolve => setTimeout(resolve, 500));
    
  //   return {
  //     id: 13,
  //     name: "Vaishnav Patil user Long Name",
  //     email: "front@example.com",
  //     address: "456 Updated Street, Updated City",
  //     role: "user",
  //     createdAt: "2025-08-22T17:04:18.262Z",
  //     updatedAt: "2025-08-22T17:29:32.780Z"
  //   };
  // }

  // async mockUpdateProfile(profileData) {
  //   await new Promise(resolve => setTimeout(resolve, 800));
  //   return { message: 'Profile updated successfully' };
  // }

  // async mockUpdatePassword(passwordData) {
  //   await new Promise(resolve => setTimeout(resolve, 800));
  //   return { message: 'Password updated successfully' };
  // }
