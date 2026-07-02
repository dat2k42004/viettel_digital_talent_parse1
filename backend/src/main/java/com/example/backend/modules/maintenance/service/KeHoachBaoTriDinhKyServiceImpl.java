package com.example.backend.modules.maintenance.service;

import com.example.backend.modules.maintenance.dto.*;
import com.example.backend.modules.maintenance.model.*;
import com.example.backend.modules.maintenance.repository.*;
import com.example.backend.modules.maintenance.service.interfaces.KeHoachBaoTriDinhKyService;
import com.example.backend.modules.asset.model.TaiSanPhanCung;
import com.example.backend.modules.asset.repository.TaiSanPhanCungRepository;
import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.auth.repository.NguoiDungRepository;
import com.example.backend.modules.auth.security.NguoiDungUserDetails;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.model.TrangThaiPhieuEnum;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.tenant.DonViContextHolder;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
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
public class KeHoachBaoTriDinhKyServiceImpl implements KeHoachBaoTriDinhKyService {

     private final KeHoachBaoTriDinhKyRepository keHoachBaoTriDinhKyRepository;
     private final ChiTietKeHoachBaoTriRepository chiTietKeHoachBaoTriRepository;
     private final TaiSanPhanCungRepository taiSanPhanCungRepository;
     private final NguoiDungRepository nguoiDungRepository;

     private Long getRequiredTenantId() {
          Long tenantId = DonViContextHolder.getTenantId();
          if (tenantId == null)
               throw new NghiepVuException("Không tìm thấy thông tin đơn vị từ phiên làm việc", 403);
          return tenantId;
     }

