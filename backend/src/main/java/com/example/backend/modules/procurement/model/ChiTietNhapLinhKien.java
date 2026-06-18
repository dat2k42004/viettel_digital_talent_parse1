package com.example.backend.modules.procurement.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_nhap_linh_kien")
public class ChiTietNhapLinhKien extends BaseEntity {

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "id_phieu_nhap_tai_san")
     private PhieuNhapTaiSan phieuNhapTaiSan;

     @Column(name = "id_tai_san_phan_cung")
     private Long idTaiSanPhanCung;

     @Column(name = "id_linh_kien_phan_cung")
     private Long idLinhKienPhanCung;

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "id_chi_tiet_don_hang_phan_cung")
     private ChiTietDonHangPhanCung chiTietDonHangPhanCung;

     @Column(name = "gia_nhap_thuc_te", precision = 15, scale = 2)
     private BigDecimal giaNhapThucTe;

     @Column(name = "tinh_trang_luc_nhap", length = 100)
     private String tinhTrangLucNhap;
}
