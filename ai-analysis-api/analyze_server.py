# ai-analysis-api/analyze_server.py

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import pandas as pd
import numpy as np
import json
import io

app = FastAPI()

def robust_json_converter(obj):
    """
    Her türlü Pandas/NumPy nesnesini JSON'a güvenli bir şekilde çevirir.
    """
    if pd.isna(obj):
        return None
    if isinstance(obj, (np.integer, np.int64)):
        return int(obj)
    if isinstance(obj, (np.floating, np.float64)):
        return float(obj)
    if isinstance(obj, np.bool_):
        return bool(obj)
    if isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    if isinstance(obj, (list, tuple, np.ndarray)):
        return [robust_json_converter(item) for item in obj]
    if isinstance(obj, dict):
        return {str(k): robust_json_converter(v) for k, v in obj.items()}
    try:
        # Diğer tüm tipler için basit bir deneme
        json.dumps(obj)
        return obj
    except (TypeError, OverflowError):
        return str(obj)

@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    mapping_json: str = Form(None),
    analysis_type: str = Form("basic")
):
    ext = file.filename.lower().split('.')[-1] if file.filename else ''
    df = None
    
    print(f"'{file.filename}' dosyası için analiz başlıyor...")

    try:
        file_content = await file.read()
        if ext in ['xlsx', 'xls']:
            df = pd.read_excel(io.BytesIO(file_content))
        elif ext == 'csv':
            try:
                df = pd.read_csv(io.StringIO(file_content.decode('utf-8')))
            except UnicodeDecodeError:
                df = pd.read_csv(io.StringIO(file_content.decode('latin-1')))
        else:
            raise HTTPException(status_code=400, detail=f"Desteklenmeyen dosya tipi: '{ext}'.")
    except Exception as e:
        print(f"HATA: Dosya okunamadı. Detay: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Dosya okunurken hata oluştu: {str(e)}")

    if df is None or df.empty:
        raise HTTPException(status_code=400, detail="Dosya boş veya okunamadı.")
    
    df.dropna(how='all', inplace=True)
    df.dropna(axis=1, how='all', inplace=True)
    df.reset_index(drop=True, inplace=True)
    df.columns = df.columns.astype(str).str.strip()

    if mapping_json and mapping_json.strip():
        try:
            mapping = json.loads(mapping_json)
            df.rename(columns={k: v for k, v in mapping.items() if k in df.columns}, inplace=True)
        except json.JSONDecodeError:
            pass
    
    print("Dosya başarıyla DataFrame'e dönüştürüldü. Sonuçlar hazırlanıyor...")
    
    try:
        # describe() sonucunu alıp elle JSON'a güvenli hale getiriyoruz.
        describe_df = df.describe(include='all').fillna(np.nan).replace([np.inf, -np.inf], np.nan)
        describe_dict = robust_json_converter(describe_df.to_dict())

        # head() sonucunu alıp elle JSON'a güvenli hale getiriyoruz.
        data_df = df.head(100).fillna(np.nan).replace([np.inf, -np.inf], np.nan)
        data_list = robust_json_converter(data_df.to_dict(orient="records"))

        result = {
            "row_count": len(df),
            "columns": list(df.columns),
            "describe": describe_dict,
            "data": data_list
        }
        
        print("Analiz sonucu başarıyla oluşturuldu. Gönderiliyor...")
        return result

    except Exception as e:
        print(f"HATA: Sonuçlar işlenemedi. Detay: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sonuçlar JSON formatına çevrilirken bir hata oluştu: {str(e)}")