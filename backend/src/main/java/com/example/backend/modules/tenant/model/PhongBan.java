package com.example.backend.modules.tenant.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "phong_ban", indexes = {
    @Index(name = "idx_phong_ban_don_vi_xoa", columnList = "id_don_vi, thoi_gian_xoa"),
    @Index(name = "idx_phong_ban_ma_don_vi_xoa", columnList = "ma_phong_ban, id_don_vi, thoi_gian_xoa")
})
public class PhongBan extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_don_vi")
    private DonVi donVi;

    @Column(name = "ma_phong_ban", length = 50)
    private String maPhongBan;

    @Column(name = "ten_phong_ban", length = 150)
    private String tenPhongBan;

    @Column(name = "ten_tieng_anh", length = 150)
    private String tenTiengAnh;

    @Column(name = "ten_viet_tat", length = 30)
    private String tenVietTat;

    @Column(name = "so_may_le", length = 20)
    private String soMayLe;

    @Column(name = "so_hotline_phong", length = 20)
    private String soHotlinePhong;

    @Column(name = "email_nhom", length = 100)
    private String emailNhom;

    @Column(name = "loai_phong_ban", length = 50)
    private String loaiPhongBan;

    @Column(name = "han_muc_ngan_sach", precision = 15, scale = 2)
    private BigDecimal hanMucNganSach;

    @Column(name = "ma_trung_tam_chi_phi", length = 50)
    private String maTrungTamChiPhi;

    @Column(name = "mo_ta_chuc_nang", columnDefinition = "TEXT")
    private String moTaChucNang;

    @Column(name = "trang_thai", length = 30)
    private String trangThai;

    @Column(name = "thoi_gian_thanh_lap")
    private LocalDate thoiGianThanhLap;
}
