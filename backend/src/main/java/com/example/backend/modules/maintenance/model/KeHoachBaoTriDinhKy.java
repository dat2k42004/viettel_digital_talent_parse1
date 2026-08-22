package com.example.backend.modules.maintenance.model;

import com.example.backend.shared.model.BaseEntity;
import com.example.backend.shared.model.TrangThaiPhieuEnum;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "ke_hoach_bao_tri_dinh_ky", indexes = {
          @Index(name = "idx_khbtdk_don_vi_xoa", columnList = "id_don_vi, thoi_gian_xoa")
})
public class KeHoachBaoTriDinhKy extends BaseEntity {

     @Column(name = "id_don_vi", nullable = false)
     private Long idDonVi;

     @Column(name = "ma_ke_hoach", length = 50)
     private String maKeHoach;

     @Column(name = "ten_ke_hoach", length = 255)
     private String tenKeHoach;

     @Column(name = "id_nguoi_lap")
     private Long idNguoiLap;

     @Column(name = "id_nguoi_phe_duyet")
     private Long idNguoiPheDuyet;

     @Column(name = "chu_ky_lap", length = 50)
     private String chuKyLap;

     @Column(name = "thoi_gian_bat_dau_ke_hoach")
     private LocalDate thoiGianBatDauKeHoach;

     @Column(name = "thoi_gian_ket_thuc_ke_hoach")
     private LocalDate thoiGianKetThucKeHoach;

     @Column(name = "thoi_gian_lan_cuoi")
     private LocalDateTime thoiGianLanCuoi;

     @Column(name = "thoi_gian_lan_tiep")
     private LocalDateTime thoiGianLanTiep;

     @Column(name = "chi_phi_du_kien", precision = 15, scale = 2)
     private BigDecimal chiPhiDuKien;

     @Enumerated(EnumType.STRING)
     @Column(name = "trang_thai", length = 30)
     private TrangThaiPhieuEnum trangThai;

     @Column(name = "noi_dung_bao_tri", columnDefinition = "TEXT")
     private String noiDungBaoTri;

     @Column(name = "ly_do_tu_choi", length = 500)
     private String lyDoTuChoi;
}
