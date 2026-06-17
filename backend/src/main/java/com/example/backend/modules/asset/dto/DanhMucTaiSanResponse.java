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
public class DanhMucTaiSanResponse {
    private Long id;
    private String maDanhMuc;
    private String tenDanhMuc;
    private String moTa;
    private String trangThai;
    private LocalDateTime thoiGianTao;
    private LocalDateTime thoiGianCapNhat;
}
