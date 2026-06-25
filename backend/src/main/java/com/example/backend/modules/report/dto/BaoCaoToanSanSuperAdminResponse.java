package com.example.backend.modules.report.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BaoCaoToanSanSuperAdminResponse {
     private Long idDonVi;
     private String tenDonVi;
     private Long tongSoLuongPhanCung;
     private Long tongSoLuongPhanMem;
     private BigDecimal tongGiaTriUocTinhVnd;
}