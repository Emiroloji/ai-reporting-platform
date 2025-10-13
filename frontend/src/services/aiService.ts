// src/services/aiService.ts

import api from './api';

// Analiz talepleri için kullanılan interface
export interface AnalysisRequest {
  id: number;
  fileName: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

// Python'dan gelen temel analiz yapısı
export interface BaseAnalysis {
  insights: {
    general_stats: {
      row_count: number;
      column_count: number;
      missing_cells: number;
      missing_cells_percentage: number;
    };
    column_analysis: Record<string, any>;
  };
  charts: Record<string, string>;
  sample_data: any[];
}

// Python'dan gelen özel, doğal dil sorgusu sonucu yapısı
export interface CustomAnalysis {
    type: 'chart' | 'table' | 'text';
    data: any;
    title: string;
}

// Ana sonuç yapısı
export interface AnalysisResult {
  base_analysis: BaseAnalysis;
  custom_analysis: CustomAnalysis | null;
}

// --- DÜZELTİLMİŞ startAnalysis FONKSİYONU ---
export const startAnalysis = async (fileId: number, query: string | null, templateId: string | null): Promise<string> => {
  try {
    // Backend @RequestBody beklediği için JSON objesi gönderiyoruz.
    const payload: { query?: string; templateId?: string } = {};
    if (query && query.trim()) {
      payload.query = query;
    }
    if (templateId) {
      payload.templateId = templateId;
    }

    // DÜZELTME: Hatalı olan "/api/ai/start-analysis" yerine, doğru olan "/api/ai/{fileId}/analyze" endpoint'ini çağırıyoruz.
    const response = await api.post(`/api/ai/${fileId}/analyze`, payload);
    return response.data.message;
  } catch (error: any) {
    console.error('Analiz başlatılırken hata:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Analiz başlatılamadı.');
  }
};

// getAnalysisHistory ve getAnalysisResult fonksiyonları
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