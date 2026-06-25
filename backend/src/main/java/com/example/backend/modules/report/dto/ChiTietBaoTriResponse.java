package com.example.backend.modules.report.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietBaoTriResponse {
     private Long id;
     private Long idTaiSanCuThe;
     private String tenTaiSanCuThe;
     private String soSerial;
     private String maTheTaiSan;
     private String loaiTaiSan;
     private Long idPhieuSuaChua;
     private String maPhieuSuaChua;
     private BigDecimal chiPhiThucTe;
     private Integer thoiGianGianDoan;
     private String noiDungKhacPhuc;
     private LocalDateTime thoiGianNghiemThu;
}