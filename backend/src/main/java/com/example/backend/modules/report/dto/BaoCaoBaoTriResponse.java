package com.example.backend.modules.report.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BaoCaoBaoTriResponse {
     private Long id;
     private Long idDonVi;
     private Long idTaiSanDanhMuc;
     private String tenTaiSanDanhMuc;
     private String maTaiSanDanhMuc;
     private String loaiTaiSan;
     private Integer soLuong;
     private BigDecimal tongChiPhi;
     private Integer tongThoiGian;
     private LocalDateTime thoiGianCapNhat;
     private List<ChiTietBaoTriResponse> danhSachChiTiet;
}