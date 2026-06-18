package com.example.backend.modules.asset.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "danh_muc_thuoc_tinh", indexes = {
        @Index(name = "idx_dmtt_xoa", columnList = "thoi_gian_xoa"),
        @Index(name = "idx_dmtt_ma_xoa", columnList = "ma_thuoc_tinh, thoi_gian_xoa"),
        @Index(name = "idx_dmtt_ap_dung_xoa", columnList = "ap_dung_cho, thoi_gian_xoa")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_danh_muc_thuoc_tinh_ma", columnNames = { "ma_thuoc_tinh" })
})
public class DanhMucThuocTinh extends BaseEntity {

    @Column(name = "ma_thuoc_tinh", length = 50, unique = true)
    private String maThuocTinh;

    @Column(name = "ten_thuoc_tinh", length = 100)
    private String tenThuocTinh;

    @Column(name = "kieu_du_lieu", length = 30)
    private String kieuDuLieu;

    @Column(name = "ap_dung_cho", length = 50)
    private String apDungCho;

    @Column(name = "bat_buoc_nhap")
    private Boolean batBuocNhap;

    @Column(name = "gia_tri_mac_dinh", length = 255)
    private String giaTriMacDinh;

    @Column(name = "trang_thai", length = 30)
    private String trangThai;

    @OneToMany(mappedBy = "danhMucThuocTinh", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LuaChonGoiY> luaChonGoiY = new ArrayList<>();

    public void addLuaChon(LuaChonGoiY option) {
        luaChonGoiY.add(option);
        option.setDanhMucThuocTinh(this);
    }

    public void removeLuaChon(LuaChonGoiY option) {
        luaChonGoiY.remove(option);
        option.setDanhMucThuocTinh(null);
    }
}
