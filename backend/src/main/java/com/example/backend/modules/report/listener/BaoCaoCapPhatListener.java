package com.example.backend.modules.report.listener;

import com.example.backend.modules.report.model.BaoCaoCapPhat;
import com.example.backend.modules.report.model.ChiTietSuDung;
import com.example.backend.modules.report.repository.BaoCaoCapPhatRepository;
import com.example.backend.modules.report.repository.ChiTietSuDungRepository;
import com.example.backend.modules.asset.model.DanhSachThietBiPhanCung;
import com.example.backend.modules.asset.model.DanhSachThietBiPhanMem;
import com.example.backend.modules.asset.model.LinhKienPhanCung;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanCungRepository;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanMemRepository;
import com.example.backend.modules.asset.repository.LinhKienPhanCungRepository;
import com.example.backend.modules.tenant.model.PhongBan;
import com.example.backend.modules.tenant.repository.PhongBanRepository;
import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.auth.repository.NguoiDungRepository;
import com.example.backend.shared.dto.BienDongCapPhatEvent;

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
public class BaoCaoCapPhatListener {

     private final BaoCaoCapPhatRepository baoCaoCapPhatRepository;
     private final ChiTietSuDungRepository chiTietSuDungRepository;

     // Đối soát chính xác 100% tên biến Repository phân hệ Core tĩnh từ mã nguồn của
     // cậu
     private final DanhSachThietBiPhanCungRepository thietBiPhanCungRepository;
     private final DanhSachThietBiPhanMemRepository thietBiPhanMemRepository;
     private final LinhKienPhanCungRepository linhKienPhanCungRepository;
     private final PhongBanRepository phongBanRepository;
     private final NguoiDungRepository nguoiDungRepository;

     @RabbitListener(queues = "inventory.bien-dong-cap-phat.queue")
     @Transactional
     public void xuLyBienDongCapPhatNgam(BienDongCapPhatEvent event) {
          log.info("RabbitMQ Worker - Tiếp nhận gói tin kết toán cấp phát sử dụng: {}, Cá thể ID: {}",
                    event.getHanhDong(), event.getIdTaiSanCuThe());
          try {
               Long idTaiSanDanhMuc = null;
               String tenTaiSanDanhMuc = "Tài sản cấp phát";
               String maTaiSanDanhMuc = "";
               String soSerial = "";
               String maTheTaiSan = "";
               BigDecimal giaMuaTaiSan = BigDecimal.ZERO;

               // 1. Phân nhánh trích xuất thông tin an toàn từ Entity Core tĩnh của cậu phục
               // vụ cache UI phẳng
               if ("PHAN_CUNG".equalsIgnoreCase(event.getLoaiTaiSan())) {
                    Optional<DanhSachThietBiPhanCung> pcOpt = thietBiPhanCungRepository
                              .findById(event.getIdTaiSanCuThe());
                    if (pcOpt.isPresent()) {
                         DanhSachThietBiPhanCung pc = pcOpt.get();
                         soSerial = pc.getSoSerial();
                         maTheTaiSan = pc.getMaTheTaiSan();
                         // Lũy kế giá trị bằng tiền VND dựa trên giá mua gốc của thiết bị phần cứng
                         giaMuaTaiSan = pc.getGiaMua() != null ? pc.getGiaMua() : BigDecimal.ZERO;
                         if (pc.getTaiSanPhanCung() != null) {
                              idTaiSanDanhMuc = pc.getTaiSanPhanCung().getId();
                              tenTaiSanDanhMuc = pc.getTaiSanPhanCung().getTenMau();
                         }
                    }
               } else if ("PHAN_MEM".equalsIgnoreCase(event.getLoaiTaiSan())) {
                    Optional<DanhSachThietBiPhanMem> pmOpt = thietBiPhanMemRepository
                              .findById(event.getIdTaiSanCuThe());
                    if (pmOpt.isPresent()) {
                         DanhSachThietBiPhanMem pm = pmOpt.get();
                         soSerial = "";
                         maTheTaiSan = pm.getKeyBanQuyen(); // Ánh xạ mã key bản quyền làm mã thẻ tài sản số
                         if (pm.getTaiSanPhanMem() != null) {
                              idTaiSanDanhMuc = pm.getTaiSanPhanMem().getId();
                              tenTaiSanDanhMuc = pm.getTaiSanPhanMem().getTenMau();
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
                         }
                    }
               }

               // 2. Điều hướng toán tử kết toán Summary và chèn dòng nhật ký phẳng sử dụng
               // vĩnh viễn
               switch (event.getHanhDong()) {
                    case CAP_PHAT -> {
                         // Tăng số lượng bàn giao và cộng dồn dòng tiền lũy kế cho Phòng ban tiếp nhận
                         // mới
                         BaoCaoCapPhat responseMoi = congSoLieuPhongBan(event, event.getIdPhongBanMoi(),
                                   idTaiSanDanhMuc, tenTaiSanDanhMuc, maTaiSanDanhMuc, giaMuaTaiSan);
                         ghiLogChiTietSuDung(event, responseMoi, soSerial, maTheTaiSan, tenTaiSanDanhMuc);
                    }
                    case THU_HOI -> {
                         // Khấu trừ sụt giảm số lượng và tiền tài sản của Phòng ban cũ hoàn trả máy
                         truSoLieuPhongBan(event, event.getIdPhongBanCu(), idTaiSanDanhMuc, giaMuaTaiSan);

                         // Ghi nhận log hành trình tài sản rời phòng ban cũ giải phóng về kho chứa
                         ghiLogChiTietSuDung(event, null, soSerial, maTheTaiSan, tenTaiSanDanhMuc);
                    }
                    case DIEU_CHUYEN -> {
                         // Kết hợp chu trình dịch chuyển: Khấu trừ Phòng ban cũ và Tăng số liệu Phòng
                         // ban mới
                         truSoLieuPhongBan(event, event.getIdPhongBanCu(), idTaiSanDanhMuc, giaMuaTaiSan);
                         BaoCaoCapPhat responseMoi = congSoLieuPhongBan(event, event.getIdPhongBanMoi(),
                                   idTaiSanDanhMuc, tenTaiSanDanhMuc, maTaiSanDanhMuc, giaMuaTaiSan);

                         // Ghi nhận log phẳng gán liền mã thông tin người dùng ký nhận mới tinh
                         ghiLogChiTietSuDung(event, responseMoi, soSerial, maTheTaiSan, tenTaiSanDanhMuc);
                    }
               }
               log.info("RabbitMQ Worker - Kết toán dòng tiền phân bổ thành công cho chứng từ gốc: {}",
                         event.getMaChungTuGoc());
          } catch (Exception e) {
               log.error("Lỗi kết toán cộng dồn số liệu cấp phát sử dụng chạy ngầm: {}", e.getMessage(), e);
               throw e;
          }
     }

     private BaoCaoCapPhat congSoLieuPhongBan(BienDongCapPhatEvent event, Long idPhongBan, Long idDanhMuc,
               String tenDanhMuc, String maDanhMuc, BigDecimal giaMuc) {
          BaoCaoCapPhat bc = baoCaoCapPhatRepository
                    .findByIdDonViAndIdPhongBanAndIdTaiSanDanhMucAndLoaiTaiSanAndThoiGianXoaIsNull(
                              event.getIdDonVi(), idPhongBan, idDanhMuc, event.getLoaiTaiSan())
                    .orElseGet(() -> {
                         String tenPB = phongBanRepository.findById(idPhongBan).map(PhongBan::getTenPhongBan)
                                   .orElse("Phòng ban tiếp nhận");
                         BaoCaoCapPhat newBc = new BaoCaoCapPhat();
                         newBc.setIdDonVi(event.getIdDonVi());
                         newBc.setIdPhongBan(idPhongBan);
                         newBc.setTenPhongBan(tenPB);
                         newBc.setIdTaiSanDanhMuc(idDanhMuc);
                         newBc.setTenTaiSanDanhMuc(tenDanhMuc);
                         newBc.setMaTaiSanDanhMuc(maDanhMuc);
                         newBc.setLoaiTaiSan(event.getLoaiTaiSan());
                         newBc.setSoLuongCap(0);
                         newBc.setTongGiaTriCap(BigDecimal.ZERO);
                         newBc.setThoiGianCapNhat(LocalDateTime.now());
                         return newBc;
                    });

          bc.setSoLuongCap(bc.getSoLuongCap() + 1);
          bc.setTongGiaTriCap(bc.getTongGiaTriCap().add(giaMuc));
          bc.setThoiGianCapNhat(LocalDateTime.now());
          return baoCaoCapPhatRepository.save(bc);
     }

     private void truSoLieuPhongBan(BienDongCapPhatEvent event, Long idPhongBan, Long idDanhMuc, BigDecimal giaMuc) {
          baoCaoCapPhatRepository.findByIdDonViAndIdPhongBanAndIdTaiSanDanhMucAndLoaiTaiSanAndThoiGianXoaIsNull(
                    event.getIdDonVi(), idPhongBan, idDanhMuc, event.getLoaiTaiSan()).ifPresent(bc -> {
                         bc.setSoLuongCap(Math.max(0, bc.getSoLuongCap() - 1));
                         BigDecimal currentTotal = bc.getTongGiaTriCap();
                         BigDecimal newTotal = currentTotal.subtract(giaMuc);
                         bc.setTongGiaTriCap(newTotal.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : newTotal);
                         bc.setThoiGianCapNhat(LocalDateTime.now());
                         baoCaoCapPhatRepository.save(bc);
                    });
     }

     private void ghiLogChiTietSuDung(BienDongCapPhatEvent event, BaoCaoCapPhat bc, String serial, String maThe,
               String tenDanhMuc) {
          // Ánh xạ chính xác logic dựng Họ Tên Người Dùng không dấu viết liền từ file
          // đính kèm của Đạt
          String hoTenNhanVien = null;
          if (event.getIdNhanVienTiepNhan() != null) {
               hoTenNhanVien = nguoiDungRepository.findById(event.getIdNhanVienTiepNhan()).map(nd -> {
                    StringBuilder sb = new StringBuilder();
                    if (nd.getHoNguoiDung() != null)
                         sb.append(nd.getHoNguoiDung().trim()).append(" ");
                    if (nd.getTenDemNguoiDung() != null)
                         sb.append(nd.getTenDemNguoiDung().trim()).append(" ");
                    if (nd.getTenNguoiDung() != null)
                         sb.append(nd.getTenNguoiDung().trim());
                    return sb.toString().trim();
               }).orElse(null);
          }

          ChiTietSuDung ct = ChiTietSuDung.builder()
                    .idDonVi(event.getIdDonVi())
                    .baoCaoCapPhat(bc) // Sẽ nhận null nếu tài sản bị thu hồi vĩnh viễn về kho bãi tĩnh
                    .idTaiSanCuThe(event.getIdTaiSanCuThe())
                    .tenTaiSanCuThe(tenDanhMuc)
                    .soSerial(serial)
                    .maTheTaiSan(maThe)
                    .loaiTaiSan(event.getLoaiTaiSan())
                    .idNhanVienTiepNhan(event.getIdNhanVienTiepNhan())
                    .hoTenNhanVienTiepNhan(hoTenNhanVien)
                    .idChungTuGoc(event.getIdChungTuGoc())
                    .maChungTuGoc(event.getMaChungTuGoc())
                    .tinhTrangBanGiao(event.getTinhTrangBanGiao() != null ? event.getTinhTrangBanGiao() : "Bình thường")
                    .thoiGianThucHien(LocalDateTime.now())
                    .build();

          chiTietSuDungRepository.save(ct);
     }
}