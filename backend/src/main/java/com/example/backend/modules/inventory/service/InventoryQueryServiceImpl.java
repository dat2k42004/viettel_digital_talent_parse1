package com.example.backend.modules.inventory.service;

import com.example.backend.modules.inventory.dto.DotKiemKeDto;
import com.example.backend.modules.inventory.service.interfaces.InventoryQueryService;
import com.example.backend.modules.inventory.repository.DotKiemKeRepository;
import com.example.backend.modules.inventory.model.TrangThaiKiemKeEnum;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryQueryServiceImpl implements InventoryQueryService {

    private final DotKiemKeRepository dotKiemKeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DotKiemKeDto> layDotKiemKeDangThucHien(Long idDonVi) {
        return dotKiemKeRepository.findAll((root, query, cb) -> cb.and(
                cb.equal(root.get("idDonVi"), idDonVi),
                cb.equal(root.get("trangThai"), TrangThaiKiemKeEnum.DANG_THUC_HIEN),
                cb.isNull(root.get("thoiGianXoa"))
        )).stream().map(d -> DotKiemKeDto.builder()
                .id(d.getId())
                .tenDotKiemKe(d.getTenDotKiemKe())
                .maDotKiemKe(d.getMaDotKiemKe())
                .thoiGianBatDauDuKien(d.getThoiGianBatDauDuKien())
                .thoiGianKetThucDuKien(d.getThoiGianKetThucDuKien())
                .idDonVi(d.getIdDonVi())
                .build()).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DotKiemKeDto layDotKiemKeTheoId(Long idDotKiemKe) {
        return dotKiemKeRepository.findById(idDotKiemKe)
                .filter(d -> d.getThoiGianXoa() == null)
                .map(d -> DotKiemKeDto.builder()
                        .id(d.getId())
                        .tenDotKiemKe(d.getTenDotKiemKe())
                        .maDotKiemKe(d.getMaDotKiemKe())
                        .thoiGianBatDauDuKien(d.getThoiGianBatDauDuKien())
                        .thoiGianKetThucDuKien(d.getThoiGianKetThucDuKien())
                        .idDonVi(d.getIdDonVi())
                        .build()).orElse(null);
    }
}
