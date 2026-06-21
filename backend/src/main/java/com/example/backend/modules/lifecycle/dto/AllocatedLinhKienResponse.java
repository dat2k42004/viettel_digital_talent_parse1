package com.example.backend.modules.lifecycle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllocatedLinhKienResponse {
    private Long chiTietCapPhatLinhKienId;
    private Long linhKienPhanCungId;
    private String tenLinhKien;
    private String soSerial;
    private String tinhTrangLucGiao;
}
