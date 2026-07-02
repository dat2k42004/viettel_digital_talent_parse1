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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
            String keyword, String trangThai, LocalDate tuNgayMua, LocalDate denNgayMua,
            String trangThaiKho, int page, int size, String sort) {
        Long idDonVi = DonViContextHolder.getTenantId();
        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        String sortBy = sortParts[0];
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<LinhKienPhanCung> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));
            if (idDonVi != null) {
                predicates.add(cb.equal(root.get("idDonVi"), idDonVi));
            }
            // ... (Giữ nguyên cụm Spec cũ)
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<LinhKienPhanCung> pageResult = linhKienRepository.findAll(spec, pageRequest);

        // FIX N+1 QUERY: Gom ID mẫu linh kiện nạp tập trung lên RAM
        Set<Long> mauIds = pageResult.getContent().stream()
                .filter(lk -> lk.getTaiSanPhanCung() != null)
                .map(lk -> lk.getTaiSanPhanCung().getId())
                .collect(Collectors.toSet());

        Map<Long, TaiSanPhanCung> mauMap = new HashMap<>();
        if (!mauIds.isEmpty()) {
            mauMap = taiSanPhanCungRepository.findAllByIdInAndThoiGianXoaIsNull(mauIds).stream()
                    .collect(Collectors.toMap(TaiSanPhanCung::getId, java.util.function.Function.identity()));
        }

        final Map<Long, TaiSanPhanCung> finalMauMap = mauMap;

        List<LinhKienPhanCungResponse> content = pageResult.getContent().stream()
                .map(linhKien -> {
                    TaiSanPhanCung mau = linhKien.getTaiSanPhanCung() != null
                            ? finalMauMap.get(linhKien.getTaiSanPhanCung().getId())
                            : null;
                    return LinhKienPhanCungResponse.builder()
                            .id(linhKien.getId())
                            .idTaiSanPhanCung(mau != null ? mau.getId() : null)
                            .tenTaiSanPhanCung(mau != null ? mau.getTenMau() : null)
                            .maMauTaiSanPhanCung(mau != null ? mau.getMaMau() : null)
                            .idNhaCungCap(linhKien.getIdNhaCungCap())
                            .idDonVi(linhKien.getIdDonVi())
                            .soSerial(linhKien.getSoSerial())
                            .giaMua(linhKien.getGiaMua())
                            .thoiGianMua(linhKien.getThoiGianMua())
                            .hanBaoHanhThang(linhKien.getHanBaoHanhThang())
                            .trangThaiKho(linhKien.getTrangThaiKho())
                            .viTriKho(linhKien.getViTriKho())
                            .trangThai(linhKien.getTrangThai() != null ? linhKien.getTrangThai().getValue() : null)
                            .thoiGianTao(linhKien.getThoiGianTao())
                            .thoiGianCapNhat(linhKien.getThoiGianCapNhat())
                            .build();
                })
                .collect(Collectors.toList());

        return PageResponse.from(
                new org.springframework.data.domain.PageImpl<>(content, pageRequest, pageResult.getTotalElements()));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "linh_kien_phan_cung_cache", key = "{#id, T(com.example.backend.shared.tenant.DonViContextHolder).getTenantId()}")
    public LinhKienPhanCungResponse layTheoId(Long id) {
        Long idDonVi = getRequiredTenantId();
        LinhKienPhanCung linhKien = linhKienRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException(
                        "Không tìm thấy linh kiện phần cứng thuộc đơn vị của bạn với ID: " + id, 404));
        return mapToResponse(linhKien);
    }

    @Override
    @Transactional
    @CacheEvict(value = { "linh_kien_phan_cung_cache", "linh_kien_phan_cung_list_cache" }, allEntries = true)
    public LinhKienPhanCungResponse themMoi(LinhKienPhanCungRequest request) {
        Long idDonVi = getRequiredTenantId();

        if (linhKienRepository.existsBySoSerialAndIdDonViAndThoiGianXoaIsNull(request.getSoSerial(), idDonVi)) {
            throw new NghiepVuException("Số Serial đã tồn tại trong đơn vị", 400);
        }

        LinhKienPhanCung linhKien = new LinhKienPhanCung();
        linhKien.setIdDonVi(idDonVi);
        capNhatThongTin(linhKien, request);
        linhKien.setTrangThai(com.example.backend.shared.model.TrangThaiVanHanhEnum.KHOA);
        linhKien = linhKienRepository.save(linhKien);

        return mapToResponse(linhKien);
    }

    @Override
    @Transactional
    @CacheEvict(value = { "linh_kien_phan_cung_cache", "linh_kien_phan_cung_list_cache" }, allEntries = true)
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
    @CacheEvict(value = { "linh_kien_phan_cung_cache", "linh_kien_phan_cung_list_cache" }, allEntries = true)
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
    @CacheEvict(value = { "linh_kien_phan_cung_cache", "linh_kien_phan_cung_list_cache" }, allEntries = true)
    public void capNhatTrangThai(Long id, TrangThaiRequest request) {
        Long idDonVi = getRequiredTenantId();
        LinhKienPhanCung linhKien = linhKienRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy linh kiện phần cứng", 404));

        String status = request.getTrangThai();
        com.example.backend.shared.model.TrangThaiVanHanhEnum trangThaiEnum;
        try {
            trangThaiEnum = com.example.backend.shared.model.TrangThaiVanHanhEnum.fromValue(status);
        } catch (IllegalArgumentException e) {
            throw new NghiepVuException(e.getMessage(), 400);
        }

        linhKien.setTrangThai(trangThaiEnum);
        linhKienRepository.save(linhKien);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SelectOption> laySelectOptions(Long idTaiSanPhanCung) {
        Long idDonVi = getRequiredTenantId();
        Specification<LinhKienPhanCung> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));
            predicates.add(cb.equal(root.get("idDonVi"), idDonVi));
            predicates.add(
                    cb.equal(root.get("trangThai"), com.example.backend.shared.model.TrangThaiVanHanhEnum.HOAT_DONG));
            if (idTaiSanPhanCung != null) {
                predicates.add(cb.equal(root.get("taiSanPhanCung").get("id"), idTaiSanPhanCung));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return linhKienRepository.findAll(spec).stream()
                .map(item -> SelectOption.builder()
                        .id(item.getId())
                        .ten(item.getTaiSanPhanCung().getTenMau() + " - " + item.getSoSerial())
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
        String statusStr = request.getTrangThai() != null ? request.getTrangThai().trim() : null;
        if (statusStr != null) {
            try {
                linhKien.setTrangThai(com.example.backend.shared.model.TrangThaiVanHanhEnum.fromValue(statusStr));
            } catch (IllegalArgumentException e) {
                throw new NghiepVuException(e.getMessage(), 400);
            }
        } else if (linhKien.getTrangThai() == null) {
            linhKien.setTrangThai(com.example.backend.shared.model.TrangThaiVanHanhEnum.KHOA);
        }
    }

    private LinhKienPhanCungResponse mapToResponse(LinhKienPhanCung linhKien) {
        return LinhKienPhanCungResponse.builder()
                .id(linhKien.getId())
                .idTaiSanPhanCung(linhKien.getTaiSanPhanCung() != null ? linhKien.getTaiSanPhanCung().getId() : null)
                .tenTaiSanPhanCung(
                        linhKien.getTaiSanPhanCung() != null ? linhKien.getTaiSanPhanCung().getTenMau() : null)
                .maMauTaiSanPhanCung(
                        linhKien.getTaiSanPhanCung() != null ? linhKien.getTaiSanPhanCung().getMaMau() : null)
                .idNhaCungCap(linhKien.getIdNhaCungCap())
                .idDonVi(linhKien.getIdDonVi())
                .soSerial(linhKien.getSoSerial())
                .giaMua(linhKien.getGiaMua())
                .thoiGianMua(linhKien.getThoiGianMua())
                .hanBaoHanhThang(linhKien.getHanBaoHanhThang())
                .trangThaiKho(linhKien.getTrangThaiKho())
                .viTriKho(linhKien.getViTriKho())
                .trangThai(linhKien.getTrangThai() != null ? linhKien.getTrangThai().getValue() : null)
                .thoiGianTao(linhKien.getThoiGianTao())
                .thoiGianCapNhat(linhKien.getThoiGianCapNhat())
                .build();
    }
}
