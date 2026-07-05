package com.example.backend.modules.asset.service;

import com.example.backend.modules.asset.dto.AssetExpiryDto;
import com.example.backend.modules.asset.service.interfaces.AssetQueryService;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanCungRepository;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanMemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetQueryServiceImpl implements AssetQueryService {

    private final DanhSachThietBiPhanCungRepository thietBiPhanCungRepository;
    private final DanhSachThietBiPhanMemRepository thietBiPhanMemRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AssetExpiryDto> layTaiSanSapHetHan(Long idDonVi, LocalDate ngayHienTai, int soNgayCanhBao) {
        List<AssetExpiryDto> result = new ArrayList<>();
        LocalDate mocHan = ngayHienTai.plusDays(soNgayCanhBao);

        // 1. Quét thiết bị phần cứng
        thietBiPhanCungRepository.findAll((root, query, cb) -> cb.and(
                cb.equal(root.get("idDonVi"), idDonVi),
                cb.isNull(root.get("thoiGianXoa"))
        )).forEach(tb -> {
            LocalDate hanBaoHanh = tb.getThoiGianHetHanBaoHanh();
            if (hanBaoHanh == null && tb.getThoiGianMua() != null && tb.getHanBaoHanhThang() != null) {
                hanBaoHanh = tb.getThoiGianMua().plusMonths(tb.getHanBaoHanhThang());
            }
            if (hanBaoHanh != null && !hanBaoHanh.isBefore(ngayHienTai) && !hanBaoHanh.isAfter(mocHan)) {
                String tenMau = tb.getTaiSanPhanCung() != null ? tb.getTaiSanPhanCung().getTenMau() : "Chưa rõ";
                String identifier = String.format("Serial: %s | Thẻ: %s", tb.getSoSerial(), tb.getMaTheTaiSan());
                result.add(AssetExpiryDto.builder()
                        .tenMau(tenMau)
                        .identifier(identifier)
                        .ngayHetHan(hanBaoHanh)
                        .loaiTaiSan("Phần cứng")
                        .build());
            }
        });

        // 2. Quét bản quyền phần mềm
        thietBiPhanMemRepository.findAll((root, query, cb) -> cb.and(
                cb.equal(root.get("idDonVi"), idDonVi),
                cb.isNull(root.get("thoiGianXoa"))
        )).forEach(pm -> {
            LocalDate hanBanQuyen = pm.getThoiGianHetHanBanQuyen();
            if (hanBanQuyen == null) {
                hanBanQuyen = pm.getThoiGianHetHan();
            }
            if (hanBanQuyen != null && !hanBanQuyen.isBefore(ngayHienTai) && !hanBanQuyen.isAfter(mocHan)) {
                String tenMau = pm.getTaiSanPhanMem() != null ? pm.getTaiSanPhanMem().getTenMau() : "Chưa rõ";
                String identifier = String.format("Key: %s | Mua chứng từ: %s", pm.getKeyBanQuyen(), pm.getMaChungTuMua());
                result.add(AssetExpiryDto.builder()
                        .tenMau(tenMau)
                        .identifier(identifier)
                        .ngayHetHan(hanBanQuyen)
                        .loaiTaiSan("Phần mềm")
                        .build());
            }
        });

        return result;
    }
}
