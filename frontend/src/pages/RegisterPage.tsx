// src/pages/RegisterPage.tsx

import React from 'react';
import { Card, Layout, Row, Col, Typography } from 'antd';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

const { Title } = Typography;
const { Content } = Layout;

const RegisterPage: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Row justify="center" align="middle" style={{ width: '100%' }}>
          <Col xs={22} sm={16} md={12} lg={8} xl={6}>
            <Card>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Title level={2}>Hesap Oluştur</Title>
              </div>
              <RegisterForm />
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Typography.Text>Zaten bir hesabınız var mı? </Typography.Text>
                <Link to="/login">Giriş Yapın</Link>
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default RegisterPage;