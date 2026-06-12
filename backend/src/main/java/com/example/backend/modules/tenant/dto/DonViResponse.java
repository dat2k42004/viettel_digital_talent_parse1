package com.example.backend.modules.tenant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonViResponse {
    private Long id;
    private String maDonVi;
    private String tenPhapLy;
    private String tenThuongMai;
    private String maSoThue;
    private String maQuocGiaDienThoai;
    private String soDienThoaiCoDinh;
    private String soDienThoaiDiDong;
    private String emailChinhThuc;
    private String tenMienHeThong;
    private String duongDanWebsite;
    private String soNhaTenDuong;
    private String phuongXa;
    private String quanHuyen;
    private String tinhThanhPho;
    private String maBuuChinh;
    private String maQuocGia;
    private String hoNguoiDaiDien;
    private String tenNguoiDaiDien;
    private String tenDemNguoiDaiDien;
    private String chucVuNguoiDaiDien;
    private String trangThai;
    private LocalDate thoiGianThanhLap;
    private LocalDate thoiGianBatDauHopDong;
    private LocalDate thoiGianHetHanHopDong;
    private LocalDateTime thoiGianTao;
    private LocalDateTime thoiGianCapNhat;
}
