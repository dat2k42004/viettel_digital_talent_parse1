package com.example.backend.modules.maintenance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhieuSuaChuaBaoTriResponse {
     private Long id;
     private Long idDonVi;
     private Long keHoachBaoTriId;
     private String maKeHoachBaoTri;
     private String maPhieuSuaChua;
     private String tenNguoiLap;
     private String tenNguoiPheDuyet;
     private LocalDateTime thoiGianLapPhieu;
     private LocalDateTime thoiGianBatDau;
     private LocalDateTime thoiGianHoanThanhDuKien;
     private LocalDateTime thoiGianHoanThanhThucTe;
     private BigDecimal tongChiPhiThucHien;
     private String trangThai;
     private String ghiChu;
     private LocalDateTime thoiGianTao;
     private LocalDateTime thoiGianCapNhat;
     private List<ChiTietBaoTriGeneralResponse> chiTietTaiSan;
}
