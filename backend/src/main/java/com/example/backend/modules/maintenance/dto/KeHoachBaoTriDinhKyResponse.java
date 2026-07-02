package com.example.backend.modules.maintenance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KeHoachBaoTriDinhKyResponse {
     private Long id;
     private Long idDonVi;
     private String maKeHoach;
     private String tenKeHoach;
     private String tenNguoiLap;
     private String tenNguoiPheDuyet;
     private String chuKyLap;
     private LocalDate thoiGianBatDauKeHoach;
     private LocalDate thoiGianKetThucKeHoach;
     private LocalDateTime thoiGianLanCuoi;
     private LocalDateTime thoiGianLanTiep;
     private BigDecimal chiPhiDuKien;
     private String trangThai;
     private String noiDungBaoTri;
     private String lyDoTuChoi;
     private LocalDateTime thoiGianTao;
     private LocalDateTime thoiGianCapNhat;
     private List<ChiTietKeHoachBaoTriResponse> chiTietPhanVi;
}