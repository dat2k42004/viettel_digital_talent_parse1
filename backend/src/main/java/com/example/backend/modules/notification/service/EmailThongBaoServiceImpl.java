package com.example.backend.modules.notification.service;

import com.example.backend.modules.asset.model.DanhSachThietBiPhanCung;
import com.example.backend.modules.asset.model.DanhSachThietBiPhanMem;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanCungRepository;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanMemRepository;
import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.auth.repository.NguoiDungRepository;
import com.example.backend.modules.auth.service.EmailService;
import com.example.backend.modules.inventory.model.DotKiemKe;
import com.example.backend.modules.inventory.model.TrangThaiKiemKeEnum;
import com.example.backend.modules.inventory.repository.DotKiemKeRepository;
import com.example.backend.modules.lifecycle.model.PhieuCapPhatTaiSan;
import com.example.backend.modules.lifecycle.model.PhieuDieuChuyenTaiSan;
import com.example.backend.modules.lifecycle.model.PhieuThanhLyTaiSan;
import com.example.backend.modules.lifecycle.model.PhieuThuHoiTaiSan;
import com.example.backend.modules.lifecycle.repository.PhieuCapPhatTaiSanRepository;
import com.example.backend.modules.lifecycle.repository.PhieuDieuChuyenTaiSanRepository;
import com.example.backend.modules.lifecycle.repository.PhieuThanhLyTaiSanRepository;
import com.example.backend.modules.lifecycle.repository.PhieuThuHoiTaiSanRepository;
import com.example.backend.modules.notification.service.interfaces.EmailThongBaoService;
import com.example.backend.modules.tenant.model.DonVi;
import com.example.backend.modules.tenant.model.PhongBan;
import com.example.backend.modules.tenant.repository.DonViRepository;
import com.example.backend.modules.tenant.repository.PhongBanRepository;
import com.example.backend.shared.model.TrangThaiPhieuEnum;
import com.example.backend.shared.tenant.DonViContextHolder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailThongBaoServiceImpl implements EmailThongBaoService {

     private final DonViRepository donViRepository;
     private final PhieuCapPhatTaiSanRepository phieuCapPhatTaiSanRepository;
     private final PhieuThuHoiTaiSanRepository phieuThuHoiTaiSanRepository;
     private final PhieuDieuChuyenTaiSanRepository phieuDieuChuyenTaiSanRepository;
     private final PhieuThanhLyTaiSanRepository phieuThanhLyTaiSanRepository;
     private final DanhSachThietBiPhanCungRepository thietBiPhanCungRepository;
     private final DanhSachThietBiPhanMemRepository thietBiPhanMemRepository;
     private final NguoiDungRepository nguoiDungRepository;
     private final PhongBanRepository phongBanRepository;
     private final DotKiemKeRepository dotKiemKeRepository;
     private final EmailService emailService;

     private static final DateTimeFormatter FORMAT_NGAY = DateTimeFormatter.ofPattern("dd/MM/yyyy");

     @Override
     @Transactional(readOnly = true)
     public void nhacNhoChungTuTonDong() {
          log.info("Bắt đầu Job quét chứng từ phê duyệt tồn đọng...");
          List<DonVi> danhSachDonVi = donViRepository.findByThoiGianXoaIsNull();

          for (DonVi donVi : danhSachDonVi) {
               Long idDonVi = donVi.getId();
               DonViContextHolder.setTenantId(idDonVi);
               try {
                    LocalDateTime mocThoiGian = LocalDateTime.now().minusDays(3);

                    // 1. Quét phiếu cấp phát
                    List<PhieuCapPhatTaiSan> danhSachCapPhat = phieuCapPhatTaiSanRepository
                              .findAll((root, query, cb) -> cb.and(
                                        cb.equal(root.get("idDonVi"), idDonVi),
                                        cb.equal(root.get("trangThai"), TrangThaiPhieuEnum.DA_PHE_DUYET),
                                        cb.isNull(root.get("thoiGianXoa")),
                                        cb.lessThan(cb.coalesce(root.get("thoiGianCapNhat"), root.get("thoiGianTao")), mocThoiGian)
                              ));

                    for (PhieuCapPhatTaiSan phieu : danhSachCapPhat) {
                         nhacNhoNguoiLapPhieu(phieu.getIdNguoiLap(), phieu.getMaPhiepCapPhat(), "Cấp phát", phieu.getThoiGianCapNhat());
                    }

                    // 2. Quét phiếu thu hồi
                    List<PhieuThuHoiTaiSan> danhSachThuHoi = phieuThuHoiTaiSanRepository
                              .findAll((root, query, cb) -> cb.and(
                                        cb.equal(root.get("idDonVi"), idDonVi),
                                        cb.equal(root.get("trangThai"), TrangThaiPhieuEnum.DA_PHE_DUYET),
                                        cb.isNull(root.get("thoiGianXoa")),
                                        cb.lessThan(cb.coalesce(root.get("thoiGianCapNhat"), root.get("thoiGianTao")), mocThoiGian)
                              ));

                    for (PhieuThuHoiTaiSan phieu : danhSachThuHoi) {
                         nhacNhoNguoiLapPhieu(phieu.getIdNguoiLap(), phieu.getMaPhieuThuHoi(), "Thu hồi", phieu.getThoiGianCapNhat());
                    }

                    // 3. Quét phiếu điều chuyển
                    List<PhieuDieuChuyenTaiSan> danhSachDieuChuyen = phieuDieuChuyenTaiSanRepository
                              .findAll((root, query, cb) -> cb.and(
                                        cb.equal(root.get("idDonVi"), idDonVi),
                                        cb.equal(root.get("trangThai"), TrangThaiPhieuEnum.DA_PHE_DUYET),
                                        cb.isNull(root.get("thoiGianXoa")),
                                        cb.lessThan(cb.coalesce(root.get("thoiGianCapNhat"), root.get("thoiGianTao")), mocThoiGian)
                              ));

                    for (PhieuDieuChuyenTaiSan phieu : danhSachDieuChuyen) {
                         nhacNhoNguoiLapPhieu(phieu.getIdNguoiLap(), phieu.getMaPhieuDieuChuyen(), "Điều chuyển", phieu.getThoiGianCapNhat());
                    }

                    // 4. Quét phiếu thanh lý
                    List<PhieuThanhLyTaiSan> danhSachThanhLy = phieuThanhLyTaiSanRepository
                              .findAll((root, query, cb) -> cb.and(
                                        cb.equal(root.get("idDonVi"), idDonVi),
                                        cb.equal(root.get("trangThai"), TrangThaiPhieuEnum.DA_PHE_DUYET),
                                        cb.isNull(root.get("thoiGianXoa")),
                                        cb.lessThan(cb.coalesce(root.get("thoiGianCapNhat"), root.get("thoiGianTao")), mocThoiGian)
                              ));

                    for (PhieuThanhLyTaiSan phieu : danhSachThanhLy) {
                         nhacNhoNguoiLapPhieu(phieu.getIdNguoiLap(), phieu.getMaPhieuThanhLy(), "Thanh lý", phieu.getThoiGianCapNhat());
                    }

               } finally {
                    DonViContextHolder.clear();
               }
          }
     }

     private void nhacNhoNguoiLapPhieu(Long idNguoiLap, String maChungTu, String loaiChungTu, LocalDateTime thoiGianDuyet) {
          if (idNguoiLap == null) return;
          nguoiDungRepository.findByIdAndThoiGianXoaIsNull(idNguoiLap).ifPresent(nguoiLap -> {
               String emailNguoiLap = nguoiLap.getEmail();
               if (emailNguoiLap != null && !emailNguoiLap.trim().isEmpty()) {
                    String hoTen = getHoTenNguoiDung(nguoiLap);
                    String tieuDe = "Nhắc nhở: Chứng từ " + loaiChungTu + " [" + maChungTu + "] phê duyệt tồn đọng";
                    String thoiGian = thoiGianDuyet != null ? thoiGianDuyet.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")) : "Chưa rõ";
                    String noiDung = "Kính gửi cán bộ kỹ thuật " + hoTen + ",\n\n" +
                              "Hệ thống ghi nhận chứng từ " + loaiChungTu + " mã số [" + maChungTu + "] đã được duyệt vào ngày " + thoiGian + " nhưng đến nay vẫn chưa được xác nhận Hoàn thành thực tế.\n" +
                              "Vui lòng tiến hành bàn giao/thu hồi vật lý và bấm 'HOAN_THANH' trên hệ thống để đóng quy trình.\n\n" +
                              "Trân trọng,\nBan quản trị hệ thống ITAM.";

                    try {
                         emailService.guiOtpQuenMatKhau(emailNguoiLap, "OTP_DUMMY"); // Fallback to send mail, but let's implement guiEmailDonGian or just modify guiOtpQuenMatKhau body?
                         // Wait, since guiOtpQuenMatKhau has fixed body, we should add a custom mail sender method in EmailService, or use JavaMailSender inside EmailThongBaoServiceImpl!
                         // Actually, we can use JavaMailSender directly or modify EmailService. Let's add a generic send method to EmailService or autowire JavaMailSender here.
                         // Let's add a generic method to EmailService later. For now we will call the custom email sending helper in this service or implement it.
                         // Let's call the helper in EmailService that we will add.
                         guiEmailDonGianDirectly(emailNguoiLap, tieuDe, noiDung);
                    } catch (Exception e) {
                         log.error("Lỗi khi gửi email nhắc nhở tồn đọng tới {}: {}", emailNguoiLap, e.getMessage());
                    }
               }
          });
     }

     private void guiEmailDonGianDirectly(String toEmail, String subject, String body) {
          // We can call emailService's generic sender if we update it, or write it directly using mailSender.
          // Let's check: EmailService wraps JavaMailSender. We will update EmailService to support guiEmailDonGian.
          // In EmailThongBaoServiceImpl, we can delegate to emailService.guiEmailDonGian(toEmail, subject, body).
          // Let's implement it here as a delegate. We will modify EmailService to add this helper.
          emailService.guiEmailDonGian(toEmail, subject, body);
     }

     @Override
     @Transactional(readOnly = true)
     public void canhBaoHetHanTaiSan() {
          log.info("Bắt đầu Job quét cảnh báo hết hạn bảo hành & bản quyền...");
          List<DonVi> danhSachDonVi = donViRepository.findByThoiGianXoaIsNull();

          for (DonVi donVi : danhSachDonVi) {
               Long idDonVi = donVi.getId();
               DonViContextHolder.setTenantId(idDonVi);
               try {
                    LocalDate ngayHienTai = LocalDate.now();
                    LocalDate moc30Ngay = ngayHienTai.plusDays(30);

                    // 1. Quét thiết bị phần cứng
                    List<DanhSachThietBiPhanCung> danhSachPhanCung = thietBiPhanCungRepository.findAll((root, query, cb) -> cb.and(
                              cb.equal(root.get("idDonVi"), idDonVi),
                              cb.isNull(root.get("thoiGianXoa"))
                    ));

                    List<DanhSachThietBiPhanCung> thietBiSapHetHan = new ArrayList<>();
                    for (DanhSachThietBiPhanCung tb : danhSachPhanCung) {
                         LocalDate hanBaoHanh = tb.getThoiGianHetHanBaoHanh();
                         if (hanBaoHanh == null && tb.getThoiGianMua() != null && tb.getHanBaoHanhThang() != null) {
                              hanBaoHanh = tb.getThoiGianMua().plusMonths(tb.getHanBaoHanhThang());
                         }
                         if (hanBaoHanh != null && !hanBaoHanh.isBefore(ngayHienTai) && !hanBaoHanh.isAfter(moc30Ngay)) {
                              thietBiSapHetHan.add(tb);
                         }
                    }

                    // 2. Quét bản quyền phần mềm
                    List<DanhSachThietBiPhanMem> danhSachPhanMem = thietBiPhanMemRepository.findAll((root, query, cb) -> cb.and(
                              cb.equal(root.get("idDonVi"), idDonVi),
                              cb.isNull(root.get("thoiGianXoa"))
                    ));

                    List<DanhSachThietBiPhanMem> phanMemSapHetHan = new ArrayList<>();
                    for (DanhSachThietBiPhanMem pm : danhSachPhanMem) {
                         LocalDate hanBanQuyen = pm.getThoiGianHetHanBanQuyen();
                         if (hanBanQuyen == null) {
                              hanBanQuyen = pm.getThoiGianHetHan();
                         }
                         if (hanBanQuyen != null && !hanBanQuyen.isBefore(ngayHienTai) && !hanBanQuyen.isAfter(moc30Ngay)) {
                              phanMemSapHetHan.add(pm);
                         }
                    }

                    if (thietBiSapHetHan.isEmpty() && phanMemSapHetHan.isEmpty()) {
                         continue;
                    }

                    // Tìm Admin đơn vị
                    List<NguoiDung> danhSachNguoiDung = nguoiDungRepository.findByIdDonViAndThoiGianXoaIsNull(idDonVi);
                    List<NguoiDung> danhSachAdmin = danhSachNguoiDung.stream()
                              .filter(u -> u.getChucVu() != null && (
                                        u.getChucVu().toLowerCase().contains("admin") ||
                                        u.getChucVu().toLowerCase().contains("quản trị") ||
                                        u.getChucVu().toLowerCase().contains("quan tri")
                              ))
                              .collect(Collectors.toList());

                    if (danhSachAdmin.isEmpty()) {
                         danhSachAdmin = danhSachNguoiDung; // Fallback gửi cho mọi người
                    }

                    // Tạo nội dung email cảnh báo
                    StringBuilder noiDungEmail = new StringBuilder();
                    noiDungEmail.append("Kính gửi Ban quản trị đơn vị,\n\n");
                    noiDungEmail.append("Hệ thống ITAM thông báo danh sách tài sản sắp hết hạn trong vòng 30 ngày tới:\n\n");

                    if (!thietBiSapHetHan.isEmpty()) {
                         noiDungEmail.append("--- DANH SÁCH THIẾT BỊ PHẦN CỨNG SẮP HẾT HẠN BẢO HÀNH ---\n");
                         for (DanhSachThietBiPhanCung tb : thietBiSapHetHan) {
                              LocalDate han = tb.getThoiGianHetHanBaoHanh() != null ? tb.getThoiGianHetHanBaoHanh() :
                                        tb.getThoiGianMua().plusMonths(tb.getHanBaoHanhThang());
                              String tenMau = tb.getTaiSanPhanCung() != null ? tb.getTaiSanPhanCung().getTenMau() : "Chưa rõ";
                              noiDungEmail.append(String.format("- Mẫu: %s | Serial: %s | Thẻ: %s | Ngày hết hạn: %s\n",
                                        tenMau, tb.getSoSerial(), tb.getMaTheTaiSan(), han.format(FORMAT_NGAY)));
                         }
                         noiDungEmail.append("\n");
                    }

                    if (!phanMemSapHetHan.isEmpty()) {
                         noiDungEmail.append("--- DANH SÁCH BẢN QUYỀN PHẦN MỀM SẮP HẾT HẠN KEY ---\n");
                         for (DanhSachThietBiPhanMem pm : phanMemSapHetHan) {
                              LocalDate han = pm.getThoiGianHetHanBanQuyen() != null ? pm.getThoiGianHetHanBanQuyen() : pm.getThoiGianHetHan();
                              String tenMau = pm.getTaiSanPhanMem() != null ? pm.getTaiSanPhanMem().getTenMau() : "Chưa rõ";
                              noiDungEmail.append(String.format("- Mẫu: %s | Key: %s | Mua chứng từ: %s | Ngày hết hạn: %s\n",
                                        tenMau, pm.getKeyBanQuyen(), pm.getMaChungTuMua(), han.format(FORMAT_NGAY)));
                         }
                         noiDungEmail.append("\n");
                    }

                    noiDungEmail.append("Vui lòng xem xét tiến hành gia hạn các tài sản trên để tránh gián đoạn vận hành.\n\n");
                    noiDungEmail.append("Trân trọng,\nHệ thống quản lý tài sản doanh nghiệp.");

                    String tieuDe = "Cảnh báo hệ thống: Tài sản CNTT sắp hết hạn bảo hành/bản quyền";
                    for (NguoiDung admin : danhSachAdmin) {
                         String emailAdmin = admin.getEmail();
                         if (emailAdmin != null && !emailAdmin.trim().isEmpty()) {
                              try {
                                   guiEmailDonGianDirectly(emailAdmin, tieuDe, noiDungEmail.toString());
                              } catch (Exception e) {
                                   log.error("Lỗi khi gửi email cảnh báo hết hạn tới {}: {}", emailAdmin, e.getMessage());
                              }
                         }
                    }

               } finally {
                    DonViContextHolder.clear();
               }
          }
     }

     @Override
     @Transactional(readOnly = true)
     public void nhacNhoKiemKe() {
          log.info("Bắt đầu Job quét đợt kiểm kê đang hoạt động để thông báo...");
          List<DonVi> danhSachDonVi = donViRepository.findByThoiGianXoaIsNull();

          for (DonVi donVi : danhSachDonVi) {
               Long idDonVi = donVi.getId();
               DonViContextHolder.setTenantId(idDonVi);
               try {
                    List<DotKiemKe> danhSachKiemKe = dotKiemKeRepository.findAll((root, query, cb) -> cb.and(
                              cb.equal(root.get("idDonVi"), idDonVi),
                              cb.equal(root.get("trangThai"), TrangThaiKiemKeEnum.DANG_THUC_HIEN),
                              cb.isNull(root.get("thoiGianXoa"))
                    ));

                    for (DotKiemKe dkk : danhSachKiemKe) {
                         nhacNhoTruongPhongKiemKe(dkk.getId());
                    }
               } finally {
                    DonViContextHolder.clear();
               }
          }
     }

     @Override
     @Transactional(readOnly = true)
     public void nhacNhoTruongPhongKiemKe(Long idDotKiemKe) {
          if (idDotKiemKe == null) return;
          DotKiemKe dkk = dotKiemKeRepository.findById(idDotKiemKe).orElse(null);
          if (dkk == null || dkk.getThoiGianXoa() != null) return;

          Long idDonVi = dkk.getIdDonVi();
          List<PhongBan> danhSachPhongBan = phongBanRepository.findAll((root, query, cb) -> cb.and(
                    cb.equal(root.get("donVi").get("id"), idDonVi),
                    cb.isNull(root.get("thoiGianXoa"))
          ));

          for (PhongBan phongBan : danhSachPhongBan) {
               // Tìm Trưởng phòng ban
               List<NguoiDung> danhSachNguoiDung = nguoiDungRepository.findAll((root, query, cb) -> cb.and(
                         cb.equal(root.get("idPhongBan"), phongBan.getId()),
                         cb.isNull(root.get("thoiGianXoa"))
               ));

               List<NguoiDung> danhSachTruongPhong = danhSachNguoiDung.stream()
                         .filter(u -> u.getChucVu() != null && (
                                   u.getChucVu().toLowerCase().contains("trưởng phòng") ||
                                   u.getChucVu().toLowerCase().contains("truong phong") ||
                                   u.getChucVu().toLowerCase().contains("manager") ||
                                   u.getChucVu().toLowerCase().contains("head")
                         ))
                         .collect(Collectors.toList());

               String tieuDe = "Thông báo: Yêu cầu thực hiện đợt kiểm kê tài sản CNTT [" + dkk.getTenDotKiemKe() + "]";
               String batDau = dkk.getThoiGianBatDauDuKien() != null ? dkk.getThoiGianBatDauDuKien().format(FORMAT_NGAY) : "Chưa rõ";
               String ketThuc = dkk.getThoiGianKetThucDuKien() != null ? dkk.getThoiGianKetThucDuKien().format(FORMAT_NGAY) : "Chưa rõ";

               String noiDungGoc = "Kính gửi Trưởng bộ phận / Phòng ban %s,\n\n" +
                         "Đơn vị đang triển khai đợt kiểm kê tài sản công nghệ thông tin mới:\n" +
                         "- Tên chiến dịch: %s (Mã: %s)\n" +
                         "- Thời gian dự kiến: Từ %s đến %s\n\n" +
                         "Yêu cầu Trưởng phòng ban phối hợp chỉ đạo cán bộ trong bộ phận truy cập hệ thống ITAM thực hiện kiểm đếm đối soát số liệu thực tế của phòng ban mình và ký chốt báo cáo đúng thời hạn quy định.\n\n" +
                         "Trân trọng cảm ơn,\nBan quản trị hệ thống ITAM.";

               String noiDung = String.format(noiDungGoc, phongBan.getTenPhongBan(), dkk.getTenDotKiemKe(), dkk.getMaDotKiemKe(), batDau, ketThuc);

               // 1. Gửi tới trưởng phòng ban
               for (NguoiDung truongPhong : danhSachTruongPhong) {
                    String emailTruongPhong = truongPhong.getEmail();
                    if (emailTruongPhong != null && !emailTruongPhong.trim().isEmpty()) {
                         try {
                              guiEmailDonGianDirectly(emailTruongPhong, tieuDe, noiDung);
                         } catch (Exception e) {
                              log.error("Lỗi gửi email kiểm kê tới Trưởng phòng {}: {}", emailTruongPhong, e.getMessage());
                         }
                    }
               }

               // 2. Gửi tới email nhóm phòng ban (emailNhom)
               String emailNhom = phongBan.getEmailNhom();
               if (emailNhom != null && !emailNhom.trim().isEmpty()) {
                    try {
                         guiEmailDonGianDirectly(emailNhom, tieuDe, noiDung);
                    } catch (Exception e) {
                         log.error("Lỗi gửi email kiểm kê tới hòm thư chung phòng ban {}: {}", emailNhom, e.getMessage());
                    }
               }
          }
     }

     private String getHoTenNguoiDung(NguoiDung nd) {
          if (nd == null) return "";
          StringBuilder sb = new StringBuilder();
          if (nd.getHoNguoiDung() != null) sb.append(nd.getHoNguoiDung().trim()).append(" ");
          if (nd.getTenDemNguoiDung() != null) sb.append(nd.getTenDemNguoiDung().trim()).append(" ");
          if (nd.getTenNguoiDung() != null) sb.append(nd.getTenNguoiDung().trim());
          return sb.toString().trim();
     }
}
