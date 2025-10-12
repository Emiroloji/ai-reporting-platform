// src/pages/FilesPage.tsx

import React, { useState } from 'react';
import { Typography, Divider } from 'antd';
import FileList from '../components/FileList';
import FileUpload from '../components/FileUpload';

const { Title, Paragraph } = Typography;

const FilesPage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <>
      <Title level={2}>Dosya Yönetimi</Title>
      <Paragraph>
        Yeni bir dosya yükleyerek analiz sürecini başlatın veya mevcut dosyalarınızı yönetin.
      </Paragraph>
      
      <FileUpload onUploadSuccess={handleUploadSuccess} />
      
      <Divider />

      <Title level={3}>Tüm Dosyalar</Title>
      <FileList key={refreshKey} />
    </>
  );
};

export default FilesPage;