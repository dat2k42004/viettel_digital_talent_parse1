package com.example.backend.modules.inventory.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_kiem_ke_linh_kien", indexes = {
          @Index(name = "idx_ctkklk_xoa", columnList = "thoi_gian_xoa")
})
public class ChiTietKiemKeLinhKien extends BaseEntity {

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "phieu_kiem_ke", referencedColumnName = "id")
     private PhieuKiemKe phieuKiemKe;

     @Column(name = "id_linh_kien_phan_cung")
     private Long idLinhKienPhanCung;

     @Column(name = "vi_tri_kho", length = 100)
     private String viTriKho;

     @Column(name = "da_kiem_ke_thuc_te")
     private Boolean daKiemKeThucTe;

     @Column(name = "vi_tri_thuc_te", length = 100)
     private String viTriThucTe;

     @Column(name = "tinh_trang_thuc_te", length = 100)
     private String tinhTrangThucTe;

     @Column(name = "ket_luan", length = 255)
     private String ketLuan; // KHOP, THIEU_HUT, SAI_VI_TRI

     @Column(name = "ghi_chu", columnDefinition = "TEXT")
     private String ghiChu;
}
