package com.example.backend.modules.inventory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.backend.shared.model.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "dot_kiem_ke", indexes = {
          @Index(name = "idx_dkk_don_vi_xoa", columnList = "id_don_vi, thoi_gian_xoa")
})
public class DotKiemKe extends BaseEntity {

     @Column(name = "id_don_vi")
     private Long idDonVi;

     @Column(name = "ma_dot_kiem_ke", length = 50)
     private String maDotKiemKe;

     @Column(name = "ten_dot_kiem_ke", length = 255)
     private String tenDotKiemKe;

     @Column(name = "id_nguoi_lap")
     private Long idNguoiLap;

     @Column(name = "id_nguoi_phe_duyet")
     private Long idNguoiPheDuyet;

     @Column(name = "thoi_gian_bat_dau_du_kien")
     private LocalDate thoiGianBatDauDuKien;

     @Column(name = "thoi_gian_ket_thuc_du_kien")
     private LocalDate thoiGianKetThucDuKien;

     @Column(name = "thoi_gian_thuc_hien")
     private LocalDateTime thoiGianThucHien;

     @Column(name = "thoi_gian_chot_so_lieu")
     private LocalDateTime thoiGianChotSoLieu;

     @Enumerated(EnumType.STRING)
     @Column(name = "trang_thai", length = 30)
     private TrangThaiKiemKeEnum trangThai;

     @Column(name = "tong_tai_san_he_thong")
     private Integer tongTaiSanHeThong;

     @Column(name = "tong_tai_san_thuc_te")
     private Integer tongTaiSanThucTe;
}
