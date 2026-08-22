package com.example.backend.modules.inventory.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_kiem_ke_phan_CUng", indexes = {
          @Index(name = "idx_ctkkpc_xoa", columnList = "thoi_gian_xoa")
})
public class ChiTietKiemKePhanCung extends BaseEntity {

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "phieu_kiem_ke", referencedColumnName = "id", nullable = false)
     private PhieuKiemKe phieuKiemKe;

     @Column(name = "id_danh_sach_thiet_bi_phan_cung")
     private Long idDanhSachThietBiPhanCung;

     @Column(name = "id_nhan_vien_duoc_cap_phat")
     private Long idNhanVienDuocCapPhat;

     @Column(name = "trang_thai_kho", length = 30)
     private String trangThaiKho;

     @Column(name = "da_kiem_ke_thuc_te")
     private Boolean daKiemKeThucTe;

     @Column(name = "id_nhan_vien_su_dung")
     private Long idNhanVienSuDung;

     @Column(name = "tinh_trang_thuc_te", length = 100)
     private String tinhTrangThucTe;

     @Column(name = "ket_luan", length = 255)
     private String ketLuan; // KHOP, THIEU_HUT, SAI_VI_TRI

     @Column(name = "ghi_chu", columnDefinition = "TEXT")
     private String ghiChu;
}
