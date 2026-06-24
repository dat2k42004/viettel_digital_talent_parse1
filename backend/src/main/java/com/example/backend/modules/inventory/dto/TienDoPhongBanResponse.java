package com.example.backend.modules.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TienDoPhongBanResponse {
     private Long idPhieuKiemKe;
     private Long idPhongBan;
     private String tenPhongBan;
     private String trangThaiPhieu;
     private Long soLuongDaKiem;
     private Long tongSoLuongTaiSan;
}
