from fastapi import FastAPI, UploadFile, File, Form
import pandas as pd
import numpy as np
import json

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
    else:
        return obj

@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    mapping_json: str = Form(None),
    analysis_type: str = Form("basic")
):
    # Excel veya CSV dosyası aç
    ext = file.filename.lower().split('.')[-1]
    if ext in ['xlsx', 'xls']:
        # Tüm dosyayı oku, başlık satırı otomatik bul
        raw_df = pd.read_excel(file.file, header=None)
    else:
        raw_df = pd.read_csv(file.file, header=None)

    # Başlık satırını bul (en çok dolu alanı olan satır)
    header_row = raw_df.notna().sum(axis=1).idxmax()
    df = pd.read_excel(file.file, header=header_row) if ext in ['xlsx', 'xls'] else pd.read_csv(file.file, header=header_row)

    # mapping_json varsa sütun adlarını değiştir
    if mapping_json:
        mapping = json.loads(mapping_json)
        df = df.rename(columns=mapping)
    
    # Tamamen boş satır ve sütunları sil
    df = df.dropna(how='all')
    df = df.dropna(axis=1, how='all')

    # Sonucu döndür
    result = {
        "row_count": len(df),
        "columns": list(df.columns),
        "describe": clean_json(df.describe(include='all').to_dict()),
        "data": clean_json(df.to_dict(orient="records"))
    }
    return result