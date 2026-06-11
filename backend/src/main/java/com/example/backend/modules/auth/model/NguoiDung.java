package com.example.backend.modules.auth.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "nguoi_dung")
public class NguoiDung extends BaseEntity {

    @Column(name = "id_don_vi")
    private Long idDonVi;

    @Column(name = "ma_nguoi_dung", length = 50)
    private String maNguoiDung;

    @Column(name = "ten_dang_nhap", length = 50)
    private String tenDangNhap;

    @Column(name = "mat_khau", length = 255)
    private String matKhau;

    @Column(name = "ho_nguoi_dung", length = 50)
    private String hoNguoiDung;

    @Column(name = "ten_dem_nguoi_dung", length = 50)
    private String tenDemNguoiDung;

    @Column(name = "ten_nguoi_dung", length = 50)
    private String tenNguoiDung;

    @Column(name = "chuc_vu", length = 100)
    private String chucVu;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "so_dien_thoai", length = 20)
    private String soDienThoai;

    @Column(name = "danh_dai_dien_url", length = 255)
    private String danhDaiDienUrl;

    @Column(name = "trang_thai", length = 30)
    private String trangThai;
}
