package com.example.backend.shared.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "nhat_ky_thao_tac_he_thong", indexes = {
    @Index(name = "idx_nk_thao_tac_tai_khoan", columnList = "id_tai_khoan_thao_tac"),
    @Index(name = "idx_nk_thao_tac_thoi_gian", columnList = "thoi_gian_thao_tac"),
    @Index(name = "idx_nk_thao_tac_thuc_the", columnList = "thuc_the_tac_dong, id_ban_ghi")
})
public class NhatKyThaoTacHeThong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_tai_khoan_thao_tac")
    private Long idTaiKhoanThaoTac;

    @Column(name = "phuong_thuc_api", length = 10)
    private String phuongThucApi;

    @Column(name = "endpoint_api", length = 255)
    private String endpointApi;

    @Column(name = "thuc_the_tac_dong", length = 100)
    private String thucTheTacDong;

    @Column(name = "id_ban_ghi")
    private Long idBanGhi;

    @Column(name = "du_lieu_truoc", columnDefinition = "TEXT")
    private String duLieuTruoc;

    @Column(name = "du_lieu_sau", columnDefinition = "TEXT")
    private String duLieuSau;

    @Column(name = "dia_chi_ip", length = 45)
    private String diaChiIp;

    @Column(name = "thoi_gian_thao_tac")
    private LocalDateTime thoiGianThaoTac;
}
