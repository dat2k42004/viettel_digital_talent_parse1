package com.example.backend.shared.event;

import com.example.backend.shared.model.NhatKyThaoTacHeThong;
import com.example.backend.shared.repository.NhatKyThaoTacHeThongRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NhatKyThaoTacListener {

    private final NhatKyThaoTacHeThongRepository repository;

    @Async
    @EventListener
    public void handleNhatKyThaoTac(NhatKyThaoTacEvent event) {
        try {
            NhatKyThaoTacHeThong logEntry = NhatKyThaoTacHeThong.builder()
                    .idTaiKhoanThaoTac(event.getIdTaiKhoanThaoTac())
                    .phuongThucApi(event.getPhuongThucApi())
                    .endpointApi(event.getEndpointApi())
                    .thucTheTacDong(event.getThucTheTacDong())
                    .idBanGhi(event.getIdBanGhi())
                    .duLieuTruoc(event.getDuLieuTruoc())
                    .duLieuSau(event.getDuLieuSau())
                    .diaChiIp(event.getDiaChiIp())
                    .thoiGianThaoTac(event.getThoiGianThaoTac())
                    .build();

            repository.save(logEntry);
        } catch (Exception e) {
            log.error("Lỗi khi lưu nhật ký thao tác hệ thống bất đồng bộ: ", e);
        }
    }
}
