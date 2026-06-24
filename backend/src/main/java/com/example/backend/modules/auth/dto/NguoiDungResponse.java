package com.example.backend.modules.auth.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class NguoiDungResponse {
    private Long id;
    private Long idDonVi;
    private Long idPhongBan;
    private String tenPhongBan;
    private String tenDangNhap;
    private String hoNguoiDung;
    private String tenDemNguoiDung;
    private String tenNguoiDung;
    private String chucVu;
    private String email;
    private String soDienThoai;
    private String danhDaiDienUrl;
    private String trangThai;
    private List<VaiTroResponse> danhSachVaiTro;
    private List<QuyenResponse> danhSachQuyen;
    private List<String> danhSachQuyenPhanGiai;
}
