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
import com.example.backend.shared.tenant.DonViContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CauHinhDonViServiceImpl implements CauHinhDonViService {

    private final CauHinhDonViRepository cauHinhDonViRepository;
    private final DanhMucCauHinhRepository danhMucCauHinhRepository;
    private final DonViRepository donViRepository;

    @Override
    public List<CauHinhDonViResponse> layDanhSach() {
        Long idDonVi = DonViContextHolder.getTenantId();
        if (idDonVi == null) {
            throw new NghiepVuException("Chỉ admin đơn vị mới được xem cấu hình đơn vị", 403);
        }
        return cauHinhDonViRepository.findByDonViIdAndThoiGianXoaIsNull(idDonVi).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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
}

