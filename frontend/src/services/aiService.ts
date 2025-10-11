// src/services/aiService.ts

import api from './api';

// Backend'in AiRequestDTO'suna karşılık gelen TypeScript interface'i
export interface AnalysisRequest {
  id: number;
  fileName: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface AnalysisResult {
  insights: {
    general_stats: {
      row_count: number;
      column_count: number;
      missing_cells: number;
      missing_cells_percentage: number;
    };
    column_analysis: Record<string, any>;
  };
  charts: Record<string, string>; // Anahtar: grafik adı, Değer: base64 string
  sample_data: any[];
}


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



// Analiz geçmişini getiren yeni fonksiyon
export const getAnalysisHistory = async (): Promise<AnalysisRequest[]> => {
  try {
    const response = await api.get('/api/ai/history');
    return response.data;
  } catch (error: any) {
    console.error('Analiz geçmişi getirilirken hata:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Analiz geçmişi getirilemedi.');
  }
};

export const getAnalysisResult = async (requestId: number): Promise<AnalysisResult> => {
  try {
    const response = await api.get(`/api/ai/result/${requestId}`);
    // Gelen JSON string'ini JavaScript nesnesine çeviriyoruz
    const resultData = JSON.parse(response.data.resultData);
    return resultData;
  } catch (error: any) {
    console.error('Analiz sonucu getirilirken hata:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Analiz sonucu getirilemedi.');
  }
};