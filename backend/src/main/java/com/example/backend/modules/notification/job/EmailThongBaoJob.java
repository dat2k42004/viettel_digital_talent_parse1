package com.example.backend.modules.notification.job;

import com.example.backend.modules.notification.service.interfaces.EmailThongBaoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailThongBaoJob {

     private final EmailThongBaoService emailThongBaoService;

     // Chạy lúc 7:00 sáng hàng ngày để quét chứng từ tồn đọng
     @Scheduled(cron = "0 0 7 * * ?")
     public void chayJobNhacNhoChungTuTonDong() {
          log.info("Bắt đầu Job tự động nhắc nhở chứng từ tồn đọng...");
          try {
               emailThongBaoService.nhacNhoChungTuTonDong();
               log.info("Hoàn thành Job tự động nhắc nhở chứng từ tồn đọng.");
          } catch (Exception e) {
               log.error("Lỗi khi chạy Job tự động nhắc nhở chứng từ tồn đọng: {}", e.getMessage(), e);
          }
     }

     // Chạy lúc 7:15 sáng hàng ngày để quét tài sản/bản quyền sắp hết hạn
     @Scheduled(cron = "0 15 7 * * ?")
     public void chayJobCanhBaoHetHanTaiSan() {
          log.info("Bắt đầu Job tự động cảnh báo hết hạn tài sản...");
          try {
               emailThongBaoService.canhBaoHetHanTaiSan();
               log.info("Hoàn thành Job tự động cảnh báo hết hạn tài sản.");
          } catch (Exception e) {
               log.error("Lỗi khi chạy Job tự động cảnh báo hết hạn tài sản: {}", e.getMessage(), e);
          }
     }

}
