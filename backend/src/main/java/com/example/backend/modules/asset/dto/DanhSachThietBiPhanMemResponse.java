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
public class DanhSachThietBiPhanMemResponse {
    private Long id;
    private Long idTaiSanPhanMem;
    private String tenTaiSanPhanMem;
    private String maMauTaiSanPhanMem;
    private Long idNhaCungCap;
    private Long idDonVi;
    private String keyBanQuyen;
    private String maChungTuMua;
    private Integer tongSoGhe;
    private BigDecimal giaMua;
    private LocalDate thoiGianMua;
    private LocalDate thoiGianHetHan;
    private String trangThaiKho;
    private String trangThai;
    private LocalDateTime thoiGianTao;
    private LocalDateTime thoiGianCapNhat;
}
