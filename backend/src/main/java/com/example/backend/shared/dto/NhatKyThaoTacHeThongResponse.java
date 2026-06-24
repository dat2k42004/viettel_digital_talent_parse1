package com.example.backend.shared.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhatKyThaoTacHeThongResponse {
    private Long id;
    private Long idTaiKhoanThaoTac;
    private String phuongThucApi;
    private String endpointApi;
    private String thucTheTacDong;
    private Long idBanGhi;
    private String duLieuTruoc;
    private String duLieuSau;
    private String diaChiIp;
    private LocalDateTime thoiGianThaoTac;
}
