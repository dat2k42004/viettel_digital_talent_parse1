package com.example.backend.modules.tenant.service;

import com.example.backend.modules.tenant.service.interfaces.PhongBanService;

import com.example.backend.modules.tenant.dto.PhongBanRequest;
import com.example.backend.modules.tenant.dto.PhongBanResponse;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.modules.tenant.model.DonVi;
import com.example.backend.modules.tenant.model.PhongBan;
import com.example.backend.modules.tenant.repository.DonViRepository;
import com.example.backend.modules.tenant.repository.PhongBanRepository;
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
public class PhongBanServiceImpl implements PhongBanService {

    private final PhongBanRepository phongBanRepository;
    private final DonViRepository donViRepository;

    @Override
    public PageResponse<PhongBanResponse> layDanhSach(String tenPhongBan, String maPhongBan, String trangThai, int page, int size) {
        Long idDonVi = DonViContextHolder.getTenantId();
        if (idDonVi == null) {
            throw new NghiepVuException("Chỉ admin đơn vị mới được xem phòng ban", 403);
        }

        Specification<PhongBan> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));
            predicates.add(cb.equal(root.get("trangThai"), "HOAT_DONG"));
            predicates.add(cb.equal(root.get("donVi").get("id"), idDonVi));

            if (tenPhongBan != null && !tenPhongBan.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("tenPhongBan")), "%" + tenPhongBan.trim().toLowerCase() + "%"));
            }

            if (maPhongBan != null && !maPhongBan.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("maPhongBan")), "%" + maPhongBan.trim().toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PhongBan> pageResult = phongBanRepository.findAll(spec, PageRequest.of(page, size, Sort.by("id").descending()));
        Page<PhongBanResponse> responsePage = pageResult.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional
    public PhongBanResponse themMoi(PhongBanRequest request) {
        Long idDonVi = DonViContextHolder.getTenantId();
        if (idDonVi == null) {
            throw new NghiepVuException("Chỉ admin đơn vị mới được thêm phòng ban", 403);
        }

        if (phongBanRepository.existsByMaPhongBanAndDonViIdAndThoiGianXoaIsNull(request.getMaPhongBan(), idDonVi)) {
            throw new NghiepVuException("Mã phòng ban đã tồn tại trong đơn vị", 400);
        }

        DonVi donVi = donViRepository.findByIdAndThoiGianXoaIsNull(idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin đơn vị", 404));

        PhongBan phongBan = new PhongBan();
        phongBan.setDonVi(donVi);
        capNhatThongTin(phongBan, request);
        phongBan = phongBanRepository.save(phongBan);

        return mapToResponse(phongBan);
    }

    @Override
    @Transactional
    public PhongBanResponse capNhat(Long id, PhongBanRequest request) {
        Long idDonVi = DonViContextHolder.getTenantId();
        PhongBan phongBan = phongBanRepository.findByIdAndDonViIdAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy phòng ban", 404));

        if (!phongBan.getMaPhongBan().equals(request.getMaPhongBan()) && 
            phongBanRepository.existsByMaPhongBanAndDonViIdAndThoiGianXoaIsNull(request.getMaPhongBan(), idDonVi)) {
            throw new NghiepVuException("Mã phòng ban đã tồn tại trong đơn vị", 400);
        }

        capNhatThongTin(phongBan, request);
        phongBan = phongBanRepository.save(phongBan);

        return mapToResponse(phongBan);
    }

    @Override
    @Transactional
    public void xoaMem(Long id) {
        Long idDonVi = DonViContextHolder.getTenantId();
        PhongBan phongBan = phongBanRepository.findByIdAndDonViIdAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy phòng ban", 404));
        
        phongBan.setThoiGianXoa(LocalDateTime.now());
        phongBan.setLyDoXoa("Người dùng xóa");
        phongBanRepository.save(phongBan);
    }

    private void capNhatThongTin(PhongBan phongBan, PhongBanRequest request) {
        phongBan.setMaPhongBan(request.getMaPhongBan());
        phongBan.setTenPhongBan(request.getTenPhongBan());
        phongBan.setTenTiengAnh(request.getTenTiengAnh());
        phongBan.setTenVietTat(request.getTenVietTat());
        phongBan.setSoMayLe(request.getSoMayLe());
        phongBan.setSoHotlinePhong(request.getSoHotlinePhong());
        phongBan.setEmailNhom(request.getEmailNhom());
        phongBan.setLoaiPhongBan(request.getLoaiPhongBan());
        phongBan.setHanMucNganSach(request.getHanMucNganSach());
        phongBan.setMaTrungTamChiPhi(request.getMaTrungTamChiPhi());
        phongBan.setMoTaChucNang(request.getMoTaChucNang());
        phongBan.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : "HOAT_DONG");
        phongBan.setThoiGianThanhLap(request.getThoiGianThanhLap());
    }

    private PhongBanResponse mapToResponse(PhongBan phongBan) {
        return PhongBanResponse.builder()
                .id(phongBan.getId())
                .idDonVi(phongBan.getDonVi().getId())
                .maPhongBan(phongBan.getMaPhongBan())
                .tenPhongBan(phongBan.getTenPhongBan())
                .tenTiengAnh(phongBan.getTenTiengAnh())
                .tenVietTat(phongBan.getTenVietTat())
                .soMayLe(phongBan.getSoMayLe())
                .soHotlinePhong(phongBan.getSoHotlinePhong())
                .emailNhom(phongBan.getEmailNhom())
                .loaiPhongBan(phongBan.getLoaiPhongBan())
                .hanMucNganSach(phongBan.getHanMucNganSach())
                .maTrungTamChiPhi(phongBan.getMaTrungTamChiPhi())
                .moTaChucNang(phongBan.getMoTaChucNang())
                .trangThai(phongBan.getTrangThai())
                .thoiGianThanhLap(phongBan.getThoiGianThanhLap())
                .build();
    }

    @Override
    @Transactional
    public void capNhatTrangThai(Long id, TrangThaiRequest request) {
        Long idDonVi = DonViContextHolder.getTenantId();
        PhongBan phongBan = phongBanRepository.findByIdAndDonViIdAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy phòng ban", 404));
        String status = request.getTrangThai();
        if (!"HOAT_DONG".equals(status) && !"KHOA".equals(status)) {
            throw new NghiepVuException("Trạng thái không hợp lệ", 400);
        }
        phongBan.setTrangThai(status);
        phongBanRepository.save(phongBan);
    }

    @Override
    public PhongBanResponse layTheoId(Long id) {
        Long idDonVi = DonViContextHolder.getTenantId();
        PhongBan phongBan;
        if (idDonVi == null) {
            phongBan = phongBanRepository.findByIdAndThoiGianXoaIsNull(id)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy phòng ban hoặc phòng ban đã bị xóa", 404));
        } else {
            phongBan = phongBanRepository.findByIdAndDonViIdAndThoiGianXoaIsNull(id, idDonVi)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy phòng ban thuộc đơn vị của bạn", 404));
        }

        if (!"HOAT_DONG".equals(phongBan.getTrangThai())) {
            throw new NghiepVuException("Phòng ban hiện đang bị khóa hoặc ngừng hoạt động", 400);
        }

        return mapToResponse(phongBan);
    }
}


