package com.example.backend.modules.procurement.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietDonHangPhanMemResponse {
     private Long id;
     private Long idTaiSanPhanMem;
     private Integer soLuongDat;
     private BigDecimal donGiaDat;
     private BigDecimal thanhTien;
     private Integer soLuongDaNhap;
     private String ghiChu;
     private LocalDateTime thoiGianTao;
     private LocalDateTime thoiGianCapNhat;
}
