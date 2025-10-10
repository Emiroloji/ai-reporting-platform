// src/pages/DashboardPage.tsx

import React, { useState } from 'react'; // useState import ediyoruz
import { Layout, Typography, Button, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';
import FileList from '../components/FileList';
import FileUpload from '../components/FileUpload'; // Yeni component'i import ediyoruz

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  
  // *** YENİ EKLENEN KISIM BAŞLANGICI ***
  // Bu state, FileList component'inin ne zaman yeniden veri çekmesi gerektiğini
  // anlamasını sağlayacak bir "tetikleyici" görevi görecek.
  const [refreshKey, setRefreshKey] = useState(0);

  // Bu fonksiyon, dosya yükleme başarılı olduğunda çağrılacak.
  const handleUploadSuccess = () => {
    // refreshKey'in değerini değiştirerek FileList'in yeniden render olmasını
    // ve verileri tekrar çekmesini tetikliyoruz.
    setRefreshKey(prevKey => prevKey + 1);
  };
  // *** YENİ EKLENEN KISIM SONU ***

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
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
        <Button 
          type="primary" 
          icon={<LogoutOutlined />} 
          onClick={handleLogout}
        >
          Çıkış Yap
        </Button>
      </Header>
      <Content style={{ padding: '24px 50px' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 280, borderRadius: '8px' }}>
          
          <Title level={2}>Dosyalarım</Title>
          <Paragraph>
            Analiz etmek için yeni bir dosya yükleyin veya daha önce yüklediğiniz dosyalar üzerinden işlem yapın.
          </Paragraph>
          
          {/* FileUpload component'ini buraya ekliyoruz ve prop olarak fonksiyonumuzu geçiyoruz. */}
          <FileUpload onUploadSuccess={handleUploadSuccess} />
          
          <Divider />

          {/* FileList'e key prop'unu ekliyoruz. Bu key değiştiğinde component yeniden render olur. */}
          <FileList key={refreshKey} />

        </div>
      </Content>
    </Layout>
  );
};

export default DashboardPage;