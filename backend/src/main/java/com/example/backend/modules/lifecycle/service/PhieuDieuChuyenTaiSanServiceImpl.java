package com.example.backend.modules.lifecycle.service;

import com.example.backend.modules.asset.model.DanhSachThietBiPhanCung;
import com.example.backend.modules.asset.model.LinhKienPhanCung;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanCungRepository;
import com.example.backend.modules.asset.repository.LinhKienPhanCungRepository;
import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.auth.repository.NguoiDungRepository;
import com.example.backend.modules.auth.security.NguoiDungUserDetails;
import com.example.backend.modules.lifecycle.dto.*;
import com.example.backend.modules.lifecycle.model.*;
import com.example.backend.modules.lifecycle.repository.*;
import com.example.backend.modules.lifecycle.service.interfaces.PhieuDieuChuyenTaiSanService;
import com.example.backend.modules.tenant.model.PhongBan;
import com.example.backend.modules.tenant.repository.PhongBanRepository;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.model.TrangThaiPhieuEnum;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.tenant.DonViContextHolder;
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
public class PhieuDieuChuyenTaiSanServiceImpl implements PhieuDieuChuyenTaiSanService {

     private final PhieuDieuChuyenTaiSanRepository phieuDieuChuyenTaiSanRepository;
     private final ChiTietDieuChuyenPhanCungRepository chiTietDieuChuyenPhanCungRepository;
     private final ChiTietDieuChuyenLinhKienRepository chiTietDieuChuyenLinhKienRepository;
     private final ChiTietCapPhatPhanCungRepository chiTietCapPhatPhanCungRepository;
     private final ChiTietCapPhatLinhKienRepository chiTietCapPhatLinhKienRepository;
     private final PhieuCapPhatTaiSanRepository phieuCapPhatTaiSanRepository;
     private final DanhSachThietBiPhanCungRepository thietBiPhanCungRepository;
     private final LinhKienPhanCungRepository linhKienPhanCungRepository;
     private final NguoiDungRepository nguoiDungRepository;
     private final PhongBanRepository phongBanRepository;

     @Autowired
     @Lazy
     private RabbitTemplate rabbitTemplate;

     private Long getRequiredTenantId() {
          Long tenantId = DonViContextHolder.getTenantId();
          if (tenantId == null) {
               throw new NghiepVuException("Không tìm thấy thông tin đơn vị từ phiên làm việc của hệ thống SaaS", 403);
          }
          return tenantId;
     }

     private Long getCurrentUserId() {
          Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
          if (authentication != null && authentication.getPrincipal() instanceof NguoiDungUserDetails userDetails) {
               return userDetails.getNguoiDung().getId();
          }
          throw new NghiepVuException("Không tìm thấy thông tin nhân viên thao tác từ phiên làm việc", 401);
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
     @Transactional(readOnly = true)
     public PageResponse<PhieuDieuChuyenTaiSanResponse> layDanhSach(String trangThai, Long idNguoiChuyen,
               Long idNguoiNhan,
               LocalDate tuNgay, LocalDate denNgay, int page, int size, String sort) {
          Long tenantId = getRequiredTenantId();
          String[] sortParts = sort.split(",");
          Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
          PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortParts[0]));

