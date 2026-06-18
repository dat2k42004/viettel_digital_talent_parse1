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
public class ChiTietNhapLinhKienResponse {
     private Long id;
     private Long idTaiSanPhanCung;
     private Long idLinhKienPhanCung;
     private Long idChiTietDonHangPhanCung;
     private BigDecimal giaNhapThucTe;
     private String tinhTrangLucNhap;
     private LocalDateTime thoiGianTao;
     private LocalDateTime thoiGianCapNhat;
}
