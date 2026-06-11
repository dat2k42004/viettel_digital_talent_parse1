package com.example.backend.modules.auth.service;

import com.example.backend.modules.auth.service.interfaces.VaiTroService;

import com.example.backend.modules.auth.dto.QuyenResponse;
import com.example.backend.modules.auth.dto.VaiTroRequest;
import com.example.backend.modules.auth.dto.VaiTroResponse;
import com.example.backend.modules.auth.model.Quyen;
import com.example.backend.modules.auth.model.VaiTro;
import com.example.backend.modules.auth.model.VaiTroQuyen;
import com.example.backend.modules.auth.repository.QuyenRepository;
import com.example.backend.modules.auth.repository.VaiTroQuyenRepository;
import com.example.backend.modules.auth.repository.VaiTroRepository;
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
public class VaiTroServiceImpl implements VaiTroService {

    private final VaiTroRepository vaiTroRepository;
    private final VaiTroQuyenRepository vaiTroQuyenRepository;
    private final QuyenRepository quyenRepository;

    public List<VaiTroResponse> layDanhSach() {
        Long idDonVi = DonViContextHolder.getTenantId();
        List<VaiTro> danhSach;
        if (idDonVi == null) {
            danhSach = vaiTroRepository.findByIdDonViIsNullAndThoiGianXoaIsNull();
        } else {
            danhSach = vaiTroRepository.findByIdDonViAndThoiGianXoaIsNull(idDonVi);
        }
        return danhSach.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public VaiTroResponse themMoi(VaiTroRequest request) {
        Long idDonVi = DonViContextHolder.getTenantId();
        
        boolean exists;
        if (idDonVi == null) {
            exists = vaiTroRepository.existsByMaVaiTroAndIdDonViIsNullAndThoiGianXoaIsNull(request.getMaVaiTro());
        } else {
            exists = vaiTroRepository.existsByMaVaiTroAndIdDonViAndThoiGianXoaIsNull(request.getMaVaiTro(), idDonVi);
        }

        if (exists) {
            throw new NghiepVuException("Mã vai trả đã tồn tại", 400);
        }

        VaiTro vaiTro = new VaiTro();
        vaiTro.setIdDonVi(idDonVi);
        vaiTro.setMaVaiTro(request.getMaVaiTro());
        vaiTro.setTenVaiTro(request.getTenVaiTro());
        vaiTro.setMoTaVaiTro(request.getMoTa());
        vaiTro = vaiTroRepository.save(vaiTro);

        capNhatQuyenChoVaiTro(vaiTro, request.getDanhSachIdQuyen());

        return mapToResponse(vaiTro);
    }

    @Transactional
    public VaiTroResponse capNhat(Long id, VaiTroRequest request) {
        VaiTro vaiTro = kiemTraTonTaiVaQuyen(id);

        Long idDonVi = DonViContextHolder.getTenantId();
        boolean exists;
        if (idDonVi == null) {
            exists = vaiTroRepository.existsByMaVaiTroAndIdDonViIsNullAndThoiGianXoaIsNull(request.getMaVaiTro());
        } else {
            exists = vaiTroRepository.existsByMaVaiTroAndIdDonViAndThoiGianXoaIsNull(request.getMaVaiTro(), idDonVi);
        }
        
        if (exists && !vaiTro.getMaVaiTro().equals(request.getMaVaiTro())) {
             throw new NghiepVuException("Mã vai trả đã tồn tại", 400);
        }

        vaiTro.setMaVaiTro(request.getMaVaiTro());
        vaiTro.setTenVaiTro(request.getTenVaiTro());
        vaiTro.setMoTaVaiTro(request.getMoTa());
        vaiTro = vaiTroRepository.save(vaiTro);

        capNhatQuyenChoVaiTro(vaiTro, request.getDanhSachIdQuyen());

        return mapToResponse(vaiTro);
    }

    @Transactional
    public void xoaMem(Long id) {
        VaiTro vaiTro = kiemTraTonTaiVaQuyen(id);
        vaiTro.setThoiGianXoa(LocalDateTime.now());
        vaiTro.setLyDoXoa("Người dùng yếuu cầu xóa");
        vaiTroRepository.save(vaiTro);
    }

    private void capNhatQuyenChoVaiTro(VaiTro vaiTro, List<Long> idQuyenList) {
        vaiTroQuyenRepository.deleteByVaiTroId(vaiTro.getId());
        if (idQuyenList != null && !idQuyenList.isEmpty()) {
            List<Quyen> quyenList = quyenRepository.findAllById(idQuyenList);
            List<VaiTroQuyen> vaiTroQuyenList = quyenList.stream().map(q -> {
                VaiTroQuyen vq = new VaiTroQuyen();
                vq.setVaiTro(vaiTro);
                vq.setQuyen(q);
                return vq;
            }).collect(Collectors.toList());
            vaiTroQuyenRepository.saveAll(vaiTroQuyenList);
        }
    }

    private VaiTro kiemTraTonTaiVaQuyen(Long id) {
        VaiTro vaiTro = vaiTroRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy vai trả", 404));
        Long idDonVi = DonViContextHolder.getTenantId();
        if ((idDonVi == null && vaiTro.getIdDonVi() != null) ||
            (idDonVi != null && !idDonVi.equals(vaiTro.getIdDonVi()))) {
            throw new NghiepVuException("Bạn kháng có quyẤn thao từc trản vai trả này", 403);
        }
        return vaiTro;
    }

    private VaiTroResponse mapToResponse(VaiTro vaiTro) {
        List<QuyenResponse> danhSachQuyen = vaiTroQuyenRepository.findByVaiTroId(vaiTro.getId()).stream()
                .map(vq -> QuyenResponse.builder()
                        .id(vq.getQuyen().getId())
                        .maQuyen(vq.getQuyen().getMaQuyen())
                        .tenQuyen(vq.getQuyen().getTenQuyen())
                        .build())
                .collect(Collectors.toList());

        return VaiTroResponse.builder()
                .id(vaiTro.getId())
                .idDonVi(vaiTro.getIdDonVi())
                .maVaiTro(vaiTro.getMaVaiTro())
                .tenVaiTro(vaiTro.getTenVaiTro())
                .moTa(vaiTro.getMoTaVaiTro())
                .danhSachQuyen(danhSachQuyen)
                .build();
    }
}

