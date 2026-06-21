package com.example.backend.modules.tenant.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DanhMucCauHinhRequest {
    private String maCauHinh;

    @NotBlank(message = "Tên cấu hình không được để trống")
    private String tenCauHinh;

    private String moTaCauHinh;
    private String nhomCauHinh;
    private String loaiDuLieu;
    private String giaTriMacDinh;
    private String trangThai;
}
