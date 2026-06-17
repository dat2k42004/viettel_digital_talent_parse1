package com.example.backend.modules.asset.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "lua_chon_goi_y", uniqueConstraints = {
    @UniqueConstraint(name = "uk_lcgy_thuoc_tinh_gia_tri", columnNames = {"id_danh_muc_thuoc_tinh", "gia_tri"})
})
public class LuaChonGoiY extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_danh_muc_thuoc_tinh")
    private DanhMucThuocTinh danhMucThuocTinh;

    @Column(name = "gia_tri", length = 150)
    private String giaTri;

    @Column(name = "trang_thai", length = 30)
    private String trangThai;

    @Column(name = "thu_tu_hien_thi")
    private Integer thuTuHienThi;
}
