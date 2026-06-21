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
@Table(name = "danh_sach_thiet_bi_phan_mem", indexes = {
        @Index(name = "idx_dstbpm_don_vi_xoa", columnList = "id_don_vi, thoi_gian_xoa"),
        @Index(name = "idx_dstbpm_don_vi_kho_xoa", columnList = "id_don_vi, trang_thai_kho, thoi_gian_xoa"),
        @Index(name = "idx_dstbpm_mau_ts_xoa", columnList = "id_tai_san_phan_mem, thoi_gian_xoa"),
        @Index(name = "idx_dstbpm_ma_ct_don_vi", columnList = "ma_chung_tu_mua, id_don_vi, thoi_gian_xoa")
})
public class DanhSachThietBiPhanMem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tai_san_phan_mem")
    private TaiSanPhanMem taiSanPhanMem;

    @Column(name = "id_nha_cung_cap")
    private Long idNhaCungCap;

    @Column(name = "id_don_vi")
    private Long idDonVi;

    @Column(name = "key_ban_quyen", length = 255, unique = true)
    private String keyBanQuyen;

    @Column(name = "ma_chung_tu_mua", length = 100)
    private String maChungTuMua;

    @Column(name = "tong_so_ghe")
    private Integer tongSoGhe;

    @Column(name = "gia_mua", precision = 15, scale = 2)
    private BigDecimal giaMua;

    @Column(name = "thoi_gian_mua")
    private LocalDate thoiGianMua;

    @Column(name = "thoi_gian_het_han")
    private LocalDate thoiGianHetHan;

    @Column(name = "trang_thai_kho", length = 50)
    private String trangThaiKho;

    @Column(name = "trang_thai", length = 30)
    @Enumerated(EnumType.STRING)
    private com.example.backend.shared.model.TrangThaiVanHanhEnum trangThai;
}
