package com.example.backend.modules.asset.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "hang_san_xuat", indexes = {
        @Index(name = "idx_hsx_xoa", columnList = "thoi_gian_xoa"),
        @Index(name = "idx_hsx_ma_xoa", columnList = "ma_hang, thoi_gian_xoa"),
        @Index(name = "idx_hsx_trang_thai_xoa", columnList = "trang_thai, thoi_gian_xoa")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_hang_san_xuat_ma", columnNames = { "ma_hang" })
})
public class HangSanXuat extends BaseEntity {

    @Column(name = "ma_hang", length = 50, unique = true)
    private String maHang;

    @Column(name = "ten_hang", length = 100)
    private String tenHang;

    @Column(name = "website_ho_tro", length = 255)
    private String websiteHoTro;

    @Column(name = "hotline_ho_tro", length = 20)
    private String hotlineHoTro;

    @Column(name = "email_ho_tro", length = 100)
    private String emailHoTro;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @Column(name = "trang_thai", length = 30)
    @Enumerated(EnumType.STRING)
    private com.example.backend.shared.model.TrangThaiCoBanEnum trangThai;
}
