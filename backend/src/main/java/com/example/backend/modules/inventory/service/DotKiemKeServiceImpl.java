package com.example.backend.modules.inventory.service;

import com.example.backend.modules.inventory.dto.DotKiemKeRequest;
import com.example.backend.modules.inventory.dto.DotKiemKeResponse;
import com.example.backend.modules.inventory.model.DotKiemKe;
import com.example.backend.modules.inventory.repository.DotKiemKeRepository;
import com.example.backend.modules.inventory.service.interfaces.DotKiemKeService;
import com.example.backend.modules.auth.service.interfaces.NguoiDungService;

import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.modules.inventory.model.TrangThaiKiemKeEnum;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DotKiemKeServiceImpl implements DotKiemKeService {

     private final DotKiemKeRepository dotKiemKeRepository;
     private final NguoiDungService nguoiDungService;

     @Autowired
     @Lazy
     private RabbitTemplate rabbitTemplate;

     private Long getRequiredTenantId() {
          Long tenantId = DonViContextHolder.getTenantId();
          if (tenantId == null) {
               if (com.example.backend.shared.utils.SecurityUtils.laSuperAdmin()) {
                    return null;
               }
               throw new NghiepVuException("Không tìm thấy thông tin đơn vị xử lý", 403);
          }
          return tenantId;
     }

     private Long getCurrentUserId() {
        return nguoiDungService.layIdNguoiDungHienTai();
    }

     @Override
     @Transactional
     public DotKiemKeResponse themMoi(DotKiemKeRequest request) {
          Long tenantId = getRequiredTenantId();
          Long userId = getCurrentUserId();

          if (request.getThoiGianKetThucDuKien().isBefore(request.getThoiGianBatDauDuKien())) {
               throw new NghiepVuException("Thời gian kết thúc dự kiến không được nhỏ hơn thời gian bắt đầu", 400);
          }

          DotKiemKe dkk = new DotKiemKe();
          dkk.setIdDonVi(tenantId);
          dkk.setMaDotKiemKe("DKK-" + tenantId + "-" + System.currentTimeMillis());
          dkk.setTenDotKiemKe(request.getTenDotKiemKe());
          dkk.setThoiGianBatDauDuKien(request.getThoiGianBatDauDuKien());
          dkk.setThoiGianKetThucDuKien(request.getThoiGianKetThucDuKien());
          dkk.setIdNguoiLap(userId);
          dkk.setTrangThai(TrangThaiKiemKeEnum.TAO_MOI);
          dkk.setTongTaiSanHeThong(0);
          dkk.setTongTaiSanThucTe(0);

          DotKiemKe saved = dotKiemKeRepository.save(dkk);
          return mapToResponse(saved);
     }

     @Override
     @Transactional
     public DotKiemKeResponse capNhat(Long id, DotKiemKeRequest request) {
          Long tenantId = getRequiredTenantId();
          DotKiemKe dkk = dotKiemKeRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin đợt kiểm kê tài sản", 404));

          if (dkk.getTrangThai() != TrangThaiKiemKeEnum.TAO_MOI) {
               throw new NghiepVuException("Chỉ cho phép cập nhật thông tin khi đợt kiểm kê ở trạng thái Tạo mới", 400);
          }

          if (request.getThoiGianKetThucDuKien().isBefore(request.getThoiGianBatDauDuKien())) {
               throw new NghiepVuException("Thời gian kết thúc dự kiến không được nhỏ hơn thời gian bắt đầu", 400);
          }

          dkk.setTenDotKiemKe(request.getTenDotKiemKe());
          dkk.setThoiGianBatDauDuKien(request.getThoiGianBatDauDuKien());
          dkk.setThoiGianKetThucDuKien(request.getThoiGianKetThucDuKien());

          DotKiemKe saved = dotKiemKeRepository.save(dkk);
          return mapToResponse(saved);
     }

     @Override
     @Transactional
     public void xoaMem(Long id) {
          Long tenantId = getRequiredTenantId();
          DotKiemKe dkk = dotKiemKeRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy đợt kiểm kê tài sản yêu cầu xóa", 404));

          if (dkk.getTrangThai() != TrangThaiKiemKeEnum.TAO_MOI) {
               throw new NghiepVuException("Chỉ cho phép xóa đợt kiểm kê khi đang ở trạng thái Tạo mới", 400);
          }

          dkk.setThoiGianXoa(LocalDateTime.now());
          dkk.setLyDoXoa("Hủy bỏ kế hoạch chiến dịch kiểm kê tài sản đơn vị");
          dotKiemKeRepository.save(dkk);
     }

     @Override
     @Transactional
     public void yeuCauPheDuyet(Long id) {
          Long tenantId = getRequiredTenantId();
          DotKiemKe dkk = dotKiemKeRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin đợt kiểm kê tài sản", 404));

          if (!dkk.getTrangThai().canTransitionTo(TrangThaiKiemKeEnum.GUI_PHE_DUYET)) {
               throw new NghiepVuException("Trạng thái hiện tại không hợp lệ để gửi yêu cầu phê duyệt", 400);
          }

          dkk.setTrangThai(TrangThaiKiemKeEnum.GUI_PHE_DUYET);
          dotKiemKeRepository.save(dkk);
     }

     @Override
     @Transactional
     public void pheDuyet(Long id) {
          Long tenantId = getRequiredTenantId();
          Long userId = getCurrentUserId();

          DotKiemKe dkk = dotKiemKeRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin đợt kiểm kê tài sản", 404));

          if (!dkk.getTrangThai().canTransitionTo(TrangThaiKiemKeEnum.DA_PHE_DUYET)) {
               throw new NghiepVuException("Đợt kiểm kê chưa được gửi duyệt hoặc trạng thái không hợp lệ để phê duyệt",
                         400);
          }

          dkk.setTrangThai(TrangThaiKiemKeEnum.DA_PHE_DUYET);
          dkk.setIdNguoiPheDuyet(userId);
          dkk.setThoiGianThucHien(LocalDateTime.now());
     }

     @Override
     @Transactional(readOnly = true)
     public PageResponse<DotKiemKeResponse> layDanhSach(String trangThai, LocalDate tuNgay, LocalDate denNgay, int page,
               int size, String sort) {
          Long tenantId = getRequiredTenantId();
          String[] sortParts = sort.split(",");
          Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
          PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortParts[0]));

          Specification<DotKiemKe> spec = (root, query, cb) -> {
               List<Predicate> predicates = new ArrayList<>();
               predicates.add(cb.isNull(root.get("thoiGianXoa")));
               predicates.add(cb.equal(root.get("idDonVi"), tenantId));

               if (trangThai != null && !trangThai.trim().isEmpty()) {
                    predicates.add(cb.equal(root.get("trangThai"), TrangThaiKiemKeEnum.fromValue(trangThai.trim())));
               }
               if (tuNgay != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("thoiGianTao"), tuNgay.atStartOfDay()));
               }
               if (denNgay != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("thoiGianTao"), denNgay.atTime(LocalTime.MAX)));
               }
               return cb.and(predicates.toArray(new Predicate[0]));
          };

          Page<DotKiemKe> pageResult = dotKiemKeRepository.findAll(spec, pageRequest);

          Set<Long> userIds = new HashSet<>();
          for (DotKiemKe dkk : pageResult.getContent()) {
               if (dkk.getIdNguoiLap() != null)
                    userIds.add(dkk.getIdNguoiLap());
               if (dkk.getIdNguoiPheDuyet() != null)
                    userIds.add(dkk.getIdNguoiPheDuyet());
          }

          Map<Long, String> userMap = userIds.isEmpty() ? new HashMap<>()
                    : nguoiDungService.layTenNguoiDungTheoIds(userIds);

          List<DotKiemKeResponse> content = pageResult.getContent().stream()
                    .map(dkk -> DotKiemKeResponse.builder()
                              .id(dkk.getId())
                              .idDonVi(dkk.getIdDonVi())
                              .maDotKiemKe(dkk.getMaDotKiemKe())
                              .tenDotKiemKe(dkk.getTenDotKiemKe())
                              .tenNguoiLap(userMap.get(dkk.getIdNguoiLap()))
                              .tenNguoiPheDuyet(userMap.get(dkk.getIdNguoiPheDuyet()))
                              .thoiGianBatDauDuKien(dkk.getThoiGianBatDauDuKien())
                              .thoiGianKetThucDuKien(dkk.getThoiGianKetThucDuKien())
                              .thoiGianThucHien(dkk.getThoiGianThucHien())
                              .thoiGianChotSoLieu(dkk.getThoiGianChotSoLieu())
                              .trangThai(dkk.getTrangThai().getValue())
                              .tongTaiSanHeThong(dkk.getTongTaiSanHeThong())
                              .tongTaiSanThucTe(dkk.getTongTaiSanThucTe())
                              .thoiGianTao(dkk.getThoiGianTao())
                              .thoiGianCapNhat(dkk.getThoiGianCapNhat())
                              .build())
                    .collect(Collectors.toList());

          return PageResponse.from(new PageImpl<>(content, pageRequest, pageResult.getTotalElements()));
     }

     @Override
     @Transactional(readOnly = true)
     public DotKiemKeResponse layTheoId(Long id) {
          Long tenantId = getRequiredTenantId();
          DotKiemKe dkk;
          if (tenantId == null) {
               dkk = dotKiemKeRepository.findByIdAndThoiGianXoaIsNull(id)
                         .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin đợt kiểm kê tài sản yêu cầu", 404));
          } else {
               dkk = dotKiemKeRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                         .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin đợt kiểm kê tài sản yêu cầu", 404));
          }

          return mapToResponse(dkk);
     }

     private DotKiemKeResponse mapToResponse(DotKiemKe dkk) {
          Set<Long> userIds = new HashSet<>();
          if (dkk.getIdNguoiLap() != null)
               userIds.add(dkk.getIdNguoiLap());
          if (dkk.getIdNguoiPheDuyet() != null)
               userIds.add(dkk.getIdNguoiPheDuyet());

          Map<Long, String> userMap = userIds.isEmpty() ? new HashMap<>()
                    : nguoiDungService.layTenNguoiDungTheoIds(userIds);

          return DotKiemKeResponse.builder()
                    .id(dkk.getId())
                    .idDonVi(dkk.getIdDonVi())
                    .maDotKiemKe(dkk.getMaDotKiemKe())
                    .tenDotKiemKe(dkk.getTenDotKiemKe())
                    .tenNguoiLap(userMap.get(dkk.getIdNguoiLap()))
                    .tenNguoiPheDuyet(userMap.get(dkk.getIdNguoiPheDuyet()))
                    .thoiGianBatDauDuKien(dkk.getThoiGianBatDauDuKien())
                    .thoiGianKetThucDuKien(dkk.getThoiGianKetThucDuKien())
                    .thoiGianThucHien(dkk.getThoiGianThucHien())
                    .thoiGianChotSoLieu(dkk.getThoiGianChotSoLieu())
                    .trangThai(dkk.getTrangThai().getValue())
                    .tongTaiSanHeThong(dkk.getTongTaiSanHeThong())
                    .tongTaiSanThucTe(dkk.getTongTaiSanThucTe())
                    .thoiGianTao(dkk.getThoiGianTao())
                    .thoiGianCapNhat(dkk.getThoiGianCapNhat())
                    .build();
     }
}