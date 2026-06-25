package com.example.backend.modules.report.listener;

import com.example.backend.modules.report.model.BaoCaoBaoTri;
import com.example.backend.modules.report.model.ChiTietBaoTri;
import com.example.backend.modules.report.repository.BaoCaoBaoTriRepository;
import com.example.backend.modules.report.repository.ChiTietBaoTriRepository;
import com.example.backend.modules.asset.model.DanhSachThietBiPhanCung;
import com.example.backend.modules.asset.model.LinhKienPhanCung;
import com.example.backend.modules.asset.model.DanhSachThietBiPhanMem;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanCungRepository;
import com.example.backend.modules.asset.repository.LinhKienPhanCungRepository;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanMemRepository;
import com.example.backend.shared.dto.BienDongBaoTriEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class BaoCaoBaoTriListener {

     private final BaoCaoBaoTriRepository baoCaoBaoTriRepository;
     private final ChiTietBaoTriRepository chiTietBaoTriRepository;

     private final DanhSachThietBiPhanCungRepository thietBiPhanCungRepository;
     private final LinhKienPhanCungRepository linhKienPhanCungRepository;
     private final DanhSachThietBiPhanMemRepository thietBiPhanMemRepository;

     @RabbitListener(queues = "inventory.bien-dong-bao-tri.queue")
     @Transactional
     public void xuLyBienDongBaoTriNgam(BienDongBaoTriEvent event) {
          log.info("RabbitMQ Worker - Nhận lệnh kết toán ngân sách chi phí bảo trì: {}, Tài sản cá thể ID: {}",
                    event.getLoaiTaiSan(), event.getIdTaiSanCuThe());
          try {
               Long idTaiSanDanhMuc = null;
               String tenTaiSanDanhMuc = "Tài sản bảo dưỡng";
               String maTaiSanDanhMuc = "";
               String soSerial = "";
               String maTheTaiSan = "";

               // 1. Phân nhánh trích xuất thông tin an toàn từ Entity Core
               if ("PHAN_CUNG".equalsIgnoreCase(event.getLoaiTaiSan())) {
                    Optional<DanhSachThietBiPhanCung> pcOpt = thietBiPhanCungRepository
                              .findById(event.getIdTaiSanCuThe());
                    if (pcOpt.isPresent()) {
                         DanhSachThietBiPhanCung pc = pcOpt.get();
                         soSerial = pc.getSoSerial();
                         maTheTaiSan = pc.getMaTheTaiSan();
                         if (pc.getTaiSanPhanCung() != null) {
                              idTaiSanDanhMuc = pc.getTaiSanPhanCung().getId();
                              tenTaiSanDanhMuc = pc.getTaiSanPhanCung().getTenMau();
                              maTaiSanDanhMuc = pc.getTaiSanPhanCung().getMaMau();
                         }
                    }
               } else if ("LINH_KIEN".equalsIgnoreCase(event.getLoaiTaiSan())) {
                    Optional<LinhKienPhanCung> lkOpt = linhKienPhanCungRepository.findById(event.getIdTaiSanCuThe());
                    if (lkOpt.isPresent()) {
                         LinhKienPhanCung lk = lkOpt.get();
                         soSerial = lk.getSoSerial();
                         maTheTaiSan = "";
                         if (lk.getTaiSanPhanCung() != null) {
                              idTaiSanDanhMuc = lk.getTaiSanPhanCung().getId();
                              tenTaiSanDanhMuc = lk.getTaiSanPhanCung().getTenMau();
                              maTaiSanDanhMuc = lk.getTaiSanPhanCung().getMaMau();
                         }
                    }
               } else if ("PHAN_MEM".equalsIgnoreCase(event.getLoaiTaiSan())) {
                    Optional<DanhSachThietBiPhanMem> pmOpt = thietBiPhanMemRepository
                              .findById(event.getIdTaiSanCuThe());
                    if (pmOpt.isPresent()) {
                         DanhSachThietBiPhanMem pm = pmOpt.get();
                         soSerial = "";
                         maTheTaiSan = pm.getKeyBanQuyen();
                         if (pm.getTaiSanPhanMem() != null) {
                              idTaiSanDanhMuc = pm.getTaiSanPhanMem().getId();
                              tenTaiSanDanhMuc = pm.getTaiSanPhanMem().getTenMau();
                              maTaiSanDanhMuc = pm.getTaiSanPhanMem().getMaMau();
                         }
                    }
               }

               // 2. ĐẬP BỎ OR_ELSE_GET LAMBDA -> Thay bằng khối lệnh if-else thuần túy để nuốt
               // gọn lỗi hằng số local
               Optional<BaoCaoBaoTri> bcOpt = baoCaoBaoTriRepository
                         .findByIdDonViAndIdTaiSanDanhMucAndLoaiTaiSanAndThoiGianXoaIsNull(
                                   event.getIdDonVi(), idTaiSanDanhMuc, event.getLoaiTaiSan());

               BaoCaoBaoTri bc;
               if (bcOpt.isPresent()) {
                    bc = bcOpt.get();
               } else {
                    bc = new BaoCaoBaoTri();
                    bc.setIdDonVi(event.getIdDonVi());
                    bc.setIdTaiSanDanhMuc(idTaiSanDanhMuc);
                    bc.setTenTaiSanDanhMuc(tenTaiSanDanhMuc);
                    bc.setMaTaiSanDanhMuc(maTaiSanDanhMuc);
                    bc.setLoaiTaiSan(event.getLoaiTaiSan());
                    bc.setSoLuong(0);
                    bc.setTongChiPhi(BigDecimal.ZERO);
                    bc.setTongThoiGian(0);
               }

               // 3. Tiến hành toán tử cộng dồn lũy kế ngân sách và thời gian gián đoạn
               // (Downtime)
               bc.setSoLuong(bc.getSoLuong() + 1);
               if (event.getChiPhiThucTe() != null) {
                    bc.setTongChiPhi(bc.getTongChiPhi().add(event.getChiPhiThucTe()));
               }
               if (event.getThoiGianGianDoan() != null) {
                    bc.setTongThoiGian(bc.getTongThoiGian() + event.getThoiGianGianDoan());
               }
               BaoCaoBaoTri savedBc = baoCaoBaoTriRepository.save(bc);

               // 4. INSERT bản ghi phẳng nhật ký hành trình vào ChiTietBaoTri phục vụ kết xuất
               // UI
               ChiTietBaoTri ct = ChiTietBaoTri.builder()
                         .idDonVi(event.getIdDonVi())
                         .baoCaoBaoTri(savedBc)
                         .idTaiSanCuThe(event.getIdTaiSanCuThe())
                         .tenTaiSanCuThe(tenTaiSanDanhMuc)
                         .soSerial(soSerial)
                         .maTheTaiSan(maTheTaiSan)
                         .loaiTaiSan(event.getLoaiTaiSan())
                         .idPhieuSuaChua(event.getIdPhieuSuaChua())
                         .maPhieuSuaChua(event.getMaPhieuSuaChua())
                         .chiPhiThucTe(event.getChiPhiThucTe() != null ? event.getChiPhiThucTe() : BigDecimal.ZERO)
                         .thoiGianGianDoan(event.getThoiGianGianDoan() != null ? event.getThoiGianGianDoan() : 0)
                         .noiDungKhacPhuc(event.getNoiDungKhacPhuc() != null ? event.getNoiDungKhacPhuc()
                                   : "Bảo trì định kỳ hệ thống")
                         .thoiGianNghiemThu(LocalDateTime.now())
                         .build();

               chiTietBaoTriRepository.save(ct);
               log.info("RabbitMQ Worker - Kết toán ngân sách bảo trì thành công cho chứng từ gốc: {}",
                         event.getMaPhieuSuaChua());
          } catch (Exception e) {
               log.error("Lỗi kết toán tích lũy số liệu chi phí bảo trì chạy ngầm: {}", e.getMessage(), e);
               throw e;
          }
     }
}