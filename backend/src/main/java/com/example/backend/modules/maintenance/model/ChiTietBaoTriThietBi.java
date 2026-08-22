package com.example.backend.modules.maintenance.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_bao_tri_thiet_bi", indexes = {
          @Index(name = "idx_ctbttb_xoa", columnList = "thoi_gian_xoa")
})
public class ChiTietBaoTriThietBi extends BaseEntity {

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "phieu_sua_chua_bao_tri", referencedColumnName = "id", nullable = false)
     private PhieuSuaChuaBaoTri phieuSuaChuaBaoTri;

     @Column(name = "id_danh_sach_thiet_bi_phan_cung")
     private Long idDanhSachThietBiPhanCung;

     @Column(name = "loai_hinh_xu_ly", length = 50)
     private String loaiHinhXuLy; // SUA_CHUA_BAO_TRI, GUI_BAO_HANH

     @Column(name = "id_nha_cung_cap")
     private Long idNhaCungCap;

     @Enumerated(EnumType.STRING)
     @Column(name = "trang_thai_thuc_hien", length = 30)
     private TrangThaiThucHienEnum trangThaiThucHien;

     @Column(name = "tinh_trang_thiet_bi", length = 100)
     private String tinhTrangThietBi;

     @Column(name = "phuong_an_xu_ly", columnDefinition = "TEXT")
     private String phuongAnXuLy;

     @Column(name = "id_linh_kien_thay_the")
     private Long idLinhKienThayThe;

     @Column(name = "chi_phi", precision = 15, scale = 2)
     private BigDecimal chiPhi;
}
