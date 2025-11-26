// src/api.js
import axios from 'axios';

// Your machine IP + backend port
export const API_BASE = "http://192.168.0.104:3000";

export const ENDPOINTS = {
  ME: `${API_BASE}/api/me`,
  HALL_MESSAGES: `${API_BASE}/api/messages/hall`,
  LOGIN: `${API_BASE}/api/auth/login`,
  SIGNUP: `${API_BASE}/api/auth/signup`,
  USERS: `${API_BASE}/api/users`,
  CONTACTS: `${API_BASE}/users/contacts`,
  PRIVATE_CONVERSATIONS: `${API_BASE}/api/messages/private/conversations`,
  PRIVATE_MESSAGES: (userId) => `${API_BASE}/api/messages/private/${userId}`,
  SEND_PRIVATE_MESSAGE: `${API_BASE}/api/messages/private`,
};

// For socket.io
export const SOCKET_URL = API_BASE;

// Authentication API functions
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await axios.post(ENDPOINTS.LOGIN, {
        email,
        password,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  },

  signup: async (name, email, password, role, avatar) => {
    try {
      const response = await axios.post(ENDPOINTS.SIGNUP, {
        name,
        email,
        password,
        role,
        avatar,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Signup failed',
      };
    }
  },

  getMe: async (token) => {
    try {
      const response = await axios.get(ENDPOINTS.ME, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get user data',
      };
    }
  },
};
