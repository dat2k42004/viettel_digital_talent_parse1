package com.example.backend.modules.maintenance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietKeHoachBaoTriResponse {
     private Long id;
     private Long idTaiSanPhanCung;
     private String maMauTaiSan;
     private String tenMauTaiSan;
}
