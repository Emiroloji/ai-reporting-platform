// src/services/userService.ts

import api from './api';

// Bu interface'i dışa aktararak diğer dosyalarda da kullanabiliriz
export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  credits: number;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
}

export interface ChangePasswordPayload {
  currentPassword?: string; // Bu alan backend'de gerekiyorsa eklenir
  newPassword?: string;
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

// YENİ FONKSİYON: Kullanıcı bilgilerini güncellemek için
export const updateUserProfile = async (payload: UpdateProfilePayload): Promise<UserProfile> => {
    try {
        const response = await api.put('/api/users/profile', payload);
        return response.data;
    } catch (error: any) {
        console.error('Profil güncellenirken hata:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Profil güncellenemedi.');
    }
};

// YENİ FONKSİYON: Şifre değiştirmek için
export const changeUserPassword = async (payload: ChangePasswordPayload): Promise<void> => {
    try {
        await api.put('/api/users/password', payload);
    } catch (error: any) {
        console.error('Şifre değiştirilirken hata:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Şifre değiştirilemedi.');
    }
}