package com.example.backend.modules.asset.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HangSanXuatResponse {
    private Long id;
    private String maHang;
    private String tenHang;
    private String websiteHoTro;
    private String hotlineHoTro;
    private String emailHoTro;
    private String ghiChu;
    private String trangThai;
    private LocalDateTime thoiGianTao;
    private LocalDateTime thoiGianCapNhat;
}
