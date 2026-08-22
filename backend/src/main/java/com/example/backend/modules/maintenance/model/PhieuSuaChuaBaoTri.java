package com.example.backend.modules.maintenance.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "phieu_sua_chua_bao_tri", indexes = {
          @Index(name = "idx_pscbt_don_vi_xoa", columnList = "id_don_vi, thoi_gian_xoa")
})
public class PhieuSuaChuaBaoTri extends BaseEntity {

     @Column(name = "id_don_vi", nullable = false)
     private Long idDonVi;

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "ke_hoach_bao_tri", referencedColumnName = "id")
     private KeHoachBaoTriDinhKy keHoachBaoTriDinhKy;

     @Column(name = "ma_phieu_sua_chua", length = 50)
     private String maPhieuSuaChua;

     @Column(name = "id_nguoi_lap")
     private Long idNguoiLap;

     @Column(name = "id_nguoi_phe_duyet")
     private Long idNguoiPheDuyet;

     @Column(name = "thoi_gian_lap_phieu")
     private LocalDateTime thoiGianLapPhieu;

     @Column(name = "thoi_gian_bat_dau")
     private LocalDateTime thoiGianBatDau;

     @Column(name = "thoi_gian_hoan_thanh_du_kien")
     private LocalDateTime thoiGianHoanThanhDuKien;

     @Column(name = "thoi_gian_hoan_thanh_thuc_te")
     private LocalDateTime thoiGianHoanThanhThucTe;

     @Column(name = "tong_chi_phi_thuc_hien", precision = 15, scale = 2)
     private BigDecimal tongChiPhiThucHien;

     @Enumerated(EnumType.STRING)
     @Column(name = "trang_thai", length = 30)
     private TrangThaiPhieuSuaChuaBaoTriEnum trangThai;

     @Column(name = "ghi_chu", columnDefinition = "TEXT")
     private String ghiChu;
}