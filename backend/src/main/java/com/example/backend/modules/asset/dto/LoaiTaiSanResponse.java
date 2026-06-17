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
public class LoaiTaiSanResponse {
    private Long id;
    private String maLoai;
    private String tenLoai;
    private String tienToMaThe;
    private Integer thoiGianKhauHao;
    private String ghiChu;
    private String trangThai;
    private LocalDateTime thoiGianTao;
    private LocalDateTime thoiGianCapNhat;
}
