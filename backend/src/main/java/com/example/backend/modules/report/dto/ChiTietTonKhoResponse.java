package com.example.backend.modules.report.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietTonKhoResponse {
     private Long id;
     private Long idTaiSanCuThe;
     private String tenTaiSanCuThe;
     private String soSerial;
     private String maTheTaiSan;
     private String loaiTaiSan;
     private String viTriKho;
     private String trangThai;
     private Long idDotKiemKeGanNhat;
     private String tenDotKiemKeGanNhat;
     private String ghiChu;
     private LocalDateTime thoiGianGhiNhan;
}