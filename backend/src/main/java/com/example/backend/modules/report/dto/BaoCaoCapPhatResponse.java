package com.example.backend.modules.report.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BaoCaoCapPhatResponse {
     private Long id;
     private Long idDonVi;
     private Long idPhongBan;
     private String tenPhongBan;
     private Long idTaiSanDanhMuc;
     private String tenTaiSanDanhMuc;
     private String maTaiSanDanhMuc;
     private String loaiTaiSan;
     private Integer soLuongCap;
     private BigDecimal tongGiaTriCap;
     private LocalDateTime thoiGianCapNhat;
     private List<ChiTietSuDungResponse> danhSachChiTiet;
}