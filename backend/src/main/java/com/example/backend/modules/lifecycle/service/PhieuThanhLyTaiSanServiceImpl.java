package com.example.backend.modules.lifecycle.service;

import com.example.backend.modules.asset.model.DanhSachThietBiPhanCung;
import com.example.backend.modules.asset.model.DanhSachThietBiPhanMem;
import com.example.backend.modules.asset.model.LinhKienPhanCung;
import com.example.backend.modules.asset.service.interfaces.DanhSachThietBiPhanCungService;
import com.example.backend.modules.asset.service.interfaces.DanhSachThietBiPhanMemService;
import com.example.backend.modules.asset.service.interfaces.LinhKienPhanCungService;
import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.auth.service.interfaces.NguoiDungService;

import com.example.backend.modules.lifecycle.dto.*;
import com.example.backend.modules.lifecycle.model.*;
import com.example.backend.modules.lifecycle.repository.*;
import com.example.backend.modules.lifecycle.service.interfaces.PhieuThanhLyTaiSanService;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.model.TrangThaiPhieuEnum;
import com.example.backend.shared.model.TrangThaiVanHanhEnum;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.tenant.DonViContextHolder;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhieuThanhLyTaiSanServiceImpl implements PhieuThanhLyTaiSanService {

     private final PhieuThanhLyTaiSanRepository phieuThanhLyTaiSanRepository;
     private final ChiTietThanhLyPhanCungRepository chiTietThanhLyPhanCungRepository;
     private final ChiTietThanhLyPhanMemRepository chiTietThanhLyPhanMemRepository;
     private final ChiTietThanhLyLinhKienRepository chiTietThanhLyLinhKienRepository;
     private final DanhSachThietBiPhanCungService thietBiPhanCungService;
     private final DanhSachThietBiPhanMemService thietBiPhanMemService;
     private final LinhKienPhanCungService linhKienPhanCungService;
     private final NguoiDungService nguoiDungService;

     @Autowired
     @Lazy
     private final RabbitTemplate rabbitTemplate;

     private Long getRequiredTenantId() {
          Long tenantId = DonViContextHolder.getTenantId();
          if (tenantId == null) {
               if (com.example.backend.shared.utils.SecurityUtils.laSuperAdmin()) {
                    return null;
               }
               throw new NghiepVuException("Không tìm thấy thông tin đơn vị từ phiên làm việc", 403);
          }
          return tenantId;
     }

     private Long getCurrentUserId() {
        return nguoiDungService.layIdNguoiDungHienTai();
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
     public PageResponse<PhieuThanhLyTaiSanResponse> layDanhSach(String trangThai, LocalDate tuNgay, LocalDate denNgay,
               int page, int size, String sort) {
          Long tenantId = DonViContextHolder.getTenantId();
          String[] sortParts = sort.split(",");
          Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
          PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortParts[0]));

          Specification<PhieuThanhLyTaiSan> spec = (root, query, cb) -> {
               List<Predicate> predicates = new ArrayList<>();
               predicates.add(cb.isNull(root.get("thoiGianXoa")));
               if (tenantId != null) {
                    predicates.add(cb.equal(root.get("idDonVi"), tenantId));
               }

               if (trangThai != null && !trangThai.trim().isEmpty()) {
                    predicates.add(cb.equal(root.get("trangThai"), TrangThaiPhieuEnum.fromValue(trangThai.trim())));
               }
               if (tuNgay != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("thoiGianTao"), tuNgay.atStartOfDay()));
               }
               if (denNgay != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("thoiGianTao"), denNgay.atTime(LocalTime.MAX)));
               }
               return cb.and(predicates.toArray(new Predicate[0]));
          };

          Page<PhieuThanhLyTaiSan> pageResult = phieuThanhLyTaiSanRepository.findAll(spec, pageRequest);
          List<PhieuThanhLyTaiSanResponse> content = mapToResponseList(pageResult.getContent());
          return PageResponse.from(new PageImpl<>(content, pageRequest, pageResult.getTotalElements()));
     }

     private List<PhieuThanhLyTaiSanResponse> mapToResponseList(List<PhieuThanhLyTaiSan> phieuList) {
          if (phieuList.isEmpty())
               return new ArrayList<>();

          Set<Long> userIds = new HashSet<>();
          for (PhieuThanhLyTaiSan p : phieuList) {
               if (p.getIdNguoiLap() != null)
                    userIds.add(p.getIdNguoiLap());
               if (p.getIdNguoiPheDuyet() != null)
                    userIds.add(p.getIdNguoiPheDuyet());
          }

          Map<Long, String> userMap = nguoiDungService.layTenNguoiDungTheoIds(userIds);

          List<PhieuThanhLyTaiSanResponse> responses = new ArrayList<>();
          for (PhieuThanhLyTaiSan p : phieuList) {
               responses.add(PhieuThanhLyTaiSanResponse.builder()
                         .id(p.getId())
                         .idDonVi(p.getIdDonVi())
                         .maPhieuThanhLy(p.getMaPhieuThanhLy())
                         .tenNguoiLap(userMap.get(p.getIdNguoiLap()))
                         .tenNguoiPheDuyet(userMap.get(p.getIdNguoiPheDuyet()))
                         .hinhThucThanhLy(p.getHinhThucThanhLy())
                         .tongTienThuHoi(p.getTongTienThuHoi())
                         .thoiGianThanhLy(p.getThoiGianThanhLy())
                         .trangThaiLucGiao(p.getTrangThaiLucGiao())
                         .lyDoThanhLy(p.getLyDoThanhLy())
                         .trangThai(p.getTrangThai() != null ? p.getTrangThai().getValue() : null)
                         .thoiGianTao(p.getThoiGianTao())
                         .thoiGianCapNhat(p.getThoiGianCapNhat())
                         .chiTietTaiSan(new ArrayList<>())
                         .build());
          }
          return responses;
     }

     @Override
     @Transactional(readOnly = true)
     public PhieuThanhLyTaiSanResponse layTheoId(Long id) {
          Long tenantId = getRequiredTenantId();
          PhieuThanhLyTaiSan phieu;
          if (tenantId == null) {
               phieu = phieuThanhLyTaiSanRepository.findByIdAndThoiGianXoaIsNull(id)
                         .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin phiếu thanh lý tài sản", 404));
          } else {
               phieu = phieuThanhLyTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                         .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin phiếu thanh lý tài sản", 404));
          }
          return mapToResponse(phieu, true);
     }

     @Override
     @Transactional
     @CacheEvict(value = {
               "thiet_bi_phan_cung_cache", "thiet_bi_phan_cung_list_cache",
               "thiet_bi_phan_mem_cache", "thiet_bi_phan_mem_list_cache",
               "linh_kien_phan_cung_cache", "linh_kien_phan_cung_list_cache"
     }, allEntries = true)
     public PhieuThanhLyTaiSanResponse themMoi(PhieuThanhLyTaiSanRequest request) {
          Long tenantId = getRequiredTenantId();
          Long userId = getCurrentUserId();

          PhieuThanhLyTaiSan phieu = new PhieuThanhLyTaiSan();
          phieu.setIdDonVi(tenantId);
          phieu.setMaPhieuThanhLy("PTL-" + tenantId + "-" + System.currentTimeMillis());
          phieu.setHinhThucThanhLy(request.getHinhThucThanhLy());
          phieu.setTongTienThuHoi(request.getTongTienThuHoi());
          phieu.setTrangThaiLucGiao(request.getTrangThaiLucGiao());
          phieu.setLyDoThanhLy(request.getLyDoThanhLy());
          phieu.setTrangThai(TrangThaiPhieuEnum.TAO_MOI);
          phieu.setIdNguoiLap(userId);

          PhieuThanhLyTaiSan savedPhieu = phieuThanhLyTaiSanRepository.save(phieu);

          // 1. Lưu mảng Phần Cứng từ Request và Xóa mềm để giữ chỗ tĩnh
          if (request.getDanhSachPhanCung() != null) {
               for (ChiTietThanhLyPhanCungRequest item : request.getDanhSachPhanCung()) {
                    DanhSachThietBiPhanCung tb = thietBiPhanCungService.layEntityTheoId(item.getIdThietBiPhanCung())
                              .orElseThrow(
                                        () -> new NghiepVuException("Không tìm thấy thiết bị phần cứng hoạt động ID: "
                                                  + item.getIdThietBiPhanCung(), 400));

                    if (tb.getTrangThai() != TrangThaiVanHanhEnum.HOAT_DONG) {
                         throw new NghiepVuException("Thiết bị mã số serial " + tb.getSoSerial()
                                   + " hiện không ở trạng thái Hoạt động, không thể thanh lý!", 400);
                    }

                    tb.setThoiGianXoa(LocalDateTime.now());
                    tb.setLyDoXoa("Nằm trong kế hoạch lập phiếu thanh lý (Chờ hoàn thành)");
                    thietBiPhanCungService.saveEntity(tb);

                    ChiTietThanhLyPhanCung ct = new ChiTietThanhLyPhanCung();
                    ct.setPhieuThanhLyTaiSan(savedPhieu);
                    ct.setDanhSachThietBiPhanCungId(tb.getId());
                    ct.setTienThuHoi(item.getTienThuHoi());
                    ct.setGhiChu(item.getGhiChu());
                    chiTietThanhLyPhanCungRepository.save(ct);
               }
          }

          // 2. Lưu mảng Phần Mềm từ Request và Xóa mềm
          if (request.getDanhSachPhanMem() != null) {
               for (ChiTietThanhLyPhanMemRequest item : request.getDanhSachPhanMem()) {
                    DanhSachThietBiPhanMem pm = thietBiPhanMemService.layEntityTheoId(item.getIdThietBiPhanMem())
                              .orElseThrow(() -> new NghiepVuException(
                                        "Không tìm thấy bản quyền phần mềm hoạt động ID: " + item.getIdThietBiPhanMem(),
                                        400));

                    if (pm.getTrangThai() != TrangThaiVanHanhEnum.HOAT_DONG) {
                         throw new NghiepVuException(
                                   "Phần mềm ID " + pm.getId() + " không ở trạng thái Hoạt động, không thể thanh lý!",
                                   400);
                    }

                    pm.setThoiGianXoa(LocalDateTime.now());
                    pm.setLyDoXoa("Nằm trong kế hoạch lập phiếu thanh lý (Chờ hoàn thành)");
                    thietBiPhanMemService.saveEntity(pm);

                    ChiTietThanhLyPhanMem ct = new ChiTietThanhLyPhanMem();
                    ct.setPhieuThanhLyTaiSan(savedPhieu);
                    ct.setDanhSachThietBiPhanMemId(pm.getId());
                    ct.setTienThuHoi(item.getTienThuHoi());
                    ct.setGhiChu(item.getGhiChu());
                    chiTietThanhLyPhanMemRepository.save(ct);
               }
          }

          // 3. Lưu mảng Linh Kiện từ Request và Xóa mềm
          if (request.getDanhSachLinhKien() != null) {
               for (ChiTietThanhLyLinhKienRequest item : request.getDanhSachLinhKien()) {
                    LinhKienPhanCung lk = linhKienPhanCungService.layEntityTheoId(item.getIdLinhKienPhanCung())
                              .orElseThrow(() -> new NghiepVuException(
                                        "Không tìm thấy linh kiện hoạt động ID: " + item.getIdLinhKienPhanCung(), 400));

                    if (lk.getTrangThai() != TrangThaiVanHanhEnum.HOAT_DONG) {
                         throw new NghiepVuException("Linh kiện số serial " + lk.getSoSerial()
                                   + " không ở trạng thái Hoạt động, không thể thanh lý!", 400);
                    }

                    lk.setThoiGianXoa(LocalDateTime.now());
                    lk.setLyDoXoa("Nằm trong kế hoạch lập phiếu thanh lý (Chờ hoàn thành)");
                    linhKienPhanCungService.saveEntity(lk);

                    ChiTietThanhLyLinhKien ct = new ChiTietThanhLyLinhKien();
                    ct.setPhieuThanhLyTaiSan(savedPhieu);
                    ct.setLinhKienPhanCungId(lk.getId());
                    ct.setTienThuHoi(item.getTienThuHoi());
                    ct.setGhiChu(item.getGhiChu());
                    chiTietThanhLyLinhKienRepository.save(ct);
               }
          }

          return mapToResponse(savedPhieu, true);
     }

     @Override
     @Transactional
     @CacheEvict(value = {
               "thiet_bi_phan_cung_cache", "thiet_bi_phan_cung_list_cache",
               "thiet_bi_phan_mem_cache", "thiet_bi_phan_mem_list_cache",
               "linh_kien_phan_cung_cache", "linh_kien_phan_cung_list_cache"
     }, allEntries = true)
     public PhieuThanhLyTaiSanResponse capNhat(Long id, PhieuThanhLyTaiSanRequest request) {
          Long tenantId = getRequiredTenantId();
          PhieuThanhLyTaiSan phieu = phieuThanhLyTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy chứng từ phiếu thanh lý cần sửa", 404));

          if (phieu.getTrangThai() != TrangThaiPhieuEnum.TAO_MOI) {
               throw new NghiepVuException(
                         "Chỉ sửa đổi được bản ghi phiếu thanh lý tài sản khi đang ở trạng thái Tạo mới (TAO_MOI)",
                         400);
          }

          phieu.setHinhThucThanhLy(request.getHinhThucThanhLy());
          phieu.setTongTienThuHoi(request.getTongTienThuHoi());
          phieu.setTrangThaiLucGiao(request.getTrangThaiLucGiao());
          phieu.setLyDoThanhLy(request.getLyDoThanhLy());

          // 2.1: Đối soát mảng Phần Cứng
          List<ChiTietThanhLyPhanCung> oldPc = chiTietThanhLyPhanCungRepository
                    .findByPhieuThanhLyTaiSanIdAndThoiGianXoaIsNull(id);
          Map<Long, ChiTietThanhLyPhanCung> oldPcMap = oldPc.stream()
                    .collect(Collectors.toMap(ChiTietThanhLyPhanCung::getDanhSachThietBiPhanCungId, x -> x));
          List<ChiTietThanhLyPhanCungRequest> newPcReq = request.getDanhSachPhanCung() != null
                    ? request.getDanhSachPhanCung()
                    : new ArrayList<>();
          Set<Long> newPcIds = newPcReq.stream().map(ChiTietThanhLyPhanCungRequest::getIdThietBiPhanCung)
                    .collect(Collectors.toSet());

          for (ChiTietThanhLyPhanCung oldItem : oldPc) {
               if (!newPcIds.contains(oldItem.getDanhSachThietBiPhanCungId())) {
                    thietBiPhanCungService.layEntityTheoId(oldItem.getDanhSachThietBiPhanCungId()).ifPresent(tb -> {
                         tb.setThoiGianXoa(null);
                         tb.setLyDoXoa(null);
                         thietBiPhanCungService.saveEntity(tb);
                    });
                    chiTietThanhLyPhanCungRepository.delete(oldItem);
               }
          }
          for (ChiTietThanhLyPhanCungRequest item : newPcReq) {
               ChiTietThanhLyPhanCung oldItem = oldPcMap.get(item.getIdThietBiPhanCung());
               if (oldItem != null) {
                    oldItem.setTienThuHoi(item.getTienThuHoi());
                    oldItem.setGhiChu(item.getGhiChu());
                    chiTietThanhLyPhanCungRepository.save(oldItem);
               } else {
                    DanhSachThietBiPhanCung tb = thietBiPhanCungService.layEntityTheoId(item.getIdThietBiPhanCung())
                              .orElseThrow(
                                        () -> new NghiepVuException("Không tìm thấy thiết bị phần cứng bổ sung mới ID: "
                                                  + item.getIdThietBiPhanCung(), 400));
                    tb.setThoiGianXoa(LocalDateTime.now());
                    tb.setLyDoXoa("Nằm trong kế hoạch lập phiếu thanh lý (Chờ hoàn thành)");
                    thietBiPhanCungService.saveEntity(tb);

                    ChiTietThanhLyPhanCung ct = new ChiTietThanhLyPhanCung();
                    ct.setPhieuThanhLyTaiSan(phieu);
                    ct.setDanhSachThietBiPhanCungId(tb.getId());
                    ct.setTienThuHoi(item.getTienThuHoi());
                    ct.setGhiChu(item.getGhiChu());
                    chiTietThanhLyPhanCungRepository.save(ct);
               }
          }

          // 2.2: Đối soát mảng Phần Mềm
          List<ChiTietThanhLyPhanMem> oldPm = chiTietThanhLyPhanMemRepository
                    .findByPhieuThanhLyTaiSanIdAndThoiGianXoaIsNull(id);
          Map<Long, ChiTietThanhLyPhanMem> oldPmMap = oldPm.stream()
                    .collect(Collectors.toMap(ChiTietThanhLyPhanMem::getDanhSachThietBiPhanMemId, x -> x));
          List<ChiTietThanhLyPhanMemRequest> newPmReq = request.getDanhSachPhanMem() != null
                    ? request.getDanhSachPhanMem()
                    : new ArrayList<>();
          Set<Long> newPmIds = newPmReq.stream().map(ChiTietThanhLyPhanMemRequest::getIdThietBiPhanMem)
                    .collect(Collectors.toSet());

          for (ChiTietThanhLyPhanMem oldItem : oldPm) {
               if (!newPmIds.contains(oldItem.getDanhSachThietBiPhanMemId())) {
                    thietBiPhanMemService.layEntityTheoId(oldItem.getDanhSachThietBiPhanMemId()).ifPresent(pm -> {
                         pm.setThoiGianXoa(null);
                         pm.setLyDoXoa(null);
                         thietBiPhanMemService.saveEntity(pm);
                    });
                    chiTietThanhLyPhanMemRepository.delete(oldItem);
               }
          }
          for (ChiTietThanhLyPhanMemRequest item : newPmReq) {
               ChiTietThanhLyPhanMem oldItem = oldPmMap.get(item.getIdThietBiPhanMem());
               if (oldItem != null) {
                    oldItem.setTienThuHoi(item.getTienThuHoi());
                    oldItem.setGhiChu(item.getGhiChu());
                    chiTietThanhLyPhanMemRepository.save(oldItem);
               } else {
                    DanhSachThietBiPhanMem pm = thietBiPhanMemService.layEntityTheoId(item.getIdThietBiPhanMem())
                              .orElseThrow(() -> new NghiepVuException(
                                        "Không tìm thấy phần mềm bổ sung mới ID: " + item.getIdThietBiPhanMem(), 400));
                    pm.setThoiGianXoa(LocalDateTime.now());
                    pm.setLyDoXoa("Nằm trong kế hoạch lập phiếu thanh lý (Chờ hoàn thành)");
                    thietBiPhanMemService.saveEntity(pm);

                    ChiTietThanhLyPhanMem ct = new ChiTietThanhLyPhanMem();
                    ct.setPhieuThanhLyTaiSan(phieu);
                    ct.setDanhSachThietBiPhanMemId(pm.getId());
                    ct.setTienThuHoi(item.getTienThuHoi());
                    ct.setGhiChu(item.getGhiChu());
                    chiTietThanhLyPhanMemRepository.save(ct);
               }
          }

          // 2.3: Đối soát mảng Linh Kiện
          List<ChiTietThanhLyLinhKien> oldLk = chiTietThanhLyLinhKienRepository
                    .findByPhieuThanhLyTaiSanIdAndThoiGianXoaIsNull(id);
          Map<Long, ChiTietThanhLyLinhKien> oldLkMap = oldLk.stream()
                    .collect(Collectors.toMap(ChiTietThanhLyLinhKien::getLinhKienPhanCungId, x -> x));
          List<ChiTietThanhLyLinhKienRequest> newLkReq = request.getDanhSachLinhKien() != null
                    ? request.getDanhSachLinhKien()
                    : new ArrayList<>();
          Set<Long> newLkIds = newLkReq.stream().map(ChiTietThanhLyLinhKienRequest::getIdLinhKienPhanCung)
                    .collect(Collectors.toSet());

          for (ChiTietThanhLyLinhKien oldItem : oldLk) {
               if (!newLkIds.contains(oldItem.getLinhKienPhanCungId())) {
                    linhKienPhanCungService.layEntityTheoId(oldItem.getLinhKienPhanCungId()).ifPresent(lk -> {
                         lk.setThoiGianXoa(null);
                         lk.setLyDoXoa(null);
                         linhKienPhanCungService.saveEntity(lk);
                    });
                    chiTietThanhLyLinhKienRepository.delete(oldItem);
               }
          }
          for (ChiTietThanhLyLinhKienRequest item : newLkReq) {
               ChiTietThanhLyLinhKien oldItem = oldLkMap.get(item.getIdLinhKienPhanCung());
               if (oldItem != null) {
                    oldItem.setTienThuHoi(item.getTienThuHoi());
                    oldItem.setGhiChu(item.getGhiChu());
                    chiTietThanhLyLinhKienRepository.save(oldItem);
               } else {
                    LinhKienPhanCung lk = linhKienPhanCungService.layEntityTheoId(item.getIdLinhKienPhanCung())
                              .orElseThrow(() -> new NghiepVuException(
                                        "Không tìm thấy linh kiện bổ sung mới ID: " + item.getIdLinhKienPhanCung(),
                                        400));
                    lk.setThoiGianXoa(LocalDateTime.now());
                    lk.setLyDoXoa("Nằm trong kế hoạch lập phiếu thanh lý (Chờ hoàn thành)");
                    linhKienPhanCungService.saveEntity(lk);

                    ChiTietThanhLyLinhKien ct = new ChiTietThanhLyLinhKien();
                    ct.setPhieuThanhLyTaiSan(phieu);
                    ct.setLinhKienPhanCungId(lk.getId());
                    ct.setTienThuHoi(item.getTienThuHoi());
                    ct.setGhiChu(item.getGhiChu());
                    chiTietThanhLyLinhKienRepository.save(ct);
               }
          }

          PhieuThanhLyTaiSan saved = phieuThanhLyTaiSanRepository.save(phieu);
          return mapToResponse(saved, true);
     }

     @Override
     @Transactional
     @CacheEvict(value = {
               "thiet_bi_phan_cung_cache", "thiet_bi_phan_cung_list_cache",
               "thiet_bi_phan_mem_cache", "thiet_bi_phan_mem_list_cache",
               "linh_kien_phan_cung_cache", "linh_kien_phan_cung_list_cache"
     }, allEntries = true)
     public void xoaMem(Long id) {
          Long tenantId = getRequiredTenantId();
          PhieuThanhLyTaiSan phieu = phieuThanhLyTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy chứng từ phiếu thanh lý tài sản để xóa",
                              404));

          if (phieu.getTrangThai() == TrangThaiPhieuEnum.DA_PHE_DUYET
                    || phieu.getTrangThai() == TrangThaiPhieuEnum.HOAN_THANH) {
               throw new NghiepVuException("Không được phép xóa phiếu thanh lý đã được phê duyệt hoặc đã hoàn tất",
                         400);
          }

          // Nhả mảng Phần cứng
          List<ChiTietThanhLyPhanCung> pcList = chiTietThanhLyPhanCungRepository
                    .findByPhieuThanhLyTaiSanIdAndThoiGianXoaIsNull(id);
          for (ChiTietThanhLyPhanCung ct : pcList) {
               thietBiPhanCungService.layEntityTheoId(ct.getDanhSachThietBiPhanCungId()).ifPresent(tb -> {
                    tb.setThoiGianXoa(null);
                    tb.setLyDoXoa(null);
                    thietBiPhanCungService.saveEntity(tb);
               });
               ct.setThoiGianXoa(LocalDateTime.now());
               ct.setLyDoXoa("Hủy phiếu thanh lý tổng");
               chiTietThanhLyPhanCungRepository.save(ct);
          }

          // Nhả mảng Phần mềm
          List<ChiTietThanhLyPhanMem> pmList = chiTietThanhLyPhanMemRepository
                    .findByPhieuThanhLyTaiSanIdAndThoiGianXoaIsNull(id);
          for (ChiTietThanhLyPhanMem ct : pmList) {
               thietBiPhanMemService.layEntityTheoId(ct.getDanhSachThietBiPhanMemId()).ifPresent(pm -> {
                    pm.setThoiGianXoa(null);
                    pm.setLyDoXoa(null);
                    thietBiPhanMemService.saveEntity(pm);
               });
               ct.setThoiGianXoa(LocalDateTime.now());
               ct.setLyDoXoa("Hủy phiếu thanh lý tổng");
               chiTietThanhLyPhanMemRepository.save(ct);
          }

          // Nhả mảng Linh kiện
          List<ChiTietThanhLyLinhKien> lkList = chiTietThanhLyLinhKienRepository
                    .findByPhieuThanhLyTaiSanIdAndThoiGianXoaIsNull(id);
          for (ChiTietThanhLyLinhKien ct : lkList) {
               linhKienPhanCungService.layEntityTheoId(ct.getLinhKienPhanCungId()).ifPresent(lk -> {
                    lk.setThoiGianXoa(null);
                    lk.setLyDoXoa(null);
                    linhKienPhanCungService.saveEntity(lk);
               });
               ct.setThoiGianXoa(LocalDateTime.now());
               ct.setLyDoXoa("Hủy phiếu thanh lý tổng");
               chiTietThanhLyLinhKienRepository.save(ct);
          }

          phieu.setThoiGianXoa(LocalDateTime.now());
          phieu.setLyDoXoa("Người dùng hủy kế hoạch thanh lý tài sản");
          phieuThanhLyTaiSanRepository.save(phieu);
     }

     @Override
     @Transactional
     public void yeuCauPheDuyet(Long id) {
          Long tenantId = getRequiredTenantId();
          PhieuThanhLyTaiSan phieu = phieuThanhLyTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy phiếu thanh lý", 404));

          if (!phieu.getTrangThai().canTransitionTo(TrangThaiPhieuEnum.GUI_PHE_DUYET)) {
               throw new NghiepVuException("Trạng thái chứng từ không hợp lệ để thực hiện gửi yêu cầu", 400);
          }
          phieu.setTrangThai(TrangThaiPhieuEnum.GUI_PHE_DUYET);
          phieuThanhLyTaiSanRepository.save(phieu);
     }

     @Override
     @Transactional
     public void pheDuyet(Long id) {
          Long tenantId = getRequiredTenantId();
          Long userId = getCurrentUserId();
          PhieuThanhLyTaiSan phieu = phieuThanhLyTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy dữ liệu phiếu thanh lý tài sản", 404));

          if (!phieu.getTrangThai().canTransitionTo(TrangThaiPhieuEnum.DA_PHE_DUYET)) {
               throw new NghiepVuException("Trạng thái chứng từ không hợp lệ để duyệt", 400);
          }
          phieu.setTrangThai(TrangThaiPhieuEnum.DA_PHE_DUYET);
          phieu.setIdNguoiPheDuyet(userId);
          phieuThanhLyTaiSanRepository.save(phieu);
     }

     // ==========================================================
     // CHỨC NĂNG 6: HOÀN THÀNH THANH LÝ (CHỐT MỐC THỜI GIAN XÓA MỚI)
     // ==========================================================
     @Override
     @Transactional
     @CacheEvict(value = {
               "thiet_bi_phan_cung_cache", "thiet_bi_phan_cung_list_cache",
               "thiet_bi_phan_mem_cache", "thiet_bi_phan_mem_list_cache",
               "linh_kien_phan_cung_cache", "linh_kien_phan_cung_list_cache"
     }, allEntries = true)
     public void hoanThanh(Long id) {
          Long tenantId = getRequiredTenantId();
          PhieuThanhLyTaiSan phieu = phieuThanhLyTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy phiếu thanh lý", 404));

          if (!phieu.getTrangThai().canTransitionTo(TrangThaiPhieuEnum.HOAN_THANH)) {
               throw new NghiepVuException("Trạng thái phiếu không hợp lệ để hoàn tất", 400);
          }

          List<ChiTietThanhLyPhanCung> pcList = chiTietThanhLyPhanCungRepository
                    .findByPhieuThanhLyTaiSanIdAndThoiGianXoaIsNull(phieu.getId());

          // đẩy sự kiện xuống queue để thực hiện cập nhật báo cáo tồn kho
          for (ChiTietThanhLyPhanCung ct : pcList) {
               if (ct.getDanhSachThietBiPhanCungId() != null) {
                    thietBiPhanCungService.layEntityTheoId(ct.getDanhSachThietBiPhanCungId()).ifPresent(tb -> {
                         tb.setThoiGianXoa(LocalDateTime.now());
                         tb.setLyDoXoa("Đã thanh lý xuất kho vĩnh viễn");
                         thietBiPhanCungService.saveEntity(tb);

                         // Phát hành gói tin thanh lý phần cứng ra hàng đợi ngầm
                         com.example.backend.shared.dto.BienDongTonKhoEvent eventBus = com.example.backend.shared.dto.BienDongTonKhoEvent
                                   .builder()
                                   .idDonVi(tenantId)
                                   .idTaiSanCuThe(tb.getId())
                                   .loaiTaiSan("PHAN_CUNG")
                                   .idViTriKho(null) // Gán null vì tài sản đã rời hoàn toàn khỏi hệ thống kho bãi
                                   .viTriKhoChiTiet("Xuất bán / Tiêu hủy")
                                   .trangThaiMoi("DA_THANH_LY")
                                   .idChungTuGoc(phieu.getId())
                                   .maChungTuGoc(phieu.getMaPhieuThanhLy())
                                   .hanhDong(com.example.backend.shared.dto.HanhDongTonKhoEnum.THANH_LY)
                                   .build();
                         rabbitTemplate.convertAndSend("inventory.bien-dong-ton-kho.queue", eventBus);
                    });
               }
          }

          // 2. Cập nhật mốc xóa mới cho Phần Mềm và bắn Event
          List<ChiTietThanhLyPhanMem> pmList = chiTietThanhLyPhanMemRepository
                    .findByPhieuThanhLyTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
          for (ChiTietThanhLyPhanMem ct : pmList) {
               if (ct.getDanhSachThietBiPhanMemId() != null) {
                    thietBiPhanMemService.layEntityTheoId(ct.getDanhSachThietBiPhanMemId()).ifPresent(pm -> {
                         pm.setThoiGianXoa(LocalDateTime.now());
                         pm.setLyDoXoa("Đã hủy bản quyền/thanh lý vĩnh viễn");
                         thietBiPhanMemService.saveEntity(pm);

                         // Phát hành gói tin hủy bản quyền phần mềm
                         com.example.backend.shared.dto.BienDongTonKhoEvent eventBus = com.example.backend.shared.dto.BienDongTonKhoEvent
                                   .builder()
                                   .idDonVi(tenantId)
                                   .idTaiSanCuThe(pm.getId())
                                   .loaiTaiSan("PHAN_MEM")
                                   .idViTriKho(null)
                                   .viTriKhoChiTiet("Hủy kích hoạt key")
                                   .trangThaiMoi("DA_THANH_LY")
                                   .idChungTuGoc(phieu.getId())
                                   .maChungTuGoc(phieu.getMaPhieuThanhLy())
                                   .hanhDong(com.example.backend.shared.dto.HanhDongTonKhoEnum.THANH_LY)
                                   .build();
                         rabbitTemplate.convertAndSend("inventory.bien-dong-ton-kho.queue", eventBus);
                    });
               }
          }

          // 3. Cập nhật mốc xóa mới cho Linh Kiện và bắn Event
          List<ChiTietThanhLyLinhKien> lkList = chiTietThanhLyLinhKienRepository
                    .findByPhieuThanhLyTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
          for (ChiTietThanhLyLinhKien ct : lkList) {
               if (ct.getLinhKienPhanCungId() != null) {
                    linhKienPhanCungService.layEntityTheoId(ct.getLinhKienPhanCungId()).ifPresent(lk -> {
                         lk.setThoiGianXoa(LocalDateTime.now());
                         lk.setLyDoXoa("Đã thanh lý hủy linh kiện vĩnh viễn");
                         linhKienPhanCungService.saveEntity(lk);

                         // Phát hành gói tin tiêu hủy linh kiện rời
                         com.example.backend.shared.dto.BienDongTonKhoEvent eventBus = com.example.backend.shared.dto.BienDongTonKhoEvent
                                   .builder()
                                   .idDonVi(tenantId)
                                   .idTaiSanCuThe(lk.getId())
                                   .loaiTaiSan("LINH_KIEN")
                                   .idViTriKho(null)
                                   .viTriKhoChiTiet("Tiêu hủy vật lý")
                                   .trangThaiMoi("DA_THANH_LY")
                                   .idChungTuGoc(phieu.getId())
                                   .maChungTuGoc(phieu.getMaPhieuThanhLy())
                                   .hanhDong(com.example.backend.shared.dto.HanhDongTonKhoEnum.THANH_LY)
                                   .build();
                         rabbitTemplate.convertAndSend("inventory.bien-dong-ton-kho.queue", eventBus);
                    });
               }
          }
          phieu.setTrangThai(TrangThaiPhieuEnum.HOAN_THANH);
          phieu.setThoiGianThanhLy(LocalDateTime.now()); // Đồng bộ trường thoiGianThanhLy của Entity mới cậu cấp
          phieuThanhLyTaiSanRepository.save(phieu);
     }

     @Override
     @Transactional
     @CacheEvict(value = {
               "thiet_bi_phan_cung_cache", "thiet_bi_phan_cung_list_cache",
               "thiet_bi_phan_mem_cache", "thiet_bi_phan_mem_list_cache",
               "linh_kien_phan_cung_cache", "linh_kien_phan_cung_list_cache"
     }, allEntries = true)
     public void tuChoiPheDuyet(Long id, String lyDoTuChoi) {
          Long idDonVi = getRequiredTenantId();
          PhieuThanhLyTaiSan phieu = phieuThanhLyTaiSanRepository
                    .findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy phiếu thanh lý tài sản", 404));

          if (phieu.getTrangThai() != TrangThaiPhieuEnum.GUI_PHE_DUYET) {
               throw new NghiepVuException("Chỉ được từ chối phê duyệt phiếu ở trạng thái Gửi phê duyệt", 400);
          }

          phieu.setTrangThai(TrangThaiPhieuEnum.TU_CHOI);
          phieu.setLyDoTuChoi(lyDoTuChoi);
          phieuThanhLyTaiSanRepository.save(phieu);

          // Khôi phục các tài sản bị xóa mềm (nhả cờ xóa mềm để hoạt động lại)
          // 1. Phần cứng
          List<ChiTietThanhLyPhanCung> danhSachPhanCung = chiTietThanhLyPhanCungRepository
                    .findByPhieuThanhLyTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
          for (ChiTietThanhLyPhanCung pc : danhSachPhanCung) {
               thietBiPhanCungService.layEntityTheoId(pc.getDanhSachThietBiPhanCungId()).ifPresent(tb -> {
                    tb.setThoiGianXoa(null);
                    tb.setLyDoXoa(null);
                    thietBiPhanCungService.saveEntity(tb);
               });
          }

          // 2. Phần mềm
          List<ChiTietThanhLyPhanMem> danhSachPhanMem = chiTietThanhLyPhanMemRepository
                    .findByPhieuThanhLyTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
          for (ChiTietThanhLyPhanMem pm : danhSachPhanMem) {
               thietBiPhanMemService.layEntityTheoId(pm.getDanhSachThietBiPhanMemId()).ifPresent(tb -> {
                    tb.setThoiGianXoa(null);
                    tb.setLyDoXoa(null);
                    thietBiPhanMemService.saveEntity(tb);
               });
          }

          // 3. Linh kiện
          List<ChiTietThanhLyLinhKien> danhSachLinhKien = chiTietThanhLyLinhKienRepository
                    .findByPhieuThanhLyTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
          for (ChiTietThanhLyLinhKien lk : danhSachLinhKien) {
               linhKienPhanCungService.layEntityTheoId(lk.getLinhKienPhanCungId()).ifPresent(linhKien -> {
                    linhKien.setThoiGianXoa(null);
                    linhKien.setLyDoXoa(null);
                    linhKienPhanCungService.saveEntity(linhKien);
               });
          }
     }

     private PhieuThanhLyTaiSanResponse mapToResponse(PhieuThanhLyTaiSan phieu, boolean includeDetails) {
          Set<Long> userIds = new HashSet<>();
          if (phieu.getIdNguoiLap() != null)
               userIds.add(phieu.getIdNguoiLap());
          if (phieu.getIdNguoiPheDuyet() != null)
               userIds.add(phieu.getIdNguoiPheDuyet());

          Map<Long, String> userMap = nguoiDungService.layTenNguoiDungTheoIds(userIds);

          List<ChiTietThanhLyGeneralResponse> chiTietTaiSan = new ArrayList<>();

          if (includeDetails) {
               // 1. Gộp mảng Phần Cứng
               List<ChiTietThanhLyPhanCung> pcList = chiTietThanhLyPhanCungRepository
                         .findByPhieuThanhLyTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
               for (ChiTietThanhLyPhanCung pc : pcList) {
                    String tenTaiSan = "", soSerial = "", maThe = "";
                    DanhSachThietBiPhanCung tb = thietBiPhanCungService.layEntityTheoId(pc.getDanhSachThietBiPhanCungId())
                              .orElse(null);
                    if (tb != null) {
                         soSerial = tb.getSoSerial();
                         maThe = tb.getMaTheTaiSan();
                         if (tb.getTaiSanPhanCung() != null)
                              tenTaiSan = tb.getTaiSanPhanCung().getTenMau();
                    }
                    chiTietTaiSan.add(ChiTietThanhLyGeneralResponse.builder()
                              .id(pc.getId())
                              .idTaiSan(pc.getDanhSachThietBiPhanCungId())
                              .tenTaiSan(tenTaiSan)
                              .soSerial(soSerial)
                              .maTheTaiSan(maThe)
                              .tienThuHoi(pc.getTienThuHoi())
                              .loai("PHAN_CUNG")
                              .ghiChu(pc.getGhiChu())
                              .build());
               }

               // 2. Gộp mảng Phần Mềm
               List<ChiTietThanhLyPhanMem> pmList = chiTietThanhLyPhanMemRepository
                         .findByPhieuThanhLyTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
               for (ChiTietThanhLyPhanMem pm : pmList) {
                    String tenTaiSan = "";
                    DanhSachThietBiPhanMem pmEntity = thietBiPhanMemService.layEntityTheoId(pm.getDanhSachThietBiPhanMemId())
                              .orElse(null);
                    if (pmEntity != null && pmEntity.getTaiSanPhanMem() != null) {
                         tenTaiSan = pmEntity.getTaiSanPhanMem().getTenMau();
                    }
                    chiTietTaiSan.add(ChiTietThanhLyGeneralResponse.builder()
                              .id(pm.getId())
                              .idTaiSan(pm.getDanhSachThietBiPhanMemId())
                              .tenTaiSan(tenTaiSan)
                              .soSerial(null)
                              .maTheTaiSan(null)
                              .tienThuHoi(pm.getTienThuHoi())
                              .loai("PHAN_MEM")
                              .ghiChu(pm.getGhiChu())
                              .build());
               }

               // 3. Gộp mảng Linh Kiện
               List<ChiTietThanhLyLinhKien> lkList = chiTietThanhLyLinhKienRepository
                         .findByPhieuThanhLyTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
               for (ChiTietThanhLyLinhKien lk : lkList) {
                    String tenTaiSan = "", soSerial = "";
                    LinhKienPhanCung lkEntity = linhKienPhanCungService.layEntityTheoId(lk.getLinhKienPhanCungId())
                              .orElse(null);
                    if (lkEntity != null) {
                         soSerial = lkEntity.getSoSerial();
                         if (lkEntity.getTaiSanPhanCung() != null)
                              tenTaiSan = lkEntity.getTaiSanPhanCung().getTenMau();
                    }
                    chiTietTaiSan.add(ChiTietThanhLyGeneralResponse.builder()
                              .id(lk.getId())
                              .idTaiSan(lk.getLinhKienPhanCungId())
                              .tenTaiSan(tenTaiSan)
                              .soSerial(soSerial)
                              .maTheTaiSan(null)
                              .tienThuHoi(lk.getTienThuHoi())
                              .loai("LINH_KIEN")
                              .ghiChu(lk.getGhiChu())
                              .build());
               }
          }

          return PhieuThanhLyTaiSanResponse.builder()
                    .id(phieu.getId())
                    .idDonVi(phieu.getIdDonVi())
                    .maPhieuThanhLy(phieu.getMaPhieuThanhLy())
                    .tenNguoiLap(userMap.get(phieu.getIdNguoiLap()))
                    .tenNguoiPheDuyet(userMap.get(phieu.getIdNguoiPheDuyet()))
                    .hinhThucThanhLy(phieu.getHinhThucThanhLy())
                    .tongTienThuHoi(phieu.getTongTienThuHoi())
                    .thoiGianThanhLy(phieu.getThoiGianThanhLy())
                    .trangThaiLucGiao(phieu.getTrangThaiLucGiao())
                    .lyDoThanhLy(phieu.getLyDoThanhLy())
                    .trangThai(phieu.getTrangThai() != null ? phieu.getTrangThai().getValue() : null)
                    .thoiGianTao(phieu.getThoiGianTao())
                    .thoiGianCapNhat(phieu.getThoiGianCapNhat())
                    .chiTietTaiSan(chiTietTaiSan)
                    .build();
     }
}