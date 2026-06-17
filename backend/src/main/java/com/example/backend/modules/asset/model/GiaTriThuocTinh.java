package com.example.backend.modules.asset.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "gia_tri_thuoc_tinh", uniqueConstraints = {
    @UniqueConstraint(name = "uk_gttt_tai_san_thuoc_tinh", columnNames = {"loai_tai_san", "id_tai_san", "id_danh_muc_thuoc_tinh"})
})
public class GiaTriThuocTinh extends BaseEntity {

    @Column(name = "id_don_vi")
    private Long idDonVi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_danh_muc_thuoc_tinh")
    private DanhMucThuocTinh danhMucThuocTinh;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lua_chon")
    private LuaChonGoiY luaChon;

    @Column(name = "loai_tai_san", length = 100)
    private String loaiTaiSan;

    @Column(name = "id_tai_san")
    private Long idTaiSan;

    @Column(name = "gia_tri", columnDefinition = "TEXT")
    private String giaTri;
}
