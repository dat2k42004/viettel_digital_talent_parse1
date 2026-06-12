package com.example.backend.shared.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TrangThaiRequest {
    @NotBlank(message = "Trạng thái không được để trống")
    private String trangThai; // "HOAT_DONG" hoặc "KHOA"
}
