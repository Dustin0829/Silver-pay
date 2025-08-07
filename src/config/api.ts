// API configuration for different environments
const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001' 
  : 'https://silver-card.vercel.app';

export const API_ENDPOINTS = {
  CREATE_USER: `${API_BASE_URL}/api/create-user`,
  DELETE_USER: `${API_BASE_URL}/api/delete-user`,
  UPDATE_USER: `${API_BASE_URL}/api/update-user`,
  GET_ALL_USERS: `${API_BASE_URL}/api/get-all-users`,
}; 