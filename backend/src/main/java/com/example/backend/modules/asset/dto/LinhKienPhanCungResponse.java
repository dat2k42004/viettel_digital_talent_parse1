package com.example.backend.modules.asset.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinhKienPhanCungResponse {
    private Long id;
    private Long idTaiSanPhanCung;
    private String tenTaiSanPhanCung;
    private String maMauTaiSanPhanCung;
    private Long idNhaCungCap;
    private Long idDonVi;
    private String soSerial;
    private BigDecimal giaMua;
    private LocalDate thoiGianMua;
    private Integer hanBaoHanhThang;
    private String trangThaiKho;
    private String viTriKho;
    private String trangThai;
    private LocalDateTime thoiGianTao;
    private LocalDateTime thoiGianCapNhat;
    private String qrCodeUrl;
}
