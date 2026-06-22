package com.example.backend.modules.maintenance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietBaoTriGeneralResponse {
     private Long id;
     private Long idTaiSanGoc;
     private String tenMauTaiSan;
     private String soSerial;
     private String maTheTaiSan;
     private String loaiHinhXuLy;
     private Long idNhaCungCap;
     private String tenNhaCungCap;
     private String trangThaiThucHien;
     private String tinhTrangThietBi;
     private String phuongAnXuLy;
     private Long idLinhKienThayThe;
     private BigDecimal chiPhi;
     private String loai; // THIET_BI, LINH_KIEN
}
