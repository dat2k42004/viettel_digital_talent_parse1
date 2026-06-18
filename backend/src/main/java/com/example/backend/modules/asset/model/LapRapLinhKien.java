package com.example.backend.modules.asset.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "lap_rap_linh_kien", indexes = {
        @Index(name = "idx_lrlk_don_vi_xoa", columnList = "id_don_vi, thoi_gian_xoa"),
        @Index(name = "idx_lrlk_thiet_bi_status", columnList = "id_thiet_bi_phan_cung, trang_thai_lien_ket, thoi_gian_xoa"),
        @Index(name = "idx_lrlk_linh_kien_status", columnList = "id_linh_kien_phan_cung, trang_thai_lien_ket, thoi_gian_xoa")
})
public class LapRapLinhKien extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_thiet_bi_phan_cung")
    private DanhSachThietBiPhanCung thietBiPhanCung;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_linh_kien_phan_cung")
    private LinhKienPhanCung linhKienPhanCung;

    @Column(name = "id_don_vi")
    private Long idDonVi;

    @Column(name = "thoi_gian_lap")
    private LocalDateTime thoiGianLap;

    @Column(name = "thoi_gian_thao")
    private LocalDateTime thoiGianThao;

    @Column(name = "trang_thai_lien_ket", length = 30)
    private String trangThaiLienKet;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;
}
