package com.example.backend.modules.tenant.service;

import com.example.backend.modules.tenant.service.interfaces.DanhMucCauHinhService;

import com.example.backend.modules.tenant.dto.DanhMucCauHinhRequest;
import com.example.backend.modules.tenant.dto.DanhMucCauHinhResponse;
import com.example.backend.modules.tenant.model.DanhMucCauHinh;
import com.example.backend.modules.tenant.repository.DanhMucCauHinhRepository;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.tenant.DonViContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DanhMucCauHinhServiceImpl implements DanhMucCauHinhService {

    private final DanhMucCauHinhRepository danhMucCauHinhRepository;

    @Override
    public PageResponse<DanhMucCauHinhResponse> layDanhSach(String tenCauHinh, String maCauHinh, int page, int size) {
        KiemTraQuyenHeThong();

        Specification<DanhMucCauHinh> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));
            predicates.add(cb.equal(root.get("trangThai"), "HOAT_DONG"));

            if (tenCauHinh != null && !tenCauHinh.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("tenCauHinh")), "%" + tenCauHinh.trim().toLowerCase() + "%"));
            }

            if (maCauHinh != null && !maCauHinh.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("maCauHinh")), "%" + maCauHinh.trim().toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<DanhMucCauHinh> pageResult = danhMucCauHinhRepository.findAll(spec, PageRequest.of(page, size, Sort.by("id").descending()));
        Page<DanhMucCauHinhResponse> responsePage = pageResult.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional
    public DanhMucCauHinhResponse themMoi(DanhMucCauHinhRequest request) {
        KiemTraQuyenHeThong();

        if (danhMucCauHinhRepository.existsByMaCauHinhAndThoiGianXoaIsNull(request.getMaCauHinh())) {
            throw new NghiepVuException("Mã cấu hình đã tồn tại", 400);
        }

        DanhMucCauHinh entity = new DanhMucCauHinh();
        capNhatThongTin(entity, request);
        entity = danhMucCauHinhRepository.save(entity);

        return mapToResponse(entity);
    }

    @Override
    @Transactional
    public DanhMucCauHinhResponse capNhat(Long id, DanhMucCauHinhRequest request) {
        KiemTraQuyenHeThong();

        DanhMucCauHinh entity = danhMucCauHinhRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy danh mục cấu hình", 404));

        if (!entity.getMaCauHinh().equals(request.getMaCauHinh()) && 
            danhMucCauHinhRepository.existsByMaCauHinhAndThoiGianXoaIsNull(request.getMaCauHinh())) {
            throw new NghiepVuException("Mã cấu hình đã tồn tại", 400);
        }

        capNhatThongTin(entity, request);
        entity = danhMucCauHinhRepository.save(entity);

        return mapToResponse(entity);
    }

    @Override
    @Transactional
    public void xoaMem(Long id) {
        KiemTraQuyenHeThong();

        DanhMucCauHinh entity = danhMucCauHinhRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy danh mục cấu hình", 404));
        
        entity.setThoiGianXoa(LocalDateTime.now());
        entity.setLyDoXoa("Người dùng xóa");
        danhMucCauHinhRepository.save(entity);
    }

    private void KiemTraQuyenHeThong() {
        if (DonViContextHolder.getTenantId() != null) {
            throw new NghiepVuException("Chỉ quản trị viên hệ thống mới được quản lý danh mục cấu hình", 403);
        }
    }

    private void capNhatThongTin(DanhMucCauHinh entity, DanhMucCauHinhRequest request) {
        entity.setMaCauHinh(request.getMaCauHinh());
        entity.setTenCauHinh(request.getTenCauHinh());
        entity.setMoTaCauHinh(request.getMoTaCauHinh());
        entity.setNhomCauHinh(request.getNhomCauHinh());
        entity.setLoaiDuLieu(request.getLoaiDuLieu());
        entity.setGiaTriMacDinh(request.getGiaTriMacDinh());
        entity.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : "HOAT_DONG");
    }

    private DanhMucCauHinhResponse mapToResponse(DanhMucCauHinh entity) {
        return DanhMucCauHinhResponse.builder()
                .id(entity.getId())
                .maCauHinh(entity.getMaCauHinh())
                .tenCauHinh(entity.getTenCauHinh())
                .moTaCauHinh(entity.getMoTaCauHinh())
                .nhomCauHinh(entity.getNhomCauHinh())
                .loaiDuLieu(entity.getLoaiDuLieu())
                .giaTriMacDinh(entity.getGiaTriMacDinh())
                .trangThai(entity.getTrangThai())
                .build();
    }

    @Override
    public DanhMucCauHinhResponse layTheoId(Long id) {
        DanhMucCauHinh entity = danhMucCauHinhRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy danh mục cấu hình hoặc danh mục đã bị xóa", 404));

        if (!"HOAT_DONG".equals(entity.getTrangThai())) {
            throw new NghiepVuException("Danh mục cấu hình hiện đang bị khóa hoặc ngừng hoạt động", 400);
        }

        return mapToResponse(entity);
    }
}

