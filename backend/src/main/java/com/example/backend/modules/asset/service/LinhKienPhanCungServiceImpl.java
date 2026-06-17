package com.example.backend.modules.asset.service;

import com.example.backend.modules.asset.dto.LinhKienPhanCungRequest;
import com.example.backend.modules.asset.dto.LinhKienPhanCungResponse;
import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.modules.asset.model.LinhKienPhanCung;
import com.example.backend.modules.asset.model.TaiSanPhanCung;
import com.example.backend.modules.asset.repository.LinhKienPhanCungRepository;
import com.example.backend.modules.asset.repository.TaiSanPhanCungRepository;
import com.example.backend.modules.asset.service.interfaces.LinhKienPhanCungService;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.tenant.DonViContextHolder;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LinhKienPhanCungServiceImpl implements LinhKienPhanCungService {

    private final LinhKienPhanCungRepository linhKienRepository;
    private final TaiSanPhanCungRepository taiSanPhanCungRepository;

    private Long getRequiredTenantId() {
        Long tenantId = DonViContextHolder.getTenantId();
        if (tenantId == null) {
            throw new NghiepVuException("Không tìm thấy thông tin đơn vị từ phiên làm việc", 403);
        }
        return tenantId;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "linh_kien_phan_cung_list_cache", key = "{#keyword, #trangThai, #tuNgayMua, #denNgayMua, #trangThaiKho, #page, #size, #sort, T(com.example.backend.shared.tenant.DonViContextHolder).getTenantId()}")
    public PageResponse<LinhKienPhanCungResponse> layDanhSach(
            String keyword,
            String trangThai,
            LocalDate tuNgayMua,
            LocalDate denNgayMua,
            String trangThaiKho,
            int page,
            int size,
            String sort
    ) {
        Long idDonVi = getRequiredTenantId();
        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortBy = sortParts[0];

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<LinhKienPhanCung> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));
            predicates.add(cb.equal(root.get("idDonVi"), idDonVi));

            if (trangThai != null && !trangThai.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("trangThai"), trangThai.trim()));
            }

            if (trangThaiKho != null && !trangThaiKho.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("trangThaiKho"), trangThaiKho.trim()));
            }

            if (tuNgayMua != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("thoiGianMua"), tuNgayMua));
            }

            if (denNgayMua != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("thoiGianMua"), denNgayMua));
            }

            if (keyword != null && !keyword.trim().isEmpty()) {
                String keywordLower = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("soSerial")), keywordLower));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<LinhKienPhanCung> pageResult = linhKienRepository.findAll(spec, pageRequest);
        Page<LinhKienPhanCungResponse> responsePage = pageResult.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "linh_kien_phan_cung_cache", key = "{#id, T(com.example.backend.shared.tenant.DonViContextHolder).getTenantId()}")
    public LinhKienPhanCungResponse layTheoId(Long id) {
        Long idDonVi = getRequiredTenantId();
        LinhKienPhanCung linhKien = linhKienRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy linh kiện phần cứng thuộc đơn vị của bạn với ID: " + id, 404));
        if (!"HOAT_DONG".equals(linhKien.getTrangThai())) {
            throw new NghiepVuException("Linh kiện phần cứng hiện đang bị khóa hoặc ngừng hoạt động", 400);
        }
        return mapToResponse(linhKien);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"linh_kien_phan_cung_cache", "linh_kien_phan_cung_list_cache"}, allEntries = true)
    public LinhKienPhanCungResponse themMoi(LinhKienPhanCungRequest request) {
        Long idDonVi = getRequiredTenantId();

        if (linhKienRepository.existsBySoSerialAndIdDonViAndThoiGianXoaIsNull(request.getSoSerial(), idDonVi)) {
            throw new NghiepVuException("Số Serial đã tồn tại trong đơn vị", 400);
        }

        LinhKienPhanCung linhKien = new LinhKienPhanCung();
        linhKien.setIdDonVi(idDonVi);
        capNhatThongTin(linhKien, request);
        linhKien = linhKienRepository.save(linhKien);

        return mapToResponse(linhKien);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"linh_kien_phan_cung_cache", "linh_kien_phan_cung_list_cache"}, allEntries = true)
    public LinhKienPhanCungResponse capNhat(Long id, LinhKienPhanCungRequest request) {
        Long idDonVi = getRequiredTenantId();
        LinhKienPhanCung linhKien = linhKienRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy linh kiện phần cứng để cập nhật", 404));

        if (!linhKien.getSoSerial().equals(request.getSoSerial()) &&
                linhKienRepository.existsBySoSerialAndIdDonViAndThoiGianXoaIsNull(request.getSoSerial(), idDonVi)) {
            throw new NghiepVuException("Số Serial mới đã tồn tại trong đơn vị", 400);
        }

        capNhatThongTin(linhKien, request);
        linhKien = linhKienRepository.save(linhKien);

        return mapToResponse(linhKien);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"linh_kien_phan_cung_cache", "linh_kien_phan_cung_list_cache"}, allEntries = true)
    public void xoaMem(Long id) {
        Long idDonVi = getRequiredTenantId();
        LinhKienPhanCung linhKien = linhKienRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy linh kiện phần cứng để xóa", 404));

        linhKien.setThoiGianXoa(LocalDateTime.now());
        linhKien.setLyDoXoa("Người dùng xóa");
        linhKienRepository.save(linhKien);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"linh_kien_phan_cung_cache", "linh_kien_phan_cung_list_cache"}, allEntries = true)
    public void capNhatTrangThai(Long id, TrangThaiRequest request) {
        Long idDonVi = getRequiredTenantId();
        LinhKienPhanCung linhKien = linhKienRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy linh kiện phần cứng", 404));

        String status = request.getTrangThai();
        if (!"HOAT_DONG".equals(status) && !"KHOA".equals(status)) {
            throw new NghiepVuException("Trạng thái không hợp lệ. Chỉ chấp nhận HOAT_DONG hoặc KHOA", 400);
        }

        linhKien.setTrangThai(status);
        linhKienRepository.save(linhKien);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SelectOption> laySelectOptions() {
        Long idDonVi = getRequiredTenantId();
        Specification<LinhKienPhanCung> spec = (root, query, cb) -> cb.and(
                cb.isNull(root.get("thoiGianXoa")),
                cb.equal(root.get("idDonVi"), idDonVi),
                cb.equal(root.get("trangThai"), "HOAT_DONG")
        );
        return linhKienRepository.findAll(spec).stream()
                .map(item -> SelectOption.builder()
                        .id(item.getId())
                        .ten(item.getSoSerial())
                        .build())
                .collect(Collectors.toList());
    }

    private void capNhatThongTin(LinhKienPhanCung linhKien, LinhKienPhanCungRequest request) {
        TaiSanPhanCung mau = taiSanPhanCungRepository.findByIdAndThoiGianXoaIsNull(request.getIdTaiSanPhanCung())
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy mẫu tài sản phần cứng tương ứng", 400));

        linhKien.setTaiSanPhanCung(mau);
        linhKien.setIdNhaCungCap(request.getIdNhaCungCap());
        linhKien.setSoSerial(request.getSoSerial().trim());
        linhKien.setGiaMua(request.getGiaMua());
        linhKien.setThoiGianMua(request.getThoiGianMua());
        linhKien.setHanBaoHanhThang(request.getHanBaoHanhThang());
        linhKien.setTrangThaiKho(request.getTrangThaiKho() != null ? request.getTrangThaiKho().trim() : null);
        linhKien.setViTriKho(request.getViTriKho() != null ? request.getViTriKho().trim() : null);
        linhKien.setTrangThai(request.getTrangThai() != null ? request.getTrangThai().trim() : "HOAT_DONG");
    }

    private LinhKienPhanCungResponse mapToResponse(LinhKienPhanCung linhKien) {
        return LinhKienPhanCungResponse.builder()
                .id(linhKien.getId())
                .idTaiSanPhanCung(linhKien.getTaiSanPhanCung() != null ? linhKien.getTaiSanPhanCung().getId() : null)
                .tenTaiSanPhanCung(linhKien.getTaiSanPhanCung() != null ? linhKien.getTaiSanPhanCung().getTenMau() : null)
                .maMauTaiSanPhanCung(linhKien.getTaiSanPhanCung() != null ? linhKien.getTaiSanPhanCung().getMaMau() : null)
                .idNhaCungCap(linhKien.getIdNhaCungCap())
                .idDonVi(linhKien.getIdDonVi())
                .soSerial(linhKien.getSoSerial())
                .giaMua(linhKien.getGiaMua())
                .thoiGianMua(linhKien.getThoiGianMua())
                .hanBaoHanhThang(linhKien.getHanBaoHanhThang())
                .trangThaiKho(linhKien.getTrangThaiKho())
                .viTriKho(linhKien.getViTriKho())
                .trangThai(linhKien.getTrangThai())
                .thoiGianTao(linhKien.getThoiGianTao())
                .thoiGianCapNhat(linhKien.getThoiGianCapNhat())
                .build();
    }
}
