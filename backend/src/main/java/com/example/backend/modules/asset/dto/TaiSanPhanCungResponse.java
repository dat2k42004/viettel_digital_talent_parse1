package com.example.backend.modules.asset.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaiSanPhanCungResponse {
    private Long id;
    private Long idDanhMucTaiSan;
    private String tenDanhMucTaiSan;
    private Long idLoaiTaiSan;
    private String tenLoaiTaiSan;
    private Long idHangSanXuat;
    private String tenHangSanXuat;
    private String maMau;
    private String tenMau;
    private String hinhAnh;
    private Boolean coTheThaoLap;
    private String moTa;
    private String trangThai;
    private LocalDateTime thoiGianTao;
    private LocalDateTime thoiGianCapNhat;
}
