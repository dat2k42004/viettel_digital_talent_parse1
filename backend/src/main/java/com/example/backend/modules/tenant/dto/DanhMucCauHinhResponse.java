package com.example.backend.modules.tenant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DanhMucCauHinhResponse {
    private Long id;
    private String maCauHinh;
    private String tenCauHinh;
    private String moTaCauHinh;
    private String nhomCauHinh;
    private String loaiDuLieu;
    private String giaTriMacDinh;
    private String trangThai;
}
