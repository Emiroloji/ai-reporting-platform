// src/pages/FileDetailPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Spin, Alert, Table, Descriptions, Breadcrumb, Button } from 'antd';
import { getFilePreview, FilePreview } from '../services/fileService';
import { HomeOutlined, FileOutlined } from '@ant-design/icons';
import ColumnMapping from '../components/ColumnMapping';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const FileDetailPage: React.FC = () => {
  // URL'deki :fileId parametresini almak için useParams hook'unu kullanıyoruz.
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();

  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // fileId'nin geçerli bir sayı olduğundan emin olalım.
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
  }, [fileId]); // useEffect, fileId değiştiğinde tekrar çalışacak.

  // Veri yükleniyorsa bir spinner göster
  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </Layout>
    );
  }

  // Hata varsa bir hata mesajı göster
  if (error) {
    return (
      <Layout style={{ minHeight: '100vh', padding: '50px' }}>
        <Alert message="Hata" description={error} type="error" showIcon />
      </Layout>
    );
  }
  
  // Ant Design Table için dinamik kolonlar oluştur
  const columns = preview?.columns.map((col, index) => ({
    title: col,
    dataIndex: index,
    key: index,
  }));
  
  // Ant Design Table için veri (dataSource) oluştur
  const dataSource = preview?.sampleRows.map((row, rowIndex) => {
    const rowObject: { [key: number]: string; key: number } = { key: rowIndex };
    row.forEach((cell, cellIndex) => {
        rowObject[cellIndex] = cell;
    });
    return rowObject;
  });

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Content style={{ padding: '24px 50px' }}>
        <Breadcrumb style={{ marginBottom: 16 }}>
            <Breadcrumb.Item onClick={() => navigate('/dashboard')}>
                <HomeOutlined />
                <span style={{cursor: 'pointer'}}>Ana Sayfa</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
                <FileOutlined />
                <span>Dosya Detayı</span>
            </Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ background: '#fff', padding: 24, borderRadius: '8px' }}>
          <Title level={2}>Dosya Önizleme ve Analiz</Title>
          <Paragraph>
            Aşağıda yüklediğiniz dosyanın ilk birkaç satırını görebilirsiniz. Kolonları kontrol edin ve analize devam edin.
          </Paragraph>
          
          {preview && (
            <ColumnMapping fileId={parseInt(fileId!)} columns={preview.columns} />
          )}
          
          <Title level={4} style={{marginTop: 24}}>Veri Önizleme</Title>
          <Table columns={columns} dataSource={dataSource} pagination={false} bordered />
        </div>
      </Content>
    </Layout>
  );
};

export default FileDetailPage;