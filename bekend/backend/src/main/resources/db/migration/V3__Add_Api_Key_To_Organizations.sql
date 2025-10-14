-- V3__Add_Api_Key_To_Organizations.sql

-- pgcrypto eklentisini etkinleştir, eğer zaten etkin değilse
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Şimdi sütunu ekleyebiliriz
ALTER TABLE organizations ADD COLUMN api_key VARCHAR(255) UNIQUE;

-- Mevcut organizasyonlar için rastgele API anahtarları oluştur
UPDATE organizations SET api_key = gen_random_uuid() WHERE api_key IS NULL;