package com.example.backend.modules.lifecycle.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_thu_hoi_linh_kien")
public class ChiTietThuHoiLinhKien extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_phieu_thu_hoi_tai_san")
    private PhieuThuHoiTaiSan phieuThuHoiTaiSan;

    @Column(name = "id_linh_kien_phan_cung")
    private Long linhKienPhanCungId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_chi_tiet_cap_phat_linh_kien")
    private ChiTietCapPhatLinhKien chiTietCapPhatLinhKien;

    @Column(name = "tinh_trang_thu_hoi", length = 100)
    private String tinhTrangThuHoi;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;
}
