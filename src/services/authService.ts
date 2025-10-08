import api from '../config/api';
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { ApiResponse, LoginRequest, LoginResponse, RegisterRequest, ChangePasswordRequest } from '../types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    console.log('authService - Login attempt with:', credentials);
    
    try {
      // Login için token olmayan temiz bir axios instance kullan
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, credentials, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('authService - Login success:', response.data);
      return response.data;
    } catch (error) {
      console.error('authService - Login failed:', error);
      throw error;
    }
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/v1/auth/register', userData);
    return response.data;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await api.post('/api/v1/auth/logout');
    return response.data;
  },

  changePassword: async (passwordData: ChangePasswordRequest): Promise<ApiResponse<void>> => {
    const response = await api.post('/api/v1/auth/change-password', passwordData);
    return response.data;
  }
};