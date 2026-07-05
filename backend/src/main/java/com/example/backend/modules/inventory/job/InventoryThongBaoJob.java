package com.example.backend.modules.inventory.job;

import com.example.backend.modules.inventory.service.interfaces.PhieuKiemKeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryThongBaoJob {

     private final PhieuKiemKeService phieuKiemKeService;

     // Chạy lúc 7:30 sáng hàng ngày để quét nhắc nhở các đợt kiểm kê chưa hoàn thành
     @Scheduled(cron = "0 30 7 * * ?")
     public void chayJobNhacNhoKiemKe() {
          log.info("Bắt đầu Job tự động nhắc nhở đợt kiểm kê đang thực hiện...");
          try {
               phieuKiemKeService.nhacNhoKiemKe();
               log.info("Hoàn thành Job tự động nhắc nhở đợt kiểm kê đang thực hiện.");
          } catch (Exception e) {
               log.error("Lỗi khi chạy Job tự động nhắc nhở đợt kiểm kê đang thực hiện: {}", e.getMessage(), e);
          }
     }
}
