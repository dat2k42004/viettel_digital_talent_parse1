package com.example.backend.modules.inventory.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_kiem_ke_phan_mem", indexes = {
          @Index(name = "idx_ctkkpm_xoa", columnList = "thoi_gian_xoa")
})
public class ChiTietKiemKePhanMem extends BaseEntity {

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "phieu_kiem_ke", referencedColumnName = "id")
     private PhieuKiemKe phieuKiemKe;

     @Column(name = "id_tai_san_phan_mem")
     private Long idTaiSanPhanMem;

     @Column(name = "id_nhan_vien_su_dung")
     private Long idNhanVienSuDung;

     // @Column(name = "id_thiet_bi_cai_dat")
     // private Long idThietBiCaiDat;

     @Column(name = "da_kiem_ke_thuc_te")
     private Boolean daKiemKeThucTe;

     @Column(name = "trang_thai_ban_quyen", length = 50)
     private String trangThaiBanQuyen;

     @Column(name = "ket_luan", length = 255)
     private String ketLuan;

     @Column(name = "ghi_chu", columnDefinition = "TEXT")
     private String ghiChu;
}
