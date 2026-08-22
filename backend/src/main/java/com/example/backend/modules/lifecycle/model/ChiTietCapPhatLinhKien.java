package com.example.backend.modules.lifecycle.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_cap_phat_linh_kien")
public class ChiTietCapPhatLinhKien extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_phieu_cap_phat_tai_san", nullable = false)
    private PhieuCapPhatTaiSan phieuCapPhatTaiSan;

    @Column(name = "id_tai_san_phan_cung")
    private Long taiSanPhanCungId;

    @Column(name = "id_linh_kien_phan_cung")
    private Long linhKienPhanCungId;

    @Column(name = "tinh_trang_luc_giao", length = 100)
    private String tinhTrangLucGiao;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;
}
