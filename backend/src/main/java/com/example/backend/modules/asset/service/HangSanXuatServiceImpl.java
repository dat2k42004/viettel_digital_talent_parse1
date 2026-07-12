package com.example.backend.modules.asset.service;

import com.example.backend.modules.asset.dto.HangSanXuatRequest;
import com.example.backend.modules.asset.dto.HangSanXuatResponse;
import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.modules.asset.model.HangSanXuat;
import com.example.backend.modules.asset.repository.HangSanXuatRepository;
import com.example.backend.modules.asset.service.interfaces.HangSanXuatService;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.response.PageResponse;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HangSanXuatServiceImpl implements HangSanXuatService {

    private final HangSanXuatRepository hangSanXuatRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "hang_san_xuat_list_cache", key = "{#keyword, #trangThai, #page, #size, #sort}")
    public PageResponse<HangSanXuatResponse> layDanhSach(String keyword, String trangThai, int page, int size, String sort) {
        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortBy = sortParts[0];
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<HangSanXuat> spec = (root, query, cb) -> {
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

            // Tìm kiếm keyword theo maHang hoặc tenHang (LIKE %keyword%)
            if (keyword != null && !keyword.trim().isEmpty()) {
                String keywordLower = "%" + keyword.trim().toLowerCase() + "%";
                Predicate maHangLike = cb.like(cb.lower(root.get("maHang")), keywordLower);
                Predicate tenHangLike = cb.like(cb.lower(root.get("tenHang")), keywordLower);
                predicates.add(cb.or(maHangLike, tenHangLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<HangSanXuat> pageResult = hangSanXuatRepository.findAll(spec, pageRequest);
        Page<HangSanXuatResponse> responsePage = pageResult.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "hang_san_xuat_cache", key = "#id")
    public HangSanXuatResponse layTheoId(Long id) {
        HangSanXuat hangSanXuat = hangSanXuatRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy hãng sản xuất với ID: " + id, 404));
        if (hangSanXuat.getTrangThai() != com.example.backend.shared.model.TrangThaiCoBanEnum.HOAT_DONG) {
            throw new NghiepVuException("Hãng sản xuất hiện đang bị khóa hoặc ngừng hoạt động", 400);
        }
        return mapToResponse(hangSanXuat);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"hang_san_xuat_cache", "hang_san_xuat_list_cache"}, allEntries = true)
    public HangSanXuatResponse themMoi(HangSanXuatRequest request) {
        HangSanXuat hangSanXuat = new HangSanXuat();
        capNhatThongTin(hangSanXuat, request);
        hangSanXuat.setMaHang("HSX-0-" + System.currentTimeMillis());
        hangSanXuat = hangSanXuatRepository.save(hangSanXuat);

        return mapToResponse(hangSanXuat);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"hang_san_xuat_cache", "hang_san_xuat_list_cache"}, allEntries = true)
    public HangSanXuatResponse capNhat(Long id, HangSanXuatRequest request) {
        HangSanXuat hangSanXuat = hangSanXuatRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy hãng sản xuất để cập nhật", 404));

        capNhatThongTin(hangSanXuat, request);
        hangSanXuat = hangSanXuatRepository.save(hangSanXuat);

        return mapToResponse(hangSanXuat);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"hang_san_xuat_cache", "hang_san_xuat_list_cache"}, allEntries = true)
    public void xoaMem(Long id) {
        HangSanXuat hangSanXuat = hangSanXuatRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy hãng sản xuất để xóa", 404));

        hangSanXuat.setThoiGianXoa(LocalDateTime.now());
        hangSanXuat.setLyDoXoa("Người dùng xóa");
        hangSanXuatRepository.save(hangSanXuat);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"hang_san_xuat_cache", "hang_san_xuat_list_cache"}, allEntries = true)
    public void capNhatTrangThai(Long id, TrangThaiRequest request) {
        HangSanXuat hangSanXuat = hangSanXuatRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy hãng sản xuất", 404));

        String status = request.getTrangThai();
        com.example.backend.shared.model.TrangThaiCoBanEnum trangThaiEnum;
        try {
            trangThaiEnum = com.example.backend.shared.model.TrangThaiCoBanEnum.fromValue(status);
        } catch (IllegalArgumentException e) {
            throw new NghiepVuException(e.getMessage(), 400);
        }

        hangSanXuat.setTrangThai(trangThaiEnum);
        hangSanXuatRepository.save(hangSanXuat);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SelectOption> laySelectOptions(String keyword) {
        Specification<HangSanXuat> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));
            predicates.add(cb.equal(root.get("trangThai"), com.example.backend.shared.model.TrangThaiCoBanEnum.HOAT_DONG));
            if (org.springframework.util.StringUtils.hasText(keyword)) {
                predicates.add(cb.like(cb.lower(root.get("tenHang")), "%" + keyword.trim().toLowerCase() + "%"));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return hangSanXuatRepository.findAll(spec).stream()
                .limit(50)
                .map(item -> SelectOption.builder()
                        .id(item.getId())
                        .ten(item.getTenHang())
                        .build())
                .collect(Collectors.toList());
    }

    private void capNhatThongTin(HangSanXuat hangSanXuat, HangSanXuatRequest request) {
        hangSanXuat.setTenHang(request.getTenHang().trim());
        hangSanXuat.setWebsiteHoTro(request.getWebsiteHoTro() != null ? request.getWebsiteHoTro().trim() : null);
        hangSanXuat.setHotlineHoTro(request.getHotlineHoTro() != null ? request.getHotlineHoTro().trim() : null);
        hangSanXuat.setEmailHoTro(request.getEmailHoTro() != null ? request.getEmailHoTro().trim() : null);
        hangSanXuat.setGhiChu(request.getGhiChu());
        String statusStr = request.getTrangThai() != null ? request.getTrangThai().trim() : "HOAT_DONG";
        try {
            hangSanXuat.setTrangThai(com.example.backend.shared.model.TrangThaiCoBanEnum.fromValue(statusStr));
        } catch (IllegalArgumentException e) {
            throw new NghiepVuException(e.getMessage(), 400);
        }
    }

    private HangSanXuatResponse mapToResponse(HangSanXuat hangSanXuat) {
        return HangSanXuatResponse.builder()
                .id(hangSanXuat.getId())
                .maHang(hangSanXuat.getMaHang())
                .tenHang(hangSanXuat.getTenHang())
                .websiteHoTro(hangSanXuat.getWebsiteHoTro())
                .hotlineHoTro(hangSanXuat.getHotlineHoTro())
                .emailHoTro(hangSanXuat.getEmailHoTro())
                .ghiChu(hangSanXuat.getGhiChu())
                .trangThai(hangSanXuat.getTrangThai() != null ? hangSanXuat.getTrangThai().getValue() : null)
                .thoiGianTao(hangSanXuat.getThoiGianTao())
                .thoiGianCapNhat(hangSanXuat.getThoiGianCapNhat())
                .build();
    }
}
