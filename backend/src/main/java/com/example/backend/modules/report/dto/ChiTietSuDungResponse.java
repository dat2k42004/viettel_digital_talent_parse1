package com.example.backend.modules.report.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietSuDungResponse {
     private Long id;
     private Long idTaiSanCuThe;
     private String tenTaiSanCuThe;
     private String soSerial;
     private String maTheTaiSan;
     private String loaiTaiSan;
     private Long idNhanVienTiepNhan;
     private String hoTenNhanVienTiepNhan;
     private Long idChungTuGoc;
     private String maChungTuGoc;
     private String tinhTrangBanGiao;
     private LocalDateTime thoiGianThucHien;
}