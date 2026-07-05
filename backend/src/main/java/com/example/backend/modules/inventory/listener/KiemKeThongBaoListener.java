package com.example.backend.modules.inventory.listener;

import com.example.backend.modules.inventory.service.interfaces.PhieuKiemKeService;
import com.example.backend.shared.dto.NhacNhoKiemKeEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class KiemKeThongBaoListener {

    private final PhieuKiemKeService phieuKiemKeService;

    @EventListener
    public void onNhacNhoKiemKe(NhacNhoKiemKeEvent event) {
        log.info("Nhận sự kiện nhắc nhở kiểm kê cho đợt ID: {}", event.getIdDotKiemKe());
        try {
            phieuKiemKeService.nhacNhoTruongPhongKiemKe(event.getIdDotKiemKe());
        } catch (Exception e) {
            log.error("Lỗi khi xử lý email nhắc nhở kiểm kê cho đợt ID = {}: {}", event.getIdDotKiemKe(), e.getMessage(), e);
        }
    }
}
