import React, { useState } from "react";
import { Form, Input, Button, message, Typography } from "antd";

const API_BASE = "http://localhost:8080/api/auth/login";

type LoginProps = {
  onLoginSuccess: () => void;
};

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Giriş başarısız!");
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        message.success("Giriş başarılı!");
        onLoginSuccess();
      } else {
        message.error("Token alınamadı!");
      }
    } catch (err) {
      message.error("Kullanıcı adı veya şifre hatalı!");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 350, margin: "80px auto" }}>
      <Typography.Title level={3} style={{ textAlign: "center" }}>
        Giriş Yap
      </Typography.Title>
      <Form layout="vertical" onFinish={onFinish}>
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