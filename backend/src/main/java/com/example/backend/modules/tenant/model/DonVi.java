package com.example.backend.modules.tenant.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "don_vi")
public class DonVi extends BaseEntity {

    @Column(name = "ma_don_vi", length = 50)
    private String maDonVi;

    @Column(name = "ten_phap_ly", length = 255)
    private String tenPhapLy;

    @Column(name = "ten_thuong_mai", length = 255)
    private String tenThuongMai;

    @Column(name = "ma_so_thue", length = 20)
    private String maSoThue;

    @Column(name = "ma_quoc_gia_dien_thoai", length = 10)
    private String maQuocGiaDienThoai;

    @Column(name = "so_dien_thoai_co_dinh", length = 20)
    private String soDienThoaiCoDinh;

    @Column(name = "so_dien_thoai_di_dong", length = 20)
    private String soDienThoaiDiDong;

    @Column(name = "email_chinh_thuc", length = 100)
    private String emailChinhThuc;

    @Column(name = "ten_mien_he_thong", length = 100)
    private String tenMienHeThong;

    @Column(name = "duong_dan_website", length = 255)
    private String duongDanWebsite;

    @Column(name = "so_nha_ten_duong", length = 255)
    private String soNhaTenDuong;

    @Column(name = "phuong_xa", length = 100)
    private String phuongXa;

    @Column(name = "quan_huyen", length = 100)
    private String quanHuyen;

    @Column(name = "tinh_thanh_pho", length = 100)
    private String tinhThanhPho;

    @Column(name = "ma_buu_chinh", length = 20)
    private String maBuuChinh;

    @Column(name = "ma_quoc_gia", length = 10)
    private String maQuocGia;

    @Column(name = "ho_nguoi_dai_dien", length = 50)
    private String hoNguoiDaiDien;

    @Column(name = "ten_nguoi_dai_dien", length = 50)
    private String tenNguoiDaiDien;

    @Column(name = "ten_dem_nguoi_dai_dien", length = 50)
    private String tenDemNguoiDaiDien;

    @Column(name = "chuc_vu_nguoi_dai_dien", length = 100)
    private String chucVuNguoiDaiDien;

    @Column(name = "trang_thai", length = 30)
    private String trangThai;

    @Column(name = "thoi_gian_thanh_lap")
    private LocalDate thoiGianThanhLap;

    @Column(name = "thoi_gian_bat_dau_hop_dong")
    private LocalDate thoiGianBatDauHopDong;

    @Column(name = "thoi_gian_het_han_hop_dong")
    private LocalDate thoiGianHetHanHopDong;
}
