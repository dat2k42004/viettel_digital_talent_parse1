package com.example.backend.modules.asset.dto;

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
public class DanhMucTaiSanRequest {

    @NotBlank(message = "Mã danh mục không được để trống")
    @Size(max = 50, message = "Mã danh mục không vượt quá 50 ký tự")
    private String maDanhMuc;

    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 100, message = "Tên danh mục không vượt quá 100 ký tự")
    private String tenDanhMuc;

    private String moTa;

    @NotBlank(message = "Trạng thái không được để trống")
    @Size(max = 30, message = "Trạng thái không vượt quá 30 ký tự")
    private String trangThai;
}
