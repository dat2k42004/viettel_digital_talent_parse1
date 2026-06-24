package com.example.backend.modules.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhieuKiemKeResponse {
     private Long id;
     private Long idDonVi;
     private Long dotKiemKeId;
     private String maDotKiemKe;
     private String tenDotKiemKe;
     private String maPhieuKiemKe;
     private Long idPhongBanKiemKe;
     private String tenPhongBan;
     private String tenNhanVienKiemKe;
     private String trangThai;
     private LocalDateTime thoiGianThucHien;
     private LocalDateTime thoiGianTao;
     private List<ChiTietKiemKeFlatResponse> danhSachChiTiet;
}
