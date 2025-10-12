// src/pages/DashboardPage.tsx

import React from 'react';
import { Typography, Row, Col, Card, Statistic, Button, Space } from 'antd';
import { FileDoneOutlined, LineChartOutlined, CreditCardOutlined, UploadOutlined, HistoryOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <>
            <Title level={2}>Genel Bakış</Title>
            <Paragraph type="secondary">
                Platformunuza hoş geldiniz. İşte hesap özetiniz ve hızlı başlangıç adımları.
            </Paragraph>

            {/* İstatistik Kartları */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title="Tamamlanan Analizler"
                            value={12}
                            prefix={<LineChartOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title="Yüklenen Dosya Sayısı"
                            value={5}
                            prefix={<FileDoneOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title="Kalan Kredi"
                            value={88}
                            prefix={<CreditCardOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Hızlı Aksiyonlar */}
            <Title level={4}>Hızlı Aksiyonlar</Title>
            <Card>
                <Space wrap size="large">
                    <Button type="primary" icon={<UploadOutlined />} size="large" onClick={() => navigate('/files')}>
                        Yeni Dosya Yükle
                    </Button>
                    <Button icon={<HistoryOutlined />} size="large" onClick={() => navigate('/history')}>
                        Analiz Geçmişini Görüntüle
                    </Button>
                </Space>
            </Card>

            {/* Buraya son aktiviteler veya son dosyalar listesi eklenebilir */}
        </>
    );
};

export default DashboardPage;