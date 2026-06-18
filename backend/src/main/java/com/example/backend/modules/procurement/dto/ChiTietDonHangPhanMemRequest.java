package com.example.backend.modules.procurement.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChiTietDonHangPhanMemRequest {
     private Long id;

     @NotNull(message = "ID mẫu tài sản phần mềm không được để trống")
     private Long idTaiSanPhanMem;

     @NotNull(message = "Số lượng đặt không được để trống")
     private Integer soLuongDat;

     @NotNull(message = "Đơn giá đặt không được để trống")
     private BigDecimal donGiaDat;

     private String ghiChu;
}
