// src/services/organizationService.ts

import api from './api';
import { UserProfile } from './userService'; // Mevcut UserProfile tipini yeniden kullanıyoruz

/**
 * Mevcut organizasyonun tüm üyelerini getiren API çağrısı.
 */
export const getOrganizationMembers = async (): Promise<UserProfile[]> => {
  try {
    const response = await api.get('/api/organization/members');
    return response.data;
  } catch (error: any) {
    console.error('Organizasyon üyeleri getirilirken hata:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Üyeler getirilemedi.');
  }
};

/**
 * Organizasyona yeni bir kullanıcı davet eden API çağrısı.
 * @param email Davet edilecek kullanıcının e-posta adresi.
 * @param role Kullanıcıya atanacak rol (Örn: "USER", "ADMIN").
 */
export const inviteUser = async (email: string, role: string): Promise<UserProfile> => {
  try {
    const response = await api.post('/api/organization/invite', { email, role });
    return response.data;
  } catch (error: any) {
    console.error('Kullanıcı davet edilirken hata:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Kullanıcı davet edilemedi.');
  }
};

/**
 * Bir kullanıcıyı organizasyondan çıkaran API çağrısı.
 * @param memberId Organizasyondan çıkarılacak kullanıcının ID'si.
 */
export const removeUser = async (memberId: number): Promise<string> => {
  try {
    const response = await api.delete(`/api/organization/members/${memberId}`);
    return response.data;
  } catch (error: any) {
    console.error('Kullanıcı çıkarılırken hata:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Kullanıcı organizasyondan çıkarılamadı.');
  }
};

/**
 * Organizasyonun API anahtarını getirir.
 */
export const getApiKey = async (): Promise<{ apiKey: string }> => {
  try {
    const response = await api.get('/api/organization/api-key');
    return response.data;
  } catch (error: any) {
    console.error('API anahtarı getirilirken hata:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'API anahtarı alınamadı.');
  }
};

/**
 * Organizasyon için yeni bir API anahtarı oluşturur.
 */
export const regenerateApiKey = async (): Promise<{ apiKey: string }> => {
  try {
    const response = await api.post('/api/organization/api-key/regenerate');
    return response.data;
  } catch (error: any) {
    console.error('API anahtarı yenilenirken hata:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'API anahtarı yenilenemedi.');
  }
};