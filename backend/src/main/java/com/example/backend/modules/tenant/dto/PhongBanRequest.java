package com.example.backend.modules.tenant.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PhongBanRequest {
    @NotBlank(message = "Mã phòng ban không được để trống")
    private String maPhongBan;

    @NotBlank(message = "Tên phòng ban không được để trống")
    private String tenPhongBan;

    private String tenTiengAnh;
    private String tenVietTat;
    private String soMayLe;
    private String soHotlinePhong;
    private String emailNhom;
    private String loaiPhongBan;
    private BigDecimal hanMucNganSach;
    private String maTrungTamChiPhi;
    private String moTaChucNang;
    private String trangThai;
    private LocalDate thoiGianThanhLap;
}
