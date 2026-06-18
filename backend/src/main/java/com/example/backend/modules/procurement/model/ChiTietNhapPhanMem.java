package com.example.backend.modules.procurement.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_nhap_phan_mem")
public class ChiTietNhapPhanMem extends BaseEntity {

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "id_phieu_nhap_tai_san")
     private PhieuNhapTaiSan phieuNhapTaiSan;

     @Column(name = "id_tai_san_phan_mem")
     private Long idTaiSanPhanMem;

     @Column(name = "id_danh_sach_thiet_bi_phan_mem")
     private Long idDanhSachThietBiPhanMem;

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "id_chi_tiet_don_hang_phan_mem")
     private ChiTietDonHangPhanMem chiTietDonHangPhanMem;

     @Column(name = "so_luong_ghe_nhap")
     private Integer soLuongGheNhap;

     @Column(name = "gia_nhap_thuc_te", precision = 15, scale = 2)
     private BigDecimal giaNhapThucTe;
}
