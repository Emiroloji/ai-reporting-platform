// src/components/ColumnMapping.tsx

import React, { useEffect, useState } from 'react';
import { Button, Form, Input, List, message, Space, Typography } from 'antd';
import { ColumnMapping as Mapping, getMappings, saveMapping } from '../services/fileService';

const { Text } = Typography;

interface ColumnMappingProps {
  fileId: number;
  columns: string[]; // Dosya önizlemesinden gelen orijinal kolon isimleri
}

const ColumnMapping: React.FC<ColumnMappingProps> = ({ fileId, columns }) => {
  const [form] = Form.useForm();
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Component yüklendiğinde mevcut eşleştirmeleri çek
  useEffect(() => {
    const fetchMappings = async () => {
      try {
        const existingMappings = await getMappings(fileId);
        const mappedData: Record<string, string> = {};
        const formFields: Record<string, string> = {};
        
        existingMappings.forEach(m => {
          mappedData[m.sourceColumn] = m.targetField;
          formFields[m.sourceColumn] = m.targetField;
        });

        setMappings(mappedData);
        form.setFieldsValue(formFields); // Formdaki inputları mevcut verilerle doldur
      } catch (error) {
        message.error('Mevcut eşleştirmeler getirilemedi.');
      }
    };
    fetchMappings();
  }, [fileId, form]);

  // Formdaki bir alanı kaydetmek için
  const handleSave = async (sourceColumn: string) => {
    try {
      setLoading(true);
      const targetField = form.getFieldValue(sourceColumn);
      if (!targetField) {
          message.warning("Lütfen bir hedef alan adı girin.");
          return;
      }
      await saveMapping(fileId, sourceColumn, targetField);
      setMappings(prev => ({...prev, [sourceColumn]: targetField}));
      message.success(`'${sourceColumn}' kolonu başarıyla eşleştirildi.`);
    } catch (error: any) {
      message.error(error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 24 }}>
        Kolon Eşleştirme
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        Dosyanızdaki kolonları yapay zekanın anlayabilmesi için anlamlı isimlerle eşleştirin. 
        Örneğin, 'SUTUN_A' yerine 'Müşteri Adı' yazabilirsiniz.
      </Typography.Paragraph>
      <Form form={form}>
        <List
          bordered
          dataSource={columns}
          renderItem={(sourceColumn) => (
            <List.Item>
              <Space align="baseline" style={{ width: '100%', justifyContent: 'space-between' }}>
                <Text strong style={{ minWidth: '150px' }}>{sourceColumn}</Text>
                <Form.Item
                  name={sourceColumn}
                  noStyle
                >
                  <Input placeholder="Hedef Alan Adı (Örn: Maaş)" style={{ flexGrow: 1, minWidth: '200px' }} />
                </Form.Item>
                <Button type="primary" onClick={() => handleSave(sourceColumn)} loading={loading}>
                  Kaydet
                </Button>
              </Space>
            </List.Item>
          )}
        />
      </Form>
    </div>
  );
};

export default ColumnMapping;