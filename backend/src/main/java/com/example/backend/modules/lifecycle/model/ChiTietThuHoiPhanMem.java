package com.example.backend.modules.lifecycle.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_thu_hoi_phan_mem")
public class ChiTietThuHoiPhanMem extends BaseEntity {

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "id_phieu_thu_hoi_tai_san")
     private PhieuThuHoiTaiSan phieuThuHoiTaiSan;

     @Column(name = "id_danh_sach_thiet_bi_phan_mem")
     private Long danhSachThietBiPhanMemId;

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "id_chi_tiet_cap_phat_phan_mem")
     private ChiTietCapPhatPhanMem chiTietCapPhatPhanMem;

     @Column(name = "thoi_gian_thu_hoi")
     private LocalDateTime thoiGianThuHoi;

     @Column(name = "ghi_chu", columnDefinition = "TEXT")
     private String ghiChu;
}