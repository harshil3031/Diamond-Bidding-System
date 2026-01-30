// src/services/auth/authService.js
import apiClient from '../configs/BaseService';
import { ENDPOINTS } from '../index';

class AuthService {
  async login(credentials) {
    return apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
  }

  async register(userData) {
    return apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
  }

  async validateToken() {
    return apiClient.get(ENDPOINTS.AUTH.VALIDATE_TOKEN);
  }

  async refreshToken() {
    return apiClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN);
  }

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
}

export default new AuthService();