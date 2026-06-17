package com.example.backend.modules.asset.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "tai_san_phan_cung")
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
    private String trangThai;
}
