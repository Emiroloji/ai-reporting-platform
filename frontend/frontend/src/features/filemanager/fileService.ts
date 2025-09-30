import api from "../../api/axios";

// Kullanıcının dosyalarını getirir
export async function getFiles() {
  const response = await api.get("/files/my");
  return response.data;
}

// Dosya yükle
export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
}

// Dosya sil
export async function deleteFile(fileId: number) {
  const response = await api.delete(`/files/${fileId}`);
  return response.data;
}

// Dosya indir
export async function downloadFile(fileId: number) {
  const response = await api.get(`/files/download/${fileId}`, {
    responseType: "blob"
  });
  return response.data;
}