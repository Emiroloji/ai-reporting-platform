from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import json
import io
import base64
from typing import Dict, Any, Optional
import os
from dotenv import load_dotenv
import ast 

load_dotenv()
from openai import OpenAI
try:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=os.getenv("OPENAI_API_BASE"))
except Exception as e:
    client = None
    print(f"Hata: OpenAI/OpenRouter istemcisi oluşturulamadı. Detay: {e}")
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
app = FastAPI()
ANALYSIS_TEMPLATES = {
    "monthly_sales_trend": "Veri setindeki tarih sütununu kullanarak aylık toplam satış trendini gösteren bir çizgi grafiği oluştur. Tarih sütununu otomatik olarak algıla.",
    "sales_by_category": "Ürün kategorilerine göre toplam satışların dağılımını gösteren bir pasta grafiği (pie chart) oluştur. Kategori ve satış sütunlarını otomatik olarak bul.",
    "top_selling_by_region": "Bölgelere göre en çok satan ürünleri ve satış adetlerini gösteren bir tablo oluştur.",
    "favo_k_analizi": "Eğer veri setinde 'Gelir', 'Maliyet' ve 'Amortisman' gibi sütunlar varsa, FAVÖK (Faiz, Amortisman ve Vergi Öncesi Kâr) analizini yap ve sonucu bir metin olarak açıkla."
}
def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    df.dropna(how='all', inplace=True); df.dropna(axis=1, how='all', inplace=True); df.reset_index(drop=True, inplace=True)
    header_row_index = 0; max_non_numeric = 0
    for i, row in df.head(10).iterrows():
        try:
            non_numeric_count = sum(1 for x in row if isinstance(x, str) and x.strip())
            if non_numeric_count >= max_non_numeric: max_non_numeric = non_numeric_count; header_row_index = i
        except Exception: continue
    header = df.iloc[header_row_index]
    header = [f'Unnamed_{i}' if pd.isna(h) or str(h).strip() == '' else h for i, h in enumerate(header)]
    df.columns = header; df = df.iloc[header_row_index + 1:].reset_index(drop=True); df.columns = df.columns.astype(str).str.strip()
    df = df.loc[:, ~df.columns.str.match(r'^Unnamed', na=True)]; df = df.replace(r'^\s*$', np.nan, regex=True)
    return df
def get_insights(df: pd.DataFrame) -> Dict[str, Any]:
    insights = {}; insights['general_stats'] = {'row_count': len(df), 'column_count': len(df.columns), 'total_cells': int(df.size), 'missing_cells': int(df.isnull().sum().sum()), 'missing_cells_percentage': float(df.isnull().sum().sum() / df.size * 100) if df.size > 0 else 0}
    column_analysis = {}
    for col_name in df.columns:
        col = df[col_name]; col_name_str = str(col_name)
        if pd.api.types.is_numeric_dtype(col):
            desc = col.describe()
            column_analysis[col_name_str] = {'type': 'numeric', 'mean': float(desc.get('mean', 0)), 'median': float(desc.get('50%', 0)), 'std': float(desc.get('std', 0)), 'min': float(desc.get('min', 0)), 'max': float(desc.get('max', 0)), 'missing_values': int(col.isnull().sum())}
        else:
            desc = col.describe()
            column_analysis[col_name_str] = {'type': 'categorical', 'unique_values': int(desc.get('unique', 0)), 'top_value': desc.get('top', None), 'missing_values': int(col.isnull().sum())}
    insights['column_analysis'] = column_analysis
    return insights
def create_visualizations(df: pd.DataFrame) -> Dict[str, str]:
    charts = {}; numeric_cols = df.select_dtypes(include=np.number).columns.tolist(); categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    for col in numeric_cols[:3]:
        plt.figure(figsize=(8, 5)); sns.histplot(df[col].dropna(), kde=True, bins=20); plt.title(f'{col} Dağılımı'); plt.xlabel(str(col)); plt.ylabel('Frekans')
        buf = io.BytesIO(); plt.savefig(buf, format='png', bbox_inches='tight'); buf.seek(0)
        charts[f'histogram_{col}'] = base64.b64encode(buf.read()).decode('utf-8'); plt.close()
    for col in categorical_cols[:3]:
        if 1 < df[col].nunique() < 30:
            plt.figure(figsize=(10, 6)); sns.countplot(y=df[col].astype(str), order=df[col].value_counts().index); plt.title(f'{col} Frekansı'); plt.xlabel('Sayı'); plt.ylabel(str(col))
            buf = io.BytesIO(); plt.savefig(buf, format='png', bbox_inches='tight'); buf.seek(0)
            charts[f'barchart_{col}'] = base64.b64encode(buf.read()).decode('utf-8'); plt.close()
    return charts
class SafeJSONEncoder(json.JSONEncoder):
    def encode(self, obj):
        def replace_invalid(o):
            if isinstance(o, (list, tuple)): return [replace_invalid(x) for x in o]
            if isinstance(o, dict): return {k: replace_invalid(v) for k, v in o.items()}
            if isinstance(o, float) and (np.isnan(o) or np.isinf(o)): return None
            return o
        return super().encode(replace_invalid(obj))


def execute_natural_language_query(df: pd.DataFrame, query: str) -> Dict[str, Any]:
    if not client:
        return {"type": "text", "data": "OpenAI/OpenRouter istemcisi başlatılamadı...", "title": "Yapılandırma Hatası"}

    data_head_string = df.head(5).to_string()
    
    prompt = f"""
    You are a data analysis expert. Your task is to generate ONLY Python code to analyze a pandas DataFrame named 'df'.

    A list of all available column names is pre-loaded into a variable named `columns`. 
    You can use this `columns` list to check for required columns.

    The generated code must create a dictionary named 'result' with three keys: 'type', 'data', and 'title'.

    **CRITICAL RULE: Your output MUST be ONLY the raw Python code. Do NOT include explanations, comments, markdown formatting, or <think> blocks. Your entire response must be valid, executable Python code.**

    Here is the context about the DataFrame 'df':
    - Available columns list: {df.columns.tolist()}
    - First 5 rows of data:
    {data_head_string}

    User Query: "{query}"

    Python Code:
    """
    
    try:
        response = client.chat.completions.create(
            extra_headers={"HTTP-Referer": "http://localhost:3000", "X-Title": "AI Reporting Platform"},
            model="qwen/qwen-2.5-coder-32b-instruct", messages=[{"role": "user", "content": prompt}],
            temperature=0.0, max_tokens=1024,
        )
        raw_response = response.choices[0].message.content.strip()
        
        generated_code = raw_response
        if "```python" in generated_code:
            generated_code = generated_code.split("```python")[1].strip()
            if "```" in generated_code: generated_code = generated_code.rsplit("```", 1)[0].strip()
        elif "<think>" in generated_code:
            generated_code = generated_code.split("</think>")[-1].strip()

    except Exception as e:
        return {"type": "text", "data": f"Yapay zeka modeline erişilirken bir hata oluştu: {str(e)}", "title": "API Bağlantı Hatası"}

    try:
        ast.parse(generated_code)
    except SyntaxError:
        print(f"--- INVALID AI RESPONSE ---\n{generated_code}\n---------------------------")
        return {"type": "text", "data": "Yapay zeka modeli geçerli bir Python kodu üretmedi. Lütfen talebinizi farklı bir şekilde ifade etmeyi deneyin veya şablonları kullanın.", "title": "Yapay Zeka Yanıt Hatası"}

    local_scope = {
        "df": df, "columns": df.columns.tolist(),
        "pd": pd, "np": np, "plt": plt, "sns": sns, 
        "io": io, "base64": base64, "BytesIO": io.BytesIO
    }
    
    try:
        exec(generated_code, globals(), local_scope)
        if 'result' in local_scope: return local_scope['result']
        else: return {"type": "text", "data": "Yapay zeka geçerli bir sonuç kodu üretemedi.", "title": "Kod Sonuç Üretmedi"}
    except Exception as e:
        return {"type": "text", "data": f"Analiz kodu çalıştırılırken bir hata oluştu: {str(e)}\n\nÜretilen Kod:\n{generated_code}", "title": "Çalıştırma Hatası"}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...), query: Optional[str] = Form(None), template_id: Optional[str] = Form(None), mapping_json: Optional[str] = Form(None)):
    ext = file.filename.lower().split('.')[-1] if file.filename else ''
    try:
        content = await file.read()
        if ext in ['xlsx', 'xls']: df = pd.read_excel(io.BytesIO(content), header=None)
        elif ext == 'csv':
            try: df = pd.read_csv(io.StringIO(content.decode('utf-8')), header=None, engine='python', sep=None, on_bad_lines='skip')
            except UnicodeDecodeError: df = pd.read_csv(io.StringIO(content.decode('latin-1')), header=None, engine='python', sep=None, on_bad_lines='skip')
        else: raise HTTPException(400, f"Desteklenmeyen dosya tipi: '{ext}'.")
    except Exception as e: raise HTTPException(500, f"Dosya okunurken hata olustu: {str(e)}")
    if df.empty: raise HTTPException(400, "Dosya boş veya okunamadı.")
    
    cleaned_df = clean_data(df.copy())
    for col in cleaned_df.columns: cleaned_df[col] = pd.to_numeric(cleaned_df[col], errors='ignore')
    insights = get_insights(cleaned_df)
    visualizations = create_visualizations(cleaned_df)
    sample_data_df = cleaned_df.head(10).replace({np.nan: None})
    sample_data = json.loads(sample_data_df.to_json(orient="records"))
    result = {"base_analysis": {"insights": insights, "charts": visualizations, "sample_data": sample_data}, "custom_analysis": None}
    final_query = None
    if template_id and template_id in ANALYSIS_TEMPLATES: final_query = ANALYSIS_TEMPLATES[template_id]
    elif query and query.strip(): final_query = query
    if final_query:
        if not os.getenv("OPENAI_API_KEY"): result["custom_analysis"] = {"type": "text", "data": "OpenRouter API anahtarı .env dosyasında bulunamadı.", "title": "Yapılandırma Hatası"}
        else: result["custom_analysis"] = execute_natural_language_query(cleaned_df, final_query)
    return JSONResponse(content=json.loads(json.dumps(result, cls=SafeJSONEncoder)))