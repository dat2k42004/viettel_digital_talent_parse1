package com.example.backend.modules.lifecycle.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_dieu_chuyen_phan_cung")
public class ChiTietDieuChuyenPhanCung extends BaseEntity {
     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "id_phieu_dieu_chuyen_tai_san")
     private PhieuDieuChuyenTaiSan phieuDieuChuyenTaiSan;

     @Column(name = "id_danh_sach_thiet_bi_phan_cung")
     private Long danhSachThietBiPhanCungId;

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "id_chi_tiet_cap_phat_phan_cung")
     private ChiTietCapPhatPhanCung chiTietCapPhatPhanCung;

     @Column(name = "trang_thai_xuat", length = 30)
     private String trangThaiXuat;

     @Column(name = "trang_thai_nhan", length = 30)
     private String trangThaiNhan;

     @Column(name = "ghi_chu", columnDefinition = "TEXT")
     private String ghiChu;
}
