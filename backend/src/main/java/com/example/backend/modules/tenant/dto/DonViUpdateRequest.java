package com.example.backend.modules.tenant.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class DonViUpdateRequest {
    @NotBlank(message = "Tên pháp lý không được để trống")
    private String tenPhapLy;

    private String tenThuongMai;
    private String maSoThue;
    private String maQuocGiaDienThoai;
    private String soDienThoaiCoDinh;
    private String soDienThoaiDiDong;

    @Email(message = "Email chính thức không hợp lệ")
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
    
    private LocalDate thoiGianThanhLap;
    private LocalDate thoiGianBatDauHopDong;
    private LocalDate thoiGianHetHanHopDong;
}
