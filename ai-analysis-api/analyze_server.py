# ai-analysis-api/analyze_server.py

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import pandas as pd
import numpy as np
import json
import io

app = FastAPI()

def clean_json(obj):
    if isinstance(obj, dict):
        return {k: clean_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_json(v) for v in obj]
    elif isinstance(obj, float):
        if np.isnan(obj) or np.isinf(obj):
            return None
        else:
            return obj
    elif isinstance(obj, (np.integer, np.floating, np.bool_)):
        return obj.item()
    else:
        return obj

@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    mapping_json: str = Form(None),
    analysis_type: str = Form("basic")
):
    ext = file.filename.lower().split('.')[-1] if file.filename else ''
    df = None

    try:
        # Gelen dosyanın tüm içeriğini byte olarak belleğe oku
        file_content = await file.read()

        if ext in ['xlsx', 'xls']:
            # Excel dosyaları için read_excel kullan
            df = pd.read_excel(io.BytesIO(file_content))
        elif ext == 'csv':
            # CSV dosyaları için read_csv kullan
            try:
                df = pd.read_csv(io.StringIO(file_content.decode('utf-8')))
            except UnicodeDecodeError:
                # utf-8 başarısız olursa latin-1 dene
                df = pd.read_csv(io.StringIO(file_content.decode('latin-1')))
        else:
            # Desteklenmeyen dosya tipleri için hata fırlat
            raise HTTPException(status_code=400, detail=f"Desteklenmeyen dosya tipi: .{ext}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dosya okunurken bir hata oluştu: {str(e)}")

    if df is None or df.empty:
        raise HTTPException(status_code=400, detail="Dosya boş veya okunamadı.")

    # Kolonları temizle (istenmeyen baştaki/sondaki boşluklar vb.)
    df.columns = df.columns.str.strip()

    if mapping_json:
        try:
            mapping = json.loads(mapping_json)
            df = df.rename(columns={k: v for k, v in mapping.items() if k in df.columns})
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Geçersiz mapping_json formatı.")

    df = df.dropna(how='all').dropna(axis=1, how='all').reset_index(drop=True)

    result = {
        "row_count": len(df),
        "columns": list(df.columns),
        "describe": clean_json(df.describe(include='all').to_dict(orient='index')),
        "data": clean_json(df.head(100).to_dict(orient="records"))
    }
    return result