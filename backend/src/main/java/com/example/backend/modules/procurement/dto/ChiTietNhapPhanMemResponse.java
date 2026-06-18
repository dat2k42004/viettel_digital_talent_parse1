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
public class ChiTietNhapPhanMemResponse {
     private Long id;
     private Long idTaiSanPhanMem;
     private Long idDanhSachThietBiPhanMem;
     private Long idChiTietDonHangPhanMem;
     private Integer soLuongGheNhap;
     private BigDecimal giaNhapThucTe;
     private LocalDateTime thoiGianTao;
     private LocalDateTime thoiGianCapNhat;
}