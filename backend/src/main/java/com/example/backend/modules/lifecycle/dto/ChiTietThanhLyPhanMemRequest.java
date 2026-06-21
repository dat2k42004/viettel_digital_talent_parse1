package com.example.backend.modules.lifecycle.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ChiTietThanhLyPhanMemRequest {
     @NotNull(message = "ID bản quyền phần mềm không được để trống")
     private Long idThietBiPhanMem;
     private BigDecimal tienThuHoi;
     private String ghiChu;
}
