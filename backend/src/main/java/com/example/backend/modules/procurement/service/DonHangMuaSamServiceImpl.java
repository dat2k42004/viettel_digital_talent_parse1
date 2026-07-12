package com.example.backend.modules.procurement.service;

import com.example.backend.modules.procurement.dto.ChiTietDonHangPhanCungRequest;
import com.example.backend.modules.procurement.dto.ChiTietDonHangPhanMemRequest;
import com.example.backend.modules.procurement.dto.ChiTietDonHangGeneralResponse;
import com.example.backend.modules.procurement.dto.DonHangMuaSamRequest;
import com.example.backend.modules.procurement.dto.DonHangMuaSamResponse;
import com.example.backend.modules.procurement.dto.SelectOption;
import com.example.backend.modules.procurement.model.ChiTietDonHangPhanCung;
import com.example.backend.modules.procurement.model.ChiTietDonHangPhanMem;
import com.example.backend.modules.procurement.model.DonHangMuaSam;
import com.example.backend.modules.procurement.model.NhaCungCap;
import com.example.backend.modules.procurement.repository.ChiTietDonHangPhanCungRepository;
import com.example.backend.modules.procurement.repository.ChiTietDonHangPhanMemRepository;
import com.example.backend.modules.procurement.repository.DonHangMuaSamRepository;
import com.example.backend.modules.procurement.service.interfaces.NhaCungCapService;
import com.example.backend.modules.procurement.service.interfaces.DonHangMuaSamService;
import com.example.backend.modules.auth.service.interfaces.NguoiDungService;

