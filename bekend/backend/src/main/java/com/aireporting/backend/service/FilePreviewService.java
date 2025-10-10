// src/main/java/com/aireporting/backend/service/FilePreviewService.java

package com.aireporting.backend.service;

import com.aireporting.backend.entity.UploadedFile;
import com.aireporting.backend.repository.UploadedFileRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FilePreviewService {

    private final UploadedFileRepository uploadedFileRepository;
    // S3 Client'ını ve bucket ismini buraya da ekliyoruz.
    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    public Map<String, Object> getFilePreview(Long fileId) throws Exception {
        UploadedFile file = uploadedFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Dosya bulunamadı!"));

        String fileType = file.getFileType();

        // S3'ten dosyayı getirmek için bir GetObjectRequest oluşturuyoruz.
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(file.getStoragePath())
                .build();

        // S3'ten gelen veri akışını (InputStream) alıyoruz.
        // Try-with-resources bloğu, işlem bitince stream'in otomatik kapanmasını sağlar.
        try (InputStream s3ObjectStream = s3Client.getObject(getObjectRequest)) {
            if (fileType != null && (fileType.contains("spreadsheet") || fileType.contains("excel"))) {
                return getExcelPreview(s3ObjectStream);
            } else if (fileType != null && fileType.contains("csv")) {
                return getCsvPreview(s3ObjectStream);
            } else if (fileType != null && fileType.contains("pdf")) {
                return getPdfPreview(s3ObjectStream);
            } else {
                throw new RuntimeException("Desteklenmeyen dosya tipi: " + fileType);
            }
        }
    }

    // Excel preview metodu artık dosya yolu yerine InputStream alıyor.
    private Map<String, Object> getExcelPreview(InputStream inputStream) throws Exception {
        List<String> columns = new ArrayList<>();
        List<List<String>> sampleRows = new ArrayList<>();
        List<String> sheetNames = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            for (int s = 0; s < workbook.getNumberOfSheets(); s++) {
                Sheet sheet = workbook.getSheetAt(s);
                sheetNames.add(sheet.getSheetName());
                if (s == 0) { // Sadece ilk sheet için preview
                    Row headerRow = sheet.getRow(0);
                    if (headerRow != null) {
                        for (Cell cell : headerRow) {
                            columns.add(cell.toString());
                        }
                    }
                    int limit = Math.min(5, sheet.getLastRowNum());
                    for (int i = 1; i <= limit; i++) {
                        Row dataRow = sheet.getRow(i);
                        List<String> rowValues = new ArrayList<>();
                        if (dataRow != null) {
                            for (Cell cell : dataRow) {
                                rowValues.add(cell.toString());
                            }
                        }
                        sampleRows.add(rowValues);
                    }
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("type", "excel");
        result.put("sheetNames", sheetNames);
        result.put("columns", columns);
        result.put("sampleRows", sampleRows);
        return result;
    }

    // CSV preview metodu artık dosya yolu yerine InputStream alıyor.
    private Map<String, Object> getCsvPreview(InputStream inputStream) throws Exception {
        List<String> columns = new ArrayList<>();
        List<List<String>> sampleRows = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String line;
            int rowCount = 0;
            while ((line = reader.readLine()) != null && rowCount <= 5) {
                List<String> values = Arrays.stream(line.split(",")).map(String::trim).collect(Collectors.toList());
                if (rowCount == 0) {
                    columns.addAll(values);
                } else {
                    sampleRows.add(values);
                }
                rowCount++;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("type", "csv");
        result.put("columns", columns);
        result.put("sampleRows", sampleRows);
        return result;
    }

    // PDF preview metodu artık dosya yolu yerine InputStream alıyor.
    private Map<String, Object> getPdfPreview(InputStream inputStream) throws Exception {
        StringBuilder text = new StringBuilder();
        try (org.apache.pdfbox.pdmodel.PDDocument document = org.apache.pdfbox.pdmodel.PDDocument.load(inputStream)) {
            org.apache.pdfbox.text.PDFTextStripper stripper = new org.apache.pdfbox.text.PDFTextStripper();
            stripper.setStartPage(1);
            stripper.setEndPage(1); // Sadece ilk sayfa
            text.append(stripper.getText(document));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("type", "pdf");
        result.put("summary", text.length() > 500 ? text.substring(0, 500) + "..." : text.toString());
        result.put("columns", new ArrayList<>(List.of("content"))); // PDF için tek bir kolon
        result.put("sampleRows", new ArrayList<>(List.of(List.of(text.substring(0, Math.min(text.length(), 100)) + "...")))); // Kısa bir örnek
        return result;
    }
}