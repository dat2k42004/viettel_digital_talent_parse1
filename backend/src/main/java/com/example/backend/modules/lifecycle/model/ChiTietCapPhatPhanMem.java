package com.example.backend.modules.lifecycle.model;

import com.example.backend.shared.model.BaseEntity;
import com.example.backend.shared.model.TrangThaiVanHanhEnum;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_cap_phat_phan_mem")
public class ChiTietCapPhatPhanMem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_phieu_cap_phat_tai_san")
    private PhieuCapPhatTaiSan phieuCapPhatTaiSan;

    @Column(name = "id_tai_san_phan_mem")
    private Long taiSanPhanMemId;

    @Column(name = "id_danh_sach_thiet_bi_phan_mem")
    private Long danhSachThietBiPhanMemId;

    @Column(name = "id_danh_sach_thiet_bi_phan_cung")
    private Long danhSachThietBiPhanCungId;

    @Column(name = "ma_key_kich_hoat", length = 255)
    private String maKeyKichHoat;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", length = 30)
    private TrangThaiVanHanhEnum trangThai;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;
}
