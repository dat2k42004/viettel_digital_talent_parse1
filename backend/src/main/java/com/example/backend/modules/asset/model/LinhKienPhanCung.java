package com.example.backend.modules.asset.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "linh_kien_phan_cung", indexes = {
        @Index(name = "idx_lkpc_don_vi_xoa", columnList = "id_don_vi, thoi_gian_xoa"),
        @Index(name = "idx_lkpc_don_vi_kho_xoa", columnList = "id_don_vi, trang_thai_kho, thoi_gian_xoa"),
        @Index(name = "idx_lkpc_mau_ts_xoa", columnList = "id_tai_san_phan_cung, thoi_gian_xoa")
})
public class LinhKienPhanCung extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tai_san_phan_cung")
    private TaiSanPhanCung taiSanPhanCung;

    @Column(name = "id_don_vi")
    private Long idDonVi;

    @Column(name = "id_nha_cung_cap")
    private Long idNhaCungCap;

    @Column(name = "so_serial", length = 100, unique = true)
    private String soSerial;

    @Column(name = "gia_mua", precision = 15, scale = 2)
    private BigDecimal giaMua;

    @Column(name = "thoi_gian_mua")
    private LocalDate thoiGianMua;

    @Column(name = "han_bao_hanh_thang")
    private Integer hanBaoHanhThang;

    @Column(name = "trang_thai_kho", length = 50)
    private String trangThaiKho;

    @Column(name = "vi_tri_kho", length = 100)
    private String viTriKho;

    @Column(name = "trang_thai", length = 30)
    @Enumerated(EnumType.STRING)
    private com.example.backend.shared.model.TrangThaiVanHanhEnum trangThai;
}
