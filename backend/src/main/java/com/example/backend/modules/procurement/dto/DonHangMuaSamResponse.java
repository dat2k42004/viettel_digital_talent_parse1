package com.example.backend.modules.procurement.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
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
public class DonHangMuaSamResponse {
     private Long id;
     private Long idDonVi;
     private Long idNhaCungCap;
     private String tenNhaCungCap;
     private Long idNguoiLap;
     private Long idNguoiPheDuyet;
     private String maDonHang;
     private String soHopDongDinhKem;
     private BigDecimal tongTienTruocThue;
     private BigDecimal thueVat;
     private BigDecimal tongTienSauThue;
     private LocalDate thoiGianGiaoDuKien;
     private String trangThai;
     private String ghiChu;
     private LocalDateTime thoiGianTao;
     private LocalDateTime thoiGianCapNhat;

     private List<ChiTietDonHangPhanCungResponse> chiTietPhanCung;
     private List<ChiTietDonHangPhanMemResponse> chiTietPhanMem;
}
