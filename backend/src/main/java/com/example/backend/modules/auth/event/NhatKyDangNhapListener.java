package com.example.backend.modules.auth.event;

import com.example.backend.modules.auth.model.NhatKyDangNhap;
import com.example.backend.modules.auth.repository.NhatKyDangNhapRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NhatKyDangNhapListener {

    private final NhatKyDangNhapRepository nhatKyDangNhapRepository;

    @Async
    @EventListener
    public void handleDangNhapEvent(DangNhapEvent event) {
        try {
            NhatKyDangNhap logEntry = new NhatKyDangNhap();
            if (event.getNguoiDung() != null) {
                logEntry.setNguoiDung(event.getNguoiDung());
                logEntry.setIdDonVi(event.getNguoiDung().getIdDonVi());
            }
            logEntry.setTenDangNhap(event.getTenDangNhap());
            logEntry.setKetQua(event.getKetQua());
            logEntry.setDiaChiIp(event.getDiaChiIp());
            logEntry.setTrinhDuyet(event.getTrinhDuyet());
            
            nhatKyDangNhapRepository.save(logEntry);
            log.info("Đã lưu nhật ký đăng nhập cho user: {} - Kết quả: {}", event.getTenDangNhap(), event.getKetQua());
        } catch (Exception e) {
            log.error("Lỗi khi lưu nhật ký đăng nhập: ", e);
        }
    }
}
