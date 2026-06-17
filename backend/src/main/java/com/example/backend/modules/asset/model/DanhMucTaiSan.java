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
@Table(name = "danh_muc_tai_san")
public class DanhMucTaiSan extends BaseEntity {

    @Column(name = "ma_danh_muc", length = 50, unique = true)
    private String maDanhMuc;

    @Column(name = "ten_danh_muc", length = 100)
    private String tenDanhMuc;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "trang_thai", length = 30)
    private String trangThai;
}
