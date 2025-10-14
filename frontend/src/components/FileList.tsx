// src/components/FileList.tsx

import React, { useEffect, useState } from 'react';
import { Table, Tag, message, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { getMyFiles, UploadedFile } from '../services/fileService';
import { FileOutlined, FilePdfOutlined, FileExcelOutlined, FileTextOutlined } from '@ant-design/icons';

// Dosya boyutunu okunabilir bir formata çeviren yardımcı fonksiyon (KB, MB, GB)
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Dosya MIME tipine göre ilgili ikonu döndüren yardımcı fonksiyon
const getFileIcon = (fileType: string | null | undefined) => {
  if (!fileType) return <FileOutlined />; // null/undefined ise direkt ikon döndür
  if (fileType.includes('pdf')) return <FilePdfOutlined style={{ color: '#D93025' }} />;
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileExcelOutlined style={{ color: '#188038' }} />;
  if (fileType.includes('csv')) return <FileTextOutlined style={{ color: '#1A73E8' }} />;
  return <FileOutlined />;
}

const FileList: React.FC = () => {
  // Yüklenmiş dosyaları ve tablonun yüklenme durumunu tutan state'ler
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Bu useEffect hook'u, component ilk yüklendiğinde çalışır ve dosyaları backend'den çeker.
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const fetchedFiles = await getMyFiles();
        
        // Gelen verinin bir dizi (array) olduğundan emin oluyoruz.
        // Bu kontrol, uygulamanın beklenmedik API cevaplarında çökmesini engeller.
        if (Array.isArray(fetchedFiles)) {
          setFiles(fetchedFiles);
        } else {
          console.warn("API'den beklenen dosya listesi (dizi) gelmedi.", fetchedFiles);
          setFiles([]); // Hatalı veriye karşı state'i boş bir diziye ayarlıyoruz.
        }

      } catch (error: any) {
        message.error(error.message || 'Dosyalar getirilemedi.');
        setFiles([]); // Hata durumunda da listeyi boşaltmak güvenlidir.
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []); // Boş dependency array sayesinde bu hook sadece bir kez çalışır.

  // Ant Design Table component'i için kolonların nasıl görüneceğini ve davranacağını tanımlıyoruz.
  const columns: ColumnsType<UploadedFile> = [
    {
      title: 'Dosya Adı',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text, record) => (
        <span>
          {getFileIcon(record.fileType)} {text}
        </span>
      ),
    },
    {
      title: 'Dosya Tipi',
      dataIndex: 'fileType',
      key: 'fileType',
      render: (type) => <Tag>{type}</Tag>,
    },
    {
      title: 'Boyut',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size) => formatBytes(size),
    },
    {
        title: 'Yüklenme Tarihi',
        dataIndex: 'uploadedAt',
        key: 'uploadedAt',
        render: (date) => new Date(date).toLocaleString('tr-TR'),
    },
    {
      title: 'İşlemler',
      key: 'action',
      render: (_, record) => (
        <Link to={`/files/${record.id}`}>Analiz Başlat</Link>
      ),
    },
  ];

  return (
    <Table 
        columns={columns} 
        dataSource={files} 
        loading={loading}
        rowKey="id"
        locale={{ emptyText: <Empty description="Henüz hiç dosya yüklemediniz." /> }}
    />
    );
};

export default FileList;