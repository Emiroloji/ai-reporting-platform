// src/pages/FileDetailPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout, Typography, Spin, Alert, Table, Breadcrumb, Button, Divider, message, Input } from 'antd';
import { HomeOutlined, FileOutlined, RobotOutlined } from '@ant-design/icons';
import { getFilePreview, FilePreview } from '../services/fileService';
import { startAnalysis } from '../services/aiService';
import ColumnMapping from '../components/ColumnMapping';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const FileDetailPage: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  
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
  
  const handleStartAnalysis = async () => {
    if (!fileId) return;
    setIsAnalyzing(true);
    try {
        const responseMessage = await startAnalysis(parseInt(fileId), query);
        message.success(responseMessage + " Analiz geçmişi sayfasından sonuçları kontrol edebilirsiniz.");
        setQuery('');
    } catch (err: any) {
        message.error(err.message);
    } finally {
        setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh', padding: '50px' }}>
        <Alert message="Hata" description={error} type="error" showIcon />
      </Layout>
    );
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
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Content style={{ padding: '24px 50px' }}>
        <Breadcrumb style={{ marginBottom: 16 }}>
            <Breadcrumb.Item>
                <Link to="/dashboard">
                    <HomeOutlined /> <span>Ana Sayfa</span>
                </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
                <FileOutlined /> <span>Dosya Detayı ve Analiz</span>
            </Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ background: '#fff', padding: 24, borderRadius: '8px' }}>
          <Title level={2}>Dosya Analizi</Title>
          <Paragraph>
            Dosyanızdaki kolonları yapay zekanın anlayabilmesi için anlamlı isimlerle eşleştirin. Ardından, neyi analiz etmek istediğinizi doğal dilde yazarak analizi başlatın.
          </Paragraph>

          {preview && fileId && (
            <ColumnMapping fileId={parseInt(fileId)} columns={preview.columns} />
          )}
          
          <Divider />

          <Title level={4}>Doğal Dil ile Analiz Talebi</Title>
            <Paragraph type="secondary">
                Veri setinizle ilgili neyi merak ettiğinizi yazın. Örneğin: "Her bir 'Item' için ortalama 'Cost' değerini gösteren bir bar grafik oluştur."
            </Paragraph>
            <Input.TextArea
                rows={4}
                placeholder="Analiz talebinizi buraya yazın..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ marginBottom: 16 }}
            />
            
            <div style={{textAlign: 'right'}}>
                <Button 
                    type="primary" 
                    size="large" 
                    icon={<RobotOutlined />} 
                    onClick={handleStartAnalysis}
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

        </div>
      </Content>
    </Layout>
  );
};

export default FileDetailPage;