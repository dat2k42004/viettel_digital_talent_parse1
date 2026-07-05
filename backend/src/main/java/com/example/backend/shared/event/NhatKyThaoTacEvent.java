package com.example.backend.shared.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class NhatKyThaoTacEvent {
    private final Long idTaiKhoanThaoTac;
    private final Long idDonVi;
    private final String phuongThucApi;
    private final String endpointApi;
    private final String thucTheTacDong;
    private final Long idBanGhi;
    private final String duLieuTruoc;
    private final String duLieuSau;
    private final String diaChiIp;
    private final LocalDateTime thoiGianThaoTac;
}
