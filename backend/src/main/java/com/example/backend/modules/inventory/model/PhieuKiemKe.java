package com.example.backend.modules.inventory.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "phieu_kiem_ke", indexes = {
          @Index(name = "idx_pkk_don_vi_xoa", columnList = "id_don_vi, thoi_gian_xoa")
})
public class PhieuKiemKe extends BaseEntity {

     @Column(name = "id_don_vi", nullable = false)
     private Long idDonVi;

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "dot_kiem_ke", referencedColumnName = "id", nullable = false)
     private DotKiemKe dotKiemKe;

     @Column(name = "ma_phieu_kiem_ke", length = 50)
     private String maPhieuKiemKe;

     @Column(name = "id_kho_kiem_ke")
     private Long idKhoKiemKe;

     @Column(name = "id_phong_ban_kiem_ke")
     private Long idPhongBanKiemKe;

     @Column(name = "id_nhan_vien_kiem_ke")
     private Long idNhanVienKiemKe;

     @Column(name = "id_nguoi_nhan_bao_cao")
     private Long idNguoiNhanBaoCao;

     @Enumerated(EnumType.STRING)
     @Column(name = "trang_thai", length = 30)
     private TrangThaiPhieuKiemKeEnum trangThai;

     @Column(name = "thoi_gian_thuc_hien")
     private LocalDateTime thoiGianThucHien;
}
