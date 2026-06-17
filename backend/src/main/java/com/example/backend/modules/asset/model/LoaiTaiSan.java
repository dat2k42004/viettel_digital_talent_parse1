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
@Table(name = "loai_tai_san")
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
    private String trangThai;
}