import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.asset.service.interfaces.TaiSanPhanCungService;
import com.example.backend.modules.asset.service.interfaces.TaiSanPhanMemService;
import com.example.backend.modules.asset.model.TaiSanPhanCung;
import com.example.backend.modules.asset.model.TaiSanPhanMem;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.tenant.DonViContextHolder;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonHangMuaSamServiceImpl implements DonHangMuaSamService {

     private final DonHangMuaSamRepository donHangMuaSamRepository;
     private final ChiTietDonHangPhanCungRepository chiTietDonHangPhanCungRepository;
     private final ChiTietDonHangPhanMemRepository chiTietDonHangPhanMemRepository;
     private final NhaCungCapService nhaCungCapService;
     private final NguoiDungService nguoiDungService;
     private final TaiSanPhanCungService taiSanPhanCungService;
     private final TaiSanPhanMemService taiSanPhanMemService;

     private Long getRequiredTenantId() {
          Long tenantId = DonViContextHolder.getTenantId();
          if (tenantId == null) {
               if (com.example.backend.shared.utils.SecurityUtils.laSuperAdmin()) {
                    return null;
               }
               throw new NghiepVuException("exception.common.no_tenant_info", 403);
          }
          return tenantId;
     }

     private Long getCurrentUserId() {
        return nguoiDungService.layIdNguoiDungHienTai();
    }

     @Override
     @Transactional(readOnly = true)
     public PageResponse<DonHangMuaSamResponse> layDanhSach(String maDonHang, Long idNhaCungCap, String trangThai,
               int page, int size, String sort) {
          String[] sortParts = sort.split(",");
          Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
          String sortBy = sortParts[0];

          PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));
          Long currentTenantId = DonViContextHolder.getTenantId();

          Specification<DonHangMuaSam> spec = (root, query, cb) -> {
               List<Predicate> predicates = new ArrayList<>();

               predicates.add(cb.isNull(root.get("thoiGianXoa")));
               if (currentTenantId != null) {
                    predicates.add(cb.equal(root.get("idDonVi"), currentTenantId));
               }

               if (maDonHang != null && !maDonHang.trim().isEmpty()) {
                    predicates.add(
                              cb.like(cb.lower(root.get("maDonHang")), "%" + maDonHang.trim().toLowerCase() + "%"));
               }

               if (idNhaCungCap != null) {
                    predicates.add(cb.equal(root.get("nhaCungCap").get("id"), idNhaCungCap));
               }

               if (trangThai != null && !trangThai.trim().isEmpty()) {
                    try {
                         predicates.add(cb.equal(root.get("trangThai"),
                                   com.example.backend.shared.model.TrangThaiPhieuEnum.fromValue(trangThai.trim())));
                    } catch (IllegalArgumentException e) {
                         throw new NghiepVuException(e.getMessage(), 400);
                    }
               }

               return cb.and(predicates.toArray(new Predicate[0]));
          };

          Page<DonHangMuaSam> pageResult = donHangMuaSamRepository.findAll(spec, pageRequest);

          // 1. Gom cả userIds và nccIds để triệt tiêu tận gốc N+1
          java.util.Set<Long> userIds = new java.util.HashSet<>();
          java.util.Set<Long> nccIds = new java.util.HashSet<>();

          for (DonHangMuaSam dh : pageResult.getContent()) {
               if (dh.getIdNguoiLap() != null)
                    userIds.add(dh.getIdNguoiLap());
               if (dh.getIdNguoiPheDuyet() != null)
                    userIds.add(dh.getIdNguoiPheDuyet());
               if (dh.getNhaCungCap() != null)
                    nccIds.add(dh.getNhaCungCap().getId());
          }

          java.util.Map<Long, String> userMap = new java.util.HashMap<>();
          if (!userIds.isEmpty()) {
               userMap = nguoiDungService.layTenNguoiDungTheoIds(userIds);
          }

          // Kéo thông tin Nhà cung cấp lên RAM trong 1 câu SQL duy nhất
          java.util.Map<Long, String> nccMap = new java.util.HashMap<>();
          if (!nccIds.isEmpty()) {
               nccMap = nhaCungCapService.layTenNhaCungCapTheoIds(nccIds);
          }

          final java.util.Map<Long, String> finalUserMap = userMap;
          final java.util.Map<Long, String> finalNccMap = nccMap;

          // Map siêu tốc trên RAM
          List<DonHangMuaSamResponse> responses = pageResult.getContent().stream()
                    .map(dh -> {
                         DonHangMuaSamResponse res = mapToResponseWithoutDetails(dh, finalUserMap);
                         // Gán trực tiếp tên nhà cung cấp đã nạp trên RAM, không gọi lazy load qua
                         // getter nữa
                         if (dh.getNhaCungCap() != null) {
                              res.setTenNhaCungCap(finalNccMap.get(dh.getNhaCungCap().getId()));
                         }
                         return res;
                    })
                    .collect(Collectors.toList());

          return PageResponse.from(new org.springframework.data.domain.PageImpl<>(responses, pageRequest,
                    pageResult.getTotalElements()));
     }

     @Override
     @Transactional(readOnly = true)
      public DonHangMuaSamResponse layTheoId(Long id) {
           Long currentTenantId = getRequiredTenantId();
           DonHangMuaSam dh;
           if (currentTenantId == null) {
                dh = donHangMuaSamRepository.findByIdAndThoiGianXoaIsNull(id)
                          .orElseThrow(() -> new NghiepVuException("Không tìm thấy đơn hàng mua sắm", 404));
           } else {
                dh = donHangMuaSamRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, currentTenantId)
                          .orElseThrow(() -> new NghiepVuException(
                                    "Không tìm thấy đơn hàng mua sắm hoặc dữ liệu không thuộc quyền quản lý", 404));
           }
           return mapToResponseWithDetails(dh);
      }

     @Override
     @Transactional(readOnly = true)
     public List<SelectOption> laySelectOptions(String keyword) {
          Long currentTenantId = getRequiredTenantId();
          List<DonHangMuaSam> danhSach;
          if (currentTenantId == null) {
               danhSach = donHangMuaSamRepository.findAll().stream()
                         .filter(dh -> dh.getThoiGianXoa() == null && dh.getTrangThai() == com.example.backend.shared.model.TrangThaiPhieuEnum.DA_PHE_DUYET)
                         .collect(Collectors.toList());
          } else {
               danhSach = donHangMuaSamRepository
                         .findByIdDonViAndTrangThaiAndThoiGianXoaIsNull(currentTenantId,
                                   com.example.backend.shared.model.TrangThaiPhieuEnum.DA_PHE_DUYET);
          }
          java.util.stream.Stream<DonHangMuaSam> stream = danhSach.stream();
          if (org.springframework.util.StringUtils.hasText(keyword)) {
               String searchKw = keyword.trim().toLowerCase();
               stream = stream.filter(dh -> dh.getMaDonHang() != null && dh.getMaDonHang().toLowerCase().contains(searchKw));
          }
          return stream
                    .limit(50)
                    .map(dh -> SelectOption.builder()
                              .id(dh.getId())
                              .ten(dh.getMaDonHang())
                              .build())
                    .collect(Collectors.toList());
     }

     @Override
     @Transactional
     public DonHangMuaSamResponse themMoi(DonHangMuaSamRequest request) {
          Long currentTenantId = getRequiredTenantId();

          NhaCungCap ncc = nhaCungCapService.layEntityTheoId(request.getIdNhaCungCap())
                    .orElseThrow(() -> new NghiepVuException(
                              "Nhà cung cấp lựa chọn không tồn tại hoặc không thuộc đơn vị", 400));

          DonHangMuaSam dh = new DonHangMuaSam();
          dh.setIdDonVi(currentTenantId);
          dh.setNhaCungCap(ncc);
          dh.setIdNguoiLap(getCurrentUserId());
          // dh.setIdNguoiPheDuyet(request.getIdNguoiPheDuyet());
          dh.setMaDonHang("PO-" + currentTenantId + "-" + System.currentTimeMillis());
          dh.setSoHopDongDinhKem(request.getSoHopDongDinhKem());
          dh.setTongTienTruocThue(request.getTongTienTruocThue());
          dh.setThueVat(request.getThueVat());
          dh.setTongTienSauThue(request.getTongTienSauThue());
          dh.setThoiGianGiaoDuKien(request.getThoiGianGiaoDuKien());
          dh.setGhiChu(request.getGhiChu());
          dh.setTrangThai(com.example.backend.shared.model.TrangThaiPhieuEnum.TAO_MOI);

          DonHangMuaSam savedDh = donHangMuaSamRepository.save(dh);

          if (request.getChiTietPhanCung() != null) {
               for (ChiTietDonHangPhanCungRequest pcReq : request.getChiTietPhanCung()) {
                    ChiTietDonHangPhanCung pc = new ChiTietDonHangPhanCung();
                    pc.setDonHangMuaSam(savedDh);
                    pc.setIdTaiSanPhanCung(pcReq.getIdTaiSanPhanCung());
                    pc.setSoLuongDat(pcReq.getSoLuongDat());
                    pc.setDonGiaDat(pcReq.getDonGiaDat());
                    pc.setThanhTien(pcReq.getDonGiaDat().multiply(java.math.BigDecimal.valueOf(pcReq.getSoLuongDat())));
                    pc.setSoLuongDaNhap(0);
                    pc.setGhiChu(pcReq.getGhiChu());
                    chiTietDonHangPhanCungRepository.save(pc);
               }
          }

          if (request.getChiTietPhanMem() != null) {
               for (ChiTietDonHangPhanMemRequest pmReq : request.getChiTietPhanMem()) {
                    ChiTietDonHangPhanMem pm = new ChiTietDonHangPhanMem();
                    pm.setDonHangMuaSam(savedDh);
                    pm.setIdTaiSanPhanMem(pmReq.getIdTaiSanPhanMem());
                    pm.setSoLuongDat(pmReq.getSoLuongDat());
                    pm.setDonGiaDat(pmReq.getDonGiaDat());
                    pm.setThanhTien(pmReq.getDonGiaDat().multiply(java.math.BigDecimal.valueOf(pmReq.getSoLuongDat())));
                    pm.setSoLuongDaNhap(0);
                    pm.setGhiChu(pmReq.getGhiChu());
                    chiTietDonHangPhanMemRepository.save(pm);
               }
          }

          return mapToResponseWithDetails(savedDh);
     }

     @Override
     @Transactional
     public DonHangMuaSamResponse capNhat(Long id, DonHangMuaSamRequest request) {
          Long currentTenantId = getRequiredTenantId();
          DonHangMuaSam dh = donHangMuaSamRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, currentTenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin đơn hàng mua sắm cần chỉnh sửa",
                              404));

          if (dh.getTrangThai() != com.example.backend.shared.model.TrangThaiPhieuEnum.TAO_MOI) {
               throw new NghiepVuException("Chỉ được sửa đơn hàng khi ở trạng thái Tạo mới (TAO_MOI)", 400);
          }

          NhaCungCap ncc = nhaCungCapService.layEntityTheoId(request.getIdNhaCungCap())
                    .orElseThrow(() -> new NghiepVuException("Nhà cung cấp lựa chọn không tồn tại", 400));

          dh.setNhaCungCap(ncc);
          dh.setIdNguoiLap(getCurrentUserId());
          dh.setSoHopDongDinhKem(request.getSoHopDongDinhKem());
          dh.setTongTienTruocThue(request.getTongTienTruocThue());
          dh.setThueVat(request.getThueVat());
          dh.setTongTienSauThue(request.getTongTienSauThue());
          dh.setThoiGianGiaoDuKien(request.getThoiGianGiaoDuKien());
          dh.setGhiChu(request.getGhiChu());

          DonHangMuaSam savedDh = donHangMuaSamRepository.save(dh);

          // Xóa các chi tiết cũ để nạp lại theo cơ chế Aggregate Root phẳng
          List<ChiTietDonHangPhanCung> oldPcList = chiTietDonHangPhanCungRepository
                    .findByDonHangMuaSamAndThoiGianXoaIsNull(savedDh);
          if (!oldPcList.isEmpty()) {
               chiTietDonHangPhanCungRepository.deleteAll(oldPcList);
          }

          List<ChiTietDonHangPhanMem> oldPmList = chiTietDonHangPhanMemRepository
                    .findByDonHangMuaSamAndThoiGianXoaIsNull(savedDh);
          if (!oldPmList.isEmpty()) {
               chiTietDonHangPhanMemRepository.deleteAll(oldPmList);
          }

          // Thêm mới lại danh sách chi tiết từ Request
          if (request.getChiTietPhanCung() != null) {
               for (ChiTietDonHangPhanCungRequest pcReq : request.getChiTietPhanCung()) {
                    ChiTietDonHangPhanCung pc = new ChiTietDonHangPhanCung();
                    pc.setDonHangMuaSam(savedDh);
                    pc.setIdTaiSanPhanCung(pcReq.getIdTaiSanPhanCung());
                    pc.setSoLuongDat(pcReq.getSoLuongDat());
                    pc.setDonGiaDat(pcReq.getDonGiaDat());
                    pc.setThanhTien(pcReq.getDonGiaDat().multiply(java.math.BigDecimal.valueOf(pcReq.getSoLuongDat())));
                    pc.setSoLuongDaNhap(0);
                    pc.setGhiChu(pcReq.getGhiChu());
                    chiTietDonHangPhanCungRepository.save(pc);
               }
          }

          if (request.getChiTietPhanMem() != null) {
               for (ChiTietDonHangPhanMemRequest pmReq : request.getChiTietPhanMem()) {
                    ChiTietDonHangPhanMem pm = new ChiTietDonHangPhanMem();
                    pm.setDonHangMuaSam(savedDh);
                    pm.setIdTaiSanPhanMem(pmReq.getIdTaiSanPhanMem());
                    pm.setSoLuongDat(pmReq.getSoLuongDat());
                    pm.setDonGiaDat(pmReq.getDonGiaDat());
                    pm.setThanhTien(pmReq.getDonGiaDat().multiply(java.math.BigDecimal.valueOf(pmReq.getSoLuongDat())));
                    pm.setSoLuongDaNhap(0);
                    pm.setGhiChu(pmReq.getGhiChu());
                    chiTietDonHangPhanMemRepository.save(pm);
               }
          }

          return mapToResponseWithDetails(savedDh);
     }

     @Override
     @Transactional
     public void yeuCauPheDuyet(Long id) {
          Long currentTenantId = getRequiredTenantId();
          DonHangMuaSam dh = donHangMuaSamRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, currentTenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin đơn hàng mua sắm", 404));

          if (!dh.getTrangThai().canTransitionTo(com.example.backend.shared.model.TrangThaiPhieuEnum.GUI_PHE_DUYET)) {
               throw new NghiepVuException(
                         "Không thể gửi yêu cầu phê duyệt đơn hàng ở trạng thái: " + dh.getTrangThai().getMoTa(), 400);
          }

          dh.setTrangThai(com.example.backend.shared.model.TrangThaiPhieuEnum.GUI_PHE_DUYET);
          donHangMuaSamRepository.save(dh);
     }

     @Override
     @Transactional
     public void pheDuyet(Long id) {
          Long currentTenantId = getRequiredTenantId();
          Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

          DonHangMuaSam dh = donHangMuaSamRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, currentTenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin đơn hàng mua sắm", 404));

          if (!dh.getTrangThai().canTransitionTo(com.example.backend.shared.model.TrangThaiPhieuEnum.DA_PHE_DUYET)) {
               throw new NghiepVuException("Không thể phê duyệt đơn hàng ở trạng thái: " + dh.getTrangThai().getMoTa(),
                         400);
          }

          dh.setTrangThai(com.example.backend.shared.model.TrangThaiPhieuEnum.DA_PHE_DUYET);
          dh.setIdNguoiPheDuyet(getCurrentUserId());
          donHangMuaSamRepository.save(dh);
     }

     @Override
     @Transactional
     public void xoaMem(Long id) {
          Long currentTenantId = getRequiredTenantId();
          DonHangMuaSam dh = donHangMuaSamRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, currentTenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin đơn hàng mua sắm cần xóa", 404));

          if (dh.getTrangThai() != com.example.backend.shared.model.TrangThaiPhieuEnum.TAO_MOI) {
               throw new NghiepVuException("Chỉ được xóa đơn hàng khi ở trạng thái Tạo mới", 400);
          }

          dh.setThoiGianXoa(LocalDateTime.now());
          dh.setLyDoXoa("Xóa mềm từ luồng chức năng quản lý hệ thống");
          donHangMuaSamRepository.save(dh);
     }

     private DonHangMuaSamResponse mapToResponseWithoutDetails(DonHangMuaSam model,
               java.util.Map<Long, String> userMap) {
          return DonHangMuaSamResponse.builder()
                    .id(model.getId())
                    .idDonVi(model.getIdDonVi())
                    .idNhaCungCap(model.getNhaCungCap() != null ? model.getNhaCungCap().getId() : null)
                    .tenNhaCungCap(model.getNhaCungCap() != null ? model.getNhaCungCap().getTenNhaCungCap() : null)
                    .tenNguoiLap(model.getIdNguoiLap() != null ? userMap.get(model.getIdNguoiLap()) : null)
                    .tenNguoiPheDuyet(
                              model.getIdNguoiPheDuyet() != null ? userMap.get(model.getIdNguoiPheDuyet()) : null)
                    .maDonHang(model.getMaDonHang())
                    .soHopDongDinhKem(model.getSoHopDongDinhKem())
                    .tongTienTruocThue(model.getTongTienTruocThue())
                    .thueVat(model.getThueVat())
                    .tongTienSauThue(model.getTongTienSauThue())
                    .thoiGianGiaoDuKien(model.getThoiGianGiaoDuKien())
                    .trangThai(model.getTrangThai() != null ? model.getTrangThai().getValue() : null)
                    .ghiChu(model.getGhiChu())
                    .thoiGianTao(model.getThoiGianTao())
                    .thoiGianCapNhat(model.getThoiGianCapNhat())
                    .build();
     }

     private DonHangMuaSamResponse mapToResponseWithDetails(DonHangMuaSam model) {
          java.util.Set<Long> userIds = new java.util.HashSet<>();
          if (model.getIdNguoiLap() != null) {
               userIds.add(model.getIdNguoiLap());
          }
          if (model.getIdNguoiPheDuyet() != null) {
               userIds.add(model.getIdNguoiPheDuyet());
          }

          java.util.Map<Long, String> userMap = new java.util.HashMap<>();
          if (!userIds.isEmpty()) {
               userMap = nguoiDungService.layTenNguoiDungTheoIds(userIds);
          }

          DonHangMuaSamResponse response = mapToResponseWithoutDetails(model, userMap);

          List<ChiTietDonHangGeneralResponse> chiTietList = new ArrayList<>();

          // 1. Map hardware details
          List<ChiTietDonHangPhanCung> pcList = chiTietDonHangPhanCungRepository
                    .findByDonHangMuaSamAndThoiGianXoaIsNull(model);
          if (!pcList.isEmpty()) {
               java.util.Set<Long> pcIds = pcList.stream()
                         .map(ChiTietDonHangPhanCung::getIdTaiSanPhanCung)
                         .filter(java.util.Objects::nonNull)
                         .collect(Collectors.toSet());
               java.util.Map<Long, String> pcNameMap = new java.util.HashMap<>();
               if (!pcIds.isEmpty()) {
                    pcNameMap = taiSanPhanCungService.layTheoIds(pcIds).stream()
                              .collect(Collectors.toMap(TaiSanPhanCung::getId, TaiSanPhanCung::getTenMau));
               }

               for (ChiTietDonHangPhanCung pc : pcList) {
                    chiTietList.add(ChiTietDonHangGeneralResponse.builder()
                              .id(pc.getId())
                              .idTaiSan(pc.getIdTaiSanPhanCung())
                              .tenTaiSan(pc.getIdTaiSanPhanCung() != null ? pcNameMap.get(pc.getIdTaiSanPhanCung())
                                        : null)
                              .soLuongDat(pc.getSoLuongDat())
                              .donGiaDat(pc.getDonGiaDat())
                              .thanhTien(pc.getThanhTien())
                              .soLuongDaNhap(pc.getSoLuongDaNhap())
                              .ghiChu(pc.getGhiChu())
                              .loai("PHAN_CUNG")
                              .thoiGianTao(pc.getThoiGianTao())
                              .thoiGianCapNhat(pc.getThoiGianCapNhat())
                              .build());
               }
          }

          // 2. Map software details
          List<ChiTietDonHangPhanMem> pmList = chiTietDonHangPhanMemRepository
                    .findByDonHangMuaSamAndThoiGianXoaIsNull(model);
          if (!pmList.isEmpty()) {
               java.util.Set<Long> pmIds = pmList.stream()
                         .map(ChiTietDonHangPhanMem::getIdTaiSanPhanMem)
                         .filter(java.util.Objects::nonNull)
                         .collect(Collectors.toSet());
               java.util.Map<Long, String> pmNameMap = new java.util.HashMap<>();
               if (!pmIds.isEmpty()) {
                    pmNameMap = taiSanPhanMemService.layTheoIds(pmIds).stream()
                              .collect(Collectors.toMap(TaiSanPhanMem::getId, TaiSanPhanMem::getTenMau));
               }

               for (ChiTietDonHangPhanMem pm : pmList) {
                    chiTietList.add(ChiTietDonHangGeneralResponse.builder()
                              .id(pm.getId())
                              .idTaiSan(pm.getIdTaiSanPhanMem())
                              .tenTaiSan(
                                        pm.getIdTaiSanPhanMem() != null ? pmNameMap.get(pm.getIdTaiSanPhanMem()) : null)
                              .soLuongDat(pm.getSoLuongDat())
                              .donGiaDat(pm.getDonGiaDat())
                              .thanhTien(pm.getThanhTien())
                              .soLuongDaNhap(pm.getSoLuongDaNhap())
                              .ghiChu(pm.getGhiChu())
                              .loai("PHAN_MEM")
                              .thoiGianTao(pm.getThoiGianTao())
                              .thoiGianCapNhat(pm.getThoiGianCapNhat())
                              .build());
               }
          }

          response.setChiTietTaiSan(chiTietList);
          return response;
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
}