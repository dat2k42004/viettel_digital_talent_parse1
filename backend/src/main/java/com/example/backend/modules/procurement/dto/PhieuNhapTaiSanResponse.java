package com.example.backend.modules.procurement.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhieuNhapTaiSanResponse {
     private Long id;
     private Long idDonVi;
     private Long idDonHangMuaSam;
     private String maDonHangMuaSam;
     private Long idNguoiNhap;
     private String maPhieuNhap;
     private String soHoaDonVat;
     private String maBienBanGiaoHang;
     private LocalDateTime thoiGianNhapKho;
     private String trangThai;
     private String ghiChu;
     private LocalDateTime thoiGianTao;
     private LocalDateTime thoiGianCapNhat;

     private List<ChiTietNhapPhanCungResponse> chiTietPhanCung;
     private List<ChiTietNhapLinhKienResponse> chiTietLinhKien;
     private List<ChiTietNhapPhanMemResponse> chiTietPhanMem;
}