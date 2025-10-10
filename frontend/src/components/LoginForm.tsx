// src/components/LoginForm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { login } from '../services/authService';

// Formdan gelecek verilerin tiplerini tanımlıyoruz.
type FieldType = {
  email?: string;
  password?: string;
  remember?: string;
};

const LoginForm: React.FC = () => {
  // Butonun yüklenme durumunu ve sayfa yönlendirmesi için gerekli hook'ları tanımlıyoruz.
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form başarıyla doldurulup "Giriş Yap" butonuna basıldığında bu fonksiyon çalışır.
  const onFinish = async (values: any) => {
    // API isteği başlarken butonu "loading" (yükleniyor) durumuna alıyoruz.
    setLoading(true);
    try {
      // Servisimizdeki login fonksiyonunu, formdan gelen email ve şifre ile çağırıyoruz.
      const data = await login(values.email, values.password);
      
      // Başarılı olursa kullanıcıya bir mesaj gösteriyoruz.
      message.success('Giriş başarılı! Yönlendiriliyorsunuz...');
      
      // Backend'den dönen token'ları tarayıcının hafızasına (localStorage) kaydediyoruz.
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      // Kullanıcıyı ana sayfaya (dashboard) yönlendiriyoruz.
      // { replace: true } seçeneği, tarayıcı geçmişinde login sayfasını tutmaz.
      navigate('/dashboard', { replace: true });

    } catch (error: any) {
      // Başarısız olursa (yanlış şifre vb.), backend'den gelen hata mesajını gösteriyoruz.
      message.error(error.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      // İstek tamamlandığında, başarılı veya başarısız fark etmeksizin,
      // butonu tekrar tıklanabilir hale getiriyoruz.
      setLoading(false);
    }
  };

  // Form validasyon kuralları başarısız olduğunda bu fonksiyon çalışır (isteğe bağlı).
  const onFinishFailed = (errorInfo: any) => {
    console.log('Form validasyonu başarısız:', errorInfo);
  };

  return (
    <Form
      name="login"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      layout="vertical"
    >
      {/* E-posta Alanı */}
      <Form.Item<FieldType>
        label="E-posta Adresi"
        name="email"
        rules={[
          { required: true, message: 'Lütfen e-posta adresinizi girin!' },
          { type: 'email', message: 'Lütfen geçerli bir e-posta adresi girin!' }
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="ornek@mail.com"
          size="large"
        />
      </Form.Item>

      {/* Şifre Alanı */}
      <Form.Item<FieldType>
        label="Şifre"
        name="password"
        rules={[{ required: true, message: 'Lütfen şifrenizi girin!' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Şifreniz"
          size="large"
        />
      </Form.Item>

      {/* Beni Hatırla & Şifremi Unuttum */}
      <Form.Item>
        <Form.Item<FieldType> name="remember" valuePropName="checked" noStyle>
          <Checkbox>Beni Hatırla</Checkbox>
        </Form.Item>
        <a style={{ float: 'right' }} href="/forgot-password">
          Şifremi Unuttum
        </a>
      </Form.Item>

      {/* Giriş Butonu */}
      <Form.Item>
        <Button type="primary" htmlType="submit" block size="large" loading={loading}>
          Giriş Yap
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;