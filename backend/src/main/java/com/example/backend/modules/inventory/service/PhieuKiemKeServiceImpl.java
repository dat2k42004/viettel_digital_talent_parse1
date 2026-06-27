package com.example.backend.modules.inventory.service;

import com.example.backend.modules.inventory.dto.*;
import com.example.backend.modules.inventory.model.*;
import com.example.backend.modules.inventory.repository.*;
import com.example.backend.modules.inventory.service.interfaces.PhieuKiemKeService;
import com.example.backend.modules.lifecycle.model.ChiTietCapPhatLinhKien;
import com.example.backend.modules.lifecycle.model.ChiTietCapPhatPhanCung;
import com.example.backend.modules.lifecycle.model.ChiTietCapPhatPhanMem;
import com.example.backend.modules.lifecycle.model.ChiTietThuHoiLinhKien;
import com.example.backend.modules.lifecycle.model.ChiTietThuHoiPhanCung;
import com.example.backend.modules.lifecycle.repository.ChiTietCapPhatLinhKienRepository;
import com.example.backend.modules.lifecycle.repository.ChiTietCapPhatPhanCungRepository;
import com.example.backend.modules.lifecycle.repository.ChiTietCapPhatPhanMemRepository;
import com.example.backend.modules.lifecycle.repository.ChiTietThuHoiLinhKienRepository;
import com.example.backend.modules.lifecycle.repository.ChiTietThuHoiPhanCungRepository;
import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.auth.repository.NguoiDungRepository;
import com.example.backend.modules.auth.security.NguoiDungUserDetails;
import com.example.backend.modules.tenant.model.PhongBan;
import com.example.backend.modules.tenant.repository.PhongBanRepository;
import com.example.backend.modules.asset.model.DanhSachThietBiPhanCung;
import com.example.backend.modules.asset.model.LinhKienPhanCung;
import com.example.backend.modules.asset.model.DanhSachThietBiPhanMem;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanCungRepository;
import com.example.backend.modules.asset.repository.LinhKienPhanCungRepository;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanMemRepository;
import com.example.backend.shared.dto.TongHopPhieuKiemKeEvent;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.tenant.DonViContextHolder;
import com.example.backend.modules.notification.service.interfaces.EmailThongBaoService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class PhieuKiemKeServiceImpl implements PhieuKiemKeService {

     private final PhieuKiemKeRepository phieuKiemKeRepository;
     private final ChiTietKiemKePhanCungRepository chiTietKiemKeThietBiRepository;
     private final ChiTietKiemKeLinhKienRepository chiTietKiemKeLinhKienRepository;
     private final ChiTietKiemKePhanMemRepository chiTietKiemKePhanMemRepository;
     private final DotKiemKeRepository dotKiemKeRepository;
     private final NguoiDungRepository nguoiDungRepository;
     private final PhongBanRepository phongBanRepository;

     private final ChiTietCapPhatPhanCungRepository chiTietCapPhatPhanCungRepository;
     private final ChiTietCapPhatLinhKienRepository chiTietCapPhatLinhKienRepository;
     private final ChiTietCapPhatPhanMemRepository chiTietCapPhatPhanMemRepository;
     private final ChiTietThuHoiPhanCungRepository chiTietThuHoiPhanCungRepository;
     private final ChiTietThuHoiLinhKienRepository chiTietThuHoiLinhKienRepository;

     // Đối soát chính xác 3 Repository kho tĩnh hiện có trong source code của cậu
     private final DanhSachThietBiPhanCungRepository danhSachThietBiPhanCungRepository;
     private final LinhKienPhanCungRepository linhKienPhanCungRepository;
     private final DanhSachThietBiPhanMemRepository danhSachThietBiPhanMemRepository;
     private final EmailThongBaoService emailThongBaoService;

     @Autowired
     @Lazy
     private RabbitTemplate rabbitTemplate;

     private Long getRequiredTenantId() {
          Long tenantId = DonViContextHolder.getTenantId();
          if (tenantId == null)
               throw new NghiepVuException("Không tìm thấy thông tin đơn vị xử lý", 403);
          return tenantId;
     }

     private Long getCurrentUserId() {
          Authentication auth = SecurityContextHolder.getContext().getAuthentication();
          if (auth != null && auth.getPrincipal() instanceof NguoiDungUserDetails user) {
               return user.getNguoiDung().getId();
          }
          throw new NghiepVuException("Phiên làm việc hết hạn, vui lòng đăng nhập lại", 401);
     }

     private String getHoTenNguoiDung(NguoiDung nd) {
          if (nd == null)
               return null;
          StringBuilder sb = new StringBuilder();
          if (nd.getHoNguoiDung() != null)
               sb.append(nd.getHoNguoiDung().trim()).append(" ");
          if (nd.getTenDemNguoiDung() != null)
               sb.append(nd.getTenDemNguoiDung().trim()).append(" ");
          if (nd.getTenNguoiDung() != null)
               sb.append(nd.getTenNguoiDung().trim());
          return sb.toString().trim();
     }

     @Override
     @Transactional
     public PhieuKiemKeResponse themMoi(PhieuKiemKeRequest request) {
          Long tenantId = getRequiredTenantId();
          Long userId = getCurrentUserId();

          DotKiemKe dkk = dotKiemKeRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(request.getDotKiemKeId(), tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy đợt kiểm kê tổng hợp hợp lệ", 404));

          if (dkk.getTrangThai() != TrangThaiKiemKeEnum.DA_PHE_DUYET
                    && dkk.getTrangThai() != TrangThaiKiemKeEnum.DANG_THUC_HIEN) {
               throw new NghiepVuException("Yêu cầu đợt kiểm kê tổng phải ở trạng thái Đã phê duyệt mới được lập phiếu",
                         400);
          }

          PhieuKiemKe p = new PhieuKiemKe();
          p.setIdDonVi(tenantId);
          p.setDotKiemKe(dkk);
          p.setMaPhieuKiemKe("PKK-" + tenantId + "-" + System.currentTimeMillis());
          p.setIdKhoKiemKe(request.getIdKhoKiemKe());
          p.setIdPhongBanKiemKe(request.getIdPhongBanKiemKe());
          p.setIdNhanVienKiemKe(userId);
          p.setIdNguoiNhanBaoCao(dkk.getIdNguoiLap());
          p.setTrangThai(TrangThaiPhieuKiemKeEnum.TAO_MOI);

          PhieuKiemKe saved = phieuKiemKeRepository.save(p);

          // 1.1 Quét danh sách Thiết bị phần cứng của đơn vị.
          // Chỉ bốc những con máy đang có sẵn trong kho hoặc cấp phát tĩnh thuộc đơn vị
          // này (Sử dụng hàm mặc định findAll)
          List<DanhSachThietBiPhanCung> tatCaThietBi = danhSachThietBiPhanCungRepository.findAll().stream()
                    .filter(x -> x.getThoiGianXoa() == null)
                    .collect(Collectors.toList());

          for (DanhSachThietBiPhanCung tb : tatCaThietBi) {
               ChiTietKiemKePhanCung ct = new ChiTietKiemKePhanCung();
               ct.setPhieuKiemKe(saved);
               ct.setIdDanhSachThietBiPhanCung(tb.getId());
               ct.setIdNhanVienDuocCapPhat(null); // Gán null hoặc bốc từ bảng log cấp phát trung gian của cậu
               ct.setTrangThaiKho("HOAT_DONG");
               ct.setDaKiemKeThucTe(false);
               chiTietKiemKeThietBiRepository.save(ct);
          }

          // 1.2 Quét danh sách Linh kiện phần cứng của đơn vị (Sử dụng hàm mặc định
          // findAll)
          List<LinhKienPhanCung> tatCaLinhKien = linhKienPhanCungRepository.findAll().stream()
                    .filter(x -> x.getThoiGianXoa() == null)
                    .collect(Collectors.toList());

          for (LinhKienPhanCung lk : tatCaLinhKien) {
               ChiTietKiemKeLinhKien ct = new ChiTietKiemKeLinhKien();
               ct.setPhieuKiemKe(saved);
               ct.setIdLinhKienPhanCung(lk.getId());
               ct.setViTriKho(lk.getSoSerial()); // Tận dụng trường có sẵn làm vết định danh đối soát lý thuyết
               ct.setDaKiemKeThucTe(false);
               chiTietKiemKeLinhKienRepository.save(ct);
          }

          // 1.3 Quét danh sách Bản quyền phần mềm cài đặt vật lý (Sử dụng hàm mặc định
          // findAll)
          List<DanhSachThietBiPhanMem> tatCaPhanMem = danhSachThietBiPhanMemRepository.findAll().stream()
                    .filter(x -> x.getThoiGianXoa() == null)
                    .collect(Collectors.toList());

          for (DanhSachThietBiPhanMem pm : tatCaPhanMem) {
               ChiTietKiemKePhanMem ct = new ChiTietKiemKePhanMem();
               ct.setPhieuKiemKe(saved);
               ct.setIdTaiSanPhanMem(pm.getId());
               // ct.setIdThietBiCaiDat(
               // pm.getDanhSachThietBiPhanCung() != null ?
               // pm.getDanhSachThietBiPhanCung().getId() : null);
               ct.setDaKiemKeThucTe(false);
               chiTietKiemKePhanMemRepository.save(ct);
          }

          return mapToResponse(saved, true);
     }

     @Override
     @Transactional
     public PhieuKiemKeResponse capNhat(Long id, PhieuKiemKeRequest request) {
          Long tenantId = getRequiredTenantId();
          PhieuKiemKe p = phieuKiemKeRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin phiếu kiểm kê", 404));

          if (p.getTrangThai() != TrangThaiPhieuKiemKeEnum.TAO_MOI) {
               throw new NghiepVuException("Phiếu đã bước vào khâu đối soát hiện trường, không được chỉnh sửa cấu hình",
                         400);
          }

          p.setIdKhoKiemKe(request.getIdKhoKiemKe());
          p.setIdPhongBanKiemKe(request.getIdPhongBanKiemKe());

          PhieuKiemKe saved = phieuKiemKeRepository.save(p);
          return mapToResponse(saved, true);
     }

     @Override
     @Transactional
     public void xoaMem(Long id) {
          Long tenantId = getRequiredTenantId();
          PhieuKiemKe p = phieuKiemKeRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy phiếu kiểm kê yêu cầu xóa", 404));

          if (p.getTrangThai() != TrangThaiPhieuKiemKeEnum.TAO_MOI) {
               throw new NghiepVuException("Phiếu đang thực hiện không được phép xóa mềm", 400);
          }

          LocalDateTime now = LocalDateTime.now();
          p.setThoiGianXoa(now);
          p.setLyDoXoa("Hủy bỏ phiếu kiểm kê cấp phòng ban");
          phieuKiemKeRepository.save(p);

          // Đồng bộ xóa mềm các bản ghi dòng chi tiết
          chiTietKiemKeThietBiRepository.findByPhieuKiemKeIdAndThoiGianXoaIsNull(id).forEach(x -> {
               x.setThoiGianXoa(now);
               chiTietKiemKeThietBiRepository.save(x);
          });
          chiTietKiemKeLinhKienRepository.findByPhieuKiemKeIdAndThoiGianXoaIsNull(id).forEach(x -> {
               x.setThoiGianXoa(now);
               chiTietKiemKeLinhKienRepository.save(x);
          });
          chiTietKiemKePhanMemRepository.findByPhieuKiemKeIdAndThoiGianXoaIsNull(id).forEach(x -> {
               x.setThoiGianXoa(now);
               chiTietKiemKePhanMemRepository.save(x);
          });
     }

     @Override
     @Transactional
     public void thucHienKiemKe(Long id, ExecuteKiemKeRequest request) {
          Long tenantId = getRequiredTenantId();
          PhieuKiemKe p = phieuKiemKeRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin phiếu kiểm kê mục tiêu", 404));

          if (p.getTrangThai() != TrangThaiPhieuKiemKeEnum.TAO_MOI
                    && p.getTrangThai() != TrangThaiPhieuKiemKeEnum.DANG_THUC_HIEN) {
               throw new NghiepVuException("Báo cáo kiểm kê đã được đóng hoặc gửi đi, không thể cập nhật thêm số liệu",
                         400);
          }

          // 6.1 Lưu dữ liệu mảng chi tiết thiết bị phần cứng
          if (request.getDanhSachThietBi() != null) {
               for (ExecuteKiemKeRequest.UpdateThietBiItem item : request.getDanhSachThietBi()) {
                    ChiTietKiemKePhanCung ct = chiTietKiemKeThietBiRepository.findById(item.getIdChiTiet())
                              .orElseThrow(() -> new NghiepVuException(
                                        "Không tìm thấy dòng thiết bị ID: " + item.getIdChiTiet(), 400));
                    ct.setTinhTrangThucTe(item.getTinhTrangThucTe());
                    ct.setKetLuan(item.getKetLuan());
                    ct.setGhiChu(item.getGhiChu());
                    ct.setIdNhanVienSuDung(item.getIdNhanVienSuDungThucTe());
                    ct.setDaKiemKeThucTe(true);
                    chiTietKiemKeThietBiRepository.save(ct);
               }
          }

          // 6.2 Lưu dữ liệu mảng chi tiết linh kiện phần cứng rời
          if (request.getDanhSachLinhKien() != null) {
               for (ExecuteKiemKeRequest.UpdateLinhKienItem item : request.getDanhSachLinhKien()) {
                    ChiTietKiemKeLinhKien ct = chiTietKiemKeLinhKienRepository.findById(item.getIdChiTiet())
                              .orElseThrow(() -> new NghiepVuException(
                                        "Không tìm thấy dòng linh kiện ID: " + item.getIdChiTiet(), 400));
                    ct.setViTriThucTe(item.getViTriThucTe());
                    ct.setTinhTrangThucTe(item.getTinhTrangThucTe());
                    ct.setKetLuan(item.getKetLuan());
                    ct.setGhiChu(item.getGhiChu());
                    ct.setDaKiemKeThucTe(true);
                    chiTietKiemKeLinhKienRepository.save(ct);
               }
          }

          // 6.3 Lưu dữ liệu mảng chi tiết bản quyền phần mềm
          if (request.getDanhSachPhanMem() != null) {
               for (ExecuteKiemKeRequest.UpdatePhanMemItem item : request.getDanhSachPhanMem()) {
                    ChiTietKiemKePhanMem ct = chiTietKiemKePhanMemRepository.findById(item.getIdChiTiet())
                              .orElseThrow(() -> new NghiepVuException(
                                        "Không tìm thấy dòng bản quyền phần mềm ID: " + item.getIdChiTiet(), 400));
                    ct.setTrangThaiBanQuyen(item.getTrangThaiBanQuyen());
                    ct.setKetLuan(item.getKetLuan());
                    ct.setGhiChu(item.getGhiChu());
                    ct.setDaKiemKeThucTe(true);
                    chiTietKiemKePhanMemRepository.save(ct);
               }
          }

          // 6.4 Phân định nút bấm: GỬI BÁO CÁO hay LƯU NHÁP TIẾN ĐỘ
          if (Boolean.TRUE.equals(request.getIsSubmit())) {
               List<ChiTietKiemKePhanCung> activeTb = chiTietKiemKeThietBiRepository
                         .findByPhieuKiemKeIdAndThoiGianXoaIsNull(id);
               List<ChiTietKiemKeLinhKien> activeLk = chiTietKiemKeLinhKienRepository
                         .findByPhieuKiemKeIdAndThoiGianXoaIsNull(id);
               List<ChiTietKiemKePhanMem> activePm = chiTietKiemKePhanMemRepository
                         .findByPhieuKiemKeIdAndThoiGianXoaIsNull(id);

               boolean chuaQuetHetTb = activeTb.stream().anyMatch(x -> !Boolean.TRUE.equals(x.getDaKiemKeThucTe()));
               boolean chuaQuetHetLk = activeLk.stream().anyMatch(x -> !Boolean.TRUE.equals(x.getDaKiemKeThucTe()));
               boolean chuaQuetHetPm = activePm.stream().anyMatch(x -> !Boolean.TRUE.equals(x.getDaKiemKeThucTe()));

               if (chuaQuetHetTb || chuaQuetHetLk || chuaQuetHetPm) {
                    throw new NghiepVuException(
                              "Bắt buộc phải hoàn tất nhập liệu đối soát cho 100% tài sản trong danh sách trước khi thực hiện gửi báo cáo",
                              400);
               }

               p.setTrangThai(TrangThaiPhieuKiemKeEnum.DA_GUI);
               p.setThoiGianThucHien(LocalDateTime.now());
          } else {
               p.setTrangThai(TrangThaiPhieuKiemKeEnum.DANG_THUC_HIEN);
          }

          // Đồng bộ đẩy đợt kiểm kê tổng sang trạng thái DANG_THUC_HIEN
          DotKiemKe dkk = p.getDotKiemKe();
          if (dkk != null && dkk.getTrangThai() == TrangThaiKiemKeEnum.DA_PHE_DUYET) {
               dkk.setTrangThai(TrangThaiKiemKeEnum.DANG_THUC_HIEN);
               dotKiemKeRepository.save(dkk);
               try {
                    emailThongBaoService.nhacNhoTruongPhongKiemKe(dkk.getId());
               } catch (Exception e) {
                    log.error("Lỗi khi tự động gửi mail thông báo đợt kiểm kê cho trưởng phòng: {}", e.getMessage(), e);
               }
          }

          phieuKiemKeRepository.save(p);
     }

     @Override
     @Transactional(readOnly = true)
     public List<TienDoPhongBanResponse> theoDoiTienDoThucHien(Long dotKiemKeId) {
          Long tenantId = getRequiredTenantId();
          List<PhieuKiemKe> phieus = phieuKiemKeRepository.findByDotKiemKeIdAndThoiGianXoaIsNull(dotKiemKeId);
          if (phieus.isEmpty())
               return new ArrayList<>();

          Set<Long> pbIds = phieus.stream().map(PhieuKiemKe::getIdPhongBanKiemKe).filter(Objects::nonNull)
                    .collect(Collectors.toSet());
          Map<Long, String> pbMap = pbIds.isEmpty() ? new HashMap<>()
                    : phongBanRepository.findAllById(pbIds).stream()
                              .collect(Collectors.toMap(PhongBan::getId, PhongBan::getTenPhongBan));

          List<TienDoPhongBanResponse> resList = new ArrayList<>();
          for (PhieuKiemKe p : phieus) {
               long totalCount = chiTietKiemKeThietBiRepository.findByPhieuKiemKeIdAndThoiGianXoaIsNull(p.getId())
                         .size()
                         + chiTietKiemKeLinhKienRepository.findByPhieuKiemKeIdAndThoiGianXoaIsNull(p.getId()).size()
                         + chiTietKiemKePhanMemRepository.findByPhieuKiemKeIdAndThoiGianXoaIsNull(p.getId()).size();

               long auditedCount = chiTietKiemKeThietBiRepository.findByPhieuKiemKeIdAndThoiGianXoaIsNull(p.getId())
                         .stream().filter(x -> Boolean.TRUE.equals(x.getDaKiemKeThucTe())).count()
                         + chiTietKiemKeLinhKienRepository.findByPhieuKiemKeIdAndThoiGianXoaIsNull(p.getId()).stream()
                                   .filter(x -> Boolean.TRUE.equals(x.getDaKiemKeThucTe())).count()
                         + chiTietKiemKePhanMemRepository.findByPhieuKiemKeIdAndThoiGianXoaIsNull(p.getId()).stream()
                                   .filter(x -> Boolean.TRUE.equals(x.getDaKiemKeThucTe())).count();

               resList.add(TienDoPhongBanResponse.builder()
                         .idPhieuKiemKe(p.getId()).idPhongBan(p.getIdPhongBanKiemKe())
                         .tenPhongBan(pbMap.get(p.getIdPhongBanKiemKe()))
                         .trangThaiPhieu(p.getTrangThai().getValue()).soLuongDaKiem(auditedCount)
                         .tongSoLuongTaiSan(totalCount).build());
          }
          return resList;
     }

     @Override
     @Transactional
     public void xacNhanHoanThanhPhongBan(Long id) {
          Long tenantId = getRequiredTenantId();
          PhieuKiemKe p = phieuKiemKeRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin phiếu kiểm kê phòng ban yêu cầu",
                              404));

          if (p.getTrangThai() != TrangThaiPhieuKiemKeEnum.DA_GUI) {
               throw new NghiepVuException("Phòng ban chưa gửi nộp báo cáo kết quả, không thể tiến hành xác nhận", 400);
          }

          p.setTrangThai(TrangThaiPhieuKiemKeEnum.XAC_NHAN);
          phieuKiemKeRepository.save(p);

          TongHopPhieuKiemKeEvent event = new TongHopPhieuKiemKeEvent(id, tenantId);

          rabbitTemplate.convertAndSend("inventory.dot-kiem-ke-aggregate.queue", event);

          // // Tự động kiểm tra điều kiện đóng Đợt kiểm kê tổng vĩnh viễn (HOAN_THANH)
          // DotKiemKe dkk = p.getDotKiemKe();
          // if (dkk != null) {
          // List<PhieuKiemKe> allTickets =
          // phieuKiemKeRepository.findByDotKiemKeIdAndThoiGianXoaIsNull(dkk.getId());
          // boolean clearAll = allTickets.stream()
          // .allMatch(x -> x.getTrangThai() == TrangThaiPhieuKiemKeEnum.XAC_NHAN);

          // if (clearAll) {
          // dkk.setTrangThai(TrangThaiKiemKeEnum.HOAN_THANH);
          // dkk.setThoiGianChotSoLieu(LocalDateTime.now());

          // // Tính toán dữ liệu kết toán tổng hợp chi phí/số lượng chênh lệch thực tế
          // dồn
          // // lên đợt tổng
          // int systemTotal = 0;
          // int actualTotal = 0;

          // for (PhieuKiemKe ticket : allTickets) {
          // List<ChiTietKiemKePhanCung> list = chiTietKiemKeThietBiRepository
          // .findByPhieuKiemKeIdAndThoiGianXoaIsNull(ticket.getId());
          // systemTotal += list.size();
          // actualTotal += list.stream().filter(x ->
          // "KHOP".equalsIgnoreCase(x.getKetLuan())).count();
          // }

          // dkk.setTongTaiSanHeThong(systemTotal);
          // dkk.setTongTaiSanThucTe(actualTotal);
          // dotKiemKeRepository.save(dkk);
          // }
          // }
     }

     @Override
     @Transactional(readOnly = true)
     public PageResponse<PhieuKiemKeResponse> layDanhSach(String trangThai, Long idPhongBan, LocalDate tuNgay,
               LocalDate denNgay, int page, int size, String sort) {
          Long tenantId = getRequiredTenantId();
          String[] sortParts = sort.split(",");
          Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
          PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortParts[0]));

          Specification<PhieuKiemKe> spec = (root, query, cb) -> {
               List<Predicate> predicates = new ArrayList<>();
               predicates.add(cb.isNull(root.get("thoiGianXoa")));
               predicates.add(cb.equal(root.get("idDonVi"), tenantId));

               if (trangThai != null && !trangThai.trim().isEmpty()) {
                    predicates.add(
                              cb.equal(root.get("trangThai"), TrangThaiPhieuKiemKeEnum.fromValue(trangThai.trim())));
               }
               if (idPhongBan != null) {
                    predicates.add(cb.equal(root.get("idPhongBanKiemKe"), idPhongBan));
               }
               if (tuNgay != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("thoiGianTao"), tuNgay.atStartOfDay()));
               }
               if (denNgay != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("thoiGianTao"), denNgay.atTime(LocalTime.MAX)));
               }
               return cb.and(predicates.toArray(new Predicate[0]));
          };

          Page<PhieuKiemKe> pageResult = phieuKiemKeRepository.findAll(spec, pageRequest);

          Set<Long> pbIds = pageResult.getContent().stream().map(PhieuKiemKe::getIdPhongBanKiemKe)
                    .filter(Objects::nonNull).collect(Collectors.toSet());
          Map<Long, String> pbMap = pbIds.isEmpty() ? new HashMap<>()
                    : phongBanRepository.findAllById(pbIds).stream()
                              .collect(Collectors.toMap(PhongBan::getId, PhongBan::getTenPhongBan));

          List<PhieuKiemKeResponse> content = pageResult.getContent().stream()
                    .map(x -> PhieuKiemKeResponse.builder()
                              .id(x.getId()).idDonVi(x.getIdDonVi())
                              .dotKiemKeId(x.getDotKiemKe() != null ? x.getDotKiemKe().getId() : null)
                              .maPhieuKiemKe(x.getMaPhieuKiemKe()).idPhongBanKiemKe(x.getIdPhongBanKiemKe())
                              .tenPhongBan(pbMap.get(x.getIdPhongBanKiemKe()))
                              .trangThai(x.getTrangThai().getValue()).thoiGianThucHien(x.getThoiGianThucHien())
                              .thoiGianTao(x.getThoiGianTao())
                              .danhSachChiTiet(new ArrayList<>()).build())
                    .collect(Collectors.toList());

          return PageResponse.from(new PageImpl<>(content, pageRequest, pageResult.getTotalElements()));
     }

     @Override
     @Transactional(readOnly = true)
     public PhieuKiemKeResponse layTheoId(Long id) {
          Long tenantId = getRequiredTenantId();
          PhieuKiemKe p = phieuKiemKeRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin phiếu kiểm kê yêu cầu", 404));
          return mapToResponse(p, true);
     }

     @Override
     @Transactional(readOnly = true)
     public TaiSanTheoPhongBanResponse layTaiSanTheoPhongBan(Long idPhongBan) {
          getRequiredTenantId();

          List<ChiTietCapPhatPhanCung> allocatedPcs = chiTietCapPhatPhanCungRepository
                    .findActiveAllocationByPhongBan(idPhongBan);
          List<TaiSanCapPhatResponse> danhSachPhanCung = new ArrayList<>();

          for (ChiTietCapPhatPhanCung cp : allocatedPcs) {
               // SỬA CHUẨN NGHIỆP VỤ: Bốc thông tin thiết bị gốc trực tiếp bằng
               // danhSachThietBiPhanCungId kiểu Long từ model chi tiết của cậu
               Optional<DanhSachThietBiPhanCung> pcOpt = danhSachThietBiPhanCungRepository
                         .findById(cp.getDanhSachThietBiPhanCungId());

               if (pcOpt.isPresent()) {
                    DanhSachThietBiPhanCung pc = pcOpt.get();

                    String tenNguoiDangSoHuu = null;
                    if (cp.getPhieuCapPhatTaiSan() != null && cp.getPhieuCapPhatTaiSan().getIdNguoiNhan() != null) {
                         tenNguoiDangSoHuu = nguoiDungRepository.findById(cp.getPhieuCapPhatTaiSan().getIdNguoiNhan())
                                   .map(this::getHoTenNguoiDung).orElse(null);
                    }

                    danhSachPhanCung.add(TaiSanCapPhatResponse.builder()
                              .idTaiSanGoc(pc.getId())
                              .tenTaiSan(pc.getTaiSanPhanCung() != null ? pc.getTaiSanPhanCung().getTenMau()
                                        : "Tài sản phần cứng")
                              .soSerial(pc.getSoSerial())
                              .maTheTaiSan(pc.getMaTheTaiSan())
                              .viTriHienTai("Phòng ban quản lý")
                              .tenNguoiDangSoHuu(tenNguoiDangSoHuu)
                              .loaiTaiSan("PHAN_CUNG")
                              .build());
               }
          }

          List<ChiTietCapPhatLinhKien> allocatedLks = chiTietCapPhatLinhKienRepository
                    .findActiveAllocationByPhongBan(idPhongBan);
          List<TaiSanCapPhatResponse> danhSachLinhKien = new ArrayList<>();

          for (ChiTietCapPhatLinhKien cp : allocatedLks) {
               // SỬA CHUẨN NGHIỆP VỤ: Bốc thông tin linh kiện gốc trực tiếp bằng
               // linhKienPhanCungId kiểu Long từ model chi tiết của cậu
               Optional<LinhKienPhanCung> lkOpt = linhKienPhanCungRepository.findById(cp.getLinhKienPhanCungId());

               if (lkOpt.isPresent()) {
                    LinhKienPhanCung lk = lkOpt.get();

                    String tenNguoiDangSoHuu = null;
                    if (cp.getPhieuCapPhatTaiSan() != null && cp.getPhieuCapPhatTaiSan().getIdNguoiNhan() != null) {
                         tenNguoiDangSoHuu = nguoiDungRepository.findById(cp.getPhieuCapPhatTaiSan().getIdNguoiNhan())
                                   .map(this::getHoTenNguoiDung).orElse(null);
                    }

                    danhSachLinhKien.add(TaiSanCapPhatResponse.builder()
                              .idTaiSanGoc(lk.getId())
                              .tenTaiSan(lk.getTaiSanPhanCung() != null ? lk.getTaiSanPhanCung().getTenMau()
                                        : "Linh kiện phần cứng rời")
                              .soSerial(lk.getSoSerial())
                              .maTheTaiSan(null)
                              .viTriHienTai("Cấp phát gắn kèm máy / kho")
                              .tenNguoiDangSoHuu(tenNguoiDangSoHuu)
                              .loaiTaiSan("LINH_KIEN")
                              .build());
               }
          }

          List<ChiTietCapPhatPhanMem> allocatedPms = chiTietCapPhatPhanMemRepository
                    .findActiveAllocationByPhongBan(idPhongBan);
          List<TaiSanCapPhatResponse> danhSachPhanMem = new ArrayList<>();

          for (ChiTietCapPhatPhanMem cp : allocatedPms) {
               Optional<DanhSachThietBiPhanMem> pmOpt = danhSachThietBiPhanMemRepository
                         .findById(cp.getDanhSachThietBiPhanMemId());

               if (pmOpt.isPresent()) {
                    DanhSachThietBiPhanMem pm = pmOpt.get();

                    String tenNguoiDangSoHuu = null;
                    if (cp.getPhieuCapPhatTaiSan() != null && cp.getPhieuCapPhatTaiSan().getIdNguoiNhan() != null) {
                         tenNguoiDangSoHuu = nguoiDungRepository.findById(cp.getPhieuCapPhatTaiSan().getIdNguoiNhan())
                                   .map(this::getHoTenNguoiDung).orElse(null);
                    }

                    String maTheMayCaiDat = "Chưa cài đặt";
                    if (cp.getDanhSachThietBiPhanCungId() != null) {
                         maTheMayCaiDat = danhSachThietBiPhanCungRepository.findById(cp.getDanhSachThietBiPhanCungId())
                                   .map(DanhSachThietBiPhanCung::getMaTheTaiSan).orElse("Chưa cài đặt");
                    }

                    danhSachPhanMem.add(TaiSanCapPhatResponse.builder()
                              .idTaiSanGoc(pm.getId())
                              .tenTaiSan(pm.getTaiSanPhanMem() != null ? pm.getTaiSanPhanMem().getTenMau()
                                        : "Bản quyền phần mềm")
                              .soSerial(pm.getKeyBanQuyen())
                              .maTheTaiSan(null)
                              .viTriHienTai("Cài đặt trên máy: " + maTheMayCaiDat)
                              .tenNguoiDangSoHuu(tenNguoiDangSoHuu)
                              .loaiTaiSan("PHAN_MEM")
                              .build());
               }
          }

          return TaiSanTheoPhongBanResponse.builder()
                    .idPhongBan(idPhongBan)
                    .danhSachPhanCung(danhSachPhanCung)
                    .danhSachLinhKien(danhSachLinhKien)
                    .danhSachPhanMem(danhSachPhanMem)
                    .build();
     }

     @Override
     @Transactional(readOnly = true)
     public List<LuaChonDotKiemKeResponse> layDotKiemKeKichHoat() {
          Long tenantId = getRequiredTenantId();
          return dotKiemKeRepository.findAll().stream()
                    .filter(x -> x.getIdDonVi().equals(tenantId)
                              && x.getThoiGianXoa() == null
                              && x.getTrangThai() == TrangThaiKiemKeEnum.DA_PHE_DUYET)
                    .map(x -> new LuaChonDotKiemKeResponse(x.getId(), x.getTenDotKiemKe()))
                    .collect(Collectors.toList());
     }

     private PhieuKiemKeResponse mapToResponse(PhieuKiemKe p, boolean includeDetails) {
          List<ChiTietKiemKeFlatResponse> flatList = new ArrayList<>();

          if (includeDetails) {
               // Nạp chi tiết thiết bị và bốc thông tin có sẵn trong Model gốc của cậu
               List<ChiTietKiemKePhanCung> tbs = chiTietKiemKeThietBiRepository
                         .findByPhieuKiemKeIdAndThoiGianXoaIsNull(p.getId());
               Set<Long> tbIds = tbs.stream().map(ChiTietKiemKePhanCung::getIdDanhSachThietBiPhanCung)
                         .collect(Collectors.toSet());
               Map<Long, DanhSachThietBiPhanCung> tbMap = tbIds.isEmpty() ? new HashMap<>()
                         : danhSachThietBiPhanCungRepository.findAllById(tbIds).stream()
                                   .collect(Collectors.toMap(DanhSachThietBiPhanCung::getId,
                                             java.util.function.Function.identity()));

               for (ChiTietKiemKePhanCung ct : tbs) {
                    DanhSachThietBiPhanCung core = tbMap.get(ct.getIdDanhSachThietBiPhanCung());
                    flatList.add(ChiTietKiemKeFlatResponse.builder()
                              .id(ct.getId()).idTaiSanGoc(ct.getIdDanhSachThietBiPhanCung())
                              .daKiemKeThucTe(ct.getDaKiemKeThucTe())
                              .tenTaiSan(core != null && core.getTaiSanPhanCung() != null
                                        ? core.getTaiSanPhanCung().getTenMau()
                                        : "Thiết bị phần cứng")
                              .soSerial(core != null ? core.getSoSerial() : null)
                              .maTheTaiSan(core != null ? core.getMaTheTaiSan() : null)
                              .tinhTrangHoacBanQuyen(ct.getTinhTrangThucTe()).ketLuan(ct.getKetLuan())
                              .ghiChu(ct.getGhiChu()).loaiTaiSan("THIET_BI").build());
               }

               // Nạp chi tiết linh kiện phần cứng rời
               List<ChiTietKiemKeLinhKien> lks = chiTietKiemKeLinhKienRepository
                         .findByPhieuKiemKeIdAndThoiGianXoaIsNull(p.getId());
               Set<Long> lkIds = lks.stream().map(ChiTietKiemKeLinhKien::getIdLinhKienPhanCung)
                         .collect(Collectors.toSet());
               Map<Long, LinhKienPhanCung> lkMap = lkIds.isEmpty() ? new HashMap<>()
                         : linhKienPhanCungRepository.findAllById(lkIds).stream()
                                   .collect(Collectors.toMap(LinhKienPhanCung::getId,
                                             java.util.function.Function.identity()));

               for (ChiTietKiemKeLinhKien ct : lks) {
                    LinhKienPhanCung core = lkMap.get(ct.getIdLinhKienPhanCung());
                    flatList.add(ChiTietKiemKeFlatResponse.builder()
                              .id(ct.getId()).idTaiSanGoc(ct.getIdLinhKienPhanCung())
                              .daKiemKeThucTe(ct.getDaKiemKeThucTe())
                              .tenTaiSan(core != null && core.getTaiSanPhanCung() != null
                                        ? core.getTaiSanPhanCung().getTenMau()
                                        : "Linh kiện phần cứng rời")
                              .soSerial(core != null ? core.getSoSerial() : null).maTheTaiSan(null)
                              .tinhTrangHoacBanQuyen(ct.getTinhTrangThucTe())
                              .viTriHoacThietBiCaiDat(ct.getViTriThucTe()).ketLuan(ct.getKetLuan())
                              .ghiChu(ct.getGhiChu()).loaiTaiSan("LINH_KIEN").build());
               }

               // Nạp chi tiết danh sách phần mềm cài đặt
               List<ChiTietKiemKePhanMem> pms = chiTietKiemKePhanMemRepository
                         .findByPhieuKiemKeIdAndThoiGianXoaIsNull(p.getId());
               Set<Long> pmIds = pms.stream().map(ChiTietKiemKePhanMem::getIdTaiSanPhanMem).collect(Collectors.toSet());
               Map<Long, DanhSachThietBiPhanMem> pmMap = pmIds.isEmpty() ? new HashMap<>()
                         : danhSachThietBiPhanMemRepository.findAllById(pmIds).stream()
                                   .collect(Collectors.toMap(DanhSachThietBiPhanMem::getId,
                                             java.util.function.Function.identity()));

               for (ChiTietKiemKePhanMem ct : pms) {
                    DanhSachThietBiPhanMem core = pmMap.get(ct.getIdTaiSanPhanMem());
                    flatList.add(ChiTietKiemKeFlatResponse.builder()
                              .id(ct.getId()).idTaiSanGoc(ct.getIdTaiSanPhanMem())
                              .daKiemKeThucTe(ct.getDaKiemKeThucTe())
                              .tenTaiSan(core != null && core.getTaiSanPhanMem() != null
                                        ? core.getTaiSanPhanMem().getTenMau()
                                        : "Bản quyền phần mềm")
                              .soSerial(core != null ? core.getKeyBanQuyen() : null).maTheTaiSan(null)
                              .tinhTrangHoacBanQuyen(ct.getTrangThaiBanQuyen()).ketLuan(ct.getKetLuan())
                              .ghiChu(ct.getGhiChu()).loaiTaiSan("PHAN_MEM").build());
               }
          }

          // Lấy tên người dùng kiểm kê tránh lỗi N+1 Query
          String actorName = null;
          if (p.getIdNhanVienKiemKe() != null) {
               actorName = nguoiDungRepository.findById(p.getIdNhanVienKiemKe()).map(this::getHoTenNguoiDung)
                         .orElse(null);
          }

          return PhieuKiemKeResponse.builder()
                    .id(p.getId()).idDonVi(p.getIdDonVi())
                    .dotKiemKeId(p.getDotKiemKe() != null ? p.getDotKiemKe().getId() : null)
                    .maDotKiemKe(p.getDotKiemKe() != null ? p.getDotKiemKe().getMaDotKiemKe() : null)
                    .tenDotKiemKe(p.getDotKiemKe() != null ? p.getDotKiemKe().getTenDotKiemKe() : null)
                    .maPhieuKiemKe(p.getMaPhieuKiemKe()).idPhongBanKiemKe(p.getIdPhongBanKiemKe())
                    .tenNhanVienKiemKe(actorName)
                    .trangThai(p.getTrangThai().getValue()).thoiGianThucHien(p.getThoiGianThucHien())
                    .thoiGianTao(p.getThoiGianTao())
                    .danhSachChiTiet(flatList).build();
     }
}