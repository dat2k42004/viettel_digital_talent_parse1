package com.example.backend.modules.inventory.listener;

import com.example.backend.modules.inventory.model.*;
import com.example.backend.modules.inventory.repository.*;
import com.example.backend.shared.dto.TongHopPhieuKiemKeEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DotKiemKeListener {

     private final PhieuKiemKeRepository phieuKiemKeRepository;
     private final DotKiemKeRepository dotKiemKeRepository;

     // Đối soát chính xác 100% tên biến khai báo Repository từ file gốc của cậu
     private final ChiTietKiemKePhanCungRepository chiTietKiemKeThietBiRepository;
     private final ChiTietKiemKeLinhKienRepository chiTietKiemKeLinhKienRepository;
     private final ChiTietKiemKePhanMemRepository chiTietKiemKePhanMemRepository;

     @RabbitListener(queues = "inventory.dot-kiem-ke-aggregate.queue")
     @Transactional
     public void xuLyTongHopPhieuKiemKe(TongHopPhieuKiemKeEvent event) {
          log.info("RabbitMQ Worker - Nhận lệnh kết toán dữ liệu từ phiếu kiểm kê ID: {}", event.getIdPhieuKiemKe());
          try {
               PhieuKiemKe phieu = phieuKiemKeRepository.findById(event.getIdPhieuKiemKe())
                         .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin phiếu kiểm kê"));

               DotKiemKe dkk = phieu.getDotKiemKe();
               if (dkk != null) {
                    // 1. Quét toàn bộ phiếu con trực thuộc chiến dịch kiểm kê này
                    List<PhieuKiemKe> allTickets = phieuKiemKeRepository
                              .findByDotKiemKeIdAndThoiGianXoaIsNull(dkk.getId());

                    // 2. Kiểm tra xem toàn bộ 100% phòng ban đã được xác nhận nghiệm thu kết quả
                    // chưa
                    boolean clearAll = allTickets.stream()
                              .allMatch(x -> x.getTrangThai() == TrangThaiPhieuKiemKeEnum.XAC_NHAN);

                    if (clearAll) {
                         // 3. Đẩy trạng thái đợt tổng kết vĩnh viễn sang HOAN_THANH
                         dkk.setTrangThai(TrangThaiKiemKeEnum.HOAN_THANH);
                         dkk.setThoiGianChotSoLieu(LocalDateTime.now());

                         int systemTotal = 0;
                         int actualTotal = 0;

                         for (PhieuKiemKe ticket : allTickets) {
                              // 3.1 Cộng dồn số liệu Phần cứng (Thiết bị)
                              List<ChiTietKiemKePhanCung> listPcs = chiTietKiemKeThietBiRepository
                                        .findByPhieuKiemKeIdAndThoiGianXoaIsNull(ticket.getId());
                              systemTotal += listPcs.size();
                              actualTotal += listPcs.stream().filter(x -> "KHOP".equalsIgnoreCase(x.getKetLuan()))
                                        .count();

                              // 3.2 Cộng dồn số liệu Linh kiện phần cứng rời
                              List<ChiTietKiemKeLinhKien> listLks = chiTietKiemKeLinhKienRepository
                                        .findByPhieuKiemKeIdAndThoiGianXoaIsNull(ticket.getId());
                              systemTotal += listLks.size();
                              actualTotal += listLks.stream().filter(x -> "KHOP".equalsIgnoreCase(x.getKetLuan()))
                                        .count();

                              // 3.3 Cộng dồn số liệu Bản quyền phần mềm ứng dụng
                              List<ChiTietKiemKePhanMem> listPms = chiTietKiemKePhanMemRepository
                                        .findByPhieuKiemKeIdAndThoiGianXoaIsNull(ticket.getId());
                              systemTotal += listPms.size();
                              actualTotal += listPms.stream().filter(x -> "KHOP".equalsIgnoreCase(x.getKetLuan()))
                                        .count();
                         }

                         dkk.setTongTaiSanHeThong(systemTotal);
                         dkk.setTongTaiSanThucTe(actualTotal);
                         dotKiemKeRepository.save(dkk);
                         log.info("RabbitMQ Worker - Đã hoàn tất nghiệm thu toàn bộ đơn vị, đóng chiến dịch kiểm kê tổng ID: {}",
                                   dkk.getId());
                    } else {
                         log.info("Đợt kiểm kê ID: {} vẫn còn phòng ban cơ sở chưa nghiệm thu xong số liệu.",
                                   dkk.getId());
                    }
               }
          } catch (Exception e) {
               log.error("Lỗi kết toán cộng dồn số liệu kiểm kê chạy ngầm: {}", e.getMessage(), e);
               throw e;
          }
     }
}