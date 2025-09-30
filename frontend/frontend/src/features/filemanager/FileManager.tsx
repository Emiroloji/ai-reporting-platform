import React, { useEffect, useState } from "react";
import { getFiles, uploadFile, deleteFile, downloadFile } from "./fileService";
import { Upload, Button, List, message, Popconfirm, Space, Typography } from "antd";
import { UploadOutlined, DeleteOutlined, DownloadOutlined, ReloadOutlined } from "@ant-design/icons";

type FileItem = {
  id: number;
  fileName: string;
  fileSize: number;
};

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const data = await getFiles();
      setFiles(data);
    } catch {
      message.error("Dosya listesi alınamadı!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (options: any) => {
    try {
      await uploadFile(options.file);
      message.success("Yükleme başarılı!");
      fetchFiles();
      if (options.onSuccess) options.onSuccess({}, options.file);
    } catch {
      message.error("Yükleme başarısız!");
      if (options.onError) options.onError();
    }
  };

  const handleDelete = async (fileId: number) => {
    try {
      await deleteFile(fileId);
      message.success("Dosya silindi!");
      fetchFiles();
    } catch {
      message.error("Silme başarısız!");
    }
  };

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const blob = await downloadFile(fileId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error("İndirme hatası!");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Typography.Title level={4} style={{ textAlign: "center", margin: 0 }}>
          Dosya Yönetimi
        </Typography.Title>
        <Upload customRequest={handleUpload} showUploadList={false}>
          <Button icon={<UploadOutlined />} block>
            Dosya Yükle
          </Button>
        </Upload>
        <Button onClick={fetchFiles} icon={<ReloadOutlined />} block>
          Yenile
        </Button>
        <List
          bordered
          loading={loading}
          locale={{ emptyText: "Dosyan yok." }}
          dataSource={files}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(item.id, item.fileName)}
                  size="small"
                />,
                <Popconfirm
                  title="Silinsin mi?"
                  onConfirm={() => handleDelete(item.id)}
                  okText="Evet"
                  cancelText="Hayır"
                >
                  <Button danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={item.fileName}
                description={`Boyut: ${(item.fileSize / 1024).toFixed(1)} KB`}
              />
            </List.Item>
          )}
        />
      </Space>
    </div>
  );
};

export default FileManager;