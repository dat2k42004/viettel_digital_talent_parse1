package com.example.backend.modules.asset.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HangSanXuatRequest {

    @NotBlank(message = "Mã hãng không được để trống")
    @Size(max = 50, message = "Mã hãng không vượt quá 50 ký tự")
    private String maHang;

    @NotBlank(message = "Tên hãng không được để trống")
    @Size(max = 100, message = "Tên hãng không vượt quá 100 ký tự")
    private String tenHang;

    @Size(max = 255, message = "Website hỗ trợ không vượt quá 255 ký tự")
    private String websiteHoTro;

    @Size(max = 20, message = "Hotline hỗ trợ không vượt quá 20 ký tự")
    private String hotlineHoTro;

    @Email(message = "Email hỗ trợ không đúng định dạng")
    @Size(max = 100, message = "Email hỗ trợ không vượt quá 100 ký tự")
    private String emailHoTro;

    private String ghiChu;

    @NotBlank(message = "Trạng thái không được để trống")
    @Size(max = 30, message = "Trạng thái không vượt quá 30 ký tự")
    private String trangThai;
}
