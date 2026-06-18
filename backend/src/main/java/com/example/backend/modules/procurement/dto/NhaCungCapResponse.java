package com.example.backend.modules.procurement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NhaCungCapResponse {
     private Long id;
     private String maNhaCungCap;
     private Long idDonVi;
     private String tenNhaCungCap;
     private String maSoThue;
     private String nguoiLienHe;
     private String soDienThoai;
     private String email;
     private String diaChi;
     private String ghiChu;
     private String trangThai;
     private LocalDateTime thoiGianTao;
     private LocalDateTime thoiGianCapNhat;
}