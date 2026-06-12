package com.example.backend.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NguoiDungTrangThaiRequest {
    @NotBlank(message = "Trạng thái không được để trống")
    private String trangThai; // Chỉ chấp nhận "HOAT_DONG" hoặc "KHOA"
}
