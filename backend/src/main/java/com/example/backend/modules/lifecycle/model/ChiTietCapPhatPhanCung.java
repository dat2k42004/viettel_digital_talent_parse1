package com.example.backend.modules.lifecycle.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_cap_phat_phan_cungchi")
public class ChiTietCapPhatPhanCung extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_phieu_cap_phat_tai_san")
    private PhieuCapPhatTaiSan phieuCapPhatTaiSan;

    @Column(name = "id_tai_san_phan_cung")
    private Long taiSanPhanCungId;

    @Column(name = "id_danh_sach_thiet_bi_phan_cung")
    private Long danhSachThietBiPhanCungId;

    @Column(name = "tinh_trang_luc_giao", length = 100)
    private String tinhTrangLucGiao;

    @Column(name = "phu_kien_kem_theo", length = 255)
    private String phuKienKemTheo;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;
}
