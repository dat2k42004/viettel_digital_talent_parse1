package com.example.backend.modules.tenant.service;

import com.example.backend.modules.tenant.service.interfaces.ViTriService;

import com.example.backend.modules.tenant.dto.ViTriRequest;
import com.example.backend.modules.tenant.dto.ViTriResponse;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.modules.tenant.model.DonVi;
import com.example.backend.modules.tenant.model.ViTri;
import com.example.backend.modules.tenant.repository.DonViRepository;
import com.example.backend.modules.tenant.repository.ViTriRepository;
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
public class ViTriServiceImpl implements ViTriService {

    private final ViTriRepository viTriRepository;
    private final DonViRepository donViRepository;

    @Override
    public PageResponse<ViTriResponse> layDanhSach(String tenViTri, String maViTri, String trangThai, String loaiViTri, int page, int size) {
        Long idDonVi = DonViContextHolder.getTenantId();
        if (idDonVi == null) {
            throw new NghiepVuException("Chỉ admin đơn vị mới được xem vị trí", 403);
        }

        Specification<ViTri> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));
            predicates.add(cb.equal(root.get("trangThai"), "HOAT_DONG"));
            predicates.add(cb.equal(root.get("donVi").get("id"), idDonVi));

            if (tenViTri != null && !tenViTri.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("tenViTri")), "%" + tenViTri.trim().toLowerCase() + "%"));
            }

            if (maViTri != null && !maViTri.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("maViTri")), "%" + maViTri.trim().toLowerCase() + "%"));
            }

            if (loaiViTri != null && !loaiViTri.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("loaiViTri"), loaiViTri.trim()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ViTri> pageResult = viTriRepository.findAll(spec, PageRequest.of(page, size, Sort.by("id").descending()));
        Page<ViTriResponse> responsePage = pageResult.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional
    public ViTriResponse themMoi(ViTriRequest request) {
        Long idDonVi = DonViContextHolder.getTenantId();
        if (idDonVi == null) {
            throw new NghiepVuException("Chỉ admin đơn vị mới được thêm vị trả", 403);
        }

        if (viTriRepository.existsByMaViTriAndDonViIdAndThoiGianXoaIsNull(request.getMaViTri(), idDonVi)) {
            throw new NghiepVuException("Mã vị trả đã tồn tại trong đơn vị", 400);
        }

        DonVi donVi = donViRepository.findByIdAndThoiGianXoaIsNull(idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin đơn vị", 404));

        ViTri viTri = new ViTri();
        viTri.setDonVi(donVi);
        capNhatThongTin(viTri, request);
        viTri = viTriRepository.save(viTri);

        return mapToResponse(viTri);
    }

    @Override
    @Transactional
    public ViTriResponse capNhat(Long id, ViTriRequest request) {
        Long idDonVi = DonViContextHolder.getTenantId();
        ViTri viTri = viTriRepository.findByIdAndDonViIdAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy vị trả", 404));

        if (!viTri.getMaViTri().equals(request.getMaViTri()) && 
            viTriRepository.existsByMaViTriAndDonViIdAndThoiGianXoaIsNull(request.getMaViTri(), idDonVi)) {
            throw new NghiepVuException("Mã vị trả đã tồn tại trong đơn vị", 400);
        }

        capNhatThongTin(viTri, request);
        viTri = viTriRepository.save(viTri);

        return mapToResponse(viTri);
    }

    @Override
    @Transactional
    public void xoaMem(Long id) {
        Long idDonVi = DonViContextHolder.getTenantId();
        ViTri viTri = viTriRepository.findByIdAndDonViIdAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy vị trả", 404));
        
        viTri.setThoiGianXoa(LocalDateTime.now());
        viTri.setLyDoXoa("Người dùng xóa");
        viTriRepository.save(viTri);
    }

    private void capNhatThongTin(ViTri viTri, ViTriRequest request) {
        viTri.setMaViTri(request.getMaViTri());
        viTri.setTenViTri(request.getTenViTri());
        viTri.setTenTiengAnh(request.getTenTiengAnh());
        viTri.setLoaiViTri(request.getLoaiViTri());
        viTri.setSucChuaToiDa(request.getSucChuaToiDa());
        viTri.setDienTichM2(request.getDienTichM2());
        viTri.setChieuCaoM(request.getChieuCaoM());
        viTri.setCapDoBaoMat(request.getCapDoBaoMat());
        viTri.setLaPhongKinh(request.getLaPhongKinh());
        viTri.setCoDieuHoaTrungTam(request.getCoDieuHoaTrungTam());
        viTri.setCoHeThongPccc(request.getCoHeThongPccc());
        viTri.setCoKiemSoatCua(request.getCoKiemSoatCua());
        viTri.setMoTaChiTiet(request.getMoTaChiTiet());
        viTri.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : "HOAT_DONG");
    }

    private ViTriResponse mapToResponse(ViTri viTri) {
        return ViTriResponse.builder()
                .id(viTri.getId())
                .idDonVi(viTri.getDonVi().getId())
                .maViTri(viTri.getMaViTri())
                .tenViTri(viTri.getTenViTri())
                .tenTiengAnh(viTri.getTenTiengAnh())
                .loaiViTri(viTri.getLoaiViTri())
                .sucChuaToiDa(viTri.getSucChuaToiDa())
                .dienTichM2(viTri.getDienTichM2())
                .chieuCaoM(viTri.getChieuCaoM())
                .capDoBaoMat(viTri.getCapDoBaoMat())
                .laPhongKinh(viTri.getLaPhongKinh())
                .coDieuHoaTrungTam(viTri.getCoDieuHoaTrungTam())
                .coHeThongPccc(viTri.getCoHeThongPccc())
                .coKiemSoatCua(viTri.getCoKiemSoatCua())
                .moTaChiTiet(viTri.getMoTaChiTiet())
                .trangThai(viTri.getTrangThai())
                .build();
    }

    @Override
    @Transactional
    public void capNhatTrangThai(Long id, TrangThaiRequest request) {
        Long idDonVi = DonViContextHolder.getTenantId();
        ViTri viTri = viTriRepository.findByIdAndDonViIdAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy vị trí", 404));
        String status = request.getTrangThai();
        if (!"HOAT_DONG".equals(status) && !"KHOA".equals(status)) {
            throw new NghiepVuException("Trạng thái không hợp lệ", 400);
        }
        viTri.setTrangThai(status);
        viTriRepository.save(viTri);
    }

    @Override
    public ViTriResponse layTheoId(Long id) {
        Long idDonVi = DonViContextHolder.getTenantId();
        ViTri viTri;
        if (idDonVi == null) {
            viTri = viTriRepository.findByIdAndThoiGianXoaIsNull(id)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy vị trí hoặc vị trí đã bị xóa", 404));
        } else {
            viTri = viTriRepository.findByIdAndDonViIdAndThoiGianXoaIsNull(id, idDonVi)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy vị trí thuộc đơn vị của bạn", 404));
        }

        if (!"HOAT_DONG".equals(viTri.getTrangThai())) {
            throw new NghiepVuException("Vị trí hiện đang bị khóa hoặc ngừng hoạt động", 400);
        }

        return mapToResponse(viTri);
    }
}

