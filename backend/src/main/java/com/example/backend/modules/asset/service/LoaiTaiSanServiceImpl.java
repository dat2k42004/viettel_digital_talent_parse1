package com.example.backend.modules.asset.service;

import com.example.backend.modules.asset.dto.LoaiTaiSanRequest;
import com.example.backend.modules.asset.dto.LoaiTaiSanResponse;
import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.modules.asset.model.LoaiTaiSan;
import com.example.backend.modules.asset.repository.LoaiTaiSanRepository;
import com.example.backend.modules.asset.service.interfaces.LoaiTaiSanService;
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
public class LoaiTaiSanServiceImpl implements LoaiTaiSanService {

    private final LoaiTaiSanRepository loaiTaiSanRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "loai_tai_san_list_cache", key = "{#keyword, #trangThai, #page, #size, #sort}")
    public PageResponse<LoaiTaiSanResponse> layDanhSach(String keyword, String trangThai, int page, int size, String sort) {
        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortBy = sortParts[0];
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<LoaiTaiSan> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Xóa mềm: thoiGianXoa IS NULL
            predicates.add(cb.isNull(root.get("thoiGianXoa")));

            // Lọc theo trạng thái
            if (trangThai != null && !trangThai.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("trangThai"), trangThai.trim()));
            }

            // Tìm kiếm keyword theo maLoai hoặc tenLoai (LIKE %keyword%)
            if (keyword != null && !keyword.trim().isEmpty()) {
                String keywordLower = "%" + keyword.trim().toLowerCase() + "%";
                Predicate maLoaiLike = cb.like(cb.lower(root.get("maLoai")), keywordLower);
                Predicate tenLoaiLike = cb.like(cb.lower(root.get("tenLoai")), keywordLower);
                predicates.add(cb.or(maLoaiLike, tenLoaiLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<LoaiTaiSan> pageResult = loaiTaiSanRepository.findAll(spec, pageRequest);
        Page<LoaiTaiSanResponse> responsePage = pageResult.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "loai_tai_san_cache", key = "#id")
    public LoaiTaiSanResponse layTheoId(Long id) {
        LoaiTaiSan loaiTaiSan = loaiTaiSanRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy loại tài sản với ID: " + id, 404));
        if (!"HOAT_DONG".equals(loaiTaiSan.getTrangThai())) {
            throw new NghiepVuException("Loại tài sản hiện đang bị khóa hoặc ngừng hoạt động", 400);
        }
        return mapToResponse(loaiTaiSan);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"loai_tai_san_cache", "loai_tai_san_list_cache"}, allEntries = true)
    public LoaiTaiSanResponse themMoi(LoaiTaiSanRequest request) {
        if (loaiTaiSanRepository.existsByMaLoaiAndThoiGianXoaIsNull(request.getMaLoai())) {
            throw new NghiepVuException("Mã loại tài sản đã tồn tại trong hệ thống", 400);
        }

        LoaiTaiSan loaiTaiSan = new LoaiTaiSan();
        capNhatThongTin(loaiTaiSan, request);
        loaiTaiSan = loaiTaiSanRepository.save(loaiTaiSan);

        return mapToResponse(loaiTaiSan);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"loai_tai_san_cache", "loai_tai_san_list_cache"}, allEntries = true)
    public LoaiTaiSanResponse capNhat(Long id, LoaiTaiSanRequest request) {
        LoaiTaiSan loaiTaiSan = loaiTaiSanRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy loại tài sản để cập nhật", 404));

        if (!loaiTaiSan.getMaLoai().equals(request.getMaLoai()) && 
            loaiTaiSanRepository.existsByMaLoaiAndThoiGianXoaIsNull(request.getMaLoai())) {
            throw new NghiepVuException("Mã loại tài sản mới đã tồn tại trong hệ thống", 400);
        }

        capNhatThongTin(loaiTaiSan, request);
        loaiTaiSan = loaiTaiSanRepository.save(loaiTaiSan);

        return mapToResponse(loaiTaiSan);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"loai_tai_san_cache", "loai_tai_san_list_cache"}, allEntries = true)
    public void xoaMem(Long id) {
        LoaiTaiSan loaiTaiSan = loaiTaiSanRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy loại tài sản để xóa", 404));

        loaiTaiSan.setThoiGianXoa(LocalDateTime.now());
        loaiTaiSan.setLyDoXoa("Người dùng xóa");
        loaiTaiSanRepository.save(loaiTaiSan);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"loai_tai_san_cache", "loai_tai_san_list_cache"}, allEntries = true)
    public void capNhatTrangThai(Long id, TrangThaiRequest request) {
        LoaiTaiSan loaiTaiSan = loaiTaiSanRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy loại tài sản", 404));

        String status = request.getTrangThai();
        if (!"HOAT_DONG".equals(status) && !"KHOA".equals(status)) {
            throw new NghiepVuException("Trạng thái không hợp lệ. Chỉ chấp nhận HOAT_DONG hoặc KHOA", 400);
        }

        loaiTaiSan.setTrangThai(status);
        loaiTaiSanRepository.save(loaiTaiSan);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SelectOption> laySelectOptions() {
        Specification<LoaiTaiSan> spec = (root, query, cb) -> cb.and(
                cb.isNull(root.get("thoiGianXoa")),
                cb.equal(root.get("trangThai"), "HOAT_DONG")
        );
        return loaiTaiSanRepository.findAll(spec).stream()
                .map(item -> SelectOption.builder()
                        .id(item.getId())
                        .ten(item.getTenLoai())
                        .build())
                .collect(Collectors.toList());
    }

    private void capNhatThongTin(LoaiTaiSan loaiTaiSan, LoaiTaiSanRequest request) {
        loaiTaiSan.setMaLoai(request.getMaLoai().trim());
        loaiTaiSan.setTenLoai(request.getTenLoai().trim());
        loaiTaiSan.setTienToMaThe(request.getTienToMaThe() != null ? request.getTienToMaThe().trim() : null);
        loaiTaiSan.setThoiGianKhauHao(request.getThoiGianKhauHao());
        loaiTaiSan.setGhiChu(request.getGhiChu());
        loaiTaiSan.setTrangThai(request.getTrangThai() != null ? request.getTrangThai().trim() : "HOAT_DONG");
    }

    private LoaiTaiSanResponse mapToResponse(LoaiTaiSan loaiTaiSan) {
        return LoaiTaiSanResponse.builder()
                .id(loaiTaiSan.getId())
                .maLoai(loaiTaiSan.getMaLoai())
                .tenLoai(loaiTaiSan.getTenLoai())
                .tienToMaThe(loaiTaiSan.getTienToMaThe())
                .thoiGianKhauHao(loaiTaiSan.getThoiGianKhauHao())
                .ghiChu(loaiTaiSan.getGhiChu())
                .trangThai(loaiTaiSan.getTrangThai())
                .thoiGianTao(loaiTaiSan.getThoiGianTao())
                .thoiGianCapNhat(loaiTaiSan.getThoiGianCapNhat())
                .build();
    }
}
