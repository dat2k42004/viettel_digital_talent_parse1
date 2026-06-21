package com.example.backend.modules.lifecycle.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChiTietDieuChuyenLinhKienRequest {
     @NotNull(message = "ID chi tiết cấp phát linh kiện không được để trống")
     private Long chiTietCapPhatLinhKienId;
     private String trangThaiXuat;
     private String ghiChu;
}
