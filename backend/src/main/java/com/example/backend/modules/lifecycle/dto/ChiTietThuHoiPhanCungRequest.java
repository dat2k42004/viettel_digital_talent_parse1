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
public class ChiTietThuHoiPhanCungRequest {

    @NotNull(message = "Chi tiết cấp phát phần cứng không được để trống")
    private Long chiTietCapPhatPhanCungId;

    @Size(max = 100, message = "Tình trạng lúc thu hồi không vượt quá 100 ký tự")
    private String tinhTrangLucThuHoi;

    @Size(max = 255, message = "Phụ kiện thu hồi không vượt quá 255 ký tự")
    private String phuKienThuHoi;

    private String ghiChu;
}
