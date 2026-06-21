package com.example.backend.modules.lifecycle.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ChiTietThanhLyLinhKienRequest {
     @NotNull(message = "ID linh kiện không được để trống")
     private Long idLinhKienPhanCung;
     private BigDecimal tienThuHoi;
     private String ghiChu;
}
