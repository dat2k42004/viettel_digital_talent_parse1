package com.example.backend.modules.asset.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "tai_san_phan_cung", indexes = {
        @Index(name = "idx_tspc_xoa", columnList = "thoi_gian_xoa"),
        @Index(name = "idx_tspc_ma_xoa", columnList = "ma_mau, thoi_gian_xoa"),
        @Index(name = "idx_tspc_bo_loc_catalog", columnList = "id_danh_muc_tai_san, id_loai_tai_san, id_hang_san_xuat, thoi_gian_xoa")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_tai_san_phan_cung_ma", columnNames = { "ma_mau" })
})
public class TaiSanPhanCung extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_danh_muc_tai_san")
    private DanhMucTaiSan danhMucTaiSan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_loai_tai_san")
    private LoaiTaiSan loaiTaiSan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_hang_san_xuat")
    private HangSanXuat hangSanXuat;

    @Column(name = "ma_mau", length = 50, unique = true)
    private String maMau;

    @Column(name = "ten_mau", length = 150)
    private String tenMau;

    @Column(name = "hinh_anh", length = 255)
    private String hinhAnh;

    @Column(name = "co_the_thao_lap")
    private Boolean coTheThaoLap;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "trang_thai", length = 30)
    @Enumerated(EnumType.STRING)
    private com.example.backend.shared.model.TrangThaiCoBanEnum trangThai;
}
