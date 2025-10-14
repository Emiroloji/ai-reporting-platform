# 1. Temel olarak Python 3.11 imajını kullan
FROM python:3.11-slim

# 2. Container içinde /app adında bir çalışma dizini oluştur
WORKDIR /app

# 3. Bağımlılık dosyasını kopyala
COPY requirements.txt requirements.txt

# 4. Bağımlılıkları yükle
RUN pip install --no-cache-dir -r requirements.txt

# 5. Proje dosyalarının geri kalanını kopyala
COPY . .

# 6. 8000 portunu dışarıya aç
EXPOSE 8000

# 7. Container çalıştığında hangi komutun çalışacağını belirt
# Bu komut docker-compose.yml dosyasında da var, ama burada olması iyi bir pratiktir.
CMD ["uvicorn", "analyze_server:app", "--host", "0.0.0.0", "--port", "8000"]