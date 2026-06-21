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
public class ChiTietThuHoiLinhKienRequest {

    @NotNull(message = "Chi tiết cấp phát linh kiện không được để trống")
    private Long chiTietCapPhatLinhKienId;

    @Size(max = 100, message = "Tình trạng thu hồi không vượt quá 100 ký tự")
    private String tinhTrangThuHoi;

    private String ghiChu;
}
