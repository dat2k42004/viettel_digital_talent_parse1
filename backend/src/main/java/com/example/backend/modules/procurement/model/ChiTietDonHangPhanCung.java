package com.example.backend.modules.procurement.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_don_hang_phan_cung")
public class ChiTietDonHangPhanCung extends BaseEntity {

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "id_don_hang_mua_sam")
     private DonHangMuaSam donHangMuaSam;

     @Column(name = "idtai_san_phan_cung")
     private Long idTaiSanPhanCung;

     @Column(name = "so_luong_dat")
     private Integer soLuongDat;

     @Column(name = "don_gia_dat", precision = 15, scale = 2)
     private BigDecimal donGiaDat;

     @Column(name = "thanh_tien", precision = 15, scale = 2)
     private BigDecimal thanhTien;

     @Column(name = "so_luong_da_nhap")
     private Integer soLuongDaNhap;

     @Column(name = "ghi_chu", columnDefinition = "TEXT")
     private String ghiChu;
}
