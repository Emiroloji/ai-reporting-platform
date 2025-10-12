// src/components/RegisterForm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, message } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { register } from '../services/authService';

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
      navigate('/login');
    } catch (error: any) {
      message.error(error.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form name="register" onFinish={onFinish} layout="vertical" autoComplete="off">
      <Form.Item<FieldType>
        name="firstName"
        rules={[{ required: true, message: 'Lütfen adınızı girin!' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Adınız" style={{ borderRadius: 25 }} />
      </Form.Item>

      <Form.Item<FieldType>
        name="lastName"
        rules={[{ required: true, message: 'Lütfen soyadınızı girin!' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Soyadınız" style={{ borderRadius: 25 }} />
      </Form.Item>

      <Form.Item<FieldType>
        name="email"
        rules={[
          { required: true, message: 'Lütfen e-posta adresinizi girin!' },
          { type: 'email', message: 'Geçerli bir e-posta adresi girin!' },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="E-posta Adresiniz" style={{ borderRadius: 25 }} />
      </Form.Item>

      <Form.Item<FieldType>
        name="password"
        rules={[{ required: true, message: 'Lütfen şifrenizi girin!' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Şifreniz" style={{ borderRadius: 25 }} />
      </Form.Item>

      <Form.Item<FieldType>
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
        <Input.Password prefix={<LockOutlined />} placeholder="Şifrenizi tekrar girin" style={{ borderRadius: 25 }} />
      </Form.Item>

      <Form.Item style={{ marginTop: 24 }}>
        <Button type="primary" htmlType="submit" block loading={loading} style={{ borderRadius: 25 }}>
          Kayıt Ol
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RegisterForm;