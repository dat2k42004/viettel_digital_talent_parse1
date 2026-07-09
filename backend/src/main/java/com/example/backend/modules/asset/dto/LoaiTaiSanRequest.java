package com.example.backend.modules.asset.dto;

import jakarta.validation.constraints.Min;
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
public class LoaiTaiSanRequest {

    @Size(max = 50, message = "{validation.asset_category.maLoai.max}")
    private String maLoai;

    @NotBlank(message = "{validation.asset_category.tenLoai.notblank}")
    @Size(max = 100, message = "{validation.asset_category.tenLoai.max}")
    private String tenLoai;

    @Size(max = 10, message = "{validation.asset_category.tienToMaThe.max}")
    private String tienToMaThe;

    @Min(value = 0, message = "{validation.asset_category.thoiGianKhauHao.min}")
    private Integer thoiGianKhauHao;

    private String ghiChu;

    @NotBlank(message = "{validation.asset_category.trangThai.notblank}")
    @Size(max = 30, message = "{validation.asset_category.trangThai.max}")
    private String trangThai;
}
