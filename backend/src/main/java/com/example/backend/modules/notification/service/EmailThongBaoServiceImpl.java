package com.example.backend.modules.notification.service;

import com.example.backend.modules.asset.dto.AssetExpiryDto;
import com.example.backend.modules.asset.service.interfaces.AssetQueryService;
import com.example.backend.modules.auth.dto.NguoiDungResponse;
import com.example.backend.modules.auth.service.interfaces.EmailService;
import com.example.backend.modules.auth.service.interfaces.NguoiDungService;
import com.example.backend.modules.lifecycle.dto.PhieuTonDongDto;
import com.example.backend.modules.lifecycle.service.interfaces.LifecycleQueryService;
import com.example.backend.modules.notification.service.interfaces.EmailThongBaoService;
import com.example.backend.modules.tenant.dto.DonViResponse;
import com.example.backend.modules.tenant.dto.PhongBanResponse;
import com.example.backend.modules.tenant.service.interfaces.DonViService;
import com.example.backend.modules.tenant.service.interfaces.PhongBanService;
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

     private final DonViService donViService;
     private final LifecycleQueryService lifecycleQueryService;
     private final AssetQueryService assetQueryService;
     private final NguoiDungService nguoiDungService;
     private final PhongBanService phongBanService;
     private final EmailService emailService;

     private static final DateTimeFormatter FORMAT_NGAY = DateTimeFormatter.ofPattern("dd/MM/yyyy");

     @Override
     @Transactional(readOnly = true)
     public void nhacNhoChungTuTonDong() {
          log.info("Bắt đầu Job quét chứng từ phê duyệt tồn đọng...");
          List<DonViResponse> danhSachDonVi = donViService.layTatCaDonViActive();

          for (DonViResponse donVi : danhSachDonVi) {
               Long idDonVi = donVi.getId();
               DonViContextHolder.setTenantId(idDonVi);
               try {
                    LocalDateTime mocThoiGian = LocalDateTime.now().minusDays(3);

                    List<PhieuTonDongDto> danhSachTonDong = lifecycleQueryService.layDanhSachPhieuTonDong(idDonVi, mocThoiGian);

                    for (PhieuTonDongDto phieu : danhSachTonDong) {
                         nhacNhoNguoiLapPhieu(phieu.getIdNguoiLap(), phieu.getMaChungTu(), phieu.getLoaiChungTu(), phieu.getThoiGianCapNhat());
                    }

               } finally {
                    DonViContextHolder.clear();
               }
          }
     }

     private void nhacNhoNguoiLapPhieu(Long idNguoiLap, String maChungTu, String loaiChungTu, LocalDateTime thoiGianDuyet) {
          if (idNguoiLap == null) return;
          try {
               NguoiDungResponse nguoiLap = nguoiDungService.layTheoId(idNguoiLap);
               if (nguoiLap != null) {
                    String emailNguoiLap = nguoiLap.getEmail();
                    if (emailNguoiLap != null && !emailNguoiLap.trim().isEmpty()) {
                         String hoTen = getHoTenNguoiDung(nguoiLap);
                         String tieuDe = "Nhắc nhở: Chứng từ " + loaiChungTu + " [" + maChungTu + "] phê duyệt tồn đọng";
                         String thoiGian = thoiGianDuyet != null ? thoiGianDuyet.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")) : "Chưa rõ";
                         String noiDung = "Kính gửi cán bộ kỹ thuật " + hoTen + ",\n\n" +
                                   "Hệ thống ghi nhận chứng từ " + loaiChungTu + " mã số [" + maChungTu + "] đã được duyệt vào ngày " + thoiGian + " nhưng đến nay vẫn chưa được xác nhận Hoàn thành thực tế.\n" +
                                   "Vui lòng tiến hành bàn giao/thu hồi vật lý và bấm 'HOAN_THANH' trên hệ thống để đóng quy trình.\n\n" +
                                   "Trân trọng,\nBan quản trị hệ thống ITAM.";

                         guiEmailDonGianDirectly(emailNguoiLap, tieuDe, noiDung);
                    }
               }
          } catch (Exception e) {
               log.error("Lỗi khi gửi email nhắc nhở tồn đọng cho user ID = {}: {}", idNguoiLap, e.getMessage());
          }
     }

     private void guiEmailDonGianDirectly(String toEmail, String subject, String body) {
          emailService.guiEmailDonGian(toEmail, subject, body);
     }

     @Override
     @Transactional(readOnly = true)
     public void canhBaoHetHanTaiSan() {
          log.info("Bắt đầu Job quét cảnh báo hết hạn bảo hành & bản quyền...");
          List<DonViResponse> danhSachDonVi = donViService.layTatCaDonViActive();

          for (DonViResponse donVi : danhSachDonVi) {
               Long idDonVi = donVi.getId();
               DonViContextHolder.setTenantId(idDonVi);
               try {
                    LocalDate ngayHienTai = LocalDate.now();
                    List<AssetExpiryDto> thietBiSapHetHan = assetQueryService.layTaiSanSapHetHan(idDonVi, ngayHienTai, 30);

                    if (thietBiSapHetHan.isEmpty()) {
                         continue;
                    }

                    // Tìm Admin đơn vị
                    List<NguoiDungResponse> danhSachNguoiDung = nguoiDungService.layAdminDonVi(idDonVi);
                    List<NguoiDungResponse> danhSachAdmin = danhSachNguoiDung.stream()
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

                    List<AssetExpiryDto> hardware = thietBiSapHetHan.stream().filter(x -> "Phần cứng".equals(x.getLoaiTaiSan())).collect(Collectors.toList());
                    List<AssetExpiryDto> software = thietBiSapHetHan.stream().filter(x -> "Phần mềm".equals(x.getLoaiTaiSan())).collect(Collectors.toList());

                    if (!hardware.isEmpty()) {
                         noiDungEmail.append("--- DANH SÁCH THIẾT BỊ PHẦN CỨNG SẮP HẾT HẠN BẢO HÀNH ---\n");
                         for (AssetExpiryDto tb : hardware) {
                              noiDungEmail.append(String.format("- Mẫu: %s | %s | Ngày hết hạn: %s\n",
                                        tb.getTenMau(), tb.getIdentifier(), tb.getNgayHetHan().format(FORMAT_NGAY)));
                         }
                         noiDungEmail.append("\n");
                    }

                    if (!software.isEmpty()) {
                         noiDungEmail.append("--- DANH SÁCH BẢN QUYỀN PHẦN MỀM SẮP HẾT HẠN KEY ---\n");
                         for (AssetExpiryDto pm : software) {
                              noiDungEmail.append(String.format("- Mẫu: %s | %s | Ngày hết hạn: %s\n",
                                        pm.getTenMau(), pm.getIdentifier(), pm.getNgayHetHan().format(FORMAT_NGAY)));
                         }
                         noiDungEmail.append("\n");
                    }

                    noiDungEmail.append("Vui lòng xem xét tiến hành gia hạn các tài sản trên để tránh gián đoạn vận hành.\n\n");
                    noiDungEmail.append("Trân trọng,\nHệ thống quản lý tài sản doanh nghiệp.");

                    String tieuDe = "Cảnh báo hệ thống: Tài sản CNTT sắp hết hạn bảo hành/bản quyền";
                    for (NguoiDungResponse admin : danhSachAdmin) {
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
     public void guiEmailYeuCauKiemKe(
             String emailNhan,
             String tenTruongPhong,
             String tenPhongBan,
             String tenDotKiemKe,
             String maDotKiemKe,
             java.time.LocalDate thoiGianBatDauDuKien,
             java.time.LocalDate thoiGianKetThucDuKien
     ) {
          String tieuDe = "Thông báo: Yêu cầu thực hiện đợt kiểm kê tài sản CNTT [" + tenDotKiemKe + "]";
          String batDau = thoiGianBatDauDuKien != null ? thoiGianBatDauDuKien.format(FORMAT_NGAY) : "Chưa rõ";
          String ketThuc = thoiGianKetThucDuKien != null ? thoiGianKetThucDuKien.format(FORMAT_NGAY) : "Chưa rõ";

          String noiDungGoc = "Kính gửi Trưởng bộ phận / Phòng ban %s,\n\n" +
                    "Đơn vị đang triển khai đợt kiểm kê tài sản công nghệ thông tin mới:\n" +
                    "- Tên chiến dịch: %s (Mã: %s)\n" +
                    "- Thời gian dự kiến: Từ %s đến %s\n\n" +
                    "Yêu cầu Trưởng phòng ban phối hợp chỉ đạo cán bộ trong bộ phận truy cập hệ thống ITAM thực hiện kiểm đếm đối soát số liệu thực tế của phòng ban mình và ký chốt báo cáo đúng thời hạn quy định.\n\n" +
                    "Trân trọng cảm ơn,\nBan quản trị hệ thống ITAM.";

          String noiDung = String.format(noiDungGoc, tenPhongBan, tenDotKiemKe, maDotKiemKe, batDau, ketThuc);
          guiEmailDonGianDirectly(emailNhan, tieuDe, noiDung);
     }

     private String getHoTenNguoiDung(NguoiDungResponse nd) {
          if (nd == null) return "";
          StringBuilder sb = new StringBuilder();
          if (nd.getHoNguoiDung() != null) sb.append(nd.getHoNguoiDung().trim()).append(" ");
          if (nd.getTenDemNguoiDung() != null) sb.append(nd.getTenDemNguoiDung().trim()).append(" ");
          if (nd.getTenNguoiDung() != null) sb.append(nd.getTenNguoiDung().trim());
          return sb.toString().trim();
     }
}
