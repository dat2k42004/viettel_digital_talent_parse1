package com.example.backend.modules.report.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BaoCaoTonKhoResponse {
     private Long id;
     private Long idDonVi;
     private Long idViTri;
     private String tenViTri;
     private Long idTaiSanDanhMuc;
     private String tenTaiSanDanhMuc;
     private String maTaiSanDanhMuc;
     private String loaiTaiSan; // PHAN_CUNG, LINH_KIEN, PHAN_MEM
     private Integer soLuongTonKho;
     private LocalDateTime thoiGianCapNhat;
     private List<ChiTietTonKhoResponse> danhSachChiTiet;
}