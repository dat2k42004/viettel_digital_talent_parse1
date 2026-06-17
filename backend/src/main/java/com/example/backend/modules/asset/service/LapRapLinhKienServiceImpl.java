package com.example.backend.modules.asset.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.modules.asset.dto.LapRapLinhKienResponse;
import com.example.backend.modules.asset.dto.LapRapLinhKienRequest;
import com.example.backend.modules.asset.model.DanhSachThietBiPhanCung;
import com.example.backend.modules.asset.model.LapRapLinhKien;
import com.example.backend.modules.asset.model.LinhKienPhanCung;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanCungRepository;
import com.example.backend.modules.asset.repository.LapRapLinhKienRepository;
import com.example.backend.modules.asset.repository.LinhKienPhanCungRepository;
import com.example.backend.modules.asset.service.interfaces.LapRapLinhKienService;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.tenant.DonViContextHolder;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LapRapLinhKienServiceImpl implements LapRapLinhKienService {
     private final LapRapLinhKienRepository lapRapLinhKienRepository;
     private final DanhSachThietBiPhanCungRepository thietBiPhanCungRepository;
     private final LinhKienPhanCungRepository linhKienPhanCungRepository;

     private Long getRequiredTenantId() {
          Long tenantId = DonViContextHolder.getTenantId();
          if (tenantId == null) {
               throw new NghiepVuException("Không tìm thấy thông tin đơn vị từ phiên làm việc", 403);
          }
          return tenantId;
     }

     @Override
     @Transactional
     public LapRapLinhKienResponse themMoi(LapRapLinhKienRequest request) {
          Long currentTenantId = getRequiredTenantId();

          // 1. Kiểm tra tồn tại và quyền sở hữu thiết bị nhận
          DanhSachThietBiPhanCung thietBi = thietBiPhanCungRepository
                    .findByIdAndIdDonViAndThoiGianXoaIsNull(request.getThietBiPhanCungId(), currentTenantId)
                    .orElseThrow(() -> new NghiepVuException(
                              "Không tìm thấy thiết bị phần cứng hoặc thiết bị không thuộc đơn vị", 404));

          // 2. Kiểm tra tồn tại và quyền sở hữu linh kiện rời
          LinhKienPhanCung linhKien = linhKienPhanCungRepository
                    .findByIdAndIdDonViAndThoiGianXoaIsNull(request.getLinhKienPhanCungId(), currentTenantId)
                    .orElseThrow(() -> new NghiepVuException(
                              "Không tìm thấy linh kiện phần cứng hoặc linh kiện không thuộc đơn vị", 404));

          // 3. Kiểm tra tính hợp lệ về kho vận của linh kiện rời
          if (!"TRONG_KHO".equals(linhKien.getTrangThaiKho())) {
               throw new NghiepVuException(
                         "Linh kiện phần cứng không sẵn sàng để lắp ráp (Phải ở trạng thái TRONG_KHO)", 400);
          }

          // 4. Chuyển trạng thái linh kiện thành 'DANG_SU_DUNG'
          linhKien.setTrangThaiKho("DANG_SU_DUNG");
          linhKienPhanCungRepository.save(linhKien);

          // 5. Sinh dữ liệu lịch sử liên kết lắp ráp
          LapRapLinhKien lapRap = new LapRapLinhKien();
          lapRap.setThietBiPhanCung(thietBi);
          lapRap.setLinhKienPhanCung(linhKien);
          lapRap.setIdDonVi(currentTenantId);
          lapRap.setThoiGianLap(LocalDateTime.now());
          lapRap.setTrangThaiLienKet("ACTIVE");
          lapRap.setGhiChu(request.getGhiChu());

          lapRap = lapRapLinhKienRepository.save(lapRap);
          return mapToResponse(lapRap);
     }

     @Override
     @Transactional
     public void capNhatThaoDo(Long id) {
          Long currentTenantId = getRequiredTenantId();

          // 1. Kiểm tra và bốc bản ghi liên kết lắp ráp
          LapRapLinhKien lapRap = lapRapLinhKienRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, currentTenantId)
                    .orElseThrow(
                              () -> new NghiepVuException("Không tìm thấy dữ liệu liên kết tháo lắp tương ứng", 404));

          // 2. Chặn nếu mối liên kết đã bị hủy từ trước
          if ("KHOA".equals(lapRap.getTrangThaiLienKet()) || lapRap.getThoiGianThao() != null) {
               throw new NghiepVuException("Mối liên kết lắp ráp này đã được tháo dỡ trước đó", 400);
          }

          // 3. Tiến hành ngắt liên kết tháo dỡ thiết bị
          lapRap.setThoiGianThao(LocalDateTime.now());
          lapRap.setTrangThaiLienKet("KHOA");
          lapRapLinhKienRepository.save(lapRap);

          // 4. Hoàn trả trạng thái linh kiện rời quay về 'TRONG_KHO'
          LinhKienPhanCung linhKien = lapRap.getLinhKienPhanCung();
          if (linhKien != null) {
               linhKien.setTrangThaiKho("TRONG_KHO");
               linhKienPhanCungRepository.save(linhKien);
          }
     }

     @Override
     @Transactional(readOnly = true)
     public PageResponse<LapRapLinhKienResponse> layDanhSach(Long thietBiPhanCungId, Long linhKienPhanCungId,
               String trangThaiLienKet, int page, int size, String sort) {
          // Tách chuỗi sort cấu hình PageRequest giống hệt file DanhMucTaiSanServiceImpl
          // của cậu
          String[] sortParts = sort.split(",");
          Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
          String sortBy = sortParts[0];

          PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));
          Long currentTenantId = getRequiredTenantId();

          Specification<LapRapLinhKien> spec = (root, query, cb) -> {
               List<Predicate> predicates = new ArrayList<>();

               // Lọc các bản ghi chưa bị xóa mềm kế thừa từ BaseEntity
               predicates.add(cb.isNull(root.get("thoiGianXoa")));

               // Cô lập Multi-tenant bảo mật tuyệt đối dữ liệu đơn vị
               predicates.add(cb.equal(root.get("idDonVi"), currentTenantId));

               // Lọc theo ID thiết bị
               if (thietBiPhanCungId != null) {
                    predicates.add(cb.equal(root.get("thietBiPhanCung").get("id"), thietBiPhanCungId));
               }

               // Lọc theo ID linh kiện
               if (linhKienPhanCungId != null) {
                    predicates.add(cb.equal(root.get("linhKienPhanCung").get("id"), linhKienPhanCungId));
               }

               // Lọc theo trạng thái liên kết (ACTIVE/INACTIVE)
               if (trangThaiLienKet != null && !trangThaiLienKet.trim().isEmpty()) {
                    predicates.add(cb.equal(root.get("trangThaiLienKet"), trangThaiLienKet.trim()));
               }

               return cb.and(predicates.toArray(new Predicate[0]));
          };

          Page<LapRapLinhKien> pageResult = lapRapLinhKienRepository.findAll(spec, pageRequest);
          Page<LapRapLinhKienResponse> responsePage = pageResult.map(this::mapToResponse);
          return PageResponse.from(responsePage);
     }

     private LapRapLinhKienResponse mapToResponse(LapRapLinhKien model) {
          return LapRapLinhKienResponse.builder()
                    .id(model.getId())
                    .thoiGianLap(model.getThoiGianLap())
                    .thoiGianThao(model.getThoiGianThao())
                    .trangThaiLienKet(model.getTrangThaiLienKet())
                    .ghiChu(model.getGhiChu())
                    .thoiGianTao(model.getThoiGianTao())
                    .thoiGianCapNhat(model.getThoiGianCapNhat())
                    .thietBiPhanCungId(model.getThietBiPhanCung() != null ? model.getThietBiPhanCung().getId() : null)
                    .soSerialThietBi(
                              model.getThietBiPhanCung() != null ? model.getThietBiPhanCung().getSoSerial() : null)
                    .maTheTaiSanThietBi(
                              model.getThietBiPhanCung() != null ? model.getThietBiPhanCung().getMaTheTaiSan() : null)
                    .linhKienPhanCungId(
                              model.getLinhKienPhanCung() != null ? model.getLinhKienPhanCung().getId() : null)
                    .soSerialLinhKien(
                              model.getLinhKienPhanCung() != null ? model.getLinhKienPhanCung().getSoSerial() : null)
                    .build();
     }
}
