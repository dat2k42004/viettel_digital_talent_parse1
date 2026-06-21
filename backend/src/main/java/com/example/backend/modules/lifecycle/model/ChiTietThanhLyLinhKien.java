package com.example.backend.modules.lifecycle.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "chi_tiet_thanh_ly_linh_kien")
public class ChiTietThanhLyLinhKien extends BaseEntity {

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "id_phieu_thanh_ly_tai_san")
     private PhieuThanhLyTaiSan phieuThanhLyTaiSan;

     @Column(name = "id_linh_kien_phan_cung")
     private Long linhKienPhanCungId;

     @Column(name = "tien_thu_hoi", precision = 15, scale = 2)
     private BigDecimal tienThuHoi;

     @Column(name = "ghi_chu", columnDefinition = "TEXT")
     private String ghiChu;
}
