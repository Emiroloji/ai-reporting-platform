// src/components/layout/HeaderBar.tsx

import React, { useEffect, useState } from 'react';
import { Layout, Avatar, Dropdown, Menu, Space, Typography, Badge, Button } from 'antd';
import { UserOutlined, LogoutOutlined, BellOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, UserProfile } from '../../services/userService';

const { Header } = Layout;
const { Text } = Typography;

const HeaderBar: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await getUserProfile();
        setUser(profile);
      } catch (error) {
        console.error("Kullanıcı profili alınamadı:", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login', { replace: true });
  };

  const menu = (
    <Menu>
      <Menu.Item key="profile">
        <UserOutlined />
        <span>Profilim</span>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout}>
        <LogoutOutlined />
        <span>Çıkış Yap</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <Header style={{ 
        background: '#fff', 
        padding: '0 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid #f0f0f0' 
    }}>
        <div /> 
        <Space size="large" align="center">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/files')}>
                Yeni Dosya Yükle
            </Button>
            <Badge count={5}>
                <BellOutlined style={{ fontSize: '20px' }} />
            </Badge>
            <Dropdown overlay={menu} trigger={['click']}>
                {/* HATA DÜZELTMESİ: a etiketine href ekleyerek uyarıyı gideriyoruz. */}
                <a href="#!" onClick={(e) => e.preventDefault()} style={{display: 'flex', alignItems: 'center'}}>
                    <Space>
                        <Avatar icon={<UserOutlined />} />
                        
                    </Space>
                </a>
            </Dropdown>
        </Space>
    </Header>
  );
};

export default HeaderBar;