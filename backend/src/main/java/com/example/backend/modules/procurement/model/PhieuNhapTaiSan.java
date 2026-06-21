package com.example.backend.modules.procurement.model;

import java.time.LocalDateTime;

import com.example.backend.shared.model.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "phieu_nhap_tai_san", indexes = {
          @Index(name = "idx_pnts_don_vi_xoa", columnList = "id_don_vi, thoi_gian_xoa")
})
public class PhieuNhapTaiSan extends BaseEntity {

     @Column(name = "id_don_vi")
     private Long idDonVi;

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "id_don_hang_mua_sam")
     private DonHangMuaSam donHangMuaSam;

     @Column(name = "id_nguoi_nhap")
     private Long idNguoiNhap;

     @Column(name = "ma_phieu_nhap", length = 50)
     private String maPhieuNhap;

     @Column(name = "so_hoa_don_vat", length = 100)
     private String soHoaDonVat;

     @Column(name = "ma_bien_ban_giao_hang", length = 100)
     private String maBienBanGiaoHang;

     @Column(name = "thoi_gian_nhap_kho")
     private LocalDateTime thoiGianNhapKho;

     @Column(name = "trang_thai", length = 30)
     @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
     private com.example.backend.shared.model.TrangThaiPhieuEnum trangThai;

     @Column(name = "ghi_chu", columnDefinition = "TEXT")
     private String ghiChu;
}
