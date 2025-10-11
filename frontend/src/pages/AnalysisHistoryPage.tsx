// src/pages/AnalysisHistoryPage.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layout,
  Typography,
  Table,
  Tag,
  message,
  Breadcrumb,
  Modal,
  Spin,
  Empty,
  Card,
  Col,
  Row,
  Statistic,
  Button,
  Space,
  Popover
} from 'antd';
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
    setModalContent(null); // Önceki içeriği temizle
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
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
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
        <Space>
            {record.status === 'COMPLETED' && (
              <Button type="link" onClick={() => handleViewResult(record.id)}>
                Sonucu Görüntüle
              </Button>
            )}
            {record.status === 'FAILED' && record.errorMessage && (
                 <Popover content={record.errorMessage} title="Hata Detayı" trigger="click">
                    <Button type="link" danger>
                        Hata Detayı
                    </Button>
                </Popover>
            )}
        </Space>
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
            locale={{ emptyText: <Empty description="Görüntülenecek analiz geçmişi bulunmuyor." /> }}
          />
        </div>
      </Content>
      
      <Modal 
        title="Detaylı Analiz Sonucu" 
        open={isModalOpen} 
        onCancel={handleCloseModal}
        footer={null}
        width={1000}
        destroyOnClose // Modal kapandığında içindeki state'leri sıfırla
      >
        {modalLoading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : modalContent ? (
          <div>
            <Title level={4}>Genel İstatistikler</Title>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card><Statistic title="Toplam Satır" value={modalContent.insights.general_stats.row_count} /></Card>
              </Col>
              <Col span={6}>
                <Card><Statistic title="Toplam Sütun" value={modalContent.insights.general_stats.column_count} /></Card>
              </Col>
              <Col span={6}>
                <Card><Statistic title="Eksik Veri (Hücre)" value={modalContent.insights.general_stats.missing_cells} /></Card>
              </Col>
               <Col span={6}>
                <Card><Statistic title="Eksik Veri Oranı" value={modalContent.insights.general_stats.missing_cells_percentage.toFixed(2)} suffix="%"/></Card>
              </Col>
            </Row>

            <Title level={4}>Grafikler</Title>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {Object.keys(modalContent.charts).length > 0 ? (
                Object.entries(modalContent.charts).map(([title, base64Image]) => (
                  <Col key={title} xs={24} md={12}>
                    <Card title={title.replace(/_/g, ' ').replace(/(^\w)/, c => c.toUpperCase())}>
                      <img src={`data:image/png;base64,${base64Image}`} alt={title} style={{ width: '100%' }} />
                    </Card>
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <Empty description="Bu veri seti için uygun grafik oluşturulamadı." />
                </Col>
              )}
            </Row>

            <Title level={4}>Örnek Veri</Title>
            <Table
              dataSource={modalContent.sample_data}
              columns={
                modalContent.sample_data.length > 0
                  ? Object.keys(modalContent.sample_data[0]).map(key => ({ title: key, dataIndex: key, key, ellipsis: true }))
                  : []
              }
              pagination={false}
              scroll={{ x: true }}
              rowKey={(record, index) => index!}
            />
          </div>
        ) : (
          <Empty description="Bu analiz için görüntülenecek bir sonuç bulunamadı." />
        )}
      </Modal>
    </Layout>
  );
};

export default AnalysisHistoryPage;