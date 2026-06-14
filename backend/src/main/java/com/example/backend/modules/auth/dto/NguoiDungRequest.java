package com.example.backend.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class NguoiDungRequest {
    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String tenDangNhap;

    private String matKhau; // Khi Thêm mới thì bắt buộc, khi Cập nhật thì nếu rỗng là không đổi mật khẩu
    private String hoNguoiDung;
    private String tenDemNguoiDung;
    
    @NotBlank(message = "Tên người dùng không được để trống")
    private String tenNguoiDung;
    
    private String chucVu;

    @Email(message = "Email không hợp lệ")
    private String email;

    private String soDienThoai;
    private String danhDaiDienUrl;

    private List<Long> danhSachIdVaiTro;
}
