package com.example.backend.modules.lifecycle.service;

import com.example.backend.modules.lifecycle.dto.PhieuTonDongDto;
import com.example.backend.modules.lifecycle.service.interfaces.LifecycleQueryService;
import com.example.backend.modules.lifecycle.repository.PhieuCapPhatTaiSanRepository;
import com.example.backend.modules.lifecycle.repository.PhieuThuHoiTaiSanRepository;
import com.example.backend.modules.lifecycle.repository.PhieuDieuChuyenTaiSanRepository;
import com.example.backend.modules.lifecycle.repository.PhieuThanhLyTaiSanRepository;
import com.example.backend.modules.lifecycle.repository.ChiTietCapPhatPhanCungRepository;
import com.example.backend.modules.lifecycle.repository.ChiTietCapPhatLinhKienRepository;
import com.example.backend.modules.lifecycle.repository.ChiTietCapPhatPhanMemRepository;
import com.example.backend.modules.lifecycle.model.ChiTietCapPhatPhanCung;
import com.example.backend.modules.lifecycle.model.ChiTietCapPhatLinhKien;
import com.example.backend.modules.lifecycle.model.ChiTietCapPhatPhanMem;
import com.example.backend.shared.model.TrangThaiPhieuEnum;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LifecycleQueryServiceImpl implements LifecycleQueryService {

    private final PhieuCapPhatTaiSanRepository phieuCapPhatTaiSanRepository;
    private final PhieuThuHoiTaiSanRepository phieuThuHoiTaiSanRepository;
    private final PhieuDieuChuyenTaiSanRepository phieuDieuChuyenTaiSanRepository;
    private final PhieuThanhLyTaiSanRepository phieuThanhLyTaiSanRepository;
    private final ChiTietCapPhatPhanCungRepository chiTietCapPhatPhanCungRepository;
    private final ChiTietCapPhatLinhKienRepository chiTietCapPhatLinhKienRepository;
    private final ChiTietCapPhatPhanMemRepository chiTietCapPhatPhanMemRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PhieuTonDongDto> layDanhSachPhieuTonDong(Long idDonVi, LocalDateTime mocThoiGian) {
        List<PhieuTonDongDto> result = new ArrayList<>();

        // 1. Quét phiếu cấp phát
        phieuCapPhatTaiSanRepository.findAll((root, query, cb) -> cb.and(
                cb.equal(root.get("idDonVi"), idDonVi),
                cb.equal(root.get("trangThai"), TrangThaiPhieuEnum.DA_PHE_DUYET),
                cb.isNull(root.get("thoiGianXoa")),
                cb.lessThan(cb.coalesce(root.get("thoiGianCapNhat"), root.get("thoiGianTao")), mocThoiGian)
        )).forEach(p -> result.add(PhieuTonDongDto.builder()
                .idNguoiLap(p.getIdNguoiLap())
                .maChungTu(p.getMaPhiepCapPhat())
                .loaiChungTu("Cấp phát")
                .thoiGianCapNhat(p.getThoiGianCapNhat() != null ? p.getThoiGianCapNhat() : p.getThoiGianTao())
                .build()));

        // 2. Quét phiếu thu hồi
        phieuThuHoiTaiSanRepository.findAll((root, query, cb) -> cb.and(
                cb.equal(root.get("idDonVi"), idDonVi),
                cb.equal(root.get("trangThai"), TrangThaiPhieuEnum.DA_PHE_DUYET),
                cb.isNull(root.get("thoiGianXoa")),
                cb.lessThan(cb.coalesce(root.get("thoiGianCapNhat"), root.get("thoiGianTao")), mocThoiGian)
        )).forEach(p -> result.add(PhieuTonDongDto.builder()
                .idNguoiLap(p.getIdNguoiLap())
                .maChungTu(p.getMaPhieuThuHoi())
                .loaiChungTu("Thu hồi")
                .thoiGianCapNhat(p.getThoiGianCapNhat() != null ? p.getThoiGianCapNhat() : p.getThoiGianTao())
                .build()));

        // 3. Quét phiếu điều chuyển
        phieuDieuChuyenTaiSanRepository.findAll((root, query, cb) -> cb.and(
                cb.equal(root.get("idDonVi"), idDonVi),
                cb.equal(root.get("trangThai"), TrangThaiPhieuEnum.DA_PHE_DUYET),
                cb.isNull(root.get("thoiGianXoa")),
                cb.lessThan(cb.coalesce(root.get("thoiGianCapNhat"), root.get("thoiGianTao")), mocThoiGian)
        )).forEach(p -> result.add(PhieuTonDongDto.builder()
                .idNguoiLap(p.getIdNguoiLap())
                .maChungTu(p.getMaPhieuDieuChuyen())
                .loaiChungTu("Điều chuyển")
                .thoiGianCapNhat(p.getThoiGianCapNhat() != null ? p.getThoiGianCapNhat() : p.getThoiGianTao())
                .build()));

        // 4. Quét phiếu thanh lý
        phieuThanhLyTaiSanRepository.findAll((root, query, cb) -> cb.and(
                cb.equal(root.get("idDonVi"), idDonVi),
                cb.equal(root.get("trangThai"), TrangThaiPhieuEnum.DA_PHE_DUYET),
                cb.isNull(root.get("thoiGianXoa")),
                cb.lessThan(cb.coalesce(root.get("thoiGianCapNhat"), root.get("thoiGianTao")), mocThoiGian)
        )).forEach(p -> result.add(PhieuTonDongDto.builder()
                .idNguoiLap(p.getIdNguoiLap())
                .maChungTu(p.getMaPhieuThanhLy())
                .loaiChungTu("Thanh lý")
                .thoiGianCapNhat(p.getThoiGianCapNhat() != null ? p.getThoiGianCapNhat() : p.getThoiGianTao())
                .build()));

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChiTietCapPhatPhanCung> layPhanCungHoatDongTheoPhongBan(Long idPhongBan) {
        return chiTietCapPhatPhanCungRepository.findActiveAllocationByPhongBan(idPhongBan);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChiTietCapPhatLinhKien> layLinhKienHoatDongTheoPhongBan(Long idPhongBan) {
        return chiTietCapPhatLinhKienRepository.findActiveAllocationByPhongBan(idPhongBan);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChiTietCapPhatPhanMem> layPhanMemHoatDongTheoPhongBan(Long idPhongBan) {
        return chiTietCapPhatPhanMemRepository.findActiveAllocationByPhongBan(idPhongBan);
    }

    @Override
    @Transactional(readOnly = true)
    public long demCapPhatChoPheDuyet(Long idDonVi) {
        if (idDonVi == null) {
            return phieuCapPhatTaiSanRepository.countByTrangThaiAndThoiGianXoaIsNull(TrangThaiPhieuEnum.GUI_PHE_DUYET);
        }
        return phieuCapPhatTaiSanRepository.countByIdDonViAndTrangThaiAndThoiGianXoaIsNull(idDonVi, TrangThaiPhieuEnum.GUI_PHE_DUYET);
    }
}
