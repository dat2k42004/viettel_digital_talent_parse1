package com.example.backend.modules.procurement.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.example.backend.shared.model.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "don_hang_mua_sam", indexes = {
          @Index(name = "idx_dhms_don_vi_xoa", columnList = "id_don_vi, thoi_gian_xoa")
})
public class DonHangMuaSam extends BaseEntity {
     @Column(name = "id_don_vi", nullable = false)
     private Long idDonVi;

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "id_nha_cung_cap", nullable = false)
     private NhaCungCap nhaCungCap;

     @Column(name = "id_nguoi_lap")
     private Long idNguoiLap;

     @Column(name = "id_nguoi_phe_duyet")
     private Long idNguoiPheDuyet;

     @Column(name = "ma_don_hang", length = 50)
     private String maDonHang;

     @Column(name = "so_hop_dong_dinh_kem", length = 100)
     private String soHopDongDinhKem;

     @Column(name = "tong_tien_truoc_thue", precision = 15, scale = 2)
     private BigDecimal tongTienTruocThue;

     @Column(name = "thue_vat", precision = 15, scale = 2)
     private BigDecimal thueVat;

     @Column(name = "tong_tien_sau_thue", precision = 15, scale = 2)
     private BigDecimal tongTienSauThue;

     @Column(name = "thoi_gian_giao_du_kien")
     private LocalDate thoiGianGiaoDuKien;

     @Column(name = "trang_thai", length = 30)
     @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
     private com.example.backend.shared.model.TrangThaiPhieuEnum trangThai;

     @Column(name = "ghi_chu", columnDefinition = "TEXT")
     private String ghiChu;
}
