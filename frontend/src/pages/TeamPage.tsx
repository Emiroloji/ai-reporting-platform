// src/pages/TeamPage.tsx

import React, { useState, useEffect } from 'react';
import {
    Typography,
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    message,
    Popconfirm,
    Tag,
    Space
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getOrganizationMembers, inviteUser, removeUser } from '../services/organizationService';
import { UserProfile } from '../services/userService';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const TeamPage: React.FC = () => {
    const [members, setMembers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    // Üyeleri getiren fonksiyon (GÜNCELLENDİ)
    const fetchMembers = async () => {
        setLoading(true);
        try {
            const memberData = await getOrganizationMembers();
            // Gelen verinin bir dizi (array) olduğundan emin oluyoruz.
            if (Array.isArray(memberData)) {
                setMembers(memberData);
            } else {
                // Eğer veri bir dizi değilse, hatayı önlemek için state'i boş bir diziye ayarlıyoruz.
                console.error("API'den beklenen üye listesi (array) gelmedi, gelen veri:", memberData);
                message.error('Üye listesi alınırken bir format hatası oluştu.');
                setMembers([]);
            }
        } catch (error: any) {
            message.error(error.message || 'Üyeler getirilemedi.');
            // Hata durumunda da state'in boş bir dizi olmasını sağlıyoruz.
            setMembers([]);
        } finally {
            setLoading(false);
        }
    };

    // Sayfa yüklendiğinde üyeleri çek
    useEffect(() => {
        fetchMembers();
    }, []);

    // Yeni üye davet etme modal'ını aç/kapa
    const showInviteModal = () => setIsModalOpen(true);
    const handleCancel = () => setIsModalOpen(false);

    // Davet formunu gönderme
    const handleInvite = async (values: { email: string; role: string }) => {
        try {
            await inviteUser(values.email, values.role);
            
            // Artık şifre beklemiyoruz, sadece genel bir başarı mesajı gösteriyoruz.
            message.success(`${values.email} adresine bir davet e-postası gönderildi. Lütfen e-posta kutusunu kontrol etmesini isteyin.`);
            
            setIsModalOpen(false);
            form.resetFields();
            fetchMembers(); // Tabloyu yenile
        } catch (error: any) {
            message.error(error.message);
        }
    };

    // Üyeyi silme
    const handleRemove = async (memberId: number) => {
        try {
            await removeUser(memberId);
            message.success('Kullanıcı organizasyondan başarıyla çıkarıldı.');
            fetchMembers(); // Tabloyu yenile
        } catch (error: any) {
            message.error(error.message);
        }
    };

    // Tablo kolonları
    const columns = [
        {
            title: 'Ad Soyad',
            dataIndex: 'firstName',
            key: 'name',
            render: (_: any, record: UserProfile) => `${record.firstName} ${record.lastName}`,
        },
        {
            title: 'E-posta',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Rol',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>{role}</Tag>,
        },
        {
            title: 'İşlemler',
            key: 'action',
            render: (_: any, record: UserProfile) => (
                <Popconfirm
                    title="Bu üyeyi çıkarmak istediğinizden emin misiniz?"
                    onConfirm={() => handleRemove(record.id)}
                    okText="Evet"
                    cancelText="Hayır"
                >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                        Çıkar
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={2}>Takım Yönetimi</Title>
                    <Paragraph type="secondary">Organizasyonunuza yeni üyeler davet edin ve mevcut üyeleri yönetin.</Paragraph>
                </div>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={showInviteModal}>
                    Yeni Üye Davet Et
                </Button>
            </div>

            <Table
                loading={loading}
                dataSource={members}
                columns={columns}
                rowKey="id"
            />

            <Modal
                title="Yeni Üye Davet Et"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleInvite} style={{ marginTop: 24 }}>
                    <Form.Item
                        name="email"
                        label="E-posta Adresi"
                        rules={[{ required: true, message: 'Lütfen bir e-posta adresi girin!' }, { type: 'email', message: 'Geçerli bir e-posta adresi girin!' }]}
                    >
                        <Input placeholder="uye@sirket.com" />
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="Kullanıcı Rolü"
                        initialValue="USER"
                        rules={[{ required: true, message: 'Lütfen bir rol seçin!' }]}
                    >
                        <Select>
                            <Option value="USER">Kullanıcı (Dosya yükleyebilir, analiz yapabilir)</Option>
                            <Option value="ADMIN">Yönetici (Tüm yetkilere sahip)</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Space>
                            <Button onClick={handleCancel}>İptal</Button>
                            <Button type="primary" htmlType="submit">
                                Davet Gönder
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default TeamPage;