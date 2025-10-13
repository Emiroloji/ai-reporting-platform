// src/pages/FileDetailPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spin, Alert, Table, Button, Divider, message, Input,  Space } from 'antd';
import { RobotOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { getFilePreview, FilePreview } from '../services/fileService';
import { startAnalysis } from '../services/aiService';
import ColumnMapping from '../components/ColumnMapping';

const { Title, Paragraph } = Typography;

// YENİ: Analiz şablonlarını burada tanımlıyoruz.
const analysisTemplates = [
  {
    id: 'monthly_sales_trend',
    title: 'Aylık Satış Trendi',
    description: 'Tarih verilerini kullanarak aylık satış trendini bir çizgi grafiği olarak çizer.',
  },
  {
    id: 'sales_by_category',
    title: 'Kategoriye Göre Satış Dağılımı',
    description: 'Ürün kategorilerinin toplam satış içindeki payını bir pasta grafiği ile gösterir.',
  },
  {
    id: 'top_selling_by_region',
    title: 'Bölgesel En Çok Satanlar',
    description: 'Her bir bölge için en çok satan ürünleri ve miktarlarını bir tablo halinde sunar.',
  },
  {
    id: 'favo_k_analizi',
    title: 'FAVÖK Analizi (Finansal)',
    description: 'Gelir, maliyet ve amortisman verilerinden yola çıkarak FAVÖK analizi yapar.',
  }
];

const FileDetailPage: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate(); // Yönlendirme için navigate hook'unu ekliyoruz
  
  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!fileId || isNaN(parseInt(fileId))) {
      setError('Geçersiz dosya ID.');
      setLoading(false);
      return;
    }

    const fetchPreview = async () => {
      try {
        setLoading(true);
        const data = await getFilePreview(parseInt(fileId));
        setPreview(data);
      } catch (err: any) {
        setError(err.message || 'Bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [fileId]);
  
  // GÜNCELLENDİ: Analiz başlatma fonksiyonu artık hem query hem de templateId alabiliyor.
  const handleStartAnalysis = async (templateId: string | null = null) => {
    if (!fileId) return;

    // Eğer şablon kullanılmıyorsa ve metin kutusu boşsa, uyarı ver.
    if (!templateId && !query.trim()) {
        message.warning('Lütfen bir analiz talebi yazın veya bir şablon seçin.');
        return;
    }

    setIsAnalyzing(true);
    try {
        // Servis çağrısını query ve templateId ile yapıyoruz.
        const responseMessage = await startAnalysis(parseInt(fileId), query, templateId);
        
        // Analiz sonrası kullanıcıya bilgi verip Analiz Geçmişi sayfasına yönlendiriyoruz.
        message.success(responseMessage, 3);
        setQuery('');
        setTimeout(() => {
            navigate('/history');
        }, 1000); // 1 saniye sonra yönlendir.

    } catch (err: any) {
        message.error(err.message);
    } finally {
        setIsAnalyzing(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin size="large" /></div>;
  }

  if (error) {
    return <Alert message="Hata" description={error} type="error" showIcon />;
  }
  
  const columns = preview?.columns.map((col, index) => ({
    title: col,
    dataIndex: index,
    key: index,
    ellipsis: true,
  }));
  
  const dataSource = preview?.sampleRows.map((row, rowIndex) => {
    const rowObject: any = { key: rowIndex };
    row.forEach((cell, cellIndex) => {
        rowObject[cellIndex] = cell;
    });
    return rowObject;
  });

  return (
    <>
      <Title level={2}>Dosya Analizi</Title>
      <Paragraph>
        Dosyanızdaki kolonları yapay zekanın anlayabilmesi için anlamlı isimlerle eşleştirin. Ardından, neyi analiz etmek istediğinizi doğal dilde yazarak veya hazır şablonları kullanarak analizi başlatın.
      </Paragraph>

      {preview && fileId && (
        <ColumnMapping fileId={parseInt(fileId)} columns={preview.columns} />
      )}
      
      <Divider />

      {/* YENİ: Analiz Şablonları Bölümü */}
      <Title level={4}>Tek Tıkla Analiz Şablonları</Title>
      <Paragraph type="secondary">
        Ne soracağınızdan emin değil misiniz? Sektörünüze özel hazırlanmış bu şablonları kullanarak hızlıca analiz yapın.
      </Paragraph>
      <Space wrap size="large" style={{ marginBottom: 24 }}>
          {analysisTemplates.map(template => (
              <Button 
                key={template.id}
                icon={<ThunderboltOutlined />} 
                onClick={() => handleStartAnalysis(template.id)}
                loading={isAnalyzing}
              >
                  {template.title}
              </Button>
          ))}
      </Space>

      <Title level={4}>Veya Doğal Dil ile Analiz Talebi Oluşturun</Title>
      <Paragraph type="secondary">
          Veri setinizle ilgili neyi merak ettiğinizi yazın. Örneğin: "Her bir 'Item' için ortalama 'Cost' değerini gösteren bir bar grafik oluştur."
      </Paragraph>
      <Input.TextArea
          rows={4}
          placeholder="Analiz talebinizi buraya yazın..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ marginBottom: 16 }}
          disabled={isAnalyzing}
      />
      
      <div style={{textAlign: 'right'}}>
          <Button 
              type="primary" 
              size="large" 
              icon={<RobotOutlined />} 
              onClick={() => handleStartAnalysis(null)} // Metin kutusu için templateId'yi null gönderiyoruz
              loading={isAnalyzing}
          >
              Yapay Zeka Analizini Başlat
          </Button>
      </div>

      <Divider />

      <Title level={4} style={{marginTop: 24}}>Veri Önizleme</Title>
      <Table 
        columns={columns} 
        dataSource={dataSource} 
        pagination={false} 
        bordered 
        scroll={{ x: true }}
      />
    </>
  );
};

export default FileDetailPage;