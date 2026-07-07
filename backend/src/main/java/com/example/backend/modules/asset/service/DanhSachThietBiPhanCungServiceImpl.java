package com.example.backend.modules.asset.service;

import com.example.backend.modules.asset.dto.DanhSachThietBiPhanCungRequest;
import com.example.backend.modules.asset.dto.DanhSachThietBiPhanCungResponse;
import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.modules.asset.model.DanhSachThietBiPhanCung;
import com.example.backend.modules.asset.model.TaiSanPhanCung;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanCungRepository;
import com.example.backend.modules.asset.repository.TaiSanPhanCungRepository;
import com.example.backend.modules.asset.service.interfaces.DanhSachThietBiPhanCungService;
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
public class DanhSachThietBiPhanCungServiceImpl implements DanhSachThietBiPhanCungService {

    private final DanhSachThietBiPhanCungRepository thietBiPhanCungRepository;
    private final TaiSanPhanCungRepository taiSanPhanCungRepository;

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

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "thiet_bi_phan_cung_list_cache", key = "{#keyword, #trangThai, #tuNgayMua, #denNgayMua, #trangThaiKho, #page, #size, #sort, T(com.example.backend.shared.tenant.DonViContextHolder).getTenantId()}")
    public PageResponse<DanhSachThietBiPhanCungResponse> layDanhSach(
            String keyword,
            String trangThai,
            LocalDate tuNgayMua,
            LocalDate denNgayMua,
            String trangThaiKho,
            int page,
            int size,
            String sort) {
        Long idDonVi = DonViContextHolder.getTenantId();
        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        String sortBy = sortParts[0];

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<DanhSachThietBiPhanCung> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));
            if (idDonVi != null) {
                predicates.add(cb.equal(root.get("idDonVi"), idDonVi));
            }

            if (trangThai != null && !trangThai.trim().isEmpty()) {
                try {
                    predicates.add(cb.equal(root.get("trangThai"),
                            com.example.backend.shared.model.TrangThaiVanHanhEnum.fromValue(trangThai.trim())));
                } catch (IllegalArgumentException e) {
                    throw new NghiepVuException(e.getMessage(), 400);
                }
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
                Predicate serialLike = cb.like(cb.lower(root.get("soSerial")), keywordLower);
                Predicate cardLike = cb.like(cb.lower(root.get("maTheTaiSan")), keywordLower);
                predicates.add(cb.or(serialLike, cardLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<DanhSachThietBiPhanCung> pageResult = thietBiPhanCungRepository.findAll(spec, pageRequest);

        // GIẢI QUYẾT N+1: Gom toàn bộ ID Mẫu tài sản phần cứng có trong trang kết quả
        // hiện tại
        Set<Long> mauIds = pageResult.getContent().stream()
                .filter(t -> t.getTaiSanPhanCung() != null)
                .map(t -> t.getTaiSanPhanCung().getId())
                .collect(Collectors.toSet());

        Map<Long, TaiSanPhanCung> mauMap = new HashMap<>();
        if (!mauIds.isEmpty()) {
            mauMap = taiSanPhanCungRepository.findAllByIdInAndThoiGianXoaIsNull(mauIds).stream()
                    .collect(Collectors.toMap(TaiSanPhanCung::getId, java.util.function.Function.identity()));
        }

        final Map<Long, TaiSanPhanCung> finalMauMap = mauMap;

        // Map khớp nối trực tiếp trên RAM, bắn duy nhất 1 câu SQL gom cụm thay vì lặp
        // vòng SELECT
        List<DanhSachThietBiPhanCungResponse> content = pageResult.getContent().stream()
                .map(t -> {
                    TaiSanPhanCung mau = t.getTaiSanPhanCung() != null ? finalMauMap.get(t.getTaiSanPhanCung().getId())
                            : null;
                    return DanhSachThietBiPhanCungResponse.builder()
                            .id(t.getId())
                            .idTaiSanPhanCung(mau != null ? mau.getId() : null)
                            .tenTaiSanPhanCung(mau != null ? mau.getTenMau() : null)
                            .maMauTaiSanPhanCung(mau != null ? mau.getMaMau() : null)
                            .idNhaCungCap(t.getIdNhaCungCap())
                            .idDonVi(t.getIdDonVi())
                            .soSerial(t.getSoSerial())
                            .maTheTaiSan(t.getMaTheTaiSan())
                            .giaMua(t.getGiaMua())
                            .thoiGianMua(t.getThoiGianMua())
                            .hanBaoHanhThang(t.getHanBaoHanhThang())
                            .trangThaiKho(t.getTrangThaiKho())
                            .viTriKho(t.getViTriKho())
                            .trangThai(t.getTrangThai() != null ? t.getTrangThai().getValue() : null)
                            .thoiGianTao(t.getThoiGianTao())
                            .thoiGianCapNhat(t.getThoiGianCapNhat())
                            .build();
                })
                .collect(Collectors.toList());

        return PageResponse.from(
                new org.springframework.data.domain.PageImpl<>(content, pageRequest, pageResult.getTotalElements()));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "thiet_bi_phan_cung_cache", key = "{#id, T(com.example.backend.shared.tenant.DonViContextHolder).getTenantId()}")
    public DanhSachThietBiPhanCungResponse layTheoId(Long id) {
        Long idDonVi = getRequiredTenantId();
        DanhSachThietBiPhanCung thietBi;
        if (idDonVi == null) {
            thietBi = thietBiPhanCungRepository.findByIdAndThoiGianXoaIsNull(id)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thiết bị phần cứng với ID: " + id, 404));
        } else {
            thietBi = thietBiPhanCungRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                    .orElseThrow(() -> new NghiepVuException(
                            "Không tìm thấy thiết bị phần cứng thuộc đơn vị của bạn với ID: " + id, 404));
        }
        return mapToResponse(thietBi);
    }

    @Override
    @Transactional
    @CacheEvict(value = { "thiet_bi_phan_cung_cache", "thiet_bi_phan_cung_list_cache" }, allEntries = true)
    public DanhSachThietBiPhanCungResponse themMoi(DanhSachThietBiPhanCungRequest request) {
        Long idDonVi = getRequiredTenantId();

        if (thietBiPhanCungRepository.existsBySoSerialAndIdDonViAndThoiGianXoaIsNull(request.getSoSerial(), idDonVi)) {
            throw new NghiepVuException("Số Serial đã tồn tại trong đơn vị", 400);
        }

        DanhSachThietBiPhanCung thietBi = new DanhSachThietBiPhanCung();
        thietBi.setIdDonVi(idDonVi);
        capNhatThongTin(thietBi, request);
        thietBi.setTrangThai(com.example.backend.shared.model.TrangThaiVanHanhEnum.KHOA);
        thietBi.setMaTheTaiSan("TS-" + idDonVi + "-" + System.currentTimeMillis());
        thietBi = thietBiPhanCungRepository.save(thietBi);

        return mapToResponse(thietBi);
    }

    @Override
    @Transactional
    @CacheEvict(value = { "thiet_bi_phan_cung_cache", "thiet_bi_phan_cung_list_cache" }, allEntries = true)
    public DanhSachThietBiPhanCungResponse capNhat(Long id, DanhSachThietBiPhanCungRequest request) {
        Long idDonVi = getRequiredTenantId();
        DanhSachThietBiPhanCung thietBi = thietBiPhanCungRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy thiết bị phần cứng để cập nhật", 404));

        if (!thietBi.getSoSerial().equals(request.getSoSerial()) &&
                thietBiPhanCungRepository.existsBySoSerialAndIdDonViAndThoiGianXoaIsNull(request.getSoSerial(),
                        idDonVi)) {
            throw new NghiepVuException("Số Serial mới đã tồn tại trong đơn vị", 400);
        }

        capNhatThongTin(thietBi, request);
        thietBi = thietBiPhanCungRepository.save(thietBi);

        return mapToResponse(thietBi);
    }

    @Override
    @Transactional
    @CacheEvict(value = { "thiet_bi_phan_cung_cache", "thiet_bi_phan_cung_list_cache" }, allEntries = true)
    public void xoaMem(Long id) {
        Long idDonVi = getRequiredTenantId();
        DanhSachThietBiPhanCung thietBi = thietBiPhanCungRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy thiết bị phần cứng để xóa", 404));

        thietBi.setThoiGianXoa(LocalDateTime.now());
        thietBi.setLyDoXoa("Người dùng xóa");
        thietBiPhanCungRepository.save(thietBi);
    }

    @Override
    @Transactional
    @CacheEvict(value = { "thiet_bi_phan_cung_cache", "thiet_bi_phan_cung_list_cache" }, allEntries = true)
    public void capNhatTrangThai(Long id, TrangThaiRequest request) {
        Long idDonVi = getRequiredTenantId();
        DanhSachThietBiPhanCung thietBi = thietBiPhanCungRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy thiết bị phần cứng", 404));

        String status = request.getTrangThai();
        com.example.backend.shared.model.TrangThaiVanHanhEnum trangThaiEnum;
        try {
            trangThaiEnum = com.example.backend.shared.model.TrangThaiVanHanhEnum.fromValue(status);
        } catch (IllegalArgumentException e) {
            throw new NghiepVuException(e.getMessage(), 400);
        }

        thietBi.setTrangThai(trangThaiEnum);
        thietBiPhanCungRepository.save(thietBi);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SelectOption> laySelectOptions(Long idTaiSanPhanCung) {
        Long idDonVi = getRequiredTenantId();
        Specification<DanhSachThietBiPhanCung> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));
            if (idDonVi != null) {
                predicates.add(cb.equal(root.get("idDonVi"), idDonVi));
            }
            predicates.add(
                    cb.equal(root.get("trangThai"), com.example.backend.shared.model.TrangThaiVanHanhEnum.HOAT_DONG));
            if (idTaiSanPhanCung != null) {
                predicates.add(cb.equal(root.get("taiSanPhanCung").get("id"), idTaiSanPhanCung));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        return thietBiPhanCungRepository.findAll(spec).stream()
                .map(item -> SelectOption.builder()
                        .id(item.getId())
                        .ten(item.getMaTheTaiSan() + " - " + item.getTaiSanPhanCung().getTenMau() + " - "
                                + item.getSoSerial())
                        .build())
                .collect(Collectors.toList());
    }

    private void capNhatThongTin(DanhSachThietBiPhanCung thietBi, DanhSachThietBiPhanCungRequest request) {
        TaiSanPhanCung mau = taiSanPhanCungRepository.findByIdAndThoiGianXoaIsNull(request.getIdTaiSanPhanCung())
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy mẫu tài sản phần cứng tương ứng", 400));

        thietBi.setTaiSanPhanCung(mau);
        thietBi.setIdNhaCungCap(request.getIdNhaCungCap());
        thietBi.setSoSerial(request.getSoSerial().trim());
        thietBi.setGiaMua(request.getGiaMua());
        thietBi.setThoiGianMua(request.getThoiGianMua());
        thietBi.setHanBaoHanhThang(request.getHanBaoHanhThang());
        thietBi.setTrangThaiKho(request.getTrangThaiKho() != null ? request.getTrangThaiKho().trim() : null);
        thietBi.setViTriKho(request.getViTriKho() != null ? request.getViTriKho().trim() : null);
        String statusStr = request.getTrangThai() != null ? request.getTrangThai().trim() : null;
        if (statusStr != null) {
            try {
                thietBi.setTrangThai(com.example.backend.shared.model.TrangThaiVanHanhEnum.fromValue(statusStr));
            } catch (IllegalArgumentException e) {
                throw new NghiepVuException(e.getMessage(), 400);
            }
        } else if (thietBi.getTrangThai() == null) {
            thietBi.setTrangThai(com.example.backend.shared.model.TrangThaiVanHanhEnum.KHOA);
        }
    }

    private DanhSachThietBiPhanCungResponse mapToResponse(DanhSachThietBiPhanCung thietBi) {
        return DanhSachThietBiPhanCungResponse.builder()
                .id(thietBi.getId())
                .idTaiSanPhanCung(thietBi.getTaiSanPhanCung() != null ? thietBi.getTaiSanPhanCung().getId() : null)
                .tenTaiSanPhanCung(thietBi.getTaiSanPhanCung() != null ? thietBi.getTaiSanPhanCung().getTenMau() : null)
                .maMauTaiSanPhanCung(
                        thietBi.getTaiSanPhanCung() != null ? thietBi.getTaiSanPhanCung().getMaMau() : null)
                .idNhaCungCap(thietBi.getIdNhaCungCap())
                .idDonVi(thietBi.getIdDonVi())
                .soSerial(thietBi.getSoSerial())
                .maTheTaiSan(thietBi.getMaTheTaiSan())
                .giaMua(thietBi.getGiaMua())
                .thoiGianMua(thietBi.getThoiGianMua())
                .hanBaoHanhThang(thietBi.getHanBaoHanhThang())
                .trangThaiKho(thietBi.getTrangThaiKho())
                .viTriKho(thietBi.getViTriKho())
                .trangThai(thietBi.getTrangThai() != null ? thietBi.getTrangThai().getValue() : null)
                .thoiGianTao(thietBi.getThoiGianTao())
                .thoiGianCapNhat(thietBi.getThoiGianCapNhat())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Optional<com.example.backend.modules.asset.model.DanhSachThietBiPhanCung> layEntityTheoId(Long id) {
        return thietBiPhanCungRepository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = { "thiet_bi_phan_cung_cache", "thiet_bi_phan_cung_list_cache" }, allEntries = true)
    public void saveEntity(com.example.backend.modules.asset.model.DanhSachThietBiPhanCung entity) {
        thietBiPhanCungRepository.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<com.example.backend.modules.asset.model.DanhSachThietBiPhanCung> layTatCaActive() {
        return thietBiPhanCungRepository.findAll().stream()
                .filter(x -> x.getThoiGianXoa() == null)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<com.example.backend.modules.asset.model.DanhSachThietBiPhanCung> layTheoIds(java.util.Collection<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new ArrayList<>();
        }
        return thietBiPhanCungRepository.findAllByIdInAndThoiGianXoaIsNull(new java.util.HashSet<>(ids));
    }
}
