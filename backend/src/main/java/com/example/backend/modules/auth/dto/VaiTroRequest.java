package com.example.backend.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class VaiTroRequest {
    private String maVaiTro;

    @NotBlank(message = "Tên vai trò không được để trống")
    private String tenVaiTro;

    private String moTa;

    private List<Long> danhSachIdQuyen;
}
