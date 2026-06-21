package com.example.backend.modules.asset.service;

import com.example.backend.modules.asset.dto.DanhMucTaiSanRequest;
import com.example.backend.modules.asset.dto.DanhMucTaiSanResponse;
import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.modules.asset.model.DanhMucTaiSan;
import com.example.backend.modules.asset.repository.DanhMucTaiSanRepository;
import com.example.backend.modules.asset.service.interfaces.DanhMucTaiSanService;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.response.PageResponse;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DanhMucTaiSanServiceImpl implements DanhMucTaiSanService {

    private final DanhMucTaiSanRepository danhMucTaiSanRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "danh_muc_tai_san_list_cache", key = "{#keyword, #trangThai, #page, #size, #sort}")
    public PageResponse<DanhMucTaiSanResponse> layDanhSach(String keyword, String trangThai, int page, int size, String sort) {
        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortBy = sortParts[0];
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<DanhMucTaiSan> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Lọc các bản ghi chưa bị xóa mềm
            predicates.add(cb.isNull(root.get("thoiGianXoa")));

            // Lọc theo trạng thái
            if (trangThai != null && !trangThai.trim().isEmpty()) {
                try {
                    predicates.add(cb.equal(root.get("trangThai"), com.example.backend.shared.model.TrangThaiCoBanEnum.fromValue(trangThai.trim())));
                } catch (IllegalArgumentException e) {
                    throw new NghiepVuException(e.getMessage(), 400);
                }
            }

            // Tìm kiếm keyword theo maDanhMuc hoặc tenDanhMuc (LIKE %keyword%)
            if (keyword != null && !keyword.trim().isEmpty()) {
                String keywordLower = "%" + keyword.trim().toLowerCase() + "%";
                Predicate maDanhMucLike = cb.like(cb.lower(root.get("maDanhMuc")), keywordLower);
                Predicate tenDanhMucLike = cb.like(cb.lower(root.get("tenDanhMuc")), keywordLower);
                predicates.add(cb.or(maDanhMucLike, tenDanhMucLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<DanhMucTaiSan> pageResult = danhMucTaiSanRepository.findAll(spec, pageRequest);
        Page<DanhMucTaiSanResponse> responsePage = pageResult.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "danh_muc_tai_san_cache", key = "#id")
    public DanhMucTaiSanResponse layTheoId(Long id) {
        DanhMucTaiSan danhMucTaiSan = danhMucTaiSanRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy danh mục tài sản với ID: " + id, 404));
        if (danhMucTaiSan.getTrangThai() != com.example.backend.shared.model.TrangThaiCoBanEnum.HOAT_DONG) {
            throw new NghiepVuException("Danh mục tài sản hiện đang bị khóa hoặc ngừng hoạt động", 400);
        }
        return mapToResponse(danhMucTaiSan);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"danh_muc_tai_san_cache", "danh_muc_tai_san_list_cache"}, allEntries = true)
    public DanhMucTaiSanResponse themMoi(DanhMucTaiSanRequest request) {
        DanhMucTaiSan danhMucTaiSan = new DanhMucTaiSan();
        capNhatThongTin(danhMucTaiSan, request);
        danhMucTaiSan.setMaDanhMuc("DMTS-0-" + System.currentTimeMillis());
        danhMucTaiSan = danhMucTaiSanRepository.save(danhMucTaiSan);

        return mapToResponse(danhMucTaiSan);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"danh_muc_tai_san_cache", "danh_muc_tai_san_list_cache"}, allEntries = true)
    public DanhMucTaiSanResponse capNhat(Long id, DanhMucTaiSanRequest request) {
        DanhMucTaiSan danhMucTaiSan = danhMucTaiSanRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy danh mục tài sản để cập nhật", 404));

        capNhatThongTin(danhMucTaiSan, request);
        danhMucTaiSan = danhMucTaiSanRepository.save(danhMucTaiSan);

        return mapToResponse(danhMucTaiSan);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"danh_muc_tai_san_cache", "danh_muc_tai_san_list_cache"}, allEntries = true)
    public void xoaMem(Long id) {
        DanhMucTaiSan danhMucTaiSan = danhMucTaiSanRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy danh mục tài sản để xóa", 404));

        danhMucTaiSan.setThoiGianXoa(LocalDateTime.now());
        danhMucTaiSan.setLyDoXoa("Người dùng xóa");
        danhMucTaiSanRepository.save(danhMucTaiSan);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"danh_muc_tai_san_cache", "danh_muc_tai_san_list_cache"}, allEntries = true)
    public void capNhatTrangThai(Long id, TrangThaiRequest request) {
        DanhMucTaiSan danhMucTaiSan = danhMucTaiSanRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy danh mục tài sản", 404));

        String status = request.getTrangThai();
        com.example.backend.shared.model.TrangThaiCoBanEnum trangThaiEnum;
        try {
            trangThaiEnum = com.example.backend.shared.model.TrangThaiCoBanEnum.fromValue(status);
        } catch (IllegalArgumentException e) {
            throw new NghiepVuException(e.getMessage(), 400);
        }

        danhMucTaiSan.setTrangThai(trangThaiEnum);
        danhMucTaiSanRepository.save(danhMucTaiSan);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SelectOption> laySelectOptions() {
        Specification<DanhMucTaiSan> spec = (root, query, cb) -> cb.and(
                cb.isNull(root.get("thoiGianXoa")),
                cb.equal(root.get("trangThai"), com.example.backend.shared.model.TrangThaiCoBanEnum.HOAT_DONG)
        );
        return danhMucTaiSanRepository.findAll(spec).stream()
                .map(item -> SelectOption.builder()
                        .id(item.getId())
                        .ten(item.getTenDanhMuc())
                        .build())
                .collect(Collectors.toList());
    }

    private void capNhatThongTin(DanhMucTaiSan danhMucTaiSan, DanhMucTaiSanRequest request) {
        danhMucTaiSan.setTenDanhMuc(request.getTenDanhMuc().trim());
        danhMucTaiSan.setMoTa(request.getMoTa());
        String statusStr = request.getTrangThai() != null ? request.getTrangThai().trim() : "HOAT_DONG";
        try {
            danhMucTaiSan.setTrangThai(com.example.backend.shared.model.TrangThaiCoBanEnum.fromValue(statusStr));
        } catch (IllegalArgumentException e) {
            throw new NghiepVuException(e.getMessage(), 400);
        }
    }

    private DanhMucTaiSanResponse mapToResponse(DanhMucTaiSan danhMucTaiSan) {
        return DanhMucTaiSanResponse.builder()
                .id(danhMucTaiSan.getId())
                .maDanhMuc(danhMucTaiSan.getMaDanhMuc())
                .tenDanhMuc(danhMucTaiSan.getTenDanhMuc())
                .moTa(danhMucTaiSan.getMoTa())
                .trangThai(danhMucTaiSan.getTrangThai() != null ? danhMucTaiSan.getTrangThai().getValue() : null)
                .thoiGianTao(danhMucTaiSan.getThoiGianTao())
                .thoiGianCapNhat(danhMucTaiSan.getThoiGianCapNhat())
                .build();
    }
}