     private Long getCurrentUserId() {
          Authentication auth = SecurityContextHolder.getContext().getAuthentication();
          if (auth != null && auth.getPrincipal() instanceof NguoiDungUserDetails user) {
               return user.getNguoiDung().getId();
          }
          throw new NghiepVuException("Không tìm thấy thông tin nhân viên thao tác", 401);
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

     private String evaluateTrangThaiDong(KeHoachBaoTriDinhKy kh) {
          if (kh.getThoiGianKetThucKeHoach() != null && kh.getThoiGianKetThucKeHoach().isBefore(LocalDate.now())) {
               return "HET_HAN";
          }
          return kh.getTrangThai() != null ? kh.getTrangThai().getValue() : null;
     }

     @Override
     @Transactional
     public KeHoachBaoTriDinhKyResponse themMoi(KeHoachBaoTriDinhKyRequest request) {
          Long tenantId = getRequiredTenantId();
          Long userId = getCurrentUserId();

          if (request.getThoiGianKetThucKeHoach().isBefore(request.getThoiGianBatDauKeHoach())) {
               throw new NghiepVuException("Thời gian kết thúc kế hoạch không được phép nhỏ hơn thời gian bắt đầu",
                         400);
          }

          if (request.getDanhSachChiTiet() == null || request.getDanhSachChiTiet().isEmpty()) {
               throw new NghiepVuException(
                         "Kế hoạch bảo trì phải có ít nhất một mẫu tài sản phần cứng để xác định phạm vi", 400);
          }

          KeHoachBaoTriDinhKy kh = new KeHoachBaoTriDinhKy();
          kh.setIdDonVi(tenantId);
          kh.setMaKeHoach("KHBT-" + tenantId + "-" + System.currentTimeMillis());
          kh.setTenKeHoach(request.getTenKeHoach());
          kh.setChuKyLap(request.getChuKyLap());
          kh.setThoiGianBatDauKeHoach(request.getThoiGianBatDauKeHoach());
          kh.setThoiGianKetThucKeHoach(request.getThoiGianKetThucKeHoach());
          kh.setChiPhiDuKien(request.getChiPhiDuKien());
          kh.setNoiDungBaoTri(request.getNoiDungBaoTri());
          kh.setTrangThai(TrangThaiPhieuEnum.TAO_MOI);
          kh.setIdNguoiLap(userId);

          KeHoachBaoTriDinhKy savedKh = keHoachBaoTriDinhKyRepository.save(kh);

          for (ChiTietKeHoachBaoTriRequest item : request.getDanhSachChiTiet()) {
               taiSanPhanCungRepository.findById(item.getIdTaiSanPhanCung())
                         .orElseThrow(() -> new NghiepVuException(
                                   "Không tìm thấy cấu hình mẫu tài sản phần cứng ID: " + item.getIdTaiSanPhanCung(),
                                   400));

               ChiTietKeHoachBaoTri ct = new ChiTietKeHoachBaoTri();
               ct.setKeHoachBaoTriDinhKy(savedKh);
               ct.setIdTaiSanPhanCung(item.getIdTaiSanPhanCung());
               chiTietKeHoachBaoTriRepository.save(ct);
          }

          return mapToResponse(savedKh, true);
     }

     @Override
     @Transactional
     public KeHoachBaoTriDinhKyResponse capNhat(Long id, KeHoachBaoTriDinhKyRequest request) {
          Long tenantId = getRequiredTenantId();
          KeHoachBaoTriDinhKy kh = keHoachBaoTriDinhKyRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin kế hoạch bảo trì", 404));

          if (kh.getTrangThai() != TrangThaiPhieuEnum.TAO_MOI) {
               throw new NghiepVuException(
                         "Chỉ được sửa đổi thông tin kế hoạch bảo trì khi đang ở trạng thái Tạo mới (TAO_MOI)", 400);
          }

          if (request.getThoiGianKetThucKeHoach().isBefore(request.getThoiGianBatDauKeHoach())) {
               throw new NghiepVuException("Thời gian kết thúc kế hoạch không được phép nhỏ hơn thời gian bắt đầu",
                         400);
          }

          kh.setTenKeHoach(request.getTenKeHoach());
          kh.setChuKyLap(request.getChuKyLap());
          kh.setThoiGianBatDauKeHoach(request.getThoiGianBatDauKeHoach());
          kh.setThoiGianKetThucKeHoach(request.getThoiGianKetThucKeHoach());
          kh.setChiPhiDuKien(request.getChiPhiDuKien());
          kh.setNoiDungBaoTri(request.getNoiDungBaoTri());

          List<ChiTietKeHoachBaoTri> oldDetails = chiTietKeHoachBaoTriRepository
                    .findByKeHoachBaoTriDinhKyIdAndThoiGianXoaIsNull(id);
          Set<Long> oldAssetIds = oldDetails.stream().map(ChiTietKeHoachBaoTri::getIdTaiSanPhanCung)
                    .collect(Collectors.toSet());

          List<ChiTietKeHoachBaoTriRequest> newReqs = request.getDanhSachChiTiet() != null
                    ? request.getDanhSachChiTiet()
                    : new ArrayList<>();
          Set<Long> newAssetIds = newReqs.stream().map(ChiTietKeHoachBaoTriRequest::getIdTaiSanPhanCung)
                    .collect(Collectors.toSet());

          // Xóa cứng các cái bỏ chọn
          for (ChiTietKeHoachBaoTri oldItem : oldDetails) {
               if (!newAssetIds.contains(oldItem.getIdTaiSanPhanCung())) {
                    chiTietKeHoachBaoTriRepository.delete(oldItem);
               }
          }

          // Thêm mới các cái chọn thêm
          for (ChiTietKeHoachBaoTriRequest req : newReqs) {
               if (!oldAssetIds.contains(req.getIdTaiSanPhanCung())) {
                    taiSanPhanCungRepository.findById(req.getIdTaiSanPhanCung())
                              .orElseThrow(() -> new NghiepVuException(
                                        "Không tìm thấy cấu hình mẫu tài sản bổ sung ID: " + req.getIdTaiSanPhanCung(),
                                        400));

                    ChiTietKeHoachBaoTri ct = new ChiTietKeHoachBaoTri();
                    ct.setKeHoachBaoTriDinhKy(kh);
                    ct.setIdTaiSanPhanCung(req.getIdTaiSanPhanCung());
                    chiTietKeHoachBaoTriRepository.save(ct);
               }
          }

          KeHoachBaoTriDinhKy saved = keHoachBaoTriDinhKyRepository.save(kh);
          return mapToResponse(saved, true);
     }

     @Override
     @Transactional
     public void xoaMem(Long id) {
          Long tenantId = getRequiredTenantId();
          KeHoachBaoTriDinhKy kh = keHoachBaoTriDinhKyRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy kế hoạch bảo trì yêu cầu xóa", 404));

          if (kh.getTrangThai() != TrangThaiPhieuEnum.TAO_MOI) {
               throw new NghiepVuException("Chỉ được phép xóa kế hoạch bảo trì khi đang ở trạng thái Tạo mới (TAO_MOI)",
                         400);
          }

          LocalDateTime now = LocalDateTime.now();
          kh.setThoiGianXoa(now);
          kh.setLyDoXoa("Hủy bỏ kế hoạch bảo trì hệ thống");
          keHoachBaoTriDinhKyRepository.save(kh);

          List<ChiTietKeHoachBaoTri> oldDetails = chiTietKeHoachBaoTriRepository
                    .findByKeHoachBaoTriDinhKyIdAndThoiGianXoaIsNull(id);
          for (ChiTietKeHoachBaoTri ct : oldDetails) {
               ct.setThoiGianXoa(now);
               ct.setLyDoXoa("Hủy kế hoạch tổng");
               chiTietKeHoachBaoTriRepository.save(ct);
          }
     }

     @Override
     @Transactional
     public void yeuCauPheDuyet(Long id) {
          Long tenantId = getRequiredTenantId();
          KeHoachBaoTriDinhKy kh = keHoachBaoTriDinhKyRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin kế hoạch bảo trì", 404));

          if (kh.getTrangThai() != TrangThaiPhieuEnum.TAO_MOI) {
               throw new NghiepVuException("Trạng thái hiện tại không hợp lệ để gửi yêu cầu phê duyệt", 400);
          }

          kh.setTrangThai(TrangThaiPhieuEnum.GUI_PHE_DUYET);
          keHoachBaoTriDinhKyRepository.save(kh);
     }

     @Override
     @Transactional
     public void pheDuyet(Long id) {
          Long tenantId = getRequiredTenantId();
          Long userId = getCurrentUserId();

          KeHoachBaoTriDinhKy kh = keHoachBaoTriDinhKyRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin kế hoạch bảo trì", 404));

          if (kh.getTrangThai() != TrangThaiPhieuEnum.GUI_PHE_DUYET) {
               throw new NghiepVuException("Kế hoạch phải ở trạng thái Gửi phê duyệt mới có thể duyệt", 400);
          }

          kh.setTrangThai(TrangThaiPhieuEnum.DA_PHE_DUYET);
          kh.setIdNguoiPheDuyet(userId);
          keHoachBaoTriDinhKyRepository.save(kh);
     }

     @Override
     @Transactional(readOnly = true)
     public PageResponse<KeHoachBaoTriDinhKyResponse> layDanhSach(String trangThai, LocalDate tuNgay, LocalDate denNgay,
               int page, int size, String sort) {
          Long tenantId = DonViContextHolder.getTenantId();
          String[] sortParts = sort.split(",");
          Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
          PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortParts[0]));

          Specification<KeHoachBaoTriDinhKy> spec = (root, query, cb) -> {
               List<Predicate> predicates = new ArrayList<>();
               predicates.add(cb.isNull(root.get("thoiGianXoa")));
               if (tenantId != null) {
                    predicates.add(cb.equal(root.get("idDonVi"), tenantId));
               }

               if (trangThai != null && !trangThai.trim().isEmpty()) {
                    if ("HET_BAN_HANH".equalsIgnoreCase(trangThai) || "HET_HAN".equalsIgnoreCase(trangThai)) {
                         predicates.add(cb.lessThan(root.get("thoiGianKetThucKeHoach"), LocalDate.now()));
                    } else {
                         predicates.add(
                                   cb.equal(root.get("trangThai"), TrangThaiPhieuEnum.fromValue(trangThai.trim())));
                         predicates.add(cb.greaterThanOrEqualTo(root.get("thoiGianKetThucKeHoach"), LocalDate.now()));
                    }
               }
               if (tuNgay != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("thoiGianTao"), tuNgay.atStartOfDay()));
               }
               if (denNgay != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("thoiGianTao"), denNgay.atTime(LocalTime.MAX)));
               }
               return cb.and(predicates.toArray(new Predicate[0]));
          };

          Page<KeHoachBaoTriDinhKy> pageResult = keHoachBaoTriDinhKyRepository.findAll(spec, pageRequest);

          // Thu thập id người dùng phục vụ in-memory batch mapping tránh N+1 Query
          Set<Long> userIds = new HashSet<>();
          for (KeHoachBaoTriDinhKy kh : pageResult.getContent()) {
               if (kh.getIdNguoiLap() != null)
                    userIds.add(kh.getIdNguoiLap());
               if (kh.getIdNguoiPheDuyet() != null)
                    userIds.add(kh.getIdNguoiPheDuyet());
          }

          Map<Long, String> userMap = userIds.isEmpty() ? new HashMap<>()
                    : nguoiDungRepository.findAllByIdInAndThoiGianXoaIsNull(userIds).stream()
                              .collect(Collectors.toMap(NguoiDung::getId, this::getHoTenNguoiDung));

          List<KeHoachBaoTriDinhKyResponse> content = pageResult.getContent().stream()
                    .map(kh -> KeHoachBaoTriDinhKyResponse.builder()
                              .id(kh.getId())
                              .idDonVi(kh.getIdDonVi())
                              .maKeHoach(kh.getMaKeHoach())
                              .tenKeHoach(kh.getTenKeHoach())
                              .tenNguoiLap(userMap.get(kh.getIdNguoiLap()))
                              .tenNguoiPheDuyet(userMap.get(kh.getIdNguoiPheDuyet()))
                              .chuKyLap(kh.getChuKyLap())
                              .thoiGianBatDauKeHoach(kh.getThoiGianBatDauKeHoach())
                              .thoiGianKetThucKeHoach(kh.getThoiGianKetThucKeHoach())
                              .thoiGianLanCuoi(kh.getThoiGianLanCuoi())
                              .thoiGianLanTiep(kh.getThoiGianLanTiep())
                              .chiPhiDuKien(kh.getChiPhiDuKien())
                              .trangThai(evaluateTrangThaiDong(kh))
                              .noiDungBaoTri(kh.getNoiDungBaoTri())
                              .lyDoTuChoi(kh.getLyDoTuChoi())
                              .thoiGianTao(kh.getThoiGianTao())
                              .thoiGianCapNhat(kh.getThoiGianCapNhat())
                              .chiTietPhanVi(new ArrayList<>())
                              .build())
                    .collect(Collectors.toList());

          return PageResponse.from(new PageImpl<>(content, pageRequest, pageResult.getTotalElements()));
     }

     @Override
     @Transactional(readOnly = true)
     public KeHoachBaoTriDinhKyResponse layTheoId(Long id) {
          Long tenantId = getRequiredTenantId();
          KeHoachBaoTriDinhKy kh = keHoachBaoTriDinhKyRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin kế hoạch bảo trì yêu cầu", 404));

          return mapToResponse(kh, true);
     }

     private KeHoachBaoTriDinhKyResponse mapToResponse(KeHoachBaoTriDinhKy kh, boolean includeDetails) {
          Set<Long> userIds = new HashSet<>();
          if (kh.getIdNguoiLap() != null)
               userIds.add(kh.getIdNguoiLap());
          if (kh.getIdNguoiPheDuyet() != null)
               userIds.add(kh.getIdNguoiPheDuyet());

          Map<Long, String> userMap = userIds.isEmpty() ? new HashMap<>()
                    : nguoiDungRepository.findAllByIdInAndThoiGianXoaIsNull(userIds).stream()
                              .collect(Collectors.toMap(NguoiDung::getId, this::getHoTenNguoiDung));

          List<ChiTietKeHoachBaoTriResponse> chiTietList = new ArrayList<>();

          if (includeDetails) {
               List<ChiTietKeHoachBaoTri> details = chiTietKeHoachBaoTriRepository
                         .findByKeHoachBaoTriDinhKyIdAndThoiGianXoaIsNull(kh.getId());

               Set<Long> assetIds = details.stream().map(ChiTietKeHoachBaoTri::getIdTaiSanPhanCung)
                         .collect(Collectors.toSet());
               Map<Long, TaiSanPhanCung> assetMap = assetIds.isEmpty() ? new HashMap<>()
                         : taiSanPhanCungRepository.findAllByIdInAndThoiGianXoaIsNull(assetIds).stream()
                                   .collect(Collectors.toMap(TaiSanPhanCung::getId,
                                             java.util.function.Function.identity()));

               for (ChiTietKeHoachBaoTri ct : details) {
                    TaiSanPhanCung mau = assetMap.get(ct.getIdTaiSanPhanCung());
                    chiTietList.add(ChiTietKeHoachBaoTriResponse.builder()
                              .id(ct.getId())
                              .idTaiSanPhanCung(ct.getIdTaiSanPhanCung())
                              .maMauTaiSan(mau != null ? mau.getMaMau() : null)
                              .tenMauTaiSan(mau != null ? mau.getTenMau() : null)
                              .build());
               }
          }

          return KeHoachBaoTriDinhKyResponse.builder()
                    .id(kh.getId())
                    .idDonVi(kh.getIdDonVi())
                    .maKeHoach(kh.getMaKeHoach())
                    .tenKeHoach(kh.getTenKeHoach())
                    .tenNguoiLap(userMap.get(kh.getIdNguoiLap()))
                    .tenNguoiPheDuyet(userMap.get(kh.getIdNguoiPheDuyet()))
                    .chuKyLap(kh.getChuKyLap())
                    .thoiGianBatDauKeHoach(kh.getThoiGianBatDauKeHoach())
                    .thoiGianKetThucKeHoach(kh.getThoiGianKetThucKeHoach())
                    .thoiGianLanCuoi(kh.getThoiGianLanCuoi())
                    .thoiGianLanTiep(kh.getThoiGianLanTiep())
                    .chiPhiDuKien(kh.getChiPhiDuKien())
                    .trangThai(evaluateTrangThaiDong(kh))
                    .noiDungBaoTri(kh.getNoiDungBaoTri())
                    .lyDoTuChoi(kh.getLyDoTuChoi())
                    .thoiGianTao(kh.getThoiGianTao())
                    .thoiGianCapNhat(kh.getThoiGianCapNhat())
                    .chiTietPhanVi(chiTietList)
                    .build();
     }

     @Override
     @Transactional
     public void tuChoiPheDuyet(Long id, String lyDoTuChoi) {
          Long tenantId = getRequiredTenantId();
          Long userId = getCurrentUserId();

          KeHoachBaoTriDinhKy kh = keHoachBaoTriDinhKyRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin kế hoạch bảo trì", 404));

          if (kh.getTrangThai() != TrangThaiPhieuEnum.GUI_PHE_DUYET) {
               throw new NghiepVuException("Kế hoạch phải ở trạng thái Gửi phê duyệt mới có thể từ chối", 400);
          }

          kh.setTrangThai(TrangThaiPhieuEnum.TU_CHOI);
          kh.setIdNguoiPheDuyet(userId);
          kh.setLyDoTuChoi(lyDoTuChoi);
          keHoachBaoTriDinhKyRepository.save(kh);
     }
}