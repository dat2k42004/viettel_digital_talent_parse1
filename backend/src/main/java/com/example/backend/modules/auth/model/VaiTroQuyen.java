package com.example.backend.modules.auth.model;

import com.example.backend.shared.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "vai_tro_quyen", indexes = {
    @Index(name = "idx_vai_tro_quyen_vai_tro_quyen", columnList = "id_vai_tro, id_quyen")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_vai_tro_quyen_role_perm", columnNames = {"id_vai_tro", "id_quyen"})
})
public class VaiTroQuyen extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_vai_tro", nullable = false)
    private VaiTro vaiTro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_quyen", nullable = false)
    private Quyen quyen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nguoi_cap_quyen")
    private NguoiDung nguoiCapQuyen;

    @Column(name = "ghi_chu_cap_quyen", columnDefinition = "TEXT")
    private String ghiChuCapQuyen;
}
