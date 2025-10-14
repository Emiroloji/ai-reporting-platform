package com.aireporting.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data // DÜZELTME: @Databu yerine @Data yazılmalı
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChartDTO {

    private String chartType; // "bar", "line", "pie" vb.
    private List<String> labels; // Grafiğin X eksenindeki etiketler (Örn: " Ocak", "Şubat")
    private List<Dataset> datasets;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Dataset {
        private String label; // Veri setinin adı (Örn: "Ortalama Maaş")
        private List<Object> data; // Asıl veriler (Örn: [15000, 12000, 13500])
        // İleride renk gibi başka özellikler de eklenebilir
    }
}