import requests
import os

# --- DEĞİŞKENLER ---
# Lütfen bu değişkenleri kendi ortamınıza göre güncelleyin
BASE_URL = "http://localhost:8080/api"
API_KEY = "bc56c32b-cef3-45fb-a25b-9e1dc06575fd"  # Veritabanından aldığınız API anahtarını buraya yapıştırın
FILE_PATH = "test.csv"
QUESTION = "Hangi departmanda kaç kişi çalışıyor, bunu bir bar grafiği ile göster."

def upload_file(file_path, api_key):
    """Dosyayı backend'e yükler."""
    print(f"'{os.path.basename(file_path)}' dosyası yükleniyor...")
    url = f"{BASE_URL}/files/upload"
    headers = {
        "x-api-key": api_key
    }
    try:
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f)}
            response = requests.post(url, headers=headers, files=files, timeout=30) # Timeout eklendi

        # HTTP hata kodlarını kontrol et
        response.raise_for_status()

        response_data = response.json()
        file_id = response_data.get("id")
        print(f"Dosya başarıyla yüklendi. Dosya ID: {file_id}")
        return file_id
    except requests.exceptions.RequestException as e:
        print(f"\n--- HATA: Dosya yüklenemedi ---")
        print(f"Detay: {e}")
        print("Lütfen backend uygulamasının çalıştığından ve http://localhost:8080 adresinden erişilebilir olduğundan emin olun.")
        return None
    except Exception as e:
        print(f"\n--- BEKLENMEDİK HATA ---")
        print(f"Detay: {e}")
        return None


def start_analysis(file_id, question, api_key):
    """Verilen dosya ID'si ve soru ile analiz başlatır."""
    if not file_id:
        return
    print(f"'{file_id}' ID'li dosya için analiz başlatılıyor...")
    print(f"Soru: {question}")

    # --- DEĞİŞİKLİK BURADA ---
    # Doğru URL formatını kullan: /api/ai/{file_id}/analyze
    url = f"{BASE_URL}/ai/{file_id}/analyze" 

    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }
    # Payload'ı 'query' olarak gönderiyoruz
    data = {
        "query": question 
    }
    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)

        response.raise_for_status()

        response_data = response.json()
        print("Analiz talebi başarıyla kabul edildi.")
        print(f"Mesaj: {response_data.get('message')}")
    except requests.exceptions.RequestException as e:
        print(f"\n--- HATA: Analiz başlatılamadı ---")
        print(f"Detay: {e}")
        print("Lütfen backend uygulamasının ve RabbitMQ'nun çalıştığından emin olun.")
    except Exception as e:
        print(f"\n--- BEKLENMEDİK HATA ---")
        print(f"Detay: {e}")


if __name__ == "__main__":
    if not os.path.exists(FILE_PATH):
        print(f"Hata: '{FILE_PATH}' dosyası bulunamadı. Lütfen dosya yolunu kontrol edin.")
    elif API_KEY == "YOUR_API_KEY":
        print("Hata: Lütfen script içindeki API_KEY değişkenini güncelleyin.")
    else:
        # 1. Adım: Dosyayı yükle
        uploaded_file_id = upload_file(FILE_PATH, API_KEY)

        # 2. Adım: Analizi başlat
        if uploaded_file_id:
            start_analysis(uploaded_file_id, QUESTION, API_KEY)