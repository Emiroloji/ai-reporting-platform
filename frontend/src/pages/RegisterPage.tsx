// src/pages/RegisterPage.tsx

import React from 'react';
import { Typography, Button, Space, ConfigProvider } from 'antd';
import { Link } from 'react-router-dom';
import { PoweroffOutlined, LinkedinOutlined, TwitterOutlined, InstagramOutlined } from '@ant-design/icons';
import RegisterForm from '../components/RegisterForm';
import type { CSSProperties } from 'react';

const { Title, Text } = Typography;

// SVG arka planını LoginPage'den kopyalıyoruz
const svgBackground = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cdefs%3E%3ClinearGradient id='g1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%230d122e;stop-opacity:1' /%3E%3Cstop offset='50%25' style='stop-color:%231e1140;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%234a2a6c;stop-opacity:1' /%3E%3C/linearGradient%3E%3Cfilter id='blurFilter'%3E%3CfeGaussianBlur in='SourceGraphic' stdDeviation='0.5' /%3E%3C/filter%3E%3C/defs%3E%3Crect x='0' y='0' width='100' height='100' fill='url(%23g1)' /%3E%3Cg fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='0.1'%3E%3Cpath d='M0 10 L100 10' /%3E%3Cpath d='M0 20 L100 20' /%3E%3Cpath d='M0 30 L100 30' /%3E%3Cpath d='M0 40 L100 40' /%3E%3Cpath d='M0 50 L100 50' /%3E%3Cpath d='M0 60 L100 60' /%3E%3Cpath d='M0 70 L100 70' /%3E%3Cpath d='M0 80 L100 80' /%3E%3Cpath d='M0 90 L100 90' /%3E%3Cpath d='M10 0 L10 100' /%3E%3Cpath d='M20 0 L20 100' /%3E%3Cpath d='M30 0 L30 100' /%3E%3Cpath d='M40 0 L40 100' /%3E%3Cpath d='M50 0 L50 100' /%3E%3Cpath d='M60 0 L60 100' /%3E%3Cpath d='M70 0 L70 100' /%3E%3Cpath d='M80 0 L80 100' /%3E%3Cpath d='M90 0 L90 100' /%3E%3C/g%3E%3Ccircle cx='15' cy='15' r='2' fill='rgba(255,255,255,0.1)' filter='url(%23blurFilter)'/%3E%3Ccircle cx='85' cy='25' r='1.5' fill='rgba(255,255,255,0.1)' filter='url(%23blurFilter)'/%3E%3Ccircle cx='30' cy='70' r='2.5' fill='rgba(255,255,255,0.1)' filter='url(%23blurFilter)'/%3E%3Ccircle cx='60' cy='40' r='1.8' fill='rgba(255,255,255,0.1)' filter='url(%23blurFilter)'/%3E%3Ccircle cx='20' cy='90' r='1.2' fill='rgba(255,255,255,0.1)' filter='url(%23blurFilter)'/%3E%3Ccircle cx='95' cy='50' r='2.3' fill='rgba(255,255,255,0.1)' filter='url(%23blurFilter)'/%3E%3C/svg%3E`;

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '24px',
    backgroundImage: `url("${svgBackground}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    color: '#fff',
  },
  content: {
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    margin: '0 auto 24px auto',
    fontSize: '40px',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(5px)',
    color: '#fff',
  },
  footer: {
    position: 'absolute',
    bottom: '24px',
    textAlign: 'center',
    width: '100%',
  },
  socialIcons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    fontSize: '20px',
  },
  socialLink: {
    color: 'rgba(255, 255, 255, 0.7)',
    transition: 'color 0.3s',
  }
};

const RegisterPage: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Input: {
            colorBgContainer: 'rgba(255, 255, 255, 0.1)',
            colorBorder: 'rgba(255, 255, 255, 0.3)',
            colorText: '#fff',
            colorTextPlaceholder: 'rgba(255, 255, 255, 0.5)',
            controlHeight: 45,
          },
          Button: {
            controlHeight: 45,
          },
          Form: {
            labelColor: 'rgba(255, 255, 255, 0.85)',
          },
        },
      }}
    >
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.logo}>
            <PoweroffOutlined />
          </div>
          <Title level={2} style={{ color: '#fff', marginBottom: 24 }}>
            Hesap Oluştur
          </Title>
          
          <RegisterForm />
          
          <Text style={{ color: 'rgba(255, 255, 255, 0.65)', marginTop: 24, display: 'block' }}>
            Zaten bir hesabınız var mı?
          </Text>
          <Link to="/login">
            <Button type="link" style={{ color: '#fff' }}>
              Giriş Yapın
            </Button>
          </Link>
        </div>

        <div style={styles.footer}>
          <Space direction="vertical">
              <Text style={{ color: 'rgba(255, 255, 255, 0.5)' }}>FOLLOW</Text>
              <div style={styles.socialIcons}>
                  <a href="https://www.linkedin.com/in/emiruysal/" target="_blank" rel="noopener noreferrer" style={styles.socialLink}><LinkedinOutlined /></a>
                  <a href="https://x.com/emircan94751761" target="_blank" rel="noopener noreferrer" style={styles.socialLink}><TwitterOutlined /></a>
                  <a href="https://www.instagram.com/emircan.uysal/" target="_blank" rel="noopener noreferrer" style={styles.socialLink}><InstagramOutlined /></a>
              </div>
          </Space>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default RegisterPage;