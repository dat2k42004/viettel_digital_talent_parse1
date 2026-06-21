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
public class ChiTietCapPhatPhanCungRequest {

    @NotNull(message = "Thiết bị phần cứng không được để trống")
    private Long danhSachThietBiPhanCungId;

    @Size(max = 100, message = "Tình trạng lúc giao không vượt quá 100 ký tự")
    private String tinhTrangLucGiao;

    @Size(max = 255, message = "Phụ kiện kèm theo không vượt quá 255 ký tự")
    private String phuKienKemTheo;

    private String ghiChu;
}
