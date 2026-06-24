package com.example.backend.modules.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DotKiemKeResponse {
     private Long id;
     private Long idDonVi;
     private String maDotKiemKe;
     private String tenDotKiemKe;
     private String tenNguoiLap;
     private String tenNguoiPheDuyet;
     private LocalDate thoiGianBatDauDuKien;
     private LocalDate thoiGianKetThucDuKien;
     private LocalDateTime thoiGianThucHien;
     private LocalDateTime thoiGianChotSoLieu;
     private String trangThai;
     private Integer tongTaiSanHeThong;
     private Integer tongTaiSanThucTe;
     private LocalDateTime thoiGianTao;
     private LocalDateTime thoiGianCapNhat;
}
