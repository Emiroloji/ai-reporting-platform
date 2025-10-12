// src/pages/ProfilePage.tsx

import React, { useEffect, useState } from 'react';
import {
  Typography,
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  message,
  Spin,
  Alert,
  Descriptions,
  Avatar,
  Divider,
} from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, LockOutlined } from '@ant-design/icons';
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  UserProfile,
} from '../services/userService';

const { Title } = Typography;

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile();
        setUser(data);
        profileForm.setFieldsValue({
          firstName: data.firstName,
          lastName: data.lastName,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [profileForm]);
  
  const handleProfileUpdate = async (values: { firstName: string, lastName: string }) => {
    setProfileSaving(true);
    try {
      const updatedUser = await updateUserProfile(values);
      setUser(updatedUser);
      message.success('Profil bilgileriniz başarıyla güncellendi.');
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    setPasswordSaving(true);
    try {
      await changeUserPassword({ newPassword: values.newPassword });
      message.success('Şifreniz başarıyla değiştirildi.');
      passwordForm.resetFields();
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin size="large" /></div>;
  }

  if (error) {
    return <Alert message="Hata" description={error} type="error" showIcon />;
  }

  return (
    <>
      <Title level={2}>Profilim</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Avatar size={128} icon={<UserOutlined />} />
              <Title level={3} style={{ marginTop: 16 }}>{user?.firstName} {user?.lastName}</Title>
              <Descriptions column={1}>
                  <Descriptions.Item label="E-posta">{user?.email}</Descriptions.Item>
                  <Descriptions.Item label="Kalan Kredi">{user?.credits}</Descriptions.Item>
                  <Descriptions.Item label="Rol">{user?.role}</Descriptions.Item>
              </Descriptions>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card title="Profil Bilgilerini Güncelle" headStyle={{borderBottom: 0}} extra={<EditOutlined />}>
            <Form form={profileForm} layout="vertical" onFinish={handleProfileUpdate}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="firstName" label="Adınız" rules={[{ required: true, message: 'Ad alanı zorunludur' }]}>
                    <Input placeholder="Adınız" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="lastName" label="Soyadınız" rules={[{ required: true, message: 'Soyad alanı zorunludur' }]}>
                    <Input placeholder="Soyadınız" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={profileSaving}>
                  Değişiklikleri Kaydet
                </Button>
              </Form.Item>
            </Form>
          </Card>
          <Divider/>
           <Card title="Şifre Değiştir" headStyle={{borderBottom: 0}} extra={<LockOutlined />}>
            <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
               <Form.Item name="newPassword" label="Yeni Şifre" rules={[{ required: true, message: 'Yeni şifre zorunludur' }, {min: 6, message: 'Şifre en az 6 karakter olmalıdır.'}]}>
                <Input.Password placeholder="Yeni Şifre" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Yeni Şifre (Tekrar)"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Lütfen yeni şifrenizi doğrulayın!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Girdiğiniz şifreler eşleşmiyor!'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Yeni Şifreyi Doğrula" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={passwordSaving}>
                  Şifreyi Değiştir
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProfilePage;