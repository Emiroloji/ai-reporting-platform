// src/components/LoginForm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { login } from '../services/authService';

type FieldType = {
  email?: string;
  password?: string;
  remember?: string;
};

const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const data = await login(values.email, values.password);
      message.success('Giriş başarılı! Yönlendiriliyorsunuz...');
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      message.error(error.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      name="login"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      autoComplete="off"
      layout="vertical"
      style={{ marginTop: 24 }}
    >
      <Form.Item<FieldType>
        name="email"
        rules={[
          { required: true, message: 'Lütfen e-posta adresinizi girin!' },
          { type: 'email', message: 'Lütfen geçerli bir e-posta adresi girin!' }
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="Email address"
          style={{ borderRadius: 25 }}
        />
      </Form.Item>

      <Form.Item<FieldType>
        name="password"
        rules={[{ required: true, message: 'Lütfen şifrenizi girin!' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Password"
          style={{ borderRadius: 25 }}
        />
      </Form.Item>

      <Form.Item>
        <Form.Item<FieldType> name="remember" valuePropName="checked" noStyle>
          <Checkbox>Hatırla beni</Checkbox>
        </Form.Item>
        <a style={{ float: 'right', color: 'rgba(255, 255, 255, 0.85)' }} href="/forgot-password">
          Şifremi Unuttum
        </a>
      </Form.Item>

      <Form.Item style={{ marginTop: 24 }}>
        <Button type="primary" htmlType="submit" block loading={loading} style={{ borderRadius: 25 }}>
          Giriş Yap
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;