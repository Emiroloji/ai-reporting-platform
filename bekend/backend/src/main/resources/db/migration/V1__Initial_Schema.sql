-- V1__Initial_Schema.sql

-- Önce Organizasyonlar tablosunu oluşturuyoruz, çünkü diğerleri ona bağlı olacak.
CREATE TABLE organizations (
                               id BIGSERIAL PRIMARY KEY,
                               name VARCHAR(255) NOT NULL,
                               created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                               owner_id BIGINT UNIQUE -- Bu sütun başlangıçta boş, sonra doldurulacak.
);

-- Sonra Kullanıcılar tablosunu oluşturuyoruz.
CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       first_name VARCHAR(100),
                       last_name VARCHAR(100),
                       role VARCHAR(50),
                       is_active BOOLEAN DEFAULT TRUE,
                       created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                       credits INTEGER,
                       organization_id BIGINT REFERENCES organizations(id) -- Her kullanıcı bir organizasyona aittir.
);

-- Şimdi organizasyon tablosundaki sahibi, kullanıcılar tablosuna bağlıyoruz.
ALTER TABLE organizations
    ADD CONSTRAINT fk_organization_owner
        FOREIGN KEY (owner_id) REFERENCES users(id);

-- Yüklenen Dosyalar tablosunu oluşturuyoruz.
CREATE TABLE uploaded_files (
                                id BIGSERIAL PRIMARY KEY,
                                organization_id BIGINT NOT NULL REFERENCES organizations(id), -- Dosya bir organizasyona aittir.
                                uploaded_by_user_id BIGINT NOT NULL REFERENCES users(id), -- Dosyayı kimin yüklediğini belirtir.
                                file_name VARCHAR(255),
                                file_type VARCHAR(255),
                                file_size BIGINT,
                                storage_path VARCHAR(1024),
                                uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Kredi işlemleri tablosunu oluşturuyoruz.
CREATE TABLE credit_transaction (
                                    id BIGSERIAL PRIMARY KEY,
                                    user_id BIGINT REFERENCES users(id),
                                    transaction_type VARCHAR(255),
                                    amount INTEGER,
                                    description TEXT,
                                    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Dosya kolon eşleştirme tablosunu oluşturuyoruz.
CREATE TABLE file_column_mapping (
                                     id BIGSERIAL PRIMARY KEY,
                                     file_id BIGINT NOT NULL REFERENCES uploaded_files(id),
                                     source_column VARCHAR(255) NOT NULL,
                                     target_field VARCHAR(255) NOT NULL
);