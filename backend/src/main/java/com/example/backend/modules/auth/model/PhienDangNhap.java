package com.example.backend.modules.auth.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "phien_dang_nhap", indexes = {
        @Index(name = "idx_phien_token_truy_cap", columnList = "token_truy_cap(255), thoi_gian_xoa"),
        @Index(name = "idx_phien_token_lam_moi", columnList = "token_lam_moi(255), thoi_gian_xoa"),
        @Index(name = "idx_phien_nguoi_dung", columnList = "id_nguoi_dung, thoi_gian_xoa")
})
public class PhienDangNhap extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nguoi_dung", nullable = false)
    private NguoiDung nguoiDung;

    @Column(name = "id_don_vi")
    private Long idDonVi;

    @Column(name = "token_truy_cap", length = 2048)
    private String tokenTruyCap;

    @Column(name = "token_lam_moi", length = 2048)
    private String tokenLamMoi;

    @Column(name = "dia_chi_ip", length = 45)
    private String diaChiIp;

    @Column(name = "loai_thiet_bi", length = 50)
    private String loaiThietBi;

    @Column(name = "he_dieu_hanh", length = 50)
    private String heDieuHanh;

    @Column(name = "trinh_duyet", length = 255)
    private String trinhDuyet;

    @Column(name = "thong_tin_thiet_bi", columnDefinition = "TEXT")
    private String thongTinThietBi;

    @Column(name = "trang_thai", length = 30)
    private String trangThai;

    @Column(name = "thoi_gian_het_han")
    private LocalDateTime thoiGianHetHan;
}
