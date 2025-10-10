// src/components/RegisterForm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, message } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { register } from '../services/authService';

// Form alanlarının tiplerini tanımlıyoruz.
type FieldType = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const RegisterForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await register(values.firstName, values.lastName, values.email, values.password);
      message.success('Kayıt başarılı! Lütfen giriş yapın.');
      navigate('/login'); // Başarılı kayıt sonrası login sayfasına yönlendir.
    } catch (error: any) {
      message.error(error.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form name="register" onFinish={onFinish} layout="vertical" autoComplete="off">
      <Form.Item<FieldType>
        label="Ad"
        name="firstName"
        rules={[{ required: true, message: 'Lütfen adınızı girin!' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Adınız" size="large" />
      </Form.Item>

      <Form.Item<FieldType>
        label="Soyad"
        name="lastName"
        rules={[{ required: true, message: 'Lütfen soyadınızı girin!' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Soyadınız" size="large" />
      </Form.Item>

      <Form.Item<FieldType>
        label="E-posta Adresi"
        name="email"
        rules={[
          { required: true, message: 'Lütfen e-posta adresinizi girin!' },
          { type: 'email', message: 'Geçerli bir e-posta adresi girin!' },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="ornek@mail.com" size="large" />
      </Form.Item>

      <Form.Item<FieldType>
        label="Şifre"
        name="password"
        rules={[{ required: true, message: 'Lütfen şifrenizi girin!' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Şifreniz" size="large" />
      </Form.Item>

      <Form.Item<FieldType>
        label="Şifre Tekrar"
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Lütfen şifrenizi doğrulayın!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Girdiğiniz şifreler eşleşmiyor!'));
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Şifrenizi tekrar girin" size="large" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block size="large" loading={loading}>
          Kayıt Ol
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RegisterForm;