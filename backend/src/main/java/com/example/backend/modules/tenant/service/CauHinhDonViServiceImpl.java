package com.example.backend.modules.tenant.service;

import com.example.backend.modules.tenant.service.interfaces.CauHinhDonViService;

import com.example.backend.modules.tenant.dto.CauHinhDonViRequest;
import com.example.backend.modules.tenant.dto.CauHinhDonViResponse;
import com.example.backend.modules.tenant.model.CauHinhDonVi;
import com.example.backend.modules.tenant.model.DanhMucCauHinh;
import com.example.backend.modules.tenant.model.DonVi;
import com.example.backend.modules.tenant.repository.CauHinhDonViRepository;
import com.example.backend.modules.tenant.repository.DanhMucCauHinhRepository;
import com.example.backend.modules.tenant.repository.DonViRepository;
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
public class CauHinhDonViServiceImpl implements CauHinhDonViService {

    private final CauHinhDonViRepository cauHinhDonViRepository;
    private final DanhMucCauHinhRepository danhMucCauHinhRepository;
    private final DonViRepository donViRepository;

    @Override
    public PageResponse<CauHinhDonViResponse> layDanhSach(String tenCauHinh, int page, int size) {
        Long idDonVi = DonViContextHolder.getTenantId();
        if (idDonVi == null) {
            throw new NghiepVuException("Chỉ admin đơn vị mới được xem cấu hình đơn vị", 403);
        }

        Specification<CauHinhDonVi> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));
            predicates.add(cb.equal(root.get("donVi").get("id"), idDonVi));
            predicates.add(cb.isNull(root.get("danhMucCauHinh").get("thoiGianXoa")));
            predicates.add(cb.equal(root.get("danhMucCauHinh").get("trangThai"), "HOAT_DONG"));

            if (tenCauHinh != null && !tenCauHinh.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("danhMucCauHinh").get("tenCauHinh")), 
                        "%" + tenCauHinh.trim().toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<CauHinhDonVi> pageResult = cauHinhDonViRepository.findAll(spec, PageRequest.of(page, size, Sort.by("id").descending()));
        Page<CauHinhDonViResponse> responsePage = pageResult.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional
    public CauHinhDonViResponse themMoi(CauHinhDonViRequest request) {
        Long idDonVi = DonViContextHolder.getTenantId();
        if (idDonVi == null) {
            throw new NghiepVuException("Chỉ admin đơn vị mới được thêm cấu hình đơn vị", 403);
        }

        if (cauHinhDonViRepository.existsByDanhMucCauHinhIdAndDonViIdAndThoiGianXoaIsNull(request.getIdDanhMucCauHinh(), idDonVi)) {
            throw new NghiepVuException("Đơn vị đã thiết lập cấu hình này rồi", 400);
        }

        DonVi donVi = donViRepository.findByIdAndThoiGianXoaIsNull(idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin đơn vị", 404));

        DanhMucCauHinh danhMucCauHinh = danhMucCauHinhRepository.findByIdAndThoiGianXoaIsNull(request.getIdDanhMucCauHinh())
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy danh mục cấu hình", 404));

        CauHinhDonVi entity = new CauHinhDonVi();
        entity.setDonVi(donVi);
        entity.setDanhMucCauHinh(danhMucCauHinh);
        entity.setGiaTriCauHinh(request.getGiaTriCauHinh());
        entity = cauHinhDonViRepository.save(entity);

        return mapToResponse(entity);
    }

    @Override
    @Transactional
    public CauHinhDonViResponse capNhat(Long id, CauHinhDonViRequest request) {
        Long idDonVi = DonViContextHolder.getTenantId();
        CauHinhDonVi entity = cauHinhDonViRepository.findByIdAndDonViIdAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy cấu hình đơn vị", 404));

        if (!entity.getDanhMucCauHinh().getId().equals(request.getIdDanhMucCauHinh()) && 
            cauHinhDonViRepository.existsByDanhMucCauHinhIdAndDonViIdAndThoiGianXoaIsNull(request.getIdDanhMucCauHinh(), idDonVi)) {
            throw new NghiepVuException("Đơn vị đã thiết lập cấu hình này rồi", 400);
        }

        if (!entity.getDanhMucCauHinh().getId().equals(request.getIdDanhMucCauHinh())) {
            DanhMucCauHinh danhMucCauHinh = danhMucCauHinhRepository.findByIdAndThoiGianXoaIsNull(request.getIdDanhMucCauHinh())
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy danh mục cấu hình", 404));
            entity.setDanhMucCauHinh(danhMucCauHinh);
        }

        entity.setGiaTriCauHinh(request.getGiaTriCauHinh());
        entity = cauHinhDonViRepository.save(entity);

        return mapToResponse(entity);
    }

    @Override
    @Transactional
    public void xoaMem(Long id) {
        Long idDonVi = DonViContextHolder.getTenantId();
        CauHinhDonVi entity = cauHinhDonViRepository.findByIdAndDonViIdAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy cấu hình đơn vị", 404));
        
        entity.setThoiGianXoa(LocalDateTime.now());
        entity.setLyDoXoa("Người dùng xóa");
        cauHinhDonViRepository.save(entity);
    }

    private CauHinhDonViResponse mapToResponse(CauHinhDonVi entity) {
        return CauHinhDonViResponse.builder()
                .id(entity.getId())
                .idDonVi(entity.getDonVi().getId())
                .idDanhMucCauHinh(entity.getDanhMucCauHinh().getId())
                .maCauHinh(entity.getDanhMucCauHinh().getMaCauHinh())
                .tenCauHinh(entity.getDanhMucCauHinh().getTenCauHinh())
                .giaTriCauHinh(entity.getGiaTriCauHinh())
                .build();
    }

    @Override
    public CauHinhDonViResponse layTheoId(Long id) {
        Long idDonVi = DonViContextHolder.getTenantId();
        CauHinhDonVi entity;
        if (idDonVi == null) {
            entity = cauHinhDonViRepository.findByIdAndThoiGianXoaIsNull(id)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy cấu hình đơn vị hoặc cấu hình đã bị xóa", 404));
        } else {
            entity = cauHinhDonViRepository.findByIdAndDonViIdAndThoiGianXoaIsNull(id, idDonVi)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy cấu hình đơn vị thuộc đơn vị của bạn", 404));
        }

        if (!"HOAT_DONG".equals(entity.getDanhMucCauHinh().getTrangThai())) {
            throw new NghiepVuException("Danh mục cấu hình liên kết hiện đang bị khóa hoặc ngừng hoạt động", 400);
        }

        return mapToResponse(entity);
    }
}

