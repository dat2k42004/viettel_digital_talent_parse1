package com.example.backend.modules.tenant.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class PhongBanResponse {
    private Long id;
    private Long idDonVi;
    private String maPhongBan;
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
