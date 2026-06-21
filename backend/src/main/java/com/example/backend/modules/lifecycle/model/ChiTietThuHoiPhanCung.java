package com.example.backend.modules.lifecycle.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_thu_hoi_phan_cung")
public class ChiTietThuHoiPhanCung extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_phieu_thu_hoi_tai_san")
    private PhieuThuHoiTaiSan phieuThuHoiTaiSan;

    @Column(name = "id_danh_sach_thiet_bi_phan_cung")
    private Long danhSachThietBiPhanCungId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_chi_tiet_cap_phat_phan_cung")
    private ChiTietCapPhatPhanCung chiTietCapPhatPhanCung;

    @Column(name = "tinh_trang_luc_thu_hoi", length = 100)
    private String tinhTrangLucThuHoi;

    @Column(name = "phu_kien_thu_hoi", length = 255)
    private String phuKienThuHoi;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;
}
