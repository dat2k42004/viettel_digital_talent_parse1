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
@Table(name = "loai_tai_san", indexes = {
        @Index(name = "idx_lts_xoa", columnList = "thoi_gian_xoa"),
        @Index(name = "idx_lts_ma_xoa", columnList = "ma_loai, thoi_gian_xoa"),
        @Index(name = "idx_lts_trang_thai_xoa", columnList = "trang_thai, thoi_gian_xoa")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_loai_tai_san_ma", columnNames = { "ma_loai" })
})
public class LoaiTaiSan extends BaseEntity {

    @Column(name = "ma_loai", length = 50, unique = true)
    private String maLoai;

    @Column(name = "ten_loai", length = 100)
    private String tenLoai;

    @Column(name = "tien_to_ma_the", length = 10)
    private String tienToMaThe;

    @Column(name = "thoi_gian_khau_hao")
    private Integer thoiGianKhauHao;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @Column(name = "trang_thai", length = 30)
    @Enumerated(EnumType.STRING)
    private com.example.backend.shared.model.TrangThaiCoBanEnum trangThai;
}
