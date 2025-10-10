-- V2__Add_AI_Analysis_Tables.sql

-- Analiz isteklerini takip etmek için bir tablo oluşturuyoruz.
CREATE TABLE ai_requests (
                             id BIGSERIAL PRIMARY KEY,
                             user_id BIGINT NOT NULL REFERENCES users(id),
                             file_id BIGINT NOT NULL REFERENCES uploaded_files(id),
                             status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
                             error_message TEXT,
                             created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                             completed_at TIMESTAMP WITHOUT TIME ZONE
);

-- Her bir analiz isteğinin sonucunu saklamak için bir tablo oluşturuyoruz.
-- 'result_data' kolonu, Python'dan gelen JSON verisini tutacak.
CREATE TABLE ai_results (
                            id BIGSERIAL PRIMARY KEY,
                            request_id BIGINT NOT NULL UNIQUE REFERENCES ai_requests(id), -- Her isteğin sadece bir sonucu olabilir.
                            result_type VARCHAR(100), -- 'basic_analysis', 'chart_data' etc.
                            result_data JSONB, -- JSON verisini verimli saklamak için JSONB tipini kullanıyoruz.
                            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);