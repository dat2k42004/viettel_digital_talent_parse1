package com.example.backend.modules.asset.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "hang_san_xuat")
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
    private String trangThai;
}
