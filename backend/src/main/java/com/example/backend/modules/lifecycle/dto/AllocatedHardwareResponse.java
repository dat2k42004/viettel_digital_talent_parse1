package com.example.backend.modules.lifecycle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllocatedHardwareResponse {
    private Long chiTietCapPhatPhanCungId;
    private Long danhSachThietBiPhanCungId;
    private String tenThietBi;
    private String soSerial;
    private String maTheTaiSan;
    private String tinhTrangLucGiao;
    private String phuKienKemTheo;
}
