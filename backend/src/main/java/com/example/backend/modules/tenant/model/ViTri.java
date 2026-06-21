package com.example.backend.modules.tenant.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "vi_tri", indexes = {
        @Index(name = "idx_vi_tri_don_vi_xoa", columnList = "id_don_vi, thoi_gian_xoa"),
        @Index(name = "idx_vi_tri_ma_don_vi_xoa", columnList = "ma_vi_tri, id_don_vi, thoi_gian_xoa")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_vi_tri_don_vi_ma", columnNames = {"id_don_vi", "ma_vi_tri"})
})
public class ViTri extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_don_vi")
    private DonVi donVi;

    @Column(name = "ma_vi_tri", length = 50, unique = true)
    private String maViTri;

    @Column(name = "ten_vi_tri", length = 150)
    private String tenViTri;

    @Column(name = "ten_tieng_anh", length = 150)
    private String tenTiengAnh;

    @Column(name = "loai_vi_tri", length = 50)
    private String loaiViTri;

    @Column(name = "suc_chua_toi_da")
    private Integer sucChuaToiDa;

    @Column(name = "dien_tich_m2", precision = 10, scale = 2)
    private BigDecimal dienTichM2;

    @Column(name = "chieu_cao_m", precision = 5, scale = 2)
    private BigDecimal chieuCaoM;

    @Column(name = "cap_do_bao_mat", length = 50)
    private String capDoBaoMat;

    @Column(name = "la_phong_kinh")
    private Boolean laPhongKinh;

    @Column(name = "co_dieu_hoa_trung_tam")
    private Boolean coDieuHoaTrungTam;

    @Column(name = "co_he_thong_pccc")
    private Boolean coHeThongPccc;

    @Column(name = "co_kiem_soat_cua")
    private Boolean coKiemSoatCua;

    @Column(name = "mo_ta_chi_tiet", columnDefinition = "TEXT")
    private String moTaChiTiet;

    @Column(name = "trang_thai", length = 30)
    @Enumerated(EnumType.STRING)
    private com.example.backend.shared.model.TrangThaiCoBanEnum trangThai;
}
