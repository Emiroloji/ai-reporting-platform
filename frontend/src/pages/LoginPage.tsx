// src/pages/LoginPage.tsx

import React from 'react';
import { Card, Layout, Row, Col, Typography } from 'antd';
import { Link } from 'react-router-dom'; // react-router-dom'dan Link'i import ediyoruz
import LoginForm from '../components/LoginForm';

const { Title } = Typography;
const { Content } = Layout;

const LoginPage: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Row justify="center" align="middle" style={{ width: '100%' }}>
          <Col xs={22} sm={16} md={12} lg={8} xl={6}>
            <Card>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Title level={2}>Giriş Yap</Title>
                <Typography.Text type="secondary">AI Raporlama Platformuna Hoş Geldiniz</Typography.Text>
              </div>
              
              <LoginForm /> 
              
              {/* Kayıt ol sayfasına yönlendirme linki */}
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Typography.Text>Hesabınız yok mu? </Typography.Text>
                <Link to="/register">Hemen Kayıt Olun</Link>
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default LoginPage;