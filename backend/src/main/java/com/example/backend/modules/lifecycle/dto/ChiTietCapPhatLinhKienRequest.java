package com.example.backend.modules.lifecycle.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietCapPhatLinhKienRequest {

    @NotNull(message = "Linh kiện phần cứng không được để trống")
    private Long linhKienPhanCungId;

    private Long taiSanPhanCungId;

    @Size(max = 100, message = "Tình trạng lúc giao không vượt quá 100 ký tự")
    private String tinhTrangLucGiao;

    private String ghiChu;
}
