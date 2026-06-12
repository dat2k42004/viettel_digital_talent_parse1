package com.example.backend.modules.tenant.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DonViTrangThaiRequest {
    @NotBlank(message = "Trạng thái không được để trống")
    private String trangThai;
}
