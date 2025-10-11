# ai-analysis-api/analyze_server.py

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import json
import io
import base64
from typing import Dict, Any, List

# Grafik oluşturma kütüphaneleri
import matplotlib
matplotlib.use('Agg') # Arayüzü olmayan bir sunucuda çalışması için
import matplotlib.pyplot as plt
import seaborn as sns

app = FastAPI()

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Veriyi temizler: Boş satır/sütunları atar, başlığı bulur."""
    # Tamamen boş satırları ve sütunları kaldır
    df.dropna(how='all', inplace=True)
    df.dropna(axis=1, how='all', inplace=True)
    df.reset_index(drop=True, inplace=True)

    # Potansiyel başlık satırını bul (en çok metin içeren satır)
    header_row_index = 0
    max_non_numeric = 0
    for i, row in df.head(10).iterrows(): # İlk 10 satırı kontrol et
        try:
            non_numeric_count = sum(1 for x in row if isinstance(x, str) and x.strip())
            if non_numeric_count >= max_non_numeric: # Eşitlik durumunda daha sonraki satırı başlık say
                max_non_numeric = non_numeric_count
                header_row_index = i
        except Exception:
            continue

    # Başlığı ayarla ve o satırdan öncesini at
    header = df.iloc[header_row_index]
    # Olası NaN başlıkları 'Unnamed' ile değiştir
    header = [f'Unnamed: {i}' if pd.isna(h) else h for i, h in enumerate(header)]
    df.columns = header
    
    df = df.iloc[header_row_index + 1:].reset_index(drop=True)
    
    # Sütun isimlerindeki gereksiz boşlukları temizle
    df.columns = df.columns.astype(str).str.strip()
    
    # "Unnamed" veya tamamen boş başlıklı sütunları kaldır
    df = df.loc[:, ~df.columns.str.match(r'^(Unnamed|)$', na=True)]
    
    # Sadece boşluk içeren hücreleri NaN yap
    df = df.replace(r'^\s*$', np.nan, regex=True)

    return df

def get_insights(df: pd.DataFrame) -> Dict[str, Any]:
    """DataFrame üzerinden temel analizler ve içgörüler üretir."""
    insights = {}
    
    # Genel İstatistikler
    insights['general_stats'] = {
        'row_count': len(df),
        'column_count': len(df.columns),
        'total_cells': int(df.size),
        'missing_cells': int(df.isnull().sum().sum()),
        'missing_cells_percentage': float(df.isnull().sum().sum() / df.size * 100) if df.size > 0 else 0
    }

    # Sütun bazlı analizler
    column_analysis = {}
    for col_name in df.columns:
        col = df[col_name]
        if pd.api.types.is_numeric_dtype(col):
            desc = col.describe()
            column_analysis[str(col_name)] = {
                'type': 'numeric',
                'mean': float(desc.get('mean', 0)),
                'median': float(desc.get('50%', 0)),
                'std': float(desc.get('std', 0)),
                'min': float(desc.get('min', 0)),
                'max': float(desc.get('max', 0)),
                'missing_values': int(col.isnull().sum())
            }
        else:
            desc = col.describe()
            column_analysis[str(col_name)] = {
                'type': 'categorical',
                'unique_values': int(desc.get('unique', 0)),
                'top_value': desc.get('top', None),
                'missing_values': int(col.isnull().sum())
            }
    insights['column_analysis'] = column_analysis

    return insights

def create_visualizations(df: pd.DataFrame) -> Dict[str, str]:
    """Veri setine uygun grafikleri oluşturur ve base64 olarak döndürür."""
    charts = {}
    numeric_cols = df.select_dtypes(include=np.number).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()

    # Sayısal sütunlar için histogramlar
    for col in numeric_cols[:3]: # İlk 3 sayısal sütun için
        plt.figure(figsize=(8, 5))
        sns.histplot(df[col].dropna(), kde=True, bins=20)
        plt.title(f'{col} Dağılımı')
        plt.xlabel(str(col))
        plt.ylabel('Frekans')
        
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight')
        buffer.seek(0)
        charts[f'histogram_{col}'] = base64.b64encode(buffer.read()).decode('utf-8')
        plt.close()

    # Kategorik sütunlar için bar grafikleri
    for col in categorical_cols[:3]: # İlk 3 kategorik sütun için
        if 1 < df[col].nunique() < 30: # Çok fazla/az eşsiz değer varsa çizme
            plt.figure(figsize=(10, 6))
            sns.countplot(y=df[col].astype(str), order = df[col].value_counts().index)
            plt.title(f'{col} Frekansı')
            plt.xlabel('Sayı')
            plt.ylabel(str(col))

            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', bbox_inches='tight')
            buffer.seek(0)
            charts[f'barchart_{col}'] = base64.b64encode(buffer.read()).decode('utf-8')
            plt.close()

    return charts

class SafeJSONEncoder(json.JSONEncoder):
    """NaN ve inf değerlerini null'a çeviren özel JSON Encoder."""
    def encode(self, obj):
        def replace_invalid(o):
            if isinstance(o, (list, tuple)):
                return [replace_invalid(x) for x in o]
            if isinstance(o, dict):
                return {k: replace_invalid(v) for k, v in o.items()}
            if isinstance(o, float) and (np.isnan(o) or np.isinf(o)):
                return None
            return o
        
        return super().encode(replace_invalid(obj))

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    ext = file.filename.lower().split('.')[-1] if file.filename else ''
    
    try:
        file_content = await file.read()
        if ext in ['xlsx', 'xls']:
            df = pd.read_excel(io.BytesIO(file_content), header=None)
        elif ext == 'csv':
            df = pd.read_csv(io.StringIO(file_content.decode('utf-8')), header=None)
        else:
            raise HTTPException(status_code=400, detail=f"Desteklenmeyen dosya tipi: '{ext}'.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dosya okunurken hata oluştu: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=400, detail="Dosya boş veya okunamadı.")
    
    # 1. Veri Temizleme
    cleaned_df = clean_data(df)
    
    # 2. Sayısal verilere dönüştürme
    for col in cleaned_df.columns:
        cleaned_df[col] = pd.to_numeric(cleaned_df[col], errors='ignore')
        
    # 3. Analiz ve İçgörü Üretme
    insights = get_insights(cleaned_df)
    
    # 4. Görselleştirme Oluşturma
    visualizations = create_visualizations(cleaned_df)

    # 5. Örnek Veriyi Hazırlama (JSON uyumlu hale getirme)
    sample_data_df = cleaned_df.head(10).replace({np.nan: None})
    sample_data = json.loads(sample_data_df.to_json(orient="records"))

    # Sonuçları birleştir
    result = {
        "insights": insights,
        "charts": visualizations,
        "sample_data": sample_data
    }
    
    # Sonucu güvenli JSON encoder ile döndür
    return JSONResponse(content=json.loads(json.dumps(result, cls=SafeJSONEncoder)))