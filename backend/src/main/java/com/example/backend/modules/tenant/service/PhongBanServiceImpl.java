package com.example.backend.modules.tenant.service;

import com.example.backend.modules.tenant.service.interfaces.PhongBanService;

import com.example.backend.modules.tenant.dto.PhongBanRequest;
import com.example.backend.modules.tenant.dto.PhongBanResponse;
import com.example.backend.modules.tenant.model.DonVi;
import com.example.backend.modules.tenant.model.PhongBan;
import com.example.backend.modules.tenant.repository.DonViRepository;
import com.example.backend.modules.tenant.repository.PhongBanRepository;
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
public class PhongBanServiceImpl implements PhongBanService {

    private final PhongBanRepository phongBanRepository;
    private final DonViRepository donViRepository;

    @Override
    public List<PhongBanResponse> layDanhSach() {
        Long idDonVi = DonViContextHolder.getTenantId();
        if (idDonVi == null) {
            throw new NghiepVuException("Chỉ admin đơn vị mới được xem phòng ban", 403);
        }
        return phongBanRepository.findByDonViIdAndThoiGianXoaIsNull(idDonVi).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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
}


