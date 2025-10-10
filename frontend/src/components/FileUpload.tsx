// src/components/FileUpload.tsx

import React, { useState } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import type { UploadProps } from 'antd';
import { uploadFile } from '../services/fileService';

const { Dragger } = Upload;

// Bu component, dışarıdan (Dashboard sayfasından) bir prop alacak.
// Bu prop, yükleme başarılı olduğunda çağrılacak olan bir fonksiyondur.
// Bu sayede dosya listesini tazeleyebileceğiz.
interface FileUploadProps {
  onUploadSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  // Yükleme sırasındaki durumu (loading) tutmak için state
  const [loading, setLoading] = useState(false);

  // Ant Design Upload component'i için konfigürasyon props'ları
  const props: UploadProps = {
    name: 'file',
    multiple: false, // Sadece tek dosya yüklemeye izin ver
    
    // Yüklenecek dosya türlerini kısıtlayabiliriz (isteğe bağlı)
    accept: ".xlsx, .xls, .csv, .pdf",

    // Ant Design'ın kendi yükleme mekanizmasını iptal edip,
    // kendi API isteğimizi atmak için bu fonksiyonu kullanıyoruz.
    customRequest: async (options) => {
      const { onSuccess, onError, file } = options;
      
      // Yükleme başladığında butonu/alanı loading durumuna al
      setLoading(true);
      try {
        // fileService'imizdeki uploadFile fonksiyonunu çağırıyoruz.
        // Ant'ın file objesini File tipine cast ediyoruz.
        await uploadFile(file as File);
        
        // Başarılı olursa...
        message.success(`${(file as File).name} dosyası başarıyla yüklendi.`);
        onUploadSuccess(); // Dashboard'a haber ver, listeyi yenilemesi için.
        if(onSuccess) onSuccess("Ok");

      } catch (error: any) {
        // Hata olursa...
        message.error(error.message || `${(file as File).name} yüklenirken bir hata oluştu.`);
        if(onError) onError(new Error(error.message));
      } finally {
        // İşlem bitince loading durumunu kaldır
        setLoading(false);
      }
    },
  };

  return (
    <Dragger {...props} disabled={loading}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Dosyayı buraya sürükleyip bırakın veya seçmek için tıklayın</p>
      <p className="ant-upload-hint">
        Analiz için tek bir PDF, XLSX, XLS veya CSV dosyası yükleyebilirsiniz.
      </p>
    </Dragger>
  );
};

export default FileUpload;