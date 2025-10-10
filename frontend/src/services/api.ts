// src/services/api.ts

import axios from 'axios';

// Backend API'mizin ana adresi
const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Bu kısım çok önemli: Axios'un "interceptor" (araya girici) özelliğini kullanıyoruz.
// Bu sayede bir istek gönderilmeden hemen önce araya girip isteği modifiye edebiliriz.
api.interceptors.request.use(
  (config) => {
    // localStorage'dan accessToken'ı alıyoruz.
    const token = localStorage.getItem('accessToken');
    
    // Eğer token varsa...
    if (token) {
      // isteğin header'larına (başlıklarına) Authorization başlığını ekliyoruz.
      // Format "Bearer <token>" şeklinde olmalı.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Bir istek hatası olursa, hatayı geri döndür.
    return Promise.reject(error);
  }
);

export default api;