package com.example.backend.modules.lifecycle.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChiTietDieuChuyenPhanCungRequest {
     @NotNull(message = "ID chi tiết cấp phát phần cứng không được để trống")
     private Long chiTietCapPhatPhanCungId;
     private String trangThaiXuat;
     private String ghiChu;
}
