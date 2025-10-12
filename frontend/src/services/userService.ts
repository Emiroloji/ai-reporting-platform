// src/services/userService.ts

import api from './api';

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  credits: number;
}

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get('/api/users/profile');
    return response.data;
  } catch (error: any) {
    console.error('Kullanıcı profili getirilirken hata:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Profil bilgileri alınamadı.');
  }
};