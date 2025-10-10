// src/services/authService.ts

import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

// ... (mevcut login fonksiyonu burada duracak)

// Yeni eklenen register fonksiyonu
// Parametre olarak RegisterRequest DTO'suna uygun alanları alacak

export const login = async (email: string, password: string) => {
  try {
    // Axios ile backend'deki /login endpoint'ine POST isteği atıyoruz.
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });
    
    // Backend'den başarılı bir cevap dönerse (2xx status kodları),
    // dönen veriyi (içinde accessToken ve refreshToken olacak) geri döndürüyoruz.
    return response.data;

  } catch (error: any) {
    // Eğer bir hata olursa (örn: 401 Unauthorized - şifre yanlış),
    // hatayı yakalayıp konsola yazdırıyoruz ve hatayı fırlatıyoruz.
    // Bu sayede component tarafında hatayı yakalayıp kullanıcıya mesaj gösterebileceğiz.
    console.error('Login Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Giriş sırasında bir hata oluştu.');
  }
};


export const register = async (firstName: string, lastName: string, email: string, password: string) => {
  try {
    // Axios ile backend'deki /register endpoint'ine POST isteği atıyoruz.
    const response = await axios.post(`${API_URL}/register`, {
      firstName,
      lastName,
      email,
      password,
    });
    
    // Backend'den başarılı cevap dönerse, kullanıcı nesnesini geri döndürüyoruz.
    return response.data;

  } catch (error: any) {
    // Hata durumunda, backend'den gelen "Email already registered!" gibi
    // spesifik mesajları yakalayıp fırlatıyoruz.
    console.error('Register Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Kayıt sırasında bir hata oluştu.');
  }
};