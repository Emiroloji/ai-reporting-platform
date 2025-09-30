import React, { useState } from "react";
import { Form, Input, Button, message, Typography } from "antd";
import { login } from '../features/auth/authService';
type LoginProps = {
  onLoginSuccess: () => void;
};

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const data = await login(values.email, values.password);
      if (data.token) {
        localStorage.setItem("token", data.token);
        message.success("Giriş başarılı!");
        onLoginSuccess();
      } else {
        message.error("Token alınamadı!");
      }
    } catch (err: any) {
      // Hata mesajını backend'den alabiliyorsan gösterebilirsin
      message.error(err.response?.data?.message || "Kullanıcı adı veya şifre hatalı!");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 350, margin: "80px auto" }}>
      <Typography.Title level={3} style={{ textAlign: "center" }}>
        Giriş Yap
      </Typography.Title>
      <Form layout="vertical" onFinish={handleFinish}>
        <Form.Item label="E-posta" name="email" rules={[{ required: true, message: "E-posta gir!" }]}>
          <Input placeholder="E-posta" />
        </Form.Item>
        <Form.Item label="Şifre" name="password" rules={[{ required: true, message: "Şifre gir!" }]}>
          <Input.Password placeholder="Şifre" />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary" block loading={loading}>
            Giriş
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;