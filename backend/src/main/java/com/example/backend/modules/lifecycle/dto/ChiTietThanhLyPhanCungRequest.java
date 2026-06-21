package com.example.backend.modules.lifecycle.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ChiTietThanhLyPhanCungRequest {
     @NotNull(message = "ID thiết bị phần cứng không được để trống")
     private Long idThietBiPhanCung;
     private BigDecimal tienThuHoi;
     private String ghiChu;
}
