package com.example.backend.shared.config;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.example.backend.shared.service.interfaces.NhatKyThaoTacHeThongService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class CleanUpLogScheduler {

     private final NhatKyThaoTacHeThongService nhatKyThaoTacHeThongService;

     @Scheduled(cron = "0 0 2 1 * ?")
     public void tuDongDonDepLogHangThang() {
          log.info("--- KÍCH HOẠT TIẾN TRÌNH TỰ ĐỘNG DỌN DẸP LOG ĐỊNH KỲ HÀNG THÁNG ---");

          int soThangGiuLai = 1;

          try {
               nhatKyThaoTacHeThongService.donDepLogCu(soThangGiuLai);
          } catch (Exception e) {
               log.error("Lỗi xảy ra trong tiến trình dọn dẹp tự động: ", e);
          }

          log.info("--- TIẾN TRÌNH TỰ ĐỘNG DỌN DẸP LOG KẾT THÚC ---");
     }
}
