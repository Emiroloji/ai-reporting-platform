package com.aireporting.backend.service;

import com.aireporting.backend.entity.UploadedFile;
import com.aireporting.backend.repository.UploadedFileRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FilePreviewService {

    private final UploadedFileRepository uploadedFileRepository;

    public Map<String, Object> getFilePreview(Long fileId) throws Exception {
        UploadedFile file = uploadedFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Dosya bulunamadı!"));

        String fileType = file.getFileType();

        if (fileType != null && fileType.contains("spreadsheet")) {
            return getExcelPreview(file);
        } else if (fileType != null && fileType.contains("csv")) {
            return getCsvPreview(file);
        } else if (fileType != null && fileType.contains("pdf")) {
            return getPdfPreview(file);
        } else {
            throw new RuntimeException("Desteklenmeyen dosya tipi: " + fileType);
        }
    }

    // Excel preview
    private Map<String, Object> getExcelPreview(UploadedFile file) throws Exception {
        List<String> columns = new ArrayList<>();
        List<List<String>> sampleRows = new ArrayList<>();
        List<String> sheetNames = new ArrayList<>();

        try (FileInputStream fis = new FileInputStream(file.getStoragePath());
             Workbook workbook = new XSSFWorkbook(fis)) {

            for (int s = 0; s < workbook.getNumberOfSheets(); s++) {
                Sheet sheet = workbook.getSheetAt(s);
                sheetNames.add(sheet.getSheetName());

                // Sadece ilk sheet için preview
                if (s == 0) {
                    Row headerRow = sheet.getRow(0);
                    if (headerRow != null) {
                        for (Cell cell : headerRow) {
                            columns.add(cell.toString());
                        }
                    }

                    // İlk 5 satırı örnekle
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

    // CSV preview
    private Map<String, Object> getCsvPreview(UploadedFile file) throws Exception {
        List<String> columns = new ArrayList<>();
        List<List<String>> sampleRows = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                new FileInputStream(file.getStoragePath()), StandardCharsets.UTF_8))) {

            String line;
            int rowCount = 0;
            while ((line = reader.readLine()) != null) {
                List<String> values = Arrays.stream(line.split(","))
                        .map(String::trim)
                        .collect(Collectors.toList());

                if (rowCount == 0) {
                    columns.addAll(values);
                } else if (rowCount <= 5) {
                    sampleRows.add(values);
                }
                rowCount++;
                if (rowCount > 5) break;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("type", "csv");
        result.put("columns", columns);
        result.put("sampleRows", sampleRows);
        return result;
    }

    // PDF preview
    private Map<String, Object> getPdfPreview(UploadedFile file) throws Exception {
        // PDFBox dependency: org.apache.pdfbox:pdfbox
        StringBuilder text = new StringBuilder();
        try (InputStream is = new FileInputStream(file.getStoragePath())) {
            // Minimal PDF extract (external lib: PDFBox)
            org.apache.pdfbox.pdmodel.PDDocument document = org.apache.pdfbox.pdmodel.PDDocument.load(is);
            org.apache.pdfbox.text.PDFTextStripper stripper = new org.apache.pdfbox.text.PDFTextStripper();
            stripper.setStartPage(1);
            stripper.setEndPage(1); // Sadece ilk sayfa özet
            text.append(stripper.getText(document));
            document.close();
        }

        Map<String, Object> result = new HashMap<>();
        result.put("type", "pdf");
        result.put("summary", text.length() > 500 ? text.substring(0,500) + "..." : text.toString());
        return result;
    }
}