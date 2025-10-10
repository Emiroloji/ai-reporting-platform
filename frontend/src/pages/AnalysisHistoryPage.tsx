// src/pages/AnalysisHistoryPage.tsx

import React, { useEffect, useState } from 'react';
import { Layout, Typography, Table, Tag, message, Breadcrumb, Modal, Spin, Button, Empty } from 'antd'; // Empty eklendi
import { Link } from 'react-router-dom';
import { HomeOutlined, HistoryOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getAnalysisHistory, AnalysisRequest, getAnalysisResult, AnalysisResult } from '../services/aiService';

const { Content } = Layout;
const { Title } = Typography;

const AnalysisHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<AnalysisRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<AnalysisResult | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getAnalysisHistory();
        setHistory(data);
      } catch (error: any) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleViewResult = async (requestId: number) => {
    setIsModalOpen(true);
    setModalLoading(true);
    try {
      const result = await getAnalysisResult(requestId);
      setModalContent(result);
    } catch (error: any) {
      message.error(error.message);
      setIsModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Tag color="success">Tamamlandı</Tag>;
      case 'PROCESSING':
        return <Tag color="processing">İşleniyor</Tag>;
      case 'FAILED':
        return <Tag color="error">Hatalı</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const columns: ColumnsType<AnalysisRequest> = [
    { title: 'Dosya Adı', dataIndex: 'fileName', key: 'fileName' },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Başlangıç',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString('tr-TR'),
    },
    {
      title: 'Bitiş',
      dataIndex: 'completedAt',
      key: 'completedAt',
      render: (date) => (date ? new Date(date).toLocaleString('tr-TR') : '-'),
    },
    {
      title: 'İşlemler',
      key: 'action',
      render: (_, record) => (
        record.status === 'COMPLETED' ? (
          <Button type="link" onClick={() => handleViewResult(record.id)}>
            Sonucu Görüntüle
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Content style={{ padding: '24px 50px' }}>
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item>
            <Link to="/dashboard"><HomeOutlined /><span> Ana Sayfa</span></Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <HistoryOutlined /><span> Analiz Geçmişi</span>
          </Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ background: '#fff', padding: 24, borderRadius: '8px' }}>
          <Title level={2}>Analiz Geçmişi</Title>
          <Table
            columns={columns}
            dataSource={history}
            loading={loading}
            rowKey="id"
          />
        </div>
      </Content>
      
      <Modal 
        title="Analiz Sonucu" 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
      >
        {modalLoading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          // *** DÜZELTİLEN KISIM ***
          // modalContent.resultData'nın dolu olup olmadığını kontrol ediyoruz.
          (modalContent && modalContent.resultData) ? (
            <pre style={{ background: '#f6f8fa', padding: '16px', borderRadius: '4px', whiteSpace: 'pre-wrap', maxHeight: '60vh', overflow: 'auto' }}>
              {JSON.stringify(JSON.parse(modalContent.resultData), null, 2)}
            </pre>
          ) : (
            // Eğer resultData boş ise, bir uyarı mesajı gösteriyoruz.
            <Empty description="Bu analiz için görüntülenecek bir sonuç bulunamadı." />
          )
        )}
      </Modal>
    </Layout>
  );
};

export default AnalysisHistoryPage;