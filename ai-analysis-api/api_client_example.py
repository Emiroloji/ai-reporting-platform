import requests
import os

# --- KULLANICI AYARLARI ---
# Bu URL'ler, uygulamanızın çalıştığı adrese göre güncellenmelidir.
BASE_URL = "http://localhost:8080/api" 

# Frontend'deki Ayarlar & API sayfasından kopyalanan API anahtarı
API_KEY = "9a21eb9a-dc37-4e6d-bdc4-22ef670c9d24" # Lütfen güncelleyin

# Analiz edilecek dosyanın yolu
FILE_PATH = "test.csv" # <-- DEĞİŞİKLİK BURADA

# Analiz için sorulacak soru
ANALYSIS_QUERY = "Hangi departmanda kaç kişi çalışıyor, bunu bir bar grafiği ile göster."

# --------------------------

def upload_file(file_path):
    """
    Belirtilen dosyayı API'ye yükler ve yüklenen dosyanın ID'sini döndürür.
    """
    if not os.path.exists(file_path):
        print(f"Hata: '{file_path}' dosyası bulunamadı.")
        return None

    url = f"{BASE_URL}/files/upload"
    headers = {
        "X-API-KEY": API_KEY
    }
    
    with open(file_path, 'rb') as f:
        files = {'file': (os.path.basename(file_path), f)}
        
        print(f"'{file_path}' dosyası yükleniyor...")
        response = requests.post(url, headers=headers, files=files)

    if response.status_code == 201:
        file_id = response.json().get('id')
        print(f"Dosya başarıyla yüklendi. Dosya ID: {file_id}")
        return file_id
    else:
        print(f"Dosya yüklenemedi. Hata Kodu: {response.status_code}")
        print("Hata Mesajı:", response.text)
        return None


def start_analysis(file_id, query):
    """
    Yüklenmiş bir dosya için yapay zeka analizini başlatır.
    """
    if not file_id:
        print("Analiz başlatılamadı: Geçersiz dosya ID'si.")
        return None
        
    # DOĞRU: file_id'yi URL'nin kendisine ekliyoruz.
    url = f"{BASE_URL}/ai/{file_id}/analyze"
    
    headers = {
        "X-API-KEY": API_KEY,
        "Content-Type": "application/json"
    }
    
    # DOĞRU: Payload artık sadece query ve templateId içeriyor.
    payload = {
        "query": query,
        "templateId": None
    }

    print(f"'{file_id}' ID'li dosya için analiz başlatılıyor...")
    print(f"Soru: {query}")
    
    response = requests.post(url, headers=headers, json=payload)

    # Düzeltme: Backend 202 (Accepted) döndüreceği için bu kontrolü de güncelleyelim.
    if response.status_code == 202: 
        message = response.json().get('message')
        print(f"Analiz talebi başarıyla kabul edildi.")
        print(f"Mesaj: {message}")
        return True # Başarılı olduğunu belirtmek için True dönelim
    else:
        print(f"Analiz başlatılamadı. Hata Kodu: {response.status_code}")
        print("Hata Mesajı:", response.text)
        return None