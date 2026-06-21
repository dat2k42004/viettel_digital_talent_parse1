package com.example.backend.modules.lifecycle.service;

import com.example.backend.modules.asset.model.DanhSachThietBiPhanCung;
import com.example.backend.modules.asset.model.DanhSachThietBiPhanMem;
import com.example.backend.modules.asset.model.LinhKienPhanCung;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanCungRepository;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanMemRepository;
import com.example.backend.modules.asset.repository.LinhKienPhanCungRepository;
import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.auth.repository.NguoiDungRepository;
import com.example.backend.modules.auth.security.NguoiDungUserDetails;
import com.example.backend.modules.lifecycle.dto.*;
import com.example.backend.modules.lifecycle.model.*;
import com.example.backend.modules.lifecycle.repository.*;
import com.example.backend.modules.lifecycle.service.interfaces.PhieuThuHoiTaiSanService;
import com.example.backend.modules.tenant.model.PhongBan;
import com.example.backend.modules.tenant.repository.PhongBanRepository;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.model.TrangThaiPhieuEnum;
import com.example.backend.shared.model.TrangThaiVanHanhEnum;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.tenant.DonViContextHolder;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhieuThuHoiTaiSanServiceImpl implements PhieuThuHoiTaiSanService {

    private final PhieuThuHoiTaiSanRepository phieuThuHoiTaiSanRepository;
    private final ChiTietThuHoiPhanCungRepository chiTietThuHoiPhanCungRepository;
    private final ChiTietThuHoiPhanMemRepository chiTietThuHoiPhanMemRepository;
    private final ChiTietThuHoiLinhKienRepository chiTietThuHoiLinhKienRepository;

    private final ChiTietCapPhatPhanCungRepository chiTietCapPhatPhanCungRepository;
    private final ChiTietCapPhatPhanMemRepository chiTietCapPhatPhanMemRepository;
    private final ChiTietCapPhatLinhKienRepository chiTietCapPhatLinhKienRepository;

    private final DanhSachThietBiPhanCungRepository thietBiPhanCungRepository;
    private final DanhSachThietBiPhanMemRepository thietBiPhanMemRepository;
    private final LinhKienPhanCungRepository linhKienPhanCungRepository;

    private final NguoiDungRepository nguoiDungRepository;
    private final PhongBanRepository phongBanRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PhieuThuHoiTaiSanResponse> layDanhSach(
            String trangThai,
            Long idPhongBan,
            LocalDate tuNgay,
            LocalDate denNgay,
            int page,
            int size,
            String sort) {
        Long tenantId = getRequiredTenantId();

        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        String sortBy = sortParts[0];

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<PhieuThuHoiTaiSan> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));
            predicates.add(cb.equal(root.get("idDonVi"), tenantId));

            if (trangThai != null && !trangThai.trim().isEmpty()) {
                try {
                    predicates.add(cb.equal(root.get("trangThai"), TrangThaiPhieuEnum.fromValue(trangThai.trim())));
                } catch (IllegalArgumentException e) {
                    throw new NghiepVuException(e.getMessage(), 400);
                }
            }

            if (idPhongBan != null) {
                predicates.add(cb.equal(root.get("idPhongBanTra"), idPhongBan));
            }

            if (tuNgay != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("thoiGianThuHoi"), tuNgay.atStartOfDay()));
            }

            if (denNgay != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("thoiGianThuHoi"), denNgay.atTime(LocalTime.MAX)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PhieuThuHoiTaiSan> pageResult = phieuThuHoiTaiSanRepository.findAll(spec, pageRequest);
        List<PhieuThuHoiTaiSanResponse> content = mapToResponseList(pageResult.getContent());
        return PageResponse.from(new PageImpl<>(content, pageRequest, pageResult.getTotalElements()));
    }

    @Override
    @Transactional(readOnly = true)
    public PhieuThuHoiTaiSanResponse layTheoId(Long id) {
        Long tenantId = getRequiredTenantId();
        PhieuThuHoiTaiSan phieu = phieuThuHoiTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                .orElseThrow(() -> new NghiepVuException(
                        "Không tìm thấy phiếu thu hồi tài sản ID " + id + " trong đơn vị", 404));
        return mapToResponse(phieu, true);
    }

    @Override
    @Transactional(readOnly = true)
    public ActiveAllocationResponse layAllocationsCuaNhanVien(Long idNhanVien) {
        Long tenantId = getRequiredTenantId();

        // 1. Hardware allocations
        List<ChiTietCapPhatPhanCung> pcAllocations = chiTietCapPhatPhanCungRepository
                .findByPhieuCapPhatTaiSanIdNguoiNhanAndPhieuCapPhatTaiSanIdDonViAndThoiGianXoaIsNull(idNhanVien,
                        tenantId);
        List<AllocatedHardwareResponse> pcList = new ArrayList<>();
        for (ChiTietCapPhatPhanCung pc : pcAllocations) {
            boolean daThuHoi = chiTietThuHoiPhanCungRepository
                    .findByChiTietCapPhatPhanCungIdAndThoiGianXoaIsNull(pc.getId()).isPresent();
            if (!daThuHoi) {
                String tenThietBi = "";
                String soSerial = "";
                String maThe = "";
                if (pc.getDanhSachThietBiPhanCungId() != null) {
                    DanhSachThietBiPhanCung tb = thietBiPhanCungRepository.findById(pc.getDanhSachThietBiPhanCungId())
                            .orElse(null);
                    if (tb != null) {
                        soSerial = tb.getSoSerial();
                        maThe = tb.getMaTheTaiSan();
                        if (tb.getTaiSanPhanCung() != null) {
                            tenThietBi = tb.getTaiSanPhanCung().getTenMau();
                        }
                    }
                }
                pcList.add(AllocatedHardwareResponse.builder()
                        .chiTietCapPhatPhanCungId(pc.getId())
                        .danhSachThietBiPhanCungId(pc.getDanhSachThietBiPhanCungId())
                        .tenThietBi(tenThietBi)
                        .soSerial(soSerial)
                        .maTheTaiSan(maThe)
                        .tinhTrangLucGiao(pc.getTinhTrangLucGiao())
                        .phuKienKemTheo(pc.getPhuKienKemTheo())
                        .build());
            }
        }

        // 2. Software allocations
        List<ChiTietCapPhatPhanMem> pmAllocations = chiTietCapPhatPhanMemRepository
                .findByPhieuCapPhatTaiSanIdNguoiNhanAndPhieuCapPhatTaiSanIdDonViAndThoiGianXoaIsNull(idNhanVien,
                        tenantId);
        List<AllocatedSoftwareResponse> pmList = new ArrayList<>();
        for (ChiTietCapPhatPhanMem pm : pmAllocations) {
            boolean daThuHoi = chiTietThuHoiPhanMemRepository
                    .findByChiTietCapPhatPhanMemIdAndThoiGianXoaIsNull(pm.getId()).isPresent();
            if (!daThuHoi) {
                String tenPhanMem = "";
                String keyBanQuyen = "";
                if (pm.getDanhSachThietBiPhanMemId() != null) {
                    DanhSachThietBiPhanMem tb = thietBiPhanMemRepository.findById(pm.getDanhSachThietBiPhanMemId())
                            .orElse(null);
                    if (tb != null) {
                        keyBanQuyen = tb.getKeyBanQuyen();
                        if (tb.getTaiSanPhanMem() != null) {
                            tenPhanMem = tb.getTaiSanPhanMem().getTenMau();
                        }
                    }
                }
                pmList.add(AllocatedSoftwareResponse.builder()
                        .chiTietCapPhatPhanMemId(pm.getId())
                        .danhSachThietBiPhanMemId(pm.getDanhSachThietBiPhanMemId())
                        .tenPhanMem(tenPhanMem)
                        .keyBanQuyen(keyBanQuyen)
                        .build());
            }
        }

        // 3. Component allocations
        List<ChiTietCapPhatLinhKien> lkAllocations = chiTietCapPhatLinhKienRepository
                .findByPhieuCapPhatTaiSanIdNguoiNhanAndPhieuCapPhatTaiSanIdDonViAndThoiGianXoaIsNull(idNhanVien,
                        tenantId);
        List<AllocatedLinhKienResponse> lkList = new ArrayList<>();
        for (ChiTietCapPhatLinhKien lk : lkAllocations) {
            boolean daThuHoi = chiTietThuHoiLinhKienRepository
                    .findByChiTietCapPhatLinhKienIdAndThoiGianXoaIsNull(lk.getId()).isPresent();
            if (!daThuHoi) {
                String tenLinhKien = "";
                String soSerial = "";
                if (lk.getLinhKienPhanCungId() != null) {
                    LinhKienPhanCung lkEntity = linhKienPhanCungRepository.findById(lk.getLinhKienPhanCungId())
                            .orElse(null);
                    if (lkEntity != null) {
                        soSerial = lkEntity.getSoSerial();
                        if (lkEntity.getTaiSanPhanCung() != null) {
                            tenLinhKien = lkEntity.getTaiSanPhanCung().getTenMau();
                        }
                    }
                }
                lkList.add(AllocatedLinhKienResponse.builder()
                        .chiTietCapPhatLinhKienId(lk.getId())
                        .linhKienPhanCungId(lk.getLinhKienPhanCungId())
                        .tenLinhKien(tenLinhKien)
                        .soSerial(soSerial)
                        .tinhTrangLucGiao(lk.getTinhTrangLucGiao())
                        .build());
            }
        }

        return ActiveAllocationResponse.builder()
                .danhSachPhanCung(pcList)
                .danhSachPhanMem(pmList)
                .danhSachLinhKien(lkList)
                .build();
    }

    @Override
    @Transactional
    public PhieuThuHoiTaiSanResponse themMoi(PhieuThuHoiTaiSanRequest request) {
        Long tenantId = getRequiredTenantId();
        Long userId = getCurrentUserId();

        validateRequestHasAtLeastOneItem(request);

        PhieuThuHoiTaiSan phieu = new PhieuThuHoiTaiSan();
        phieu.setIdDonVi(tenantId);
        phieu.setMaPhieuThuHoi("PTH-" + tenantId + "-" + System.currentTimeMillis());
        phieu.setIdNhanVienTra(request.getIdNhanVienTra());
        phieu.setIdPhongBanTra(request.getIdPhongBanTra());
        phieu.setLyDoThuHoi(request.getLyDoThuHoi());
        phieu.setTrangThai(TrangThaiPhieuEnum.TAO_MOI);
        phieu.setIdNguoiLap(userId);

        PhieuThuHoiTaiSan savedPhieu = phieuThuHoiTaiSanRepository.save(phieu);

        // 1. Lưu phần cứng
        if (request.getDanhSachPhanCung() != null) {
            for (ChiTietThuHoiPhanCungRequest rq : request.getDanhSachPhanCung()) {
                ChiTietCapPhatPhanCung cp = chiTietCapPhatPhanCungRepository.findById(rq.getChiTietCapPhatPhanCungId())
                        .orElseThrow(() -> new NghiepVuException(
                                "Không tìm thấy chi tiết cấp phát phần cứng ID " + rq.getChiTietCapPhatPhanCungId(),
                                400));

                if (cp.getThoiGianXoa() != null) {
                    throw new NghiepVuException("Chi tiết cấp phát phần cứng ID " + rq.getChiTietCapPhatPhanCungId()
                            + " đã bị thu hồi hoặc xóa bỏ trước đó", 400);
                }

                // Xóa mềm chi tiết cấp phát (Giữ chỗ ngầm chu kỳ thu hồi)
                cp.setThoiGianXoa(LocalDateTime.now());
                cp.setLyDoXoa("Thu hồi tài sản (Chờ hoàn thành)");
                chiTietCapPhatPhanCungRepository.save(cp);

                // ĐÃ SỬA: BỎ đoạn thietBiPhanCungRepository.save(tb) đổi trạng thái về
                // HOAT_DONG tại đây!

                // Tạo chi tiết thu hồi
                ChiTietThuHoiPhanCung ct = new ChiTietThuHoiPhanCung();
                ct.setPhieuThuHoiTaiSan(savedPhieu);
                ct.setDanhSachThietBiPhanCungId(cp.getDanhSachThietBiPhanCungId());
                ct.setChiTietCapPhatPhanCung(cp);
                ct.setTinhTrangLucThuHoi(rq.getTinhTrangLucThuHoi());
                ct.setPhuKienThuHoi(rq.getPhuKienThuHoi());
                ct.setGhiChu(rq.getGhiChu());
                chiTietThuHoiPhanCungRepository.save(ct);
            }
        }

        // 2. Lưu phần mềm
        if (request.getDanhSachPhanMem() != null) {
            for (ChiTietThuHoiPhanMemRequest rq : request.getDanhSachPhanMem()) {
                ChiTietCapPhatPhanMem cp = chiTietCapPhatPhanMemRepository.findById(rq.getChiTietCapPhatPhanMemId())
                        .orElseThrow(() -> new NghiepVuException(
                                "Không tìm thấy chi tiết cấp phát phần mềm ID " + rq.getChiTietCapPhatPhanMemId(),
                                400));

                if (cp.getThoiGianXoa() != null) {
                    throw new NghiepVuException("Chi tiết cấp phát phần mềm ID " + rq.getChiTietCapPhatPhanMemId()
                            + " đã bị thu hồi hoặc xóa bỏ trước đó", 400);
                }

                // Xóa mềm chi tiết cấp phát
                cp.setThoiGianXoa(LocalDateTime.now());
                cp.setLyDoXoa("Thu hồi tài sản (Chờ hoàn thành)");
                chiTietCapPhatPhanMemRepository.save(cp);

                // ĐÃ SỬA: BỎ đoạn thietBiPhanMemRepository.save(tb) đổi trạng thái về HOAT_DONG
                // tại đây!

                // Tạo chi tiết thu hồi
                ChiTietThuHoiPhanMem ct = new ChiTietThuHoiPhanMem();
                ct.setPhieuThuHoiTaiSan(savedPhieu);
                ct.setDanhSachThietBiPhanMemId(cp.getDanhSachThietBiPhanMemId());
                ct.setChiTietCapPhatPhanMem(cp);
                ct.setThoiGianThuHoi(LocalDateTime.now());
                ct.setGhiChu(rq.getGhiChu());
                chiTietThuHoiPhanMemRepository.save(ct);
            }
        }

        // 3. Lưu linh kiện
        if (request.getDanhSachLinhKien() != null) {
            for (ChiTietThuHoiLinhKienRequest rq : request.getDanhSachLinhKien()) {
                ChiTietCapPhatLinhKien cp = chiTietCapPhatLinhKienRepository.findById(rq.getChiTietCapPhatLinhKienId())
                        .orElseThrow(() -> new NghiepVuException(
                                "Không tìm thấy chi tiết cấp phát linh kiện ID " + rq.getChiTietCapPhatLinhKienId(),
                                400));

                if (cp.getThoiGianXoa() != null) {
                    throw new NghiepVuException("Chi tiết cấp phát linh kiện ID " + rq.getChiTietCapPhatLinhKienId()
                            + " đã bị thu hồi hoặc xóa bỏ trước đó", 400);
                }

                // Xóa mềm chi tiết cấp phát
                cp.setThoiGianXoa(LocalDateTime.now());
                cp.setLyDoXoa("Thu hồi tài sản (Chờ hoàn thành)");
                chiTietCapPhatLinhKienRepository.save(cp);

                // ĐÃ SỬA: BỎ đoạn linhKienPhanCungRepository.save(lk) đổi trạng thái về
                // HOAT_DONG tại đây!

                // Tạo chi tiết thu hồi
                ChiTietThuHoiLinhKien ct = new ChiTietThuHoiLinhKien();
                ct.setPhieuThuHoiTaiSan(savedPhieu);
                ct.setLinhKienPhanCungId(cp.getLinhKienPhanCungId());
                ct.setChiTietCapPhatLinhKien(cp);
                ct.setTinhTrangThuHoi(rq.getTinhTrangThuHoi());
                ct.setGhiChu(rq.getGhiChu());
                chiTietThuHoiLinhKienRepository.save(ct);
            }
        }

        return mapToResponse(savedPhieu, true);
    }

    @Override
    @Transactional
    public PhieuThuHoiTaiSanResponse capNhat(Long id, PhieuThuHoiTaiSanRequest request) {
        Long tenantId = getRequiredTenantId();
        PhieuThuHoiTaiSan phieu = phieuThuHoiTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy phiếu thu hồi tài sản cần chỉnh sửa", 404));

        if (phieu.getTrangThai() != TrangThaiPhieuEnum.TAO_MOI) {
            throw new NghiepVuException("Chỉ được chỉnh sửa phiếu thu hồi tài sản ở trạng thái Tạo mới (TAO_MOI)", 400);
        }

        validateRequestHasAtLeastOneItem(request);

        phieu.setIdNhanVienTra(request.getIdNhanVienTra());
        phieu.setIdPhongBanTra(request.getIdPhongBanTra());
        phieu.setLyDoThuHoi(request.getLyDoThuHoi());

        // 1. Cập nhật phần cứng
        List<ChiTietThuHoiPhanCung> oldPcList = chiTietThuHoiPhanCungRepository
                .findByPhieuThuHoiTaiSanIdAndThoiGianXoaIsNull(id);
        List<ChiTietThuHoiPhanCungRequest> newPcReqList = request.getDanhSachPhanCung() != null
                ? request.getDanhSachPhanCung()
                : new ArrayList<>();
        Map<Long, ChiTietThuHoiPhanCung> oldPcMap = oldPcList.stream()
                .filter(x -> x.getChiTietCapPhatPhanCung() != null)
                .collect(Collectors.toMap(x -> x.getChiTietCapPhatPhanCung().getId(), x -> x));

        Set<Long> newPcIds = newPcReqList.stream().map(ChiTietThuHoiPhanCungRequest::getChiTietCapPhatPhanCungId)
                .collect(Collectors.toSet());

        for (ChiTietThuHoiPhanCung oldPc : oldPcList) {
            if (oldPc.getChiTietCapPhatPhanCung() != null) {
                Long cpId = oldPc.getChiTietCapPhatPhanCung().getId();
                if (!newPcIds.contains(cpId)) {
                    // Khôi phục chi tiết cấp phát về hoạt động lại
                    ChiTietCapPhatPhanCung cp = oldPc.getChiTietCapPhatPhanCung();
                    cp.setThoiGianXoa(null);
                    cp.setLyDoXoa(null);
                    chiTietCapPhatPhanCungRepository.save(cp);

                    // ĐÃ SỬA: BỎ khâu chọc trạng thái thiết bị vật lý tại đây vì lúc tạo mới nó
                    // chưa bị đổi!

                    chiTietThuHoiPhanCungRepository.delete(oldPc);
                }
            }
        }

        for (ChiTietThuHoiPhanCungRequest rq : newPcReqList) {
            ChiTietThuHoiPhanCung oldPc = oldPcMap.get(rq.getChiTietCapPhatPhanCungId());
            if (oldPc != null) {
                oldPc.setTinhTrangLucThuHoi(rq.getTinhTrangLucThuHoi());
                oldPc.setPhuKienThuHoi(rq.getPhuKienThuHoi());
                oldPc.setGhiChu(rq.getGhiChu());
                chiTietThuHoiPhanCungRepository.save(oldPc);
            } else {
                ChiTietCapPhatPhanCung cp = chiTietCapPhatPhanCungRepository.findById(rq.getChiTietCapPhatPhanCungId())
                        .orElseThrow(() -> new NghiepVuException(
                                "Không tìm thấy chi tiết cấp phát phần cứng ID " + rq.getChiTietCapPhatPhanCungId(),
                                400));

                cp.setThoiGianXoa(LocalDateTime.now());
                cp.setLyDoXoa("Thu hồi tài sản (Chờ hoàn thành)");
                chiTietCapPhatPhanCungRepository.save(cp);

                // ĐÃ SỬA: Tuyệt đối không chạm vào thiết bị vật lý khi lưu sửa đổi

                ChiTietThuHoiPhanCung ct = new ChiTietThuHoiPhanCung();
                ct.setPhieuThuHoiTaiSan(phieu);
                ct.setDanhSachThietBiPhanCungId(cp.getDanhSachThietBiPhanCungId());
                ct.setChiTietCapPhatPhanCung(cp);
                ct.setTinhTrangLucThuHoi(rq.getTinhTrangLucThuHoi());
                ct.setPhuKienThuHoi(rq.getPhuKienThuHoi());
                ct.setGhiChu(rq.getGhiChu());
                chiTietThuHoiPhanCungRepository.save(ct);
            }
        }

        // 2. Cập nhật phần mềm (Áp dụng sửa tương tự mảng phần cứng)
        List<ChiTietThuHoiPhanMem> oldPmList = chiTietThuHoiPhanMemRepository
                .findByPhieuThuHoiTaiSanIdAndThoiGianXoaIsNull(id);
        List<ChiTietThuHoiPhanMemRequest> newPmReqList = request.getDanhSachPhanMem() != null
                ? request.getDanhSachPhanMem()
                : new ArrayList<>();
        Map<Long, ChiTietThuHoiPhanMem> oldPmMap = oldPmList.stream()
                .filter(x -> x.getChiTietCapPhatPhanMem() != null)
                .collect(Collectors.toMap(x -> x.getChiTietCapPhatPhanMem().getId(), x -> x));

        Set<Long> newPmIds = newPmReqList.stream().map(ChiTietThuHoiPhanMemRequest::getChiTietCapPhatPhanMemId)
                .collect(Collectors.toSet());

        for (ChiTietThuHoiPhanMem oldPm : oldPmList) {
            if (oldPm.getChiTietCapPhatPhanMem() != null) {
                Long cpId = oldPm.getChiTietCapPhatPhanMem().getId();
                if (!newPmIds.contains(cpId)) {
                    ChiTietCapPhatPhanMem cp = oldPm.getChiTietCapPhatPhanMem();
                    cp.setThoiGianXoa(null);
                    cp.setLyDoXoa(null);
                    chiTietCapPhatPhanMemRepository.save(cp);
                    chiTietThuHoiPhanMemRepository.delete(oldPm);
                }
            }
        }

        for (ChiTietThuHoiPhanMemRequest rq : newPmReqList) {
            ChiTietThuHoiPhanMem oldPm = oldPmMap.get(rq.getChiTietCapPhatPhanMemId());
            if (oldPm != null) {
                oldPm.setGhiChu(rq.getGhiChu());
                chiTietThuHoiPhanMemRepository.save(oldPm);
            } else {
                ChiTietCapPhatPhanMem cp = chiTietCapPhatPhanMemRepository.findById(rq.getChiTietCapPhatPhanMemId())
                        .orElseThrow(() -> new NghiepVuException(
                                "Không tìm thấy chi tiết cấp phát phần mềm ID " + rq.getChiTietCapPhatPhanMemId(),
                                400));

                cp.setThoiGianXoa(LocalDateTime.now());
                cp.setLyDoXoa("Thu hồi tài sản (Chờ hoàn thành)");
                chiTietCapPhatPhanMemRepository.save(cp);

                ChiTietThuHoiPhanMem ct = new ChiTietThuHoiPhanMem();
                ct.setPhieuThuHoiTaiSan(phieu);
                ct.setDanhSachThietBiPhanMemId(cp.getDanhSachThietBiPhanMemId());
                ct.setChiTietCapPhatPhanMem(cp);
                ct.setThoiGianThuHoi(LocalDateTime.now());
                ct.setGhiChu(rq.getGhiChu());
                chiTietThuHoiPhanMemRepository.save(ct);
            }
        }

        // 3. Cập nhật linh kiện (Áp dụng sửa tương tự)
        List<ChiTietThuHoiLinhKien> oldLkList = chiTietThuHoiLinhKienRepository
                .findByPhieuThuHoiTaiSanIdAndThoiGianXoaIsNull(id);
        List<ChiTietThuHoiLinhKienRequest> newLkReqList = request.getDanhSachLinhKien() != null
                ? request.getDanhSachLinhKien()
                : new ArrayList<>();
        Map<Long, ChiTietThuHoiLinhKien> oldLkMap = oldLkList.stream()
                .filter(x -> x.getChiTietCapPhatLinhKien() != null)
                .collect(Collectors.toMap(x -> x.getChiTietCapPhatLinhKien().getId(), x -> x));

        Set<Long> newLkIds = newLkReqList.stream().map(ChiTietThuHoiLinhKienRequest::getChiTietCapPhatLinhKienId)
                .collect(Collectors.toSet());

        for (ChiTietThuHoiLinhKien oldLk : oldLkList) {
            if (oldLk.getChiTietCapPhatLinhKien() != null) {
                Long cpId = oldLk.getChiTietCapPhatLinhKien().getId();
                if (!newLkIds.contains(cpId)) {
                    ChiTietCapPhatLinhKien cp = oldLk.getChiTietCapPhatLinhKien();
                    cp.setThoiGianXoa(null);
                    cp.setLyDoXoa(null);
                    chiTietCapPhatLinhKienRepository.save(cp);
                    chiTietThuHoiLinhKienRepository.delete(oldLk);
                }
            }
        }

        for (ChiTietThuHoiLinhKienRequest rq : newLkReqList) {
            ChiTietThuHoiLinhKien oldLk = oldLkMap.get(rq.getChiTietCapPhatLinhKienId());
            if (oldLk != null) {
                oldLk.setTinhTrangThuHoi(rq.getTinhTrangThuHoi());
                oldLk.setGhiChu(rq.getGhiChu());
                chiTietThuHoiLinhKienRepository.save(oldLk);
            } else {
                ChiTietCapPhatLinhKien cp = chiTietCapPhatLinhKienRepository.findById(rq.getChiTietCapPhatLinhKienId())
                        .orElseThrow(() -> new NghiepVuException(
                                "Không tìm thấy chi tiết cấp phát linh kiện ID " + rq.getChiTietCapPhatLinhKienId(),
                                400));

                cp.setThoiGianXoa(LocalDateTime.now());
                cp.setLyDoXoa("Thu hồi tài sản (Chờ hoàn thành)");
                chiTietCapPhatLinhKienRepository.save(cp);

                ChiTietThuHoiLinhKien ct = new ChiTietThuHoiLinhKien();
                ct.setPhieuThuHoiTaiSan(phieu);
                ct.setLinhKienPhanCungId(cp.getLinhKienPhanCungId());
                ct.setChiTietCapPhatLinhKien(cp);
                ct.setTinhTrangThuHoi(rq.getTinhTrangThuHoi());
                ct.setGhiChu(rq.getGhiChu());
                chiTietThuHoiLinhKienRepository.save(ct);
            }
        }

        PhieuThuHoiTaiSan saved = phieuThuHoiTaiSanRepository.save(phieu);
        return mapToResponse(saved, true);
    }

    @Override
    @Transactional
    public void xoaMem(Long id) {
        Long tenantId = getRequiredTenantId();
        PhieuThuHoiTaiSan phieu = phieuThuHoiTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                .orElseThrow(() -> new NghiepVuException(
                        "Không tìm thấy phiếu thu hồi tài sản ID " + id + " trong đơn vị để xóa", 404));

        if (phieu.getTrangThai() == TrangThaiPhieuEnum.DA_PHE_DUYET
                || phieu.getTrangThai() == TrangThaiPhieuEnum.HOAN_THANH) {
            throw new NghiepVuException(
                    "Không được phép xóa phiếu thu hồi đã được phê duyệt hoặc đã hoàn tất thu hồi", 400);
        }

        phieu.setThoiGianXoa(LocalDateTime.now());
        phieu.setLyDoXoa("Người dùng hủy yêu cầu / Yêu cầu không được phê duyệt");
        phieuThuHoiTaiSanRepository.save(phieu);

        // 1. Phục hồi phần cứng
        List<ChiTietThuHoiPhanCung> pcList = chiTietThuHoiPhanCungRepository
                .findByPhieuThuHoiTaiSanIdAndThoiGianXoaIsNull(id);
        for (ChiTietThuHoiPhanCung pc : pcList) {
            pc.setThoiGianXoa(LocalDateTime.now());
            pc.setLyDoXoa("Xóa phiếu thu hồi tài sản");
            chiTietThuHoiPhanCungRepository.save(pc);

            if (pc.getChiTietCapPhatPhanCung() != null) {
                ChiTietCapPhatPhanCung cp = pc.getChiTietCapPhatPhanCung();
                cp.setThoiGianXoa(null);
                cp.setLyDoXoa(null);
                chiTietCapPhatPhanCungRepository.save(cp);

                // if (cp.getDanhSachThietBiPhanCungId() != null) {
                //     thietBiPhanCungRepository.findById(cp.getDanhSachThietBiPhanCungId()).ifPresent(tb -> {
                //         tb.setTrangThai(TrangThaiVanHanhEnum.CAP_PHAT);
                //         thietBiPhanCungRepository.save(tb);
                //     });
                // }
            }
        }

        // 2. Phục hồi phần mềm
        List<ChiTietThuHoiPhanMem> pmList = chiTietThuHoiPhanMemRepository
                .findByPhieuThuHoiTaiSanIdAndThoiGianXoaIsNull(id);
        for (ChiTietThuHoiPhanMem pm : pmList) {
            pm.setThoiGianXoa(LocalDateTime.now());
            pm.setLyDoXoa("Xóa phiếu thu hồi tài sản");
            chiTietThuHoiPhanMemRepository.save(pm);

            if (pm.getChiTietCapPhatPhanMem() != null) {
                ChiTietCapPhatPhanMem cp = pm.getChiTietCapPhatPhanMem();
                cp.setThoiGianXoa(null);
                cp.setLyDoXoa(null);
                chiTietCapPhatPhanMemRepository.save(cp);

                // if (cp.getDanhSachThietBiPhanMemId() != null) {
                //     thietBiPhanMemRepository.findById(cp.getDanhSachThietBiPhanMemId()).ifPresent(tb -> {
                //         tb.setTrangThai(TrangThaiVanHanhEnum.CAP_PHAT);
                //         thietBiPhanMemRepository.save(tb);
                //     });
                // }
            }
        }

        // 3. Phục hồi linh kiện
        List<ChiTietThuHoiLinhKien> lkList = chiTietThuHoiLinhKienRepository
                .findByPhieuThuHoiTaiSanIdAndThoiGianXoaIsNull(id);
        for (ChiTietThuHoiLinhKien lk : lkList) {
            lk.setThoiGianXoa(LocalDateTime.now());
            lk.setLyDoXoa("Xóa phiếu thu hồi tài sản");
            chiTietThuHoiLinhKienRepository.save(lk);

            if (lk.getChiTietCapPhatLinhKien() != null) {
                ChiTietCapPhatLinhKien cp = lk.getChiTietCapPhatLinhKien();
                cp.setThoiGianXoa(null);
                cp.setLyDoXoa(null);
                chiTietCapPhatLinhKienRepository.save(cp);

                // if (cp.getLinhKienPhanCungId() != null) {
                //     linhKienPhanCungRepository.findById(cp.getLinhKienPhanCungId()).ifPresent(lkEntity -> {
                //         lkEntity.setTrangThai(TrangThaiVanHanhEnum.CAP_PHAT);
                //         linhKienPhanCungRepository.save(lkEntity);
                //     });
                // }
            }
        }
    }

    @Override
    @Transactional
    public void yeuCauPheDuyet(Long id) {
        Long tenantId = getRequiredTenantId();
        PhieuThuHoiTaiSan phieu = phieuThuHoiTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy phiếu thu hồi tài sản ID " + id, 404));

        if (!phieu.getTrangThai().canTransitionTo(TrangThaiPhieuEnum.GUI_PHE_DUYET)) {
            throw new NghiepVuException(
                    "Không thể gửi yêu cầu phê duyệt phiếu thu hồi ở trạng thái: " + phieu.getTrangThai().getMoTa(),
                    400);
        }

        phieu.setTrangThai(TrangThaiPhieuEnum.GUI_PHE_DUYET);
        phieuThuHoiTaiSanRepository.save(phieu);
    }

    @Override
    @Transactional
    public void pheDuyet(Long id) {
        Long tenantId = getRequiredTenantId();
        Long userId = getCurrentUserId();

        PhieuThuHoiTaiSan phieu = phieuThuHoiTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy phiếu thu hồi tài sản ID " + id, 404));

        if (!phieu.getTrangThai().canTransitionTo(TrangThaiPhieuEnum.DA_PHE_DUYET)) {
            throw new NghiepVuException(
                    "Không thể phê duyệt phiếu thu hồi ở trạng thái: " + phieu.getTrangThai().getMoTa(), 400);
        }

        phieu.setTrangThai(TrangThaiPhieuEnum.DA_PHE_DUYET);
        phieu.setIdNguoiPheDuyet(userId);
        phieuThuHoiTaiSanRepository.save(phieu);
    }

    @Override
    @Transactional
    public void hoanThanh(Long id) {
        Long tenantId = getRequiredTenantId();

        PhieuThuHoiTaiSan phieu = phieuThuHoiTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy phiếu thu hồi tài sản ID " + id, 404));

        if (!phieu.getTrangThai().canTransitionTo(TrangThaiPhieuEnum.HOAN_THANH)) {
            throw new NghiepVuException(
                    "Không thể hoàn thành phiếu thu hồi ở trạng thái: " + phieu.getTrangThai().getMoTa(), 400);
        }

        // ĐÃ ĐỘ: Kích hoạt cập nhật trạng thái thiết bị vật lý về kho khi thủ kho nhận
        // thiết bị thành công!

        // 1. Giải phóng thiết bị phần cứng về HOAT_DONG
        List<ChiTietThuHoiPhanCung> pcList = chiTietThuHoiPhanCungRepository
                .findByPhieuThuHoiTaiSanIdAndThoiGianXoaIsNull(id);
        for (ChiTietThuHoiPhanCung pc : pcList) {
            if (pc.getDanhSachThietBiPhanCungId() != null) {
                thietBiPhanCungRepository.findById(pc.getDanhSachThietBiPhanCungId()).ifPresent(tb -> {
                    tb.setTrangThai(TrangThaiVanHanhEnum.HOAT_DONG); // Quay về trạng thái sẵn sàng trong kho tĩnh
                    thietBiPhanCungRepository.save(tb);
                });
            }
        }

        // 2. Giải phóng license phần mềm về HOAT_DONG
        List<ChiTietThuHoiPhanMem> pmList = chiTietThuHoiPhanMemRepository
                .findByPhieuThuHoiTaiSanIdAndThoiGianXoaIsNull(id);
        for (ChiTietThuHoiPhanMem pm : pmList) {
            if (pm.getDanhSachThietBiPhanMemId() != null) {
                thietBiPhanMemRepository.findById(pm.getDanhSachThietBiPhanMemId()).ifPresent(tb -> {
                    tb.setTrangThai(TrangThaiVanHanhEnum.HOAT_DONG);
                    thietBiPhanMemRepository.save(tb);
                });
            }
        }

        // 3. Giải phóng linh kiện phần cứng về HOAT_DONG
        List<ChiTietThuHoiLinhKien> lkList = chiTietThuHoiLinhKienRepository
                .findByPhieuThuHoiTaiSanIdAndThoiGianXoaIsNull(id);
        for (ChiTietThuHoiLinhKien lk : lkList) {
            if (lk.getLinhKienPhanCungId() != null) {
                linhKienPhanCungRepository.findById(lk.getLinhKienPhanCungId()).ifPresent(lkEntity -> {
                    lkEntity.setTrangThai(TrangThaiVanHanhEnum.HOAT_DONG);
                    linhKienPhanCungRepository.save(lkEntity);
                });
            }
        }

        // Cập nhật chốt thông tin phiếu thu hồi tài sản
        phieu.setTrangThai(TrangThaiPhieuEnum.HOAN_THANH);
        phieu.setThoiGianThuHoi(LocalDateTime.now());
        phieuThuHoiTaiSanRepository.save(phieu);
    }

    private void validateRequestHasAtLeastOneItem(PhieuThuHoiTaiSanRequest request) {
        int totalSize = 0;
        if (request.getDanhSachPhanCung() != null) {
            totalSize += request.getDanhSachPhanCung().size();
        }
        if (request.getDanhSachPhanMem() != null) {
            totalSize += request.getDanhSachPhanMem().size();
        }
        if (request.getDanhSachLinhKien() != null) {
            totalSize += request.getDanhSachLinhKien().size();
        }

        if (totalSize == 0) {
            throw new NghiepVuException(
                    "Phiếu thu hồi phải chứa ít nhất 1 tài sản (thiết bị phần cứng, phần mềm, hoặc linh kiện)", 400);
        }
    }

    // hàm này dùng cho mapping danh sách tránh n + 1 query
    private List<PhieuThuHoiTaiSanResponse> mapToResponseList(List<PhieuThuHoiTaiSan> phieuList) {
        if (phieuList.isEmpty())
            return new ArrayList<>();

        Set<Long> userIds = new java.util.HashSet<>();
        Set<Long> deptIds = new java.util.HashSet<>();

        for (PhieuThuHoiTaiSan p : phieuList) {
            if (p.getIdNhanVienTra() != null)
                userIds.add(p.getIdNhanVienTra());
            if (p.getIdNguoiLap() != null)
                userIds.add(p.getIdNguoiLap());
            if (p.getIdNguoiPheDuyet() != null)
                userIds.add(p.getIdNguoiPheDuyet());
            if (p.getIdPhongBanTra() != null)
                deptIds.add(p.getIdPhongBanTra());
        }

        Map<Long, String> userMap = nguoiDungRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(NguoiDung::getId, this::getHoTenNguoiDung));

        Map<Long, String> deptMap = phongBanRepository.findAllById(deptIds).stream()
                .collect(Collectors.toMap(PhongBan::getId, PhongBan::getTenPhongBan));

        List<PhieuThuHoiTaiSanResponse> responses = new ArrayList<>();
        for (PhieuThuHoiTaiSan phieu : phieuList) {
            PhieuThuHoiTaiSanResponse res = PhieuThuHoiTaiSanResponse.builder()
                    .id(phieu.getId())
                    .idDonVi(phieu.getIdDonVi())
                    .maPhieuThuHoi(phieu.getMaPhieuThuHoi())
                    .idNhanVienTra(phieu.getIdNhanVienTra())
                    .tenNhanVienTra(userMap.get(phieu.getIdNhanVienTra()))
                    .idPhongBanTra(phieu.getIdPhongBanTra())
                    .tenPhongBanTra(deptMap.get(phieu.getIdPhongBanTra()))
                    .tenNguoiLap(userMap.get(phieu.getIdNguoiLap()))
                    .tenNguoiPheDuyet(userMap.get(phieu.getIdNguoiPheDuyet()))
                    .lyDoThuHoi(phieu.getLyDoThuHoi())
                    .thoiGianThuHoi(phieu.getThoiGianThuHoi())
                    .trangThai(phieu.getTrangThai() != null ? phieu.getTrangThai().getValue() : null)
                    .thoiGianTao(phieu.getThoiGianTao())
                    .thoiGianCapNhat(phieu.getThoiGianCapNhat())
                    .chiTietTaiSan(new ArrayList<>())
                    .build();
            responses.add(res);
        }
        return responses;
    }

    private PhieuThuHoiTaiSanResponse mapToResponse(PhieuThuHoiTaiSan phieu, boolean includeDetails) {
        String tenNhanVienTra = null;
        if (phieu.getIdNhanVienTra() != null) {
            tenNhanVienTra = nguoiDungRepository.findById(phieu.getIdNhanVienTra())
                    .map(this::getHoTenNguoiDung)
                    .orElse(null);
        }

        String tenPhongBanTra = null;
        if (phieu.getIdPhongBanTra() != null) {
            tenPhongBanTra = phongBanRepository.findById(phieu.getIdPhongBanTra())
                    .map(PhongBan::getTenPhongBan)
                    .orElse(null);
        }

        String tenNguoiLap = null;
        if (phieu.getIdNguoiLap() != null) {
            tenNguoiLap = nguoiDungRepository.findById(phieu.getIdNguoiLap())
                    .map(this::getHoTenNguoiDung)
                    .orElse(null);
        }

        String tenNguoiPheDuyet = null;
        if (phieu.getIdNguoiPheDuyet() != null) {
            tenNguoiPheDuyet = nguoiDungRepository.findById(phieu.getIdNguoiPheDuyet())
                    .map(this::getHoTenNguoiDung)
                    .orElse(null);
        }

        List<ChiTietThuHoiGeneralResponse> chiTietTaiSan = new ArrayList<>();

        if (includeDetails) {
            // 1. Map phan cung
            List<ChiTietThuHoiPhanCung> pcDetails = chiTietThuHoiPhanCungRepository
                    .findByPhieuThuHoiTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
            for (ChiTietThuHoiPhanCung pc : pcDetails) {
                String tenThietBi = "";
                String soSerial = "";
                String maThe = "";
                if (pc.getDanhSachThietBiPhanCungId() != null) {
                    DanhSachThietBiPhanCung tb = thietBiPhanCungRepository.findById(pc.getDanhSachThietBiPhanCungId())
                            .orElse(null);
                    if (tb != null) {
                        soSerial = tb.getSoSerial();
                        maThe = tb.getMaTheTaiSan();
                        if (tb.getTaiSanPhanCung() != null) {
                            tenThietBi = tb.getTaiSanPhanCung().getTenMau();
                        }
                    }
                }
                chiTietTaiSan.add(ChiTietThuHoiGeneralResponse.builder()
                        .id(pc.getId())
                        .idChiTietCapPhat(pc.getChiTietCapPhatPhanCung() != null ? pc.getChiTietCapPhatPhanCung().getId() : null)
                        .idTaiSan(pc.getDanhSachThietBiPhanCungId())
                        .tenTaiSan(tenThietBi)
                        .soSerial(soSerial)
                        .maTheTaiSan(maThe)
                        .tinhTrangLucThuHoi(pc.getTinhTrangLucThuHoi())
                        .phuKienThuHoi(pc.getPhuKienThuHoi())
                        .thoiGianThuHoi(null)
                        .ghiChu(pc.getGhiChu())
                        .loai("PHAN_CUNG")
                        .build());
            }

            // 2. Map phan mem
            List<ChiTietThuHoiPhanMem> pmDetails = chiTietThuHoiPhanMemRepository
                    .findByPhieuThuHoiTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
            for (ChiTietThuHoiPhanMem pm : pmDetails) {
                String tenPhanMem = "";
                String keyBanQuyen = "";
                if (pm.getDanhSachThietBiPhanMemId() != null) {
                    DanhSachThietBiPhanMem tb = thietBiPhanMemRepository.findById(pm.getDanhSachThietBiPhanMemId())
                            .orElse(null);
                    if (tb != null) {
                        keyBanQuyen = tb.getKeyBanQuyen();
                        if (tb.getTaiSanPhanMem() != null) {
                            tenPhanMem = tb.getTaiSanPhanMem().getTenMau();
                        }
                    }
                }
                chiTietTaiSan.add(ChiTietThuHoiGeneralResponse.builder()
                        .id(pm.getId())
                        .idChiTietCapPhat(pm.getChiTietCapPhatPhanMem() != null ? pm.getChiTietCapPhatPhanMem().getId() : null)
                        .idTaiSan(pm.getDanhSachThietBiPhanMemId())
                        .tenTaiSan(tenPhanMem)
                        .soSerial(null)
                        .maTheTaiSan(keyBanQuyen)
                        .tinhTrangLucThuHoi(null)
                        .phuKienThuHoi(null)
                        .thoiGianThuHoi(pm.getThoiGianThuHoi())
                        .ghiChu(pm.getGhiChu())
                        .loai("PHAN_MEM")
                        .build());
            }

            // 3. Map linh kien
            List<ChiTietThuHoiLinhKien> lkDetails = chiTietThuHoiLinhKienRepository
                    .findByPhieuThuHoiTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
            for (ChiTietThuHoiLinhKien lk : lkDetails) {
                String tenLinhKien = "";
                String soSerial = "";
                if (lk.getLinhKienPhanCungId() != null) {
                    LinhKienPhanCung lkEntity = linhKienPhanCungRepository.findById(lk.getLinhKienPhanCungId())
                            .orElse(null);
                    if (lkEntity != null) {
                        soSerial = lkEntity.getSoSerial();
                        if (lkEntity.getTaiSanPhanCung() != null) {
                            tenLinhKien = lkEntity.getTaiSanPhanCung().getTenMau();
                        }
                    }
                }
                chiTietTaiSan.add(ChiTietThuHoiGeneralResponse.builder()
                        .id(lk.getId())
                        .idChiTietCapPhat(lk.getChiTietCapPhatLinhKien() != null ? lk.getChiTietCapPhatLinhKien().getId() : null)
                        .idTaiSan(lk.getLinhKienPhanCungId())
                        .tenTaiSan(tenLinhKien)
                        .soSerial(soSerial)
                        .maTheTaiSan(null)
                        .tinhTrangLucThuHoi(lk.getTinhTrangThuHoi())
                        .phuKienThuHoi(null)
                        .thoiGianThuHoi(null)
                        .ghiChu(lk.getGhiChu())
                        .loai("LINH_KIEN")
                        .build());
            }
        }

        return PhieuThuHoiTaiSanResponse.builder()
                .id(phieu.getId())
                .idDonVi(phieu.getIdDonVi())
                .maPhieuThuHoi(phieu.getMaPhieuThuHoi())
                .idNhanVienTra(phieu.getIdNhanVienTra())
                .tenNhanVienTra(tenNhanVienTra)
                .idPhongBanTra(phieu.getIdPhongBanTra())
                .tenPhongBanTra(tenPhongBanTra)
                .tenNguoiLap(tenNguoiLap)
                .tenNguoiPheDuyet(tenNguoiPheDuyet)
                .lyDoThuHoi(phieu.getLyDoThuHoi())
                .thoiGianThuHoi(phieu.getThoiGianThuHoi())
                .trangThai(phieu.getTrangThai() != null ? phieu.getTrangThai().getValue() : null)
                .chiTietTaiSan(chiTietTaiSan)
                .thoiGianTao(phieu.getThoiGianTao())
                .thoiGianCapNhat(phieu.getThoiGianCapNhat())
                .build();
    }

    private Long getRequiredTenantId() {
        Long tenantId = DonViContextHolder.getTenantId();
        if (tenantId == null) {
            throw new NghiepVuException("Không tìm thấy thông tin đơn vị từ phiên làm việc", 403);
        }
        return tenantId;
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof NguoiDungUserDetails userDetails) {
            return userDetails.getNguoiDung().getId();
        }
        throw new NghiepVuException("Không tìm thấy thông tin người dùng từ phiên làm việc", 401);
    }

    private String getHoTenNguoiDung(NguoiDung nd) {
        if (nd == null)
            return null;
        StringBuilder sb = new StringBuilder();
        if (nd.getHoNguoiDung() != null)
            sb.append(nd.getHoNguoiDung().trim()).append(" ");
        if (nd.getTenDemNguoiDung() != null)
            sb.append(nd.getTenDemNguoiDung().trim()).append(" ");
        if (nd.getTenNguoiDung() != null)
            sb.append(nd.getTenNguoiDung().trim());
        return sb.toString().trim();
    }
}
