package com.example.backend.modules.tenant.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DangKyDonViRequest {
    @NotBlank(message = "Tên pháp lý không được để trống")
    private String tenPhapLy;

    @NotBlank(message = "Tên miền hệ thống không được để trống")
    private String tenMienHeThong;
    
    private String maSoThue;
    
    @NotBlank(message = "Tên người đại diện không được để trống")
    private String tenNguoiDaiDien;

    // Admin info
    @NotBlank(message = "Tn ng nhập khng ức ? trảng")
    private String tenDangNhapAdmin;
    
    @NotBlank(message = "Mặt khẩu khng ức ? trảng")
    private String matKhauAdmin;
    
    @NotBlank(message = "Tn admin khng ức ? trảng")
    private String tenAdmin;

    @Email(message = "Email khng hợp lỗi")
    @NotBlank(message = "Email khng ức ? trảng")
    private String emailAdmin;
}
