package com.example.backend.modules.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietKiemKeFlatResponse {
     private Long id;
     private Long idTaiSanGoc;
     private String tenTaiSan;
     private String soSerial;
     private String maTheTaiSan;
     private Boolean daKiemKeThucTe;
     private String tinhTrangHoacBanQuyen;
     private String viTriHoacThietBiCaiDat;
     private String ketLuan;
     private String ghiChu;
     private String loaiTaiSan; // THIET_BI, LINH_KIEN, PHAN_MEM
}
