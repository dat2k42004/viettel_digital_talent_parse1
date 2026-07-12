package com.example.backend.modules.procurement.service;

import com.example.backend.modules.procurement.dto.NhaCungCapRequest;
import com.example.backend.modules.procurement.dto.NhaCungCapResponse;
import com.example.backend.modules.procurement.dto.SelectOption;
import com.example.backend.modules.procurement.model.NhaCungCap;
import com.example.backend.modules.procurement.repository.NhaCungCapRepository;
import com.example.backend.modules.procurement.service.interfaces.NhaCungCapService;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.model.TrangThaiCoBanEnum;
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

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NhaCungCapServiceImpl implements NhaCungCapService {

     private final NhaCungCapRepository nhaCungCapRepository;

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

     @Override
     @Transactional(readOnly = true)
     public PageResponse<NhaCungCapResponse> layDanhSach(String keyword, String trangThai, int page, int size,
               String sort) {
          String[] sortParts = sort.split(",");
          Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
          String sortBy = sortParts[0];

          PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));
          Long currentTenantId = DonViContextHolder.getTenantId();

          Specification<NhaCungCap> spec = (root, query, cb) -> {
               List<Predicate> predicates = new ArrayList<>();

               predicates.add(cb.isNull(root.get("thoiGianXoa")));
               if (currentTenantId != null) {
                    predicates.add(cb.equal(root.get("idDonVi"), currentTenantId));
               }

               if (trangThai != null && !trangThai.trim().isEmpty()) {
                    try {
                         predicates.add(cb.equal(root.get("trangThai"), TrangThaiCoBanEnum.fromValue(trangThai.trim())));
                    } catch (IllegalArgumentException e) {
                         throw new NghiepVuException("exception.common.invalid_status", 400);
                    }
               }

               if (keyword != null && !keyword.trim().isEmpty()) {
                    String searchKeyword = "%" + keyword.trim().toLowerCase() + "%";
                    Predicate matchMa = cb.like(cb.lower(root.get("maNhaCungCap")), searchKeyword);
                    Predicate matchTen = cb.like(cb.lower(root.get("tenNhaCungCap")), searchKeyword);
                    predicates.add(cb.or(matchMa, matchTen));
               }

               return cb.and(predicates.toArray(new Predicate[0]));
          };

          Page<NhaCungCap> pageResult = nhaCungCapRepository.findAll(spec, pageRequest);
          Page<NhaCungCapResponse> responsePage = pageResult.map(this::mapToResponse);
          return PageResponse.from(responsePage);
     }

     @Override
     @Transactional(readOnly = true)
     public NhaCungCapResponse layTheoId(Long id) {
          Long currentTenantId = getRequiredTenantId();
          NhaCungCap ncc;
          if (currentTenantId == null) {
               ncc = nhaCungCapRepository.findByIdAndThoiGianXoaIsNull(id)
                         .orElseThrow(() -> new NghiepVuException("Không tìm thấy nhà cung cấp", 404));
          } else {
               ncc = nhaCungCapRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, currentTenantId)
                         .orElseThrow(() -> new NghiepVuException(
                                   "Không tìm thấy nhà cung cấp hoặc dữ liệu không thuộc quyền quản lý", 404));
          }
          return mapToResponse(ncc);
     }

      @Override
      @Transactional(readOnly = true)
      public List<SelectOption> laySelectOptions(String keyword) {
           Long currentTenantId = getRequiredTenantId();
           List<NhaCungCap> danhSach;
           if (currentTenantId == null) {
                danhSach = nhaCungCapRepository.findAll().stream()
                          .filter(ncc -> ncc.getThoiGianXoa() == null && ncc.getTrangThai() == TrangThaiCoBanEnum.HOAT_DONG)
                          .collect(Collectors.toList());
           } else {
                danhSach = nhaCungCapRepository
                          .findByIdDonViAndTrangThaiAndThoiGianXoaIsNull(currentTenantId, TrangThaiCoBanEnum.HOAT_DONG);
           }
           java.util.stream.Stream<NhaCungCap> stream = danhSach.stream();
           if (org.springframework.util.StringUtils.hasText(keyword)) {
                String searchKw = keyword.trim().toLowerCase();
                stream = stream.filter(ncc -> ncc.getTenNhaCungCap() != null && ncc.getTenNhaCungCap().toLowerCase().contains(searchKw));
           }
           return stream
                     .limit(50)
                     .map(ncc -> SelectOption.builder()
                               .id(ncc.getId())
                               .ten(ncc.getTenNhaCungCap())
                               .build())
                     .collect(Collectors.toList());
      }

     @Override
     @Transactional
     public NhaCungCapResponse themMoi(NhaCungCapRequest request) {
          Long currentTenantId = getRequiredTenantId();

          NhaCungCap ncc = new NhaCungCap();
          ncc.setIdDonVi(currentTenantId);
          ncc.setMaNhaCungCap("NCC-" + currentTenantId + "-" + System.currentTimeMillis());
          ncc.setTenNhaCungCap(request.getTenNhaCungCap());
          ncc.setMaSoThue(request.getMaSoThue());
          ncc.setNguoiLienHe(request.getNguoiLienHe());
          ncc.setSoDienThoai(request.getSoDienThoai());
          ncc.setEmail(request.getEmail());
          ncc.setDiaChi(request.getDiaChi());
          ncc.setGhiChu(request.getGhiChu());
          ncc.setTrangThai(TrangThaiCoBanEnum.HOAT_DONG);

          return mapToResponse(nhaCungCapRepository.save(ncc));
     }

     @Override
     @Transactional
     public NhaCungCapResponse capNhat(Long id, NhaCungCapRequest request) {
          Long currentTenantId = getRequiredTenantId();
          NhaCungCap ncc = nhaCungCapRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, currentTenantId)
                    .orElseThrow(
                              () -> new NghiepVuException("Không tìm thấy thông tin nhà cung cấp cần chỉnh sửa", 404));

          ncc.setTenNhaCungCap(request.getTenNhaCungCap());
          ncc.setMaSoThue(request.getMaSoThue());
          ncc.setNguoiLienHe(request.getNguoiLienHe());
          ncc.setSoDienThoai(request.getSoDienThoai());
          ncc.setEmail(request.getEmail());
          ncc.setDiaChi(request.getDiaChi());
          ncc.setGhiChu(request.getGhiChu());

          return mapToResponse(nhaCungCapRepository.save(ncc));
     }

     @Override
     @Transactional
     public void capNhatTrangThai(Long id, TrangThaiRequest request) {
          Long currentTenantId = getRequiredTenantId();
          NhaCungCap ncc = nhaCungCapRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, currentTenantId)
                    .orElseThrow(() -> new NghiepVuException(
                              "Không tìm thấy thông tin nhà cung cấp cần cập nhật trạng thái", 404));

          try {
               ncc.setTrangThai(TrangThaiCoBanEnum.fromValue(request.getTrangThai()));
          } catch (IllegalArgumentException e) {
               throw new NghiepVuException("exception.common.invalid_status", 400);
          }
          nhaCungCapRepository.save(ncc);
     }

     @Override
     @Transactional
     public void xoaMem(Long id) {
          Long currentTenantId = getRequiredTenantId();
          NhaCungCap ncc = nhaCungCapRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, currentTenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin nhà cung cấp cần xóa", 404));

          ncc.setThoiGianXoa(java.time.LocalDateTime.now());
          ncc.setLyDoXoa("Xóa mềm từ giao diện quản lý hệ thống");
          nhaCungCapRepository.save(ncc);
     }

     private NhaCungCapResponse mapToResponse(NhaCungCap model) {
          return NhaCungCapResponse.builder()
                    .id(model.getId())
                    .maNhaCungCap(model.getMaNhaCungCap())
                    .idDonVi(model.getIdDonVi())
                    .tenNhaCungCap(model.getTenNhaCungCap())
                    .maSoThue(model.getMaSoThue())
                    .nguoiLienHe(model.getNguoiLienHe())
                    .soDienThoai(model.getSoDienThoai())
                    .email(model.getEmail())
                    .diaChi(model.getDiaChi())
                    .ghiChu(model.getGhiChu())
                    .trangThai(model.getTrangThai() != null ? model.getTrangThai().getValue() : null)
                    .thoiGianTao(model.getThoiGianTao())
                    .thoiGianCapNhat(model.getThoiGianCapNhat())
                    .build();
     }

     @Override
     @Transactional(readOnly = true)
     public java.util.Optional<com.example.backend.modules.procurement.model.NhaCungCap> layEntityTheoId(Long id) {
          return nhaCungCapRepository.findById(id);
     }

     @Override
     @Transactional
     public void saveEntity(com.example.backend.modules.procurement.model.NhaCungCap entity) {
          nhaCungCapRepository.save(entity);
     }

     @Override
     @Transactional(readOnly = true)
     public java.util.Map<Long, String> layTenNhaCungCapTheoIds(java.util.Collection<Long> ids) {
          java.util.Map<Long, String> map = new java.util.HashMap<>();
          if (ids == null || ids.isEmpty()) {
               return map;
          }
          nhaCungCapRepository.findAllByIdInAndThoiGianXoaIsNull(new java.util.HashSet<>(ids))
                  .forEach(ncc -> map.put(ncc.getId(), ncc.getTenNhaCungCap()));
          return map;
     }
}
