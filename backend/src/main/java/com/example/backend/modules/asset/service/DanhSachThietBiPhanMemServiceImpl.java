package com.example.backend.modules.asset.service;

import com.example.backend.modules.asset.dto.DanhSachThietBiPhanMemRequest;
import com.example.backend.modules.asset.dto.DanhSachThietBiPhanMemResponse;
import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.modules.asset.model.DanhSachThietBiPhanMem;
import com.example.backend.modules.asset.model.TaiSanPhanMem;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanMemRepository;
import com.example.backend.modules.asset.repository.TaiSanPhanMemRepository;
import com.example.backend.modules.asset.service.interfaces.DanhSachThietBiPhanMemService;
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
public class DanhSachThietBiPhanMemServiceImpl implements DanhSachThietBiPhanMemService {

    private final DanhSachThietBiPhanMemRepository thietBiPhanMemRepository;
    private final TaiSanPhanMemRepository taiSanPhanMemRepository;

    private Long getRequiredTenantId() {
        Long tenantId = DonViContextHolder.getTenantId();
        if (tenantId == null) {
            throw new NghiepVuException("Không tìm thấy thông tin đơn vị từ phiên làm việc", 403);
        }
        return tenantId;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "thiet_bi_phan_mem_list_cache", key = "{#keyword, #trangThai, #tuNgayMua, #denNgayMua, #tuNgayHetHan, #denNgayHetHan, #trangThaiKho, #page, #size, #sort, T(com.example.backend.shared.tenant.DonViContextHolder).getTenantId()}")
    public PageResponse<DanhSachThietBiPhanMemResponse> layDanhSach(
            String keyword,
            String trangThai,
            LocalDate tuNgayMua,
            LocalDate denNgayMua,
            LocalDate tuNgayHetHan,
            LocalDate denNgayHetHan,
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

        Specification<DanhSachThietBiPhanMem> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));
            predicates.add(cb.equal(root.get("idDonVi"), idDonVi));

            if (trangThai != null && !trangThai.trim().isEmpty()) {
                try {
                    predicates.add(cb.equal(root.get("trangThai"), com.example.backend.shared.model.TrangThaiVanHanhEnum.fromValue(trangThai.trim())));
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

            if (tuNgayHetHan != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("thoiGianHetHan"), tuNgayHetHan));
            }

            if (denNgayHetHan != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("thoiGianHetHan"), denNgayHetHan));
            }

            if (keyword != null && !keyword.trim().isEmpty()) {
                String keywordLower = "%" + keyword.trim().toLowerCase() + "%";
                Predicate keyLike = cb.like(cb.lower(root.get("keyBanQuyen")), keywordLower);
                Predicate docLike = cb.like(cb.lower(root.get("maChungTuMua")), keywordLower);
                predicates.add(cb.or(keyLike, docLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<DanhSachThietBiPhanMem> pageResult = thietBiPhanMemRepository.findAll(spec, pageRequest);
        
        // GIẢI QUYẾT N+1: Gom toàn bộ ID Mẫu tài sản phần mềm có trong trang kết quả hiện tại
        Set<Long> mauIds = pageResult.getContent().stream()
                .filter(t -> t.getTaiSanPhanMem() != null)
                .map(t -> t.getTaiSanPhanMem().getId())
                .collect(Collectors.toSet());

        Map<Long, TaiSanPhanMem> mauMap = new HashMap<>();
        if (!mauIds.isEmpty()) {
            mauMap = taiSanPhanMemRepository.findAllById(mauIds).stream()
                    .collect(Collectors.toMap(TaiSanPhanMem::getId, java.util.function.Function.identity()));
        }

        final Map<Long, TaiSanPhanMem> finalMauMap = mauMap;

        // Khớp nối trực tiếp trên RAM, loại bỏ Lazy Load getter lặp
        List<DanhSachThietBiPhanMemResponse> content = pageResult.getContent().stream()
                .map(t -> {
                    TaiSanPhanMem mau = t.getTaiSanPhanMem() != null ? finalMauMap.get(t.getTaiSanPhanMem().getId()) : null;
                    return DanhSachThietBiPhanMemResponse.builder()
                            .id(t.getId())
                            .idTaiSanPhanMem(mau != null ? mau.getId() : null)
                            .tenTaiSanPhanMem(mau != null ? mau.getTenMau() : null)
                            .maMauTaiSanPhanMem(mau != null ? mau.getMaMau() : null)
                            .idNhaCungCap(t.getIdNhaCungCap())
                            .idDonVi(t.getIdDonVi())
                            .keyBanQuyen(t.getKeyBanQuyen())
                            .maChungTuMua(t.getMaChungTuMua())
                            .tongSoGhe(t.getTongSoGhe())
                            .giaMua(t.getGiaMua())
                            .thoiGianMua(t.getThoiGianMua())
                            .thoiGianHetHan(t.getThoiGianHetHan())
                            .trangThaiKho(t.getTrangThaiKho())
                            .trangThai(t.getTrangThai() != null ? t.getTrangThai().getValue() : null)
                            .thoiGianTao(t.getThoiGianTao())
                            .thoiGianCapNhat(t.getThoiGianCapNhat())
                            .build();
                })
                .collect(Collectors.toList());

        return PageResponse.from(new org.springframework.data.domain.PageImpl<>(content, pageRequest, pageResult.getTotalElements()));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "thiet_bi_phan_mem_cache", key = "{#id, T(com.example.backend.shared.tenant.DonViContextHolder).getTenantId()}")
    public DanhSachThietBiPhanMemResponse layTheoId(Long id) {
        Long idDonVi = getRequiredTenantId();
        DanhSachThietBiPhanMem thietBi = thietBiPhanMemRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy key bản quyền thuộc đơn vị của bạn với ID: " + id, 404));
        if (thietBi.getTrangThai() != com.example.backend.shared.model.TrangThaiVanHanhEnum.HOAT_DONG) {
            throw new NghiepVuException("Key bản quyền hiện đang bị khóa hoặc ngừng hoạt động", 400);
        }
        return mapToResponse(thietBi);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"thiet_bi_phan_mem_cache", "thiet_bi_phan_mem_list_cache"}, allEntries = true)
    public DanhSachThietBiPhanMemResponse themMoi(DanhSachThietBiPhanMemRequest request) {
        Long idDonVi = getRequiredTenantId();

        if (thietBiPhanMemRepository.existsByKeyBanQuyenAndIdDonViAndThoiGianXoaIsNull(request.getKeyBanQuyen(), idDonVi)) {
            throw new NghiepVuException("Key bản quyền đã tồn tại trong đơn vị", 400);
        }

        DanhSachThietBiPhanMem thietBi = new DanhSachThietBiPhanMem();
        thietBi.setIdDonVi(idDonVi);
        capNhatThongTin(thietBi, request);
        thietBi = thietBiPhanMemRepository.save(thietBi);

        return mapToResponse(thietBi);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"thiet_bi_phan_mem_cache", "thiet_bi_phan_mem_list_cache"}, allEntries = true)
    public DanhSachThietBiPhanMemResponse capNhat(Long id, DanhSachThietBiPhanMemRequest request) {
        Long idDonVi = getRequiredTenantId();
        DanhSachThietBiPhanMem thietBi = thietBiPhanMemRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy key bản quyền để cập nhật", 404));

        if (!thietBi.getKeyBanQuyen().equals(request.getKeyBanQuyen()) &&
                thietBiPhanMemRepository.existsByKeyBanQuyenAndIdDonViAndThoiGianXoaIsNull(request.getKeyBanQuyen(), idDonVi)) {
            throw new NghiepVuException("Key bản quyền mới đã tồn tại trong đơn vị", 400);
        }

        capNhatThongTin(thietBi, request);
        thietBi = thietBiPhanMemRepository.save(thietBi);

        return mapToResponse(thietBi);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"thiet_bi_phan_mem_cache", "thiet_bi_phan_mem_list_cache"}, allEntries = true)
    public void xoaMem(Long id) {
        Long idDonVi = getRequiredTenantId();
        DanhSachThietBiPhanMem thietBi = thietBiPhanMemRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy key bản quyền để xóa", 404));

        thietBi.setThoiGianXoa(LocalDateTime.now());
        thietBi.setLyDoXoa("Người dùng xóa");
        thietBiPhanMemRepository.save(thietBi);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"thiet_bi_phan_mem_cache", "thiet_bi_phan_mem_list_cache"}, allEntries = true)
    public void capNhatTrangThai(Long id, TrangThaiRequest request) {
        Long idDonVi = getRequiredTenantId();
        DanhSachThietBiPhanMem thietBi = thietBiPhanMemRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy key bản quyền", 404));

        String status = request.getTrangThai();
        com.example.backend.shared.model.TrangThaiVanHanhEnum trangThaiEnum;
        try {
            trangThaiEnum = com.example.backend.shared.model.TrangThaiVanHanhEnum.fromValue(status);
        } catch (IllegalArgumentException e) {
            throw new NghiepVuException(e.getMessage(), 400);
        }

        thietBi.setTrangThai(trangThaiEnum);
        thietBiPhanMemRepository.save(thietBi);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SelectOption> laySelectOptions() {
        Long idDonVi = getRequiredTenantId();
        Specification<DanhSachThietBiPhanMem> spec = (root, query, cb) -> cb.and(
                cb.isNull(root.get("thoiGianXoa")),
                cb.equal(root.get("idDonVi"), idDonVi),
                cb.equal(root.get("trangThai"), com.example.backend.shared.model.TrangThaiVanHanhEnum.HOAT_DONG)
        );
        return thietBiPhanMemRepository.findAll(spec).stream()
                .map(item -> SelectOption.builder()
                        .id(item.getId())
                        .ten(item.getKeyBanQuyen())
                        .build())
                .collect(Collectors.toList());
    }

    private void capNhatThongTin(DanhSachThietBiPhanMem thietBi, DanhSachThietBiPhanMemRequest request) {
        TaiSanPhanMem mau = taiSanPhanMemRepository.findByIdAndThoiGianXoaIsNull(request.getIdTaiSanPhanMem())
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy mẫu tài sản phần mềm tương ứng", 400));

        thietBi.setTaiSanPhanMem(mau);
        thietBi.setIdNhaCungCap(request.getIdNhaCungCap());
        thietBi.setKeyBanQuyen(request.getKeyBanQuyen().trim());
        thietBi.setMaChungTuMua(request.getMaChungTuMua() != null ? request.getMaChungTuMua().trim() : null);
        thietBi.setTongSoGhe(request.getTongSoGhe());
        thietBi.setGiaMua(request.getGiaMua());
        thietBi.setThoiGianMua(request.getThoiGianMua());
        thietBi.setThoiGianHetHan(request.getThoiGianHetHan());
        thietBi.setTrangThaiKho(request.getTrangThaiKho() != null ? request.getTrangThaiKho().trim() : null);
        String statusStr = request.getTrangThai() != null ? request.getTrangThai().trim() : "HOAT_DONG";
        try {
            thietBi.setTrangThai(com.example.backend.shared.model.TrangThaiVanHanhEnum.fromValue(statusStr));
        } catch (IllegalArgumentException e) {
            throw new NghiepVuException(e.getMessage(), 400);
        }
    }

    private DanhSachThietBiPhanMemResponse mapToResponse(DanhSachThietBiPhanMem thietBi) {
        return DanhSachThietBiPhanMemResponse.builder()
                .id(thietBi.getId())
                .idTaiSanPhanMem(thietBi.getTaiSanPhanMem() != null ? thietBi.getTaiSanPhanMem().getId() : null)
                .tenTaiSanPhanMem(thietBi.getTaiSanPhanMem() != null ? thietBi.getTaiSanPhanMem().getTenMau() : null)
                .maMauTaiSanPhanMem(thietBi.getTaiSanPhanMem() != null ? thietBi.getTaiSanPhanMem().getMaMau() : null)
                .idNhaCungCap(thietBi.getIdNhaCungCap())
                .idDonVi(thietBi.getIdDonVi())
                .keyBanQuyen(thietBi.getKeyBanQuyen())
                .maChungTuMua(thietBi.getMaChungTuMua())
                .tongSoGhe(thietBi.getTongSoGhe())
                .giaMua(thietBi.getGiaMua())
                .thoiGianMua(thietBi.getThoiGianMua())
                .thoiGianHetHan(thietBi.getThoiGianHetHan())
                .trangThaiKho(thietBi.getTrangThaiKho())
                .trangThai(thietBi.getTrangThai() != null ? thietBi.getTrangThai().getValue() : null)
                .thoiGianTao(thietBi.getThoiGianTao())
                .thoiGianCapNhat(thietBi.getThoiGianCapNhat())
                .build();
    }
}
