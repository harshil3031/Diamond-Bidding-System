// src/services/index.js
// This file exports all services for easy imports elsewhere
import apiClient from './configs/BaseService';

// Define endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VALIDATE_TOKEN: '/auth/validate-token',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  USERS: {
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAILS: (id) => `/products/${id}`,
  },
};

import authService from './auth/authService';

// Export services
export {
  apiClient,
  authService,
};