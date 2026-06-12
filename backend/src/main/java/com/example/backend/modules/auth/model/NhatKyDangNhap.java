package com.example.backend.modules.auth.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "nhat_ky_dang_nhap", indexes = {
    @Index(name = "idx_nk_dang_nhap_nguoi_dung", columnList = "id_nguoi_dung"),
    @Index(name = "idx_nk_dang_nhap_don_vi", columnList = "id_don_vi")
})
public class NhatKyDangNhap extends BaseEntity {

    @Column(name = "id_don_vi")
    private Long idDonVi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nguoi_dung")
    private NguoiDung nguoiDung;

    @Column(name = "ten_dang_nhap", length = 50)
    private String tenDangNhap;

    @Column(name = "ket_qua", length = 50)
    private String ketQua;

    @Column(name = "dia_chi_ip", length = 45)
    private String diaChiIp;

    @Column(name = "loai_thiet_bi", length = 50)
    private String loaiThietBi;

    @Column(name = "he_dieu_hanh", length = 50)
    private String heDieuHanh;

    @Column(name = "trinh_duyet", length = 50)
    private String trinhDuyet;

    @Column(name = "thong_tin_thiet_bi", columnDefinition = "TEXT")
    private String thongTinThietBi;
}