          Specification<PhieuDieuChuyenTaiSan> spec = (root, query, cb) -> {
               List<Predicate> predicates = new ArrayList<>();
               predicates.add(cb.isNull(root.get("thoiGianXoa")));
               predicates.add(cb.equal(root.get("idDonVi"), tenantId));

               if (trangThai != null && !trangThai.trim().isEmpty()) {
                    predicates.add(cb.equal(root.get("trangThai"), TrangThaiPhieuEnum.fromValue(trangThai.trim())));
               }
               if (idNguoiChuyen != null) {
                    predicates.add(cb.equal(root.get("idNguoiChuyen"), idNguoiChuyen));
               }
               if (idNguoiNhan != null) {
                    predicates.add(cb.equal(root.get("idNguoiNhan"), idNguoiNhan));
               }
               if (tuNgay != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("thoiGianBanGiao"), tuNgay.atStartOfDay()));
               }
               if (denNgay != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("thoiGianBanGiao"), denNgay.atTime(LocalTime.MAX)));
               }
               return cb.and(predicates.toArray(new Predicate[0]));
          };

          Page<PhieuDieuChuyenTaiSan> pageResult = phieuDieuChuyenTaiSanRepository.findAll(spec, pageRequest);
          List<PhieuDieuChuyenTaiSanResponse> content = mapToResponseList(pageResult.getContent());
          return PageResponse.from(new PageImpl<>(content, pageRequest, pageResult.getTotalElements()));
     }

     private List<PhieuDieuChuyenTaiSanResponse> mapToResponseList(List<PhieuDieuChuyenTaiSan> phieuList) {
          if (phieuList.isEmpty())
               return new ArrayList<>();

          Set<Long> userIds = new HashSet<>();
          Set<Long> pbIds = new HashSet<>();
          for (PhieuDieuChuyenTaiSan p : phieuList) {
               if (p.getIdNguoiChuyen() != null)
                    userIds.add(p.getIdNguoiChuyen());
               if (p.getIdNguoiNhan() != null)
                    userIds.add(p.getIdNguoiNhan());
               if (p.getIdNguoiLap() != null)
                    userIds.add(p.getIdNguoiLap());
               if (p.getIdNguoiPheDuyet() != null)
                    userIds.add(p.getIdNguoiPheDuyet());
               if (p.getIdPhongBanChuyen() != null)
                    pbIds.add(p.getIdPhongBanChuyen());
               if (p.getIdPhongBanNhan() != null)
                    pbIds.add(p.getIdPhongBanNhan());
          }

          Map<Long, String> userMap = nguoiDungRepository.findAllById(userIds).stream()
                    .collect(Collectors.toMap(NguoiDung::getId, this::getHoTenNguoiDung));
          Map<Long, String> pbMap = phongBanRepository.findAllById(pbIds).stream()
                    .collect(Collectors.toMap(PhongBan::getId, PhongBan::getTenPhongBan));

          List<PhieuDieuChuyenTaiSanResponse> responses = new ArrayList<>();
          for (PhieuDieuChuyenTaiSan phieu : phieuList) {
               responses.add(PhieuDieuChuyenTaiSanResponse.builder()
                         .id(phieu.getId())
                         .idDonVi(phieu.getIdDonVi())
                         .maPhieuDieuChuyen(phieu.getMaPhieuDieuChuyen())
                         .idNguoiChuyen(phieu.getIdNguoiChuyen())
                         .tenNguoiChuyen(userMap.get(phieu.getIdNguoiChuyen()))
                         .idPhongBanChuyen(phieu.getIdPhongBanChuyen())
                         .tenPhongBanChuyen(pbMap.get(phieu.getIdPhongBanChuyen()))
                         .idNguoiNhan(phieu.getIdNguoiNhan())
                         .tenNguoiNhan(userMap.get(phieu.getIdNguoiNhan()))
                         .idPhongBanNhan(phieu.getIdPhongBanNhan())
                         .tenPhongBanNhan(pbMap.get(phieu.getIdPhongBanNhan()))
                         .tenNguoiLap(userMap.get(phieu.getIdNguoiLap()))
                         .tenNguoiPheDuyet(userMap.get(phieu.getIdNguoiPheDuyet()))
                         .lyDoDieuChuyen(phieu.getLyDoDieuChuyen())
                         .thoiGianBanGiao(phieu.getThoiGianBanGiao())
                         .trangThai(phieu.getTrangThai() != null ? phieu.getTrangThai().getValue() : null)
                         .thoiGianTao(phieu.getThoiGianTao())
                         .thoiGianCapNhat(phieu.getThoiGianCapNhat())
                         .chiTietTaiSan(new ArrayList<>())
                         .build());
          }
          return responses;
     }

     @Override
     @Transactional(readOnly = true)
     public PhieuDieuChuyenTaiSanResponse layTheoId(Long id) {
          Long tenantId = getRequiredTenantId();
          PhieuDieuChuyenTaiSan phieu = phieuDieuChuyenTaiSanRepository
                    .findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException(
                              "Không tìm thấy thông tin phiếu điều chuyển tài sản yêu cầu", 404));
          return mapToResponse(phieu, true);
     }

     @Override
     @Transactional
     public PhieuDieuChuyenTaiSanResponse themMoi(PhieuDieuChuyenTaiSanRequest request) {
          Long tenantId = getRequiredTenantId();
          Long userId = getCurrentUserId();

          int hardwareSize = request.getDanhSachPhanCung() != null ? request.getDanhSachPhanCung().size() : 0;
          int componentSize = request.getDanhSachLinhKien() != null ? request.getDanhSachLinhKien().size() : 0;

          if (hardwareSize == 0 && componentSize == 0) {
               throw new NghiepVuException(
                         "Yêu cầu lập phiếu thất bại! Phải chọn ít nhất 1 thiết bị hoặc linh kiện để điều chuyển", 400);
          }

          PhieuDieuChuyenTaiSan phieu = new PhieuDieuChuyenTaiSan();
          phieu.setIdDonVi(tenantId);
          phieu.setMaPhieuDieuChuyen("PDC-" + tenantId + "-" + System.currentTimeMillis());
          phieu.setIdNguoiChuyen(request.getIdNguoiChuyen());
          phieu.setIdPhongBanChuyen(request.getIdPhongBanChuyen());
          phieu.setIdNguoiNhan(request.getIdNguoiNhan());
          phieu.setIdPhongBanNhan(request.getIdPhongBanNhan());
          phieu.setLyDoDieuChuyen(request.getLyDoDieuChuyen());
          phieu.setTrangThai(TrangThaiPhieuEnum.TAO_MOI);
          phieu.setIdNguoiLap(userId);

          PhieuDieuChuyenTaiSan savedPhieu = phieuDieuChuyenTaiSanRepository.save(phieu);

          // 1. Vòng lặp lưu mảng Chi tiết Cấp phát Phần Cứng đầu vào của Request
          if (request.getDanhSachPhanCung() != null) {
               for (ChiTietDieuChuyenPhanCungRequest item : request.getDanhSachPhanCung()) {
                    ChiTietCapPhatPhanCung cp = chiTietCapPhatPhanCungRepository
                              .findById(item.getChiTietCapPhatPhanCungId())
                              .orElseThrow(() -> new NghiepVuException(
                                        "Không tìm thấy chi tiết cấp phát thiết bị phần cứng gốc ID: "
                                                  + item.getChiTietCapPhatPhanCungId(),
                                        400));

                    if (cp.getThoiGianXoa() != null) {
                         throw new NghiepVuException(
                                   "Thiết bị phần cứng thuộc lượt cấp phát ID " + item.getChiTietCapPhatPhanCungId()
                                             + " đang bận hoặc đã được điều chuyển/thu hồi trước đó!",
                                   400);
                    }

                    // Xóa mềm dòng cấp phát cũ của người gửi để Giữ Chỗ ngầm (Lock vật tư)
                    cp.setThoiGianXoa(LocalDateTime.now());
                    cp.setLyDoXoa("Đang điều chuyển tài sản (Chờ hoàn thành)");
                    chiTietCapPhatPhanCungRepository.save(cp);

                    ChiTietDieuChuyenPhanCung ct = new ChiTietDieuChuyenPhanCung();
                    ct.setPhieuDieuChuyenTaiSan(savedPhieu);
                    ct.setDanhSachThietBiPhanCungId(cp.getDanhSachThietBiPhanCungId());
                    ct.setChiTietCapPhatPhanCung(cp);
                    ct.setTrangThaiXuat(item.getTrangThaiXuat());
                    ct.setGhiChu(item.getGhiChu());
                    chiTietDieuChuyenPhanCungRepository.save(ct);
               }
          }

          // 2. Vòng lặp lưu mảng Chi tiết Cấp phát Linh Kiện đầu vào riêng biệt của
          // Request
          if (request.getDanhSachLinhKien() != null) {
               for (ChiTietDieuChuyenLinhKienRequest item : request.getDanhSachLinhKien()) {
                    ChiTietCapPhatLinhKien cp = chiTietCapPhatLinhKienRepository
                              .findById(item.getChiTietCapPhatLinhKienId())
                              .orElseThrow(() -> new NghiepVuException(
                                        "Không tìm thấy chi tiết cấp phát linh kiện gốc ID: "
                                                  + item.getChiTietCapPhatLinhKienId(),
                                        400));

                    if (cp.getThoiGianXoa() != null) {
                         throw new NghiepVuException(
                                   "Linh kiện thuộc lượt cấp phát ID " + item.getChiTietCapPhatLinhKienId()
                                             + " đang bận hoặc đã được điều chuyển/thu hồi trước đó!",
                                   400);
                    }

                    // Xóa mềm dòng cấp phát linh kiện cũ của người gửi để giữ chỗ ngầm
                    cp.setThoiGianXoa(LocalDateTime.now());
                    cp.setLyDoXoa("Đang điều chuyển linh kiện (Chờ hoàn thành)");
                    chiTietCapPhatLinhKienRepository.save(cp);

                    ChiTietDieuChuyenLinhKien ct = new ChiTietDieuChuyenLinhKien();
                    ct.setPhieuDieuChuyenTaiSan(savedPhieu);
                    ct.setLinhKienPhanCungId(cp.getLinhKienPhanCungId());
                    ct.setChiTietCapPhatLinhKien(cp);
                    ct.setTrangThaiXuat(item.getTrangThaiXuat());
                    ct.setGhiChu(item.getGhiChu());
                    chiTietDieuChuyenLinhKienRepository.save(ct);
               }
          }

          return mapToResponse(savedPhieu, true);
     }

     // ==========================================================
     // CHỨC NĂNG 2: CẬP NHẬT PHIẾU ĐIỀU CHUYỂN (TÁCH BIỆT MẢNG REQUEST)
     // ==========================================================
     @Override
     @Transactional
     public PhieuDieuChuyenTaiSanResponse capNhat(Long id, PhieuDieuChuyenTaiSanRequest request) {
          Long tenantId = getRequiredTenantId();
          PhieuDieuChuyenTaiSan phieu = phieuDieuChuyenTaiSanRepository
                    .findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy phiếu điều chuyển cần chỉnh sửa", 404));

          if (phieu.getTrangThai() != TrangThaiPhieuEnum.TAO_MOI) {
               throw new NghiepVuException(
                         "Chỉ được chỉnh sửa phiếu điều chuyển khi đang ở trạng thái Tạo mới (TAO_MOI)", 400);
          }

          phieu.setIdNguoiChuyen(request.getIdNguoiChuyen());
          phieu.setIdPhongBanChuyen(request.getIdPhongBanChuyen());
          phieu.setIdNguoiNhan(request.getIdNguoiNhan());
          phieu.setIdPhongBanNhan(request.getIdPhongBanNhan());
          phieu.setLyDoDieuChuyen(request.getLyDoDieuChuyen());

          // 2.1: Đối soát mảng Phần Cứng từ Request đầu vào (`chiTietCapPhatPhanCungId`)
          List<ChiTietDieuChuyenPhanCung> oldPcDetails = chiTietDieuChuyenPhanCungRepository
                    .findByPhieuDieuChuyenTaiSanIdAndThoiGianXoaIsNull(id);
          Map<Long, ChiTietDieuChuyenPhanCung> oldPcMap = oldPcDetails.stream()
                    .collect(Collectors.toMap(x -> x.getChiTietCapPhatPhanCung().getId(), x -> x));

          List<ChiTietDieuChuyenPhanCungRequest> newPcReq = request.getDanhSachPhanCung() != null
                    ? request.getDanhSachPhanCung()
                    : new ArrayList<>();
          Set<Long> newPcCpIds = newPcReq.stream().map(ChiTietDieuChuyenPhanCungRequest::getChiTietCapPhatPhanCungId)
                    .collect(Collectors.toSet());

          // Loại bỏ phần tử phần cứng bị xóa khỏi danh sách mới
          for (ChiTietDieuChuyenPhanCung oldDt : oldPcDetails) {
               Long cpId = oldDt.getChiTietCapPhatPhanCung().getId();
               if (!newPcCpIds.contains(cpId)) {
                    ChiTietCapPhatPhanCung cp = oldDt.getChiTietCapPhatPhanCung();
                    cp.setThoiGianXoa(null); // Nhả trạng thái xóa mềm cấp phát gốc cho người gửi
                    cp.setLyDoXoa(null);
                    chiTietCapPhatPhanCungRepository.save(cp);

                    chiTietDieuChuyenPhanCungRepository.delete(oldDt); // Xóa cứng dòng chi tiết cũ bị bỏ ra ngoài
               }
          }

          // Cập nhật hoặc thêm mới phần cứng
          for (ChiTietDieuChuyenPhanCungRequest item : newPcReq) {
               ChiTietDieuChuyenPhanCung oldDt = oldPcMap.get(item.getChiTietCapPhatPhanCungId());
               if (oldDt != null) {
                    oldDt.setTrangThaiXuat(item.getTrangThaiXuat());
                    oldDt.setGhiChu(item.getGhiChu());
                    chiTietDieuChuyenPhanCungRepository.save(oldDt);
               } else {
                    ChiTietCapPhatPhanCung cp = chiTietCapPhatPhanCungRepository
                              .findById(item.getChiTietCapPhatPhanCungId())
                              .orElseThrow(() -> new NghiepVuException("Không tìm thấy chi tiết cấp phát phần cứng ID: "
                                        + item.getChiTietCapPhatPhanCungId(), 400));

                    cp.setThoiGianXoa(LocalDateTime.now());
                    cp.setLyDoXoa("Đang điều chuyển tài sản (Chờ hoàn thành)");
                    chiTietCapPhatPhanCungRepository.save(cp);

                    ChiTietDieuChuyenPhanCung newDt = new ChiTietDieuChuyenPhanCung();
                    newDt.setPhieuDieuChuyenTaiSan(phieu);
                    newDt.setDanhSachThietBiPhanCungId(cp.getDanhSachThietBiPhanCungId());
                    newDt.setChiTietCapPhatPhanCung(cp);
                    newDt.setTrangThaiXuat(item.getTrangThaiXuat());
                    newDt.setGhiChu(item.getGhiChu());
                    chiTietDieuChuyenPhanCungRepository.save(newDt);
               }
          }

          // 2.2: Đối soát mảng Linh Kiện từ Request đầu vào (`chiTietCapPhatLinhKienId`)
          List<ChiTietDieuChuyenLinhKien> oldLkDetails = chiTietDieuChuyenLinhKienRepository
                    .findByPhieuDieuChuyenTaiSanIdAndThoiGianXoaIsNull(id);
          Map<Long, ChiTietDieuChuyenLinhKien> oldLkMap = oldLkDetails.stream()
                    .collect(Collectors.toMap(x -> x.getChiTietCapPhatLinhKien().getId(), x -> x));

          List<ChiTietDieuChuyenLinhKienRequest> newLkReq = request.getDanhSachLinhKien() != null
                    ? request.getDanhSachLinhKien()
                    : new ArrayList<>();
          Set<Long> newLkCpIds = newLkReq.stream().map(ChiTietDieuChuyenLinhKienRequest::getChiTietCapPhatLinhKienId)
                    .collect(Collectors.toSet());

          // Loại bỏ linh kiện bị xóa khỏi danh sách mới
          for (ChiTietDieuChuyenLinhKien oldDt : oldLkDetails) {
               Long cpId = oldDt.getChiTietCapPhatLinhKien().getId();
               if (!newLkCpIds.contains(cpId)) {
                    ChiTietCapPhatLinhKien cp = oldDt.getChiTietCapPhatLinhKien();
                    cp.setThoiGianXoa(null); // Nhả trạng thái xóa mềm cấp phát gốc cho người gửi
                    cp.setLyDoXoa(null);
                    chiTietCapPhatLinhKienRepository.save(cp);

                    chiTietDieuChuyenLinhKienRepository.delete(oldDt); // Xóa cứng dòng chi tiết cũ bị bỏ ra ngoài
               }
          }

          // Cập nhật hoặc thêm mới linh kiện
          for (ChiTietDieuChuyenLinhKienRequest item : newLkReq) {
               ChiTietDieuChuyenLinhKien oldDt = oldLkMap.get(item.getChiTietCapPhatLinhKienId());
               if (oldDt != null) {
                    oldDt.setTrangThaiXuat(item.getTrangThaiXuat());
                    oldDt.setGhiChu(item.getGhiChu());
                    chiTietDieuChuyenLinhKienRepository.save(oldDt);
               } else {
                    ChiTietCapPhatLinhKien cp = chiTietCapPhatLinhKienRepository
                              .findById(item.getChiTietCapPhatLinhKienId())
                              .orElseThrow(() -> new NghiepVuException("Không tìm thấy chi tiết cấp phát linh kiện ID: "
                                        + item.getChiTietCapPhatLinhKienId(), 400));

                    cp.setThoiGianXoa(LocalDateTime.now());
                    cp.setLyDoXoa("Đang điều chuyển linh kiện (Chờ hoàn thành)");
                    chiTietCapPhatLinhKienRepository.save(cp);

                    ChiTietDieuChuyenLinhKien newDt = new ChiTietDieuChuyenLinhKien();
                    newDt.setPhieuDieuChuyenTaiSan(phieu);
                    newDt.setLinhKienPhanCungId(cp.getLinhKienPhanCungId());
                    newDt.setChiTietCapPhatLinhKien(cp);
                    newDt.setTrangThaiXuat(item.getTrangThaiXuat());
                    newDt.setGhiChu(item.getGhiChu());
                    chiTietDieuChuyenLinhKienRepository.save(newDt);
               }
          }

          PhieuDieuChuyenTaiSan saved = phieuDieuChuyenTaiSanRepository.save(phieu);
          return mapToResponse(saved, true);
     }

     @Override
     @Transactional
     public void xoaMem(Long id) {
          Long tenantId = getRequiredTenantId();
          PhieuDieuChuyenTaiSan phieu = phieuDieuChuyenTaiSanRepository
                    .findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin phiếu điều chuyển cần hủy bỏ",
                              404));

          if (phieu.getTrangThai() == TrangThaiPhieuEnum.DA_PHE_DUYET
                    || phieu.getTrangThai() == TrangThaiPhieuEnum.HOAN_THANH) {
               throw new NghiepVuException(
                         "Không được phép xóa hoặc hủy bỏ phiếu điều chuyển đã được phê duyệt hoặc đã hoàn thành",
                         400);
          }

          // 1. Phục hồi danh mục phần cứng người gửi về hoạt động lại
          List<ChiTietDieuChuyenPhanCung> pcDetails = chiTietDieuChuyenPhanCungRepository
                    .findByPhieuDieuChuyenTaiSanIdAndThoiGianXoaIsNull(id);
          for (ChiTietDieuChuyenPhanCung dt : pcDetails) {
               if (dt.getChiTietCapPhatPhanCung() != null) {
                    ChiTietCapPhatPhanCung cp = dt.getChiTietCapPhatPhanCung();
                    cp.setThoiGianXoa(null); // Nhả cờ xóa mềm để khôi phục hiệu lực cấp phát cho người gửi
                    cp.setLyDoXoa(null);
                    chiTietCapPhatPhanCungRepository.save(cp);
               }
               dt.setThoiGianXoa(LocalDateTime.now());
               dt.setLyDoXoa("Hủy phiếu điều chuyển phần cứng tổng");
               chiTietDieuChuyenPhanCungRepository.save(dt);
          }

          // 2. Phục hồi danh mục linh kiện người gửi về hoạt động lại
          List<ChiTietDieuChuyenLinhKien> lkDetails = chiTietDieuChuyenLinhKienRepository
                    .findByPhieuDieuChuyenTaiSanIdAndThoiGianXoaIsNull(id);
          for (ChiTietDieuChuyenLinhKien dt : lkDetails) {
               if (dt.getChiTietCapPhatLinhKien() != null) {
                    ChiTietCapPhatLinhKien cp = dt.getChiTietCapPhatLinhKien();
                    cp.setThoiGianXoa(null);
                    cp.setLyDoXoa(null);
                    chiTietCapPhatLinhKienRepository.save(cp);
               }
               dt.setThoiGianXoa(LocalDateTime.now());
               dt.setLyDoXoa("Hủy phiếu điều chuyển linh kiện tổng");
               chiTietDieuChuyenLinhKienRepository.save(dt);
          }

          phieu.setThoiGianXoa(LocalDateTime.now());
          phieu.setLyDoXoa("Người dùng hủy yêu cầu / Yêu cầu không được phê duyệt");
          phieuDieuChuyenTaiSanRepository.save(phieu);
     }

     @Override
     @Transactional
     public void yeuCauPheDuyet(Long id) {
          Long tenantId = getRequiredTenantId();
          PhieuDieuChuyenTaiSan phieu = phieuDieuChuyenTaiSanRepository
                    .findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy phiếu điều chuyển", 404));

          if (!phieu.getTrangThai().canTransitionTo(TrangThaiPhieuEnum.GUI_PHE_DUYET)) {
               throw new NghiepVuException("Trạng thái phiếu không hợp lệ để thực hiện gửi yêu cầu phê duyệt", 400);
          }
          phieu.setTrangThai(TrangThaiPhieuEnum.GUI_PHE_DUYET);
          phieuDieuChuyenTaiSanRepository.save(phieu);
     }

     @Override
     @Transactional
     public void pheDuyet(Long id) {
          Long tenantId = getRequiredTenantId();
          Long userId = getCurrentUserId();
          PhieuDieuChuyenTaiSan phieu = phieuDieuChuyenTaiSanRepository
                    .findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy dữ liệu phiếu điều chuyển tài sản", 404));

          if (!phieu.getTrangThai().canTransitionTo(TrangThaiPhieuEnum.DA_PHE_DUYET)) {
               throw new NghiepVuException("Trạng thái phiếu hiện tại không hợp lệ để thực hiện phê duyệt", 400);
          }
          phieu.setTrangThai(TrangThaiPhieuEnum.DA_PHE_DUYET);
          phieu.setIdNguoiPheDuyet(userId);
          phieuDieuChuyenTaiSanRepository.save(phieu);
     }

     @Override
     @Transactional
     public void hoanThanh(Long id) {
          Long tenantId = getRequiredTenantId();
          Long userId = getCurrentUserId();

          PhieuDieuChuyenTaiSan phieu = phieuDieuChuyenTaiSanRepository
                    .findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(
                              () -> new NghiepVuException("Không tìm thấy thông tin phiếu điều chuyển tài sản", 404));

          if (!phieu.getTrangThai().canTransitionTo(TrangThaiPhieuEnum.HOAN_THANH)) {
               throw new NghiepVuException("Trạng thái phiếu hiện hành không hợp lệ để xác nhận hoàn thành", 400);
          }

          List<ChiTietDieuChuyenPhanCung> pcDetails = chiTietDieuChuyenPhanCungRepository
                    .findByPhieuDieuChuyenTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
          List<ChiTietDieuChuyenLinhKien> lkDetails = chiTietDieuChuyenLinhKienRepository
                    .findByPhieuDieuChuyenTaiSanIdAndThoiGianXoaIsNull(phieu.getId());

          // LUỒNG CHẠY NGẦM TỰ ĐỘNG: Khởi tạo 1 PhieuCapPhatTaiSan tổng (ảo) cho Người
          // nhận mới tinh dưới DB
          PhieuCapPhatTaiSan phieuVirtual = new PhieuCapPhatTaiSan();
          phieuVirtual.setIdDonVi(tenantId);
          phieuVirtual.setIdNguoiLap(userId);
          phieuVirtual.setMaPhiepCapPhat("PCP-AUTO-" + tenantId + "-" + System.currentTimeMillis());
          phieuVirtual.setIdNguoiNhan(phieu.getIdNguoiNhan());
          phieuVirtual.setIdPhongBanNhan(phieu.getIdPhongBanNhan());
          phieuVirtual.setMucDichSuDung("Nhận bàn giao máy trực tiếp từ nhân viên qua mã phiếu điều chuyển: "
                    + phieu.getMaPhieuDieuChuyen());
          phieuVirtual.setTrangThai(TrangThaiPhieuEnum.HOAN_THANH);
          phieuVirtual.setThoiGianBanGiao(LocalDateTime.now());
          PhieuCapPhatTaiSan savedVirtualPhieu = phieuCapPhatTaiSanRepository.save(phieuVirtual);

          // đẩy sự kiện xuống queue để thực hiện cập nhật bao cáo cấp phát
          for (ChiTietDieuChuyenPhanCung pc : pcDetails) {
               if (pc.getTrangThaiNhan() == null || pc.getTrangThaiNhan().trim().isEmpty()) {
                    pc.setTrangThaiNhan("Đã nhận bàn giao thiết bị phần cứng từ điều chuyển");
               }
               chiTietDieuChuyenPhanCungRepository.save(pc);

               if (pc.getChiTietCapPhatPhanCung() != null) {
                    ChiTietCapPhatPhanCung cpOld = pc.getChiTietCapPhatPhanCung();
                    cpOld.setLyDoXoa("Đã hoàn tất đóng chu kỳ sở hữu cũ thông qua điều chuyển");
                    chiTietCapPhatPhanCungRepository.save(cpOld);
               }

               ChiTietCapPhatPhanCung cpNew = new ChiTietCapPhatPhanCung();
               cpNew.setPhieuCapPhatTaiSan(savedVirtualPhieu);
               cpNew.setDanhSachThietBiPhanCungId(pc.getDanhSachThietBiPhanCungId());
               cpNew.setTinhTrangLucGiao(pc.getTrangThaiNhan());
               cpNew.setGhiChu("Kế thừa tự động từ mã phiếu điều chuyển hệ thống: " + phieu.getMaPhieuDieuChuyen());
               chiTietCapPhatPhanCungRepository.save(cpNew);

               // BẮN SỰ KIỆN ĐIỀU CHUYỂN PHẦN CỨNG SANG HÀNG ĐỢI
               com.example.backend.shared.dto.BienDongCapPhatEvent eventBus = com.example.backend.shared.dto.BienDongCapPhatEvent
                         .builder()
                         .idDonVi(tenantId)
                         .idTaiSanCuThe(pc.getDanhSachThietBiPhanCungId())
                         .loaiTaiSan("PHAN_CUNG")
                         .idPhongBanCu(phieu.getIdPhongBanChuyen())
                         .idPhongBanMoi(phieu.getIdPhongBanNhan())
                         .idNhanVienTiepNhan(phieu.getIdNguoiNhan())
                         .idChungTuGoc(phieu.getId())
                         .maChungTuGoc(phieu.getMaPhieuDieuChuyen())
                         .tinhTrangBanGiao(pc.getTrangThaiNhan())
                         .hanhDong(com.example.backend.shared.dto.HanhDongCapPhatEnum.DIEU_CHUYEN)
                         .build();
               rabbitTemplate.convertAndSend("inventory.bien-dong-cap-phat.queue", eventBus);
          }

          // 6.2: Điều chuyển linh kiện rời và phát hành thông điệp
          for (ChiTietDieuChuyenLinhKien lk : lkDetails) {
               if (lk.getTrangThaiNhan() == null || lk.getTrangThaiNhan().trim().isEmpty()) {
                    lk.setTrangThaiNhan("Đã nhận bàn giao linh kiện từ điều chuyển");
               }
               chiTietDieuChuyenLinhKienRepository.save(lk);

               if (lk.getChiTietCapPhatLinhKien() != null) {
                    ChiTietCapPhatLinhKien cpOld = lk.getChiTietCapPhatLinhKien();
                    cpOld.setLyDoXoa("Đã hoàn tất chu kỳ sở hữu cũ thông qua điều chuyển");
                    chiTietCapPhatLinhKienRepository.save(cpOld);
               }

               ChiTietCapPhatLinhKien cpNew = new ChiTietCapPhatLinhKien();
               cpNew.setPhieuCapPhatTaiSan(savedVirtualPhieu);
               cpNew.setLinhKienPhanCungId(lk.getLinhKienPhanCungId());
               cpNew.setTinhTrangLucGiao(lk.getTrangThaiNhan());
               cpNew.setGhiChu("Kế thừa tự động từ mã phiếu điều chuyển hệ thống: " + phieu.getMaPhieuDieuChuyen());
               chiTietCapPhatLinhKienRepository.save(cpNew);

               // BẮN SỰ KIỆN ĐIỀU CHUYỂN LINH KIỆN SANG HÀNG ĐỢI
               com.example.backend.shared.dto.BienDongCapPhatEvent eventBus = com.example.backend.shared.dto.BienDongCapPhatEvent
                         .builder()
                         .idDonVi(tenantId)
                         .idTaiSanCuThe(lk.getLinhKienPhanCungId())
                         .loaiTaiSan("LINH_KIEN")
                         .idPhongBanCu(phieu.getIdPhongBanChuyen())
                         .idPhongBanMoi(phieu.getIdPhongBanNhan())
                         .idNhanVienTiepNhan(phieu.getIdNguoiNhan())
                         .idChungTuGoc(phieu.getId())
                         .maChungTuGoc(phieu.getMaPhieuDieuChuyen())
                         .tinhTrangBanGiao(lk.getTrangThaiNhan())
                         .hanhDong(com.example.backend.shared.dto.HanhDongCapPhatEnum.DIEU_CHUYEN)
                         .build();
               rabbitTemplate.convertAndSend("inventory.bien-dong-cap-phat.queue", eventBus);
          }

          phieu.setTrangThai(TrangThaiPhieuEnum.HOAN_THANH);
          phieu.setThoiGianBanGiao(LocalDateTime.now());
          phieuDieuChuyenTaiSanRepository.save(phieu);
     }

     @Override
     @Transactional
     public void tuChoiPheDuyet(Long id, String lyDoTuChoi) {
          Long idDonVi = getRequiredTenantId();
          PhieuDieuChuyenTaiSan phieu = phieuDieuChuyenTaiSanRepository
                    .findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy phiếu điều chuyển tài sản", 404));

          if (phieu.getTrangThai() != TrangThaiPhieuEnum.GUI_PHE_DUYET) {
               throw new NghiepVuException("Chỉ được từ chối phê duyệt phiếu ở trạng thái Gửi phê duyệt", 400);
          }

          phieu.setTrangThai(TrangThaiPhieuEnum.TU_CHOI);
          phieu.setLyDoTuChoi(lyDoTuChoi);
          phieuDieuChuyenTaiSanRepository.save(phieu);

          // Khôi phục các dòng cấp phát cũ bị xóa mềm trở lại hoạt động bình thường
          // 1. Phần cứng
          List<ChiTietDieuChuyenPhanCung> danhSachPhanCung = chiTietDieuChuyenPhanCungRepository
                    .findByPhieuDieuChuyenTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
          for (ChiTietDieuChuyenPhanCung pc : danhSachPhanCung) {
               if (pc.getChiTietCapPhatPhanCung() != null) {
                    ChiTietCapPhatPhanCung cp = pc.getChiTietCapPhatPhanCung();
                    cp.setThoiGianXoa(null);
                    cp.setLyDoXoa(null);
                    chiTietCapPhatPhanCungRepository.save(cp);
               }
          }

          // 2. Linh kiện
          List<ChiTietDieuChuyenLinhKien> danhSachLinhKien = chiTietDieuChuyenLinhKienRepository
                    .findByPhieuDieuChuyenTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
          for (ChiTietDieuChuyenLinhKien lk : danhSachLinhKien) {
               if (lk.getChiTietCapPhatLinhKien() != null) {
                    ChiTietCapPhatLinhKien cp = lk.getChiTietCapPhatLinhKien();
                    cp.setThoiGianXoa(null);
                    cp.setLyDoXoa(null);
                    chiTietCapPhatLinhKienRepository.save(cp);
               }
          }
     }

     private PhieuDieuChuyenTaiSanResponse mapToResponse(PhieuDieuChuyenTaiSan phieu, boolean includeDetails) {
          Set<Long> userIds = new HashSet<>();
          Set<Long> pbIds = new HashSet<>();
          if (phieu.getIdNguoiChuyen() != null)
               userIds.add(phieu.getIdNguoiChuyen());
          if (phieu.getIdNguoiNhan() != null)
               userIds.add(phieu.getIdNguoiNhan());
          if (phieu.getIdNguoiLap() != null)
               userIds.add(phieu.getIdNguoiLap());
          if (phieu.getIdNguoiPheDuyet() != null)
               userIds.add(phieu.getIdNguoiPheDuyet());
          if (phieu.getIdPhongBanChuyen() != null)
               pbIds.add(phieu.getIdPhongBanChuyen());
          if (phieu.getIdPhongBanNhan() != null)
               pbIds.add(phieu.getIdPhongBanNhan());

          Map<Long, String> userMap = nguoiDungRepository.findAllById(userIds).stream()
                    .collect(Collectors.toMap(NguoiDung::getId, this::getHoTenNguoiDung));
          Map<Long, String> pbMap = phongBanRepository.findAllById(pbIds).stream()
                    .collect(Collectors.toMap(PhongBan::getId, PhongBan::getTenPhongBan));

          List<ChiTietDieuChuyenGeneralResponse> chiTietTaiSan = new ArrayList<>();

          if (includeDetails) {
               // 1. Quét danh sách chi tiết phần cứng vật lý dưới DB -> Đóng gói gộp vào mảng
               // Response chung phẳng
               List<ChiTietDieuChuyenPhanCung> pcList = chiTietDieuChuyenPhanCungRepository
                         .findByPhieuDieuChuyenTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
               for (ChiTietDieuChuyenPhanCung pc : pcList) {
                    String tenTaiSan = "", soSerial = "", maThe = "";
                    DanhSachThietBiPhanCung tb = thietBiPhanCungRepository.findById(pc.getDanhSachThietBiPhanCungId())
                              .orElse(null);
                    if (tb != null) {
                         soSerial = tb.getSoSerial();
                         maThe = tb.getMaTheTaiSan();
                         if (tb.getTaiSanPhanCung() != null)
                              tenTaiSan = tb.getTaiSanPhanCung().getTenMau();
                    }
                    chiTietTaiSan.add(ChiTietDieuChuyenGeneralResponse.builder()
                              .id(pc.getId())
                              .idTaiSan(pc.getDanhSachThietBiPhanCungId())
                              .chiTietCapPhatId(
                                        pc.getChiTietCapPhatPhanCung() != null ? pc.getChiTietCapPhatPhanCung().getId()
                                                  : null)
                              .tenTaiSan(tenTaiSan)
                              .soSerial(soSerial)
                              .maTheTaiSan(maThe)
                              .trangThaiXuat(pc.getTrangThaiXuat())
                              .trangThaiNhan(pc.getTrangThaiNhan())
                              .loai("PHAN_CUNG") // Gắn cờ để FE phân biệt dòng thiết bị
                              .ghiChu(pc.getGhiChu())
                              .build());
               }

               // 2. Quét danh sách chi tiết linh kiện vật lý dưới DB -> Gộp phẳng chung vào
               // cùng một mảng Response trên luôn
               List<ChiTietDieuChuyenLinhKien> lkList = chiTietDieuChuyenLinhKienRepository
                         .findByPhieuDieuChuyenTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
               for (ChiTietDieuChuyenLinhKien lk : lkList) {
                    String tenTaiSan = "", soSerial = "";
                    LinhKienPhanCung lkEntity = linhKienPhanCungRepository.findById(lk.getLinhKienPhanCungId())
                              .orElse(null);
                    if (lkEntity != null) {
                         soSerial = lkEntity.getSoSerial();
                         if (lkEntity.getTaiSanPhanCung() != null)
                              tenTaiSan = lkEntity.getTaiSanPhanCung().getTenMau();
                    }
                    chiTietTaiSan.add(ChiTietDieuChuyenGeneralResponse.builder()
                              .id(lk.getId())
                              .idTaiSan(lk.getLinhKienPhanCungId())
                              .chiTietCapPhatId(
                                        lk.getChiTietCapPhatLinhKien() != null ? lk.getChiTietCapPhatLinhKien().getId()
                                                  : null)
                              .tenTaiSan(tenTaiSan)
                              .soSerial(soSerial)
                              .maTheTaiSan(null) // Linh kiện không quản lý mã thẻ độc lập
                              .trangThaiXuat(lk.getTrangThaiXuat())
                              .trangThaiNhan(lk.getTrangThaiNhan())
                              .loai("LINH_KIEN") // Gắn cờ để FE phân biệt dòng linh kiện
                              .ghiChu(lk.getGhiChu())
                              .build());
               }
          }

          return PhieuDieuChuyenTaiSanResponse.builder()
                    .id(phieu.getId())
                    .idDonVi(phieu.getIdDonVi())
                    .maPhieuDieuChuyen(phieu.getMaPhieuDieuChuyen())
                    .idNguoiChuyen(phieu.getIdNguoiChuyen())
                    .tenNguoiChuyen(userMap.get(phieu.getIdNguoiChuyen()))
                    .idPhongBanChuyen(phieu.getIdPhongBanChuyen())
                    .tenPhongBanChuyen(pbMap.get(phieu.getIdPhongBanChuyen()))
                    .idNguoiNhan(phieu.getIdNguoiNhan())
                    .tenNguoiNhan(userMap.get(phieu.getIdNguoiNhan()))
                    .idPhongBanNhan(phieu.getIdPhongBanNhan())
                    .tenPhongBanNhan(pbMap.get(phieu.getIdPhongBanNhan()))
                    .tenNguoiLap(userMap.get(phieu.getIdNguoiLap()))
                    .tenNguoiPheDuyet(userMap.get(phieu.getIdNguoiPheDuyet()))
                    .lyDoDieuChuyen(phieu.getLyDoDieuChuyen())
                    .thoiGianBanGiao(phieu.getThoiGianBanGiao())
                    .trangThai(phieu.getTrangThai() != null ? phieu.getTrangThai().getValue() : null)
                    .thoiGianTao(phieu.getThoiGianTao())
                    .thoiGianCapNhat(phieu.getThoiGianCapNhat())
                    .chiTietTaiSan(chiTietTaiSan) // Trả về mảng gộp phẳng đồng bộ định dạng!
                    .build();
     }
}