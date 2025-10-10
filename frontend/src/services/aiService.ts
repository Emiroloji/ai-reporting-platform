// src/services/aiService.ts

import api from './api';

// Backend'in /api/ai/{fileId}/analyze endpoint'ini çağıran fonksiyon.
export const startAnalysis = async (fileId: number): Promise<string> => {
  try {
    // Backend bu endpoint için POST metodu bekliyor.
    const response = await api.post(`/api/ai/${fileId}/analyze`);
    // Backend'den gelen "Analiz talebiniz alındı..." mesajını döndürüyoruz.
    return response.data;
  } catch (error: any) { // Hatalı satır buradaydı, şimdi düzeltildi.
    console.error('Analiz başlatılırken hata:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Analiz başlatılamadı.');
  }
};