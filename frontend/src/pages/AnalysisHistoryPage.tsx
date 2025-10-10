// src/pages/AnalysisHistoryPage.tsx

import React, { useEffect, useState } from 'react';
import { Layout, Typography, Table, Tag, message, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined, HistoryOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getAnalysisHistory, AnalysisRequest } from '../services/aiService';

const { Content } = Layout;
const { Title } = Typography;

const AnalysisHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<AnalysisRequest[]>([]);
  const [loading, setLoading] = useState(true);

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
        record.status === 'COMPLETED' ? <a>Sonucu Görüntüle</a> : null
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
    </Layout>
  );
};

export default AnalysisHistoryPage;