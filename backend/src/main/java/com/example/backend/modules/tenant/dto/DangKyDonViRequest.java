package com.example.backend.modules.tenant.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DangKyDonViRequest {
    @NotBlank(message = "Tn php lỗi khng ức ? trảng")
    private String tenPhapLy;
    
    private String maSoThue;
    
    @NotBlank(message = "Tn ngĐi Đi diện khng ức ? trảng")
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
