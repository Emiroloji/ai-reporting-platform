// src/services/fileService.ts

import api from './api'; // Kendi oluşturduğumuz axios instance'ını import ediyoruz.

// Yüklenecek dosyanın bilgilerini tanımlayan bir TypeScript interface'i.
// Bu, kodumuzun daha güvenli ve okunabilir olmasını sağlar.
export interface UploadedFile {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}
export interface FilePreview {
  type: 'excel' | 'csv' | 'pdf';
  sheetNames?: string[];
  columns: string[];
  sampleRows: string[][];
  summary?: string;
}
export interface ColumnMapping {
  id: number;
  sourceColumn: string;
  targetField: string;
}

// Backend'in /api/files/my endpoint'inden dosyaları çekecek fonksiyon.
export const getMyFiles = async (): Promise<UploadedFile[]> => {
  try {
    const response = await api.get('/api/files/my');
    return response.data;
  } catch (error: any) {
    console.error('Dosyaları getirirken hata:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Dosyalar getirilemedi.');
  }
};

// Backend'in /api/files/upload endpoint'ine dosya yükleyecek fonksiyon.
export const uploadFile = async (file: File): Promise<UploadedFile> => {
  // Dosyayı göndermek için FormData kullanıyoruz. Bu, dosya yüklemeleri için standart bir yöntemdir.
  const formData = new FormData();
  formData.append('file', file); // Backend'in beklediği 'file' key'i ile dosyayı ekliyoruz.

  try {
    // Header olarak 'Content-Type': 'multipart/form-data' belirtiyoruz.
    const response = await api.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Dosya yüklenirken hata:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Dosya yüklenemedi.');
  }
};

export const getFilePreview = async (fileId: number): Promise<FilePreview> => {
  try {
    const response = await api.get(`/api/files/${fileId}/preview`);
    return response.data;
  } catch (error: any) {
    console.error('Dosya önizlemesi getirilirken hata:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Dosya önizlemesi getirilemedi.');
  }
};

// Belirtilen dosya ID'si için mevcut tüm kolon eşleştirmelerini getiren fonksiyon.
export const getMappings = async (fileId: number): Promise<ColumnMapping[]> => {
  try {
    const response = await api.get(`/api/files/${fileId}/mapping`);
    return response.data;
  } catch (error: any) {
    console.error('Eşleştirmeler getirilirken hata:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Eşleştirmeler getirilemedi.');
  }
};

// Bir dosya için yeni bir kolon eşleştirmesi ekleyen veya güncelleyen fonksiyon.
// Backend'deki yapıya göre hem ekleme hem güncelleme için kullanılabilir.
export const saveMapping = async (fileId: number, sourceColumn: string, targetField: string): Promise<ColumnMapping> => {
    try {
      // Not: Backend'de PUT metodu mappingId istiyor, POST ise source/target istiyor.
      // Şimdilik basitçe yeni ekleme (POST) yapıyoruz.
      const response = await api.post(`/api/files/${fileId}/mapping`, { sourceColumn, targetField });
      return response.data;
    } catch (error: any) {
      console.error('Eşleştirme kaydedilirken hata:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Eşleştirme kaydedilemedi.');
    }
  };