package com.example.backend.modules.maintenance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class TienDoBaoTriChiTietRequest {
     @NotNull(message = "ID dòng chi tiết không được để trống")
     private Long idChiTiet;

     @NotBlank(message = "Phân loại bắt buộc truyền (THIET_BI hoặc LINH_KIEN)")
     private String loaiChiTiet;

     @NotBlank(message = "Trạng thái thực hiện mới không được để trống")
     private String trangThaiThucHienMoi; // DA_GUI_DI, DA_THU_LAI

     private String phuongAnXuLy;
     private BigDecimal chiPhiThucTe;
     private Long idLinhKienThayThe;
}
