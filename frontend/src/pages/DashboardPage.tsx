// src/pages/DashboardPage.tsx

import React, { useState } from 'react';
import { Layout, Typography, Button, Divider, Space } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { LogoutOutlined, HistoryOutlined } from '@ant-design/icons';
import FileList from '../components/FileList';
import FileUpload from '../components/FileUpload';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Bu state, FileUpload başarılı olduğunda FileList'in yenilenmesini tetikler.
  const [refreshKey, setRefreshKey] = useState(0);

  // Bu fonksiyon, FileUpload component'inden çağrılır.
  const handleUploadSuccess = () => {
    // refreshKey'i güncelleyerek FileList'in yeniden veri çekmesini sağlarız.
    setRefreshKey(prevKey => prevKey + 1);
  };

  const handleLogout = () => {
    // Kullanıcı bilgilerini tarayıcı hafızasından temizle
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Kullanıcıyı login sayfasına yönlendir
    navigate('/login', { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backgroundColor: '#fff',
          borderBottom: '1px solid #f0f0f0'
        }}
      >
        <Title level={4} style={{ margin: 0 }}>AI Raporlama Platformu</Title>
        <Space>
          {/* Analiz Geçmişi Sayfasına Yönlendirme Butonu/Linki */}
          <Link to="/history">
            <Button icon={<HistoryOutlined />}>
              Analiz Geçmişi
            </Button>
          </Link>
          {/* Çıkış Yap Butonu */}
          <Button 
            type="primary" 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
          >
            Çıkış Yap
          </Button>
        </Space>
      </Header>
      <Content style={{ padding: '24px 50px' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 280, borderRadius: '8px' }}>
          
          <Title level={2}>Dosyalarım</Title>
          <Paragraph>
            Analiz etmek için yeni bir dosya yükleyin veya daha önce yüklediğiniz dosyalar üzerinden işlem yapın.
          </Paragraph>
          
          {/* Dosya Yükleme Component'i */}
          <FileUpload onUploadSuccess={handleUploadSuccess} />
          
          <Divider />

          {/* Dosya Listesi Component'i. 'key' prop'u değiştiğinde yeniden render olur. */}
          <FileList key={refreshKey} />

        </div>
      </Content>
    </Layout>
  );
};

export default DashboardPage;