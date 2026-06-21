package com.example.backend.modules.asset.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "lua_chon_goi_y", indexes = {
        @Index(name = "idx_lcgy_thuoc_tinh_xoa", columnList = "id_danh_muc_thuoc_tinh, thoi_gian_xoa")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_lcgy_thuoc_tinh_gia_tri", columnNames = { "id_danh_muc_thuoc_tinh", "gia_tri" })
})
public class LuaChonGoiY extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_danh_muc_thuoc_tinh")
    private DanhMucThuocTinh danhMucThuocTinh;

    @Column(name = "gia_tri", length = 150)
    private String giaTri;

    @Column(name = "trang_thai", length = 30)
    @Enumerated(EnumType.STRING)
    private com.example.backend.shared.model.TrangThaiCoBanEnum trangThai;

    @Column(name = "thu_tu_hien_thi")
    private Integer thuTuHienThi;
}
