// src/pages/SettingsPage.tsx

import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, Input, message, Popconfirm, Spin } from 'antd';
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import { getApiKey, regenerateApiKey } from '../services/organizationService'; // Bu fonksiyonları birazdan ekleyeceğiz

const { Title, Paragraph, Text } = Typography;

const SettingsPage: React.FC = () => {
    const [apiKey, setApiKey] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApiKey = async () => {
            try {
                setLoading(true);
                const data = await getApiKey();
                setApiKey(data.apiKey);
            } catch (error: any) {
                message.error(error.message || 'API anahtarı getirilemedi.');
            } finally {
                setLoading(false);
            }
        };
        fetchApiKey();
    }, []);

    const handleRegenerate = async () => {
        try {
            const data = await regenerateApiKey();
            setApiKey(data.apiKey);
            message.success('Yeni API anahtarı başarıyla oluşturuldu!');
        } catch (error: any) {
            message.error(error.message || 'API anahtarı yenilenemedi.');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey);
        message.success('API anahtarı panoya kopyalandı!');
    };

    return (
        <>
            <Title level={2}>Ayarlar ve Entegrasyonlar</Title>
            <Paragraph>
                Platformu dış sistemlerle entegre etmek ve otomasyon sağlamak için API anahtarınızı yönetin.
            </Paragraph>

            <Card title="API Anahtarı Yönetimi">
                <Paragraph type="secondary">
                    Bu anahtar, sizin organizasyonunuza aittir. Kendi uygulamalarınızdan veya otomasyon araçlarınızdan platformumuza erişmek için kullanabilirsiniz. 
                    Bu anahtarı güvenli bir şekilde saklayın ve kimseyle paylaşmayın.
                </Paragraph>
                {loading ? (
                    <Spin />
                ) : (
                    <Input.Group compact>
                        <Input style={{ width: 'calc(100% - 200px)' }} value={apiKey} readOnly />
                        <Button icon={<CopyOutlined />} onClick={handleCopy}>Kopyala</Button>
                        <Popconfirm
                            title="Mevcut anahtarınız geçersiz kılınacak!"
                            description="Yeni bir API anahtarı oluşturmak istediğinizden emin misiniz?"
                            onConfirm={handleRegenerate}
                            okText="Evet, Yenile"
                            cancelText="İptal"
                        >
                            <Button icon={<ReloadOutlined />} danger>Yenile</Button>
                        </Popconfirm>
                    </Input.Group>
                )}
            </Card>
        </>
    );
};

export default SettingsPage;