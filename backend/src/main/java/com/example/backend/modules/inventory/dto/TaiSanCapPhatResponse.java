package com.example.backend.modules.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaiSanCapPhatResponse {
     private Long idTaiSanGoc;
     private String tenTaiSan;
     private String soSerial;
     private String maTheTaiSan;
     private String viTriHienTai;
     private String tenNguoiDangSoHuu;
     private String loaiTaiSan; // PHAN_CUNG, LINH_KIEN, PHAN_MEM
}
