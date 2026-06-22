package com.example.backend.modules.maintenance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ChiTietBaoTriLinhKienRequest {
     @NotNull(message = "ID linh kiện không được để trống")
     private Long idLinhKienPhanCung;

     @NotBlank(message = "Loại hình xử lý bắt buộc chọn")
     private String loaiHinhXuLy; // SUA_CHUA_BAO_TRI, GUI_BAO_HANH

     private Long idNhaCungCap;
     private String tinhTrangThietBi;
     private BigDecimal chiPhi;
}
