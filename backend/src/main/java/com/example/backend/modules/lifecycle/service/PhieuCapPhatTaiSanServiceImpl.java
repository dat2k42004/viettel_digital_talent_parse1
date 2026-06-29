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
import com.example.backend.modules.lifecycle.service.interfaces.PhieuCapPhatTaiSanService;
import com.example.backend.modules.tenant.model.PhongBan;
import com.example.backend.modules.tenant.repository.PhongBanRepository;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.model.TrangThaiPhieuEnum;
import com.example.backend.shared.model.TrangThaiVanHanhEnum;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.tenant.DonViContextHolder;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhieuCapPhatTaiSanServiceImpl implements PhieuCapPhatTaiSanService {

    private final PhieuCapPhatTaiSanRepository phieuCapPhatTaiSanRepository;
    private final ChiTietCapPhatPhanCungRepository chiTietCapPhatPhanCungRepository;
    private final ChiTietCapPhatPhanMemRepository chiTietCapPhatPhanMemRepository;
    private final ChiTietCapPhatLinhKienRepository chiTietCapPhatLinhKienRepository;

    private final ChiTietThuHoiPhanCungRepository chiTietThuHoiPhanCungRepository;
    private final ChiTietThuHoiPhanMemRepository chiTietThuHoiPhanMemRepository;
    private final ChiTietThuHoiLinhKienRepository chiTietThuHoiLinhKienRepository;

    private final DanhSachThietBiPhanCungRepository thietBiPhanCungRepository;
    private final DanhSachThietBiPhanMemRepository thietBiPhanMemRepository;
    private final LinhKienPhanCungRepository linhKienPhanCungRepository;

    @Autowired
    @Lazy
    private RabbitTemplate rabbitTemplate;

    private final NguoiDungRepository nguoiDungRepository;
    private final PhongBanRepository phongBanRepository;

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

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PhieuCapPhatTaiSanResponse> layDanhSach(
            String trangThai,
            Long idPhongBan,
            LocalDate tuNgayBanGiao,
            LocalDate denNgayBanGiao,
            int page,
            int size,
            String sort) {
        Long tenantId = DonViContextHolder.getTenantId();

        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        String sortBy = sortParts[0];

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<PhieuCapPhatTaiSan> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));
            if (tenantId != null) {
                predicates.add(cb.equal(root.get("idDonVi"), tenantId));
            }

            if (trangThai != null && !trangThai.trim().isEmpty()) {
                try {
                    predicates.add(cb.equal(root.get("trangThai"), TrangThaiPhieuEnum.fromValue(trangThai.trim())));
                } catch (IllegalArgumentException e) {
                    throw new NghiepVuException(e.getMessage(), 400);
                }
            }

            if (idPhongBan != null) {
                predicates.add(cb.equal(root.get("idPhongBanNhan"), idPhongBan));
            }

            if (tuNgayBanGiao != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("thoiGianBanGiao"), tuNgayBanGiao.atStartOfDay()));
            }

            if (denNgayBanGiao != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("thoiGianBanGiao"), denNgayBanGiao.atTime(23, 59, 59)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PhieuCapPhatTaiSan> pageResult = phieuCapPhatTaiSanRepository.findAll(spec, pageRequest);
        List<PhieuCapPhatTaiSanResponse> content = mapToResponseList(pageResult.getContent());
        return PageResponse.from(new PageImpl<>(content, pageRequest, pageResult.getTotalElements()));
    }

    @Override
    @Transactional(readOnly = true)
    public PhieuCapPhatTaiSanResponse layTheoId(Long id) {
        Long tenantId = getRequiredTenantId();
        PhieuCapPhatTaiSan phieu = phieuCapPhatTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy phiếu cấp phát", 404));
        return mapToResponse(phieu, true);
    }

    @Override
    @Transactional
    public PhieuCapPhatTaiSanResponse themMoi(PhieuCapPhatTaiSanRequest request) {
        Long tenantId = getRequiredTenantId();
        Long userId = getCurrentUserId();

        validateAssetPresence(request);

        PhieuCapPhatTaiSan phieu = new PhieuCapPhatTaiSan();
        phieu.setIdDonVi(tenantId);
        phieu.setIdNguoiLap(userId);
        phieu.setMaPhiepCapPhat("PCP-" + tenantId + "-" + System.currentTimeMillis());
        phieu.setIdNguoiNhan(request.getIdNguoiNhan());
        phieu.setIdPhongBanNhan(request.getIdPhongBanNhan());
        phieu.setMucDichSuDung(request.getMucDichSuDung());
        phieu.setTrangThai(TrangThaiPhieuEnum.TAO_MOI);

        phieu = phieuCapPhatTaiSanRepository.save(phieu);

        luuChiTietCuaPhieu(phieu, request, tenantId);

        return mapToResponse(phieu, true);
    }

    @Override
    @Transactional
    public PhieuCapPhatTaiSanResponse capNhat(Long id, PhieuCapPhatTaiSanRequest request) {
        Long tenantId = getRequiredTenantId();
        PhieuCapPhatTaiSan phieu = phieuCapPhatTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy phiếu cấp phát để cập nhật", 404));

        if (phieu.getTrangThai() != TrangThaiPhieuEnum.TAO_MOI) {
            throw new NghiepVuException("Chỉ được cập nhật phiếu cấp phát ở trạng thái Tạo mới", 400);
        }

        validateAssetPresence(request);

        // Khôi phục trạng thái tài sản cũ và xóa cứng chi tiết cũ
        khoiPhucTaiSanVaXoaCungChiTietCu(phieu);

        // Cập nhật thông tin cơ bản
        phieu.setIdNguoiNhan(request.getIdNguoiNhan());
        phieu.setIdPhongBanNhan(request.getIdPhongBanNhan());
        phieu.setMucDichSuDung(request.getMucDichSuDung());
        phieu = phieuCapPhatTaiSanRepository.save(phieu);

        // Lưu chi tiết mới và chuyển trạng thái tài sản mới
        luuChiTietCuaPhieu(phieu, request, tenantId);

        return mapToResponse(phieu, true);
    }

    @Override
    @Transactional
    public void xoaMem(Long id) {
        Long tenantId = getRequiredTenantId();
        PhieuCapPhatTaiSan phieu = phieuCapPhatTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy phiếu cấp phát để xóa", 404));

        if (phieu.getTrangThai() == TrangThaiPhieuEnum.DA_PHE_DUYET
                || phieu.getTrangThai() == TrangThaiPhieuEnum.HOAN_THANH) {
            throw new NghiepVuException(
                    "Không được phép xóa phiếu cấp phát đã được phê duyệt hoặc đã hoàn tất bàn giao", 400);
        }

        // Khôi phục tài sản cũ và xóa mềm chi tiết
        khoiPhucTaiSanVaXoaMemChiTietCu(phieu);

        // Xóa mềm phiếu
        phieu.setThoiGianXoa(LocalDateTime.now());
        phieu.setLyDoXoa("Người dùng hủy yêu cầu / Yêu cầu không được phê duyệt");
        phieuCapPhatTaiSanRepository.save(phieu);
    }

    @Override
    @Transactional
    public void yeuCauPheDuyet(Long id) {
        Long tenantId = getRequiredTenantId();
        PhieuCapPhatTaiSan phieu = phieuCapPhatTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy phiếu cấp phát", 404));

        if (!phieu.getTrangThai().canTransitionTo(TrangThaiPhieuEnum.GUI_PHE_DUYET)) {
            throw new NghiepVuException(
                    "Không thể gửi yêu cầu phê duyệt cho phiếu ở trạng thái: " + phieu.getTrangThai().getMoTa(), 400);
        }

        phieu.setTrangThai(TrangThaiPhieuEnum.GUI_PHE_DUYET);
        phieuCapPhatTaiSanRepository.save(phieu);
    }

    @Override
    @Transactional
    public void pheDuyet(Long id) {
        Long tenantId = getRequiredTenantId();
        Long userId = getCurrentUserId();
        PhieuCapPhatTaiSan phieu = phieuCapPhatTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy phiếu cấp phát", 404));

        if (!phieu.getTrangThai().canTransitionTo(TrangThaiPhieuEnum.DA_PHE_DUYET)) {
            throw new NghiepVuException("Không thể phê duyệt phiếu ở trạng thái: " + phieu.getTrangThai().getMoTa(),
                    400);
        }
        phieu.setTrangThai(TrangThaiPhieuEnum.DA_PHE_DUYET);
        phieu.setIdNguoiPheDuyet(userId);
        phieuCapPhatTaiSanRepository.save(phieu);
    }

    @Override
    @Transactional
    public void hoanThanh(Long id) {
        Long tenantId = getRequiredTenantId();
        PhieuCapPhatTaiSan phieu = phieuCapPhatTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy phiếu cấp phát", 404));

        if (!phieu.getTrangThai().canTransitionTo(TrangThaiPhieuEnum.HOAN_THANH)) {
            throw new NghiepVuException("Không thể hoàn thành phiếu ở trạng thái: " + phieu.getTrangThai().getMoTa(),
                    400);
        }

        phieu.setTrangThai(TrangThaiPhieuEnum.HOAN_THANH);
        phieu.setThoiGianBanGiao(LocalDateTime.now());
        phieuCapPhatTaiSanRepository.save(phieu);

        // đẩy sự kiện xuống queue để cập nhật báo cáo cấp phát
        List<ChiTietCapPhatPhanCung> pcList = chiTietCapPhatPhanCungRepository
                .findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
        for (ChiTietCapPhatPhanCung pc : pcList) {
            com.example.backend.shared.dto.BienDongCapPhatEvent eventBus = com.example.backend.shared.dto.BienDongCapPhatEvent
                    .builder()
                    .idDonVi(tenantId)
                    .idTaiSanCuThe(pc.getDanhSachThietBiPhanCungId())
                    .loaiTaiSan("PHAN_CUNG")
                    .idPhongBanCu(null) // Cấp phát mới từ kho bãi vật lý nên phòng ban cũ là null
                    .idPhongBanMoi(phieu.getIdPhongBanNhan())
                    .idNhanVienTiepNhan(phieu.getIdNguoiNhan())
                    .idChungTuGoc(phieu.getId())
                    .maChungTuGoc(phieu.getMaPhiepCapPhat())
                    .tinhTrangBanGiao(pc.getTinhTrangLucGiao() != null ? pc.getTinhTrangLucGiao() : "Bình thường")
                    .hanhDong(com.example.backend.shared.dto.HanhDongCapPhatEnum.CAP_PHAT)
                    .build();
            rabbitTemplate.convertAndSend("inventory.bien-dong-cap-phat.queue", eventBus);
        }

        // 2. Quét mảng chi tiết key bản quyền phần mềm bàn giao
        List<ChiTietCapPhatPhanMem> pmList = chiTietCapPhatPhanMemRepository
                .findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
        for (ChiTietCapPhatPhanMem pm : pmList) {
            com.example.backend.shared.dto.BienDongCapPhatEvent eventBus = com.example.backend.shared.dto.BienDongCapPhatEvent
                    .builder()
                    .idDonVi(tenantId)
                    .idTaiSanCuThe(pm.getDanhSachThietBiPhanMemId())
                    .loaiTaiSan("PHAN_MEM")
                    .idPhongBanCu(null)
                    .idPhongBanMoi(phieu.getIdPhongBanNhan())
                    .idNhanVienTiepNhan(phieu.getIdNguoiNhan())
                    .idChungTuGoc(phieu.getId())
                    .maChungTuGoc(phieu.getMaPhiepCapPhat())
                    .tinhTrangBanGiao("Kích hoạt key bản quyền")
                    .hanhDong(com.example.backend.shared.dto.HanhDongCapPhatEnum.CAP_PHAT)
                    .build();
            rabbitTemplate.convertAndSend("inventory.bien-dong-cap-phat.queue", eventBus);
        }

        // 3. Quét mảng chi tiết linh kiện rời bàn giao lắp ráp
        List<ChiTietCapPhatLinhKien> lkList = chiTietCapPhatLinhKienRepository
                .findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
        for (ChiTietCapPhatLinhKien lk : lkList) {
            com.example.backend.shared.dto.BienDongCapPhatEvent eventBus = com.example.backend.shared.dto.BienDongCapPhatEvent
                    .builder()
                    .idDonVi(tenantId)
                    .idTaiSanCuThe(lk.getLinhKienPhanCungId())
                    .loaiTaiSan("LINH_KIEN")
                    .idPhongBanCu(null)
                    .idPhongBanMoi(phieu.getIdPhongBanNhan())
                    .idNhanVienTiepNhan(phieu.getIdNguoiNhan())
                    .idChungTuGoc(phieu.getId())
                    .maChungTuGoc(phieu.getMaPhiepCapPhat())
                    .tinhTrangBanGiao(lk.getTinhTrangLucGiao() != null ? lk.getTinhTrangLucGiao() : "Bình thường")
                    .hanhDong(com.example.backend.shared.dto.HanhDongCapPhatEnum.CAP_PHAT)
                    .build();
            rabbitTemplate.convertAndSend("inventory.bien-dong-cap-phat.queue", eventBus);
        }
    }

    @Override
    @Transactional
    public void tuChoiPheDuyet(Long id, String lyDoTuChoi) {
        Long idDonVi = getRequiredTenantId();
        PhieuCapPhatTaiSan phieu = phieuCapPhatTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy phiếu cấp phát", 404));

        if (phieu.getTrangThai() != TrangThaiPhieuEnum.GUI_PHE_DUYET) {
            throw new NghiepVuException("Chỉ được từ chối phê duyệt phiếu ở trạng thái Gửi phê duyệt", 400);
        }

        phieu.setTrangThai(TrangThaiPhieuEnum.TU_CHOI);
        phieu.setLyDoTuChoi(lyDoTuChoi);
        phieuCapPhatTaiSanRepository.save(phieu);

        // Khôi phục trạng thái vận hành của các thiết bị phần cứng, phần mềm, linh kiện
        // 1. Phần cứng
        List<ChiTietCapPhatPhanCung> danhSachPhanCung = chiTietCapPhatPhanCungRepository
                .findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
        for (ChiTietCapPhatPhanCung pc : danhSachPhanCung) {
            if (pc.getDanhSachThietBiPhanCungId() != null) {
                thietBiPhanCungRepository.findById(pc.getDanhSachThietBiPhanCungId()).ifPresent(tb -> {
                    tb.setTrangThai(TrangThaiVanHanhEnum.HOAT_DONG);
                    thietBiPhanCungRepository.save(tb);
                });
            }
        }

        // 2. Phần mềm
        List<ChiTietCapPhatPhanMem> danhSachPhanMem = chiTietCapPhatPhanMemRepository
                .findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
        for (ChiTietCapPhatPhanMem pm : danhSachPhanMem) {
            if (pm.getDanhSachThietBiPhanMemId() != null) {
                thietBiPhanMemRepository.findById(pm.getDanhSachThietBiPhanMemId()).ifPresent(tb -> {
                    tb.setTrangThai(TrangThaiVanHanhEnum.HOAT_DONG);
                    thietBiPhanMemRepository.save(tb);
                });
            }
        }

        // 3. Linh kiện
        List<ChiTietCapPhatLinhKien> danhSachLinhKien = chiTietCapPhatLinhKienRepository
                .findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
        for (ChiTietCapPhatLinhKien lk : danhSachLinhKien) {
            if (lk.getLinhKienPhanCungId() != null) {
                linhKienPhanCungRepository.findById(lk.getLinhKienPhanCungId()).ifPresent(linhKien -> {
                    linhKien.setTrangThai(TrangThaiVanHanhEnum.HOAT_DONG);
                    linhKienPhanCungRepository.save(linhKien);
                });
            }
        }
    }

    private void validateAssetPresence(PhieuCapPhatTaiSanRequest request) {
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
                    "Phiếu cấp phát phải chứa ít nhất 1 tài sản (thiết bị phần cứng, phần mềm, hoặc linh kiện)", 400);
        }
    }

    private void luuChiTietCuaPhieu(PhieuCapPhatTaiSan phieu, PhieuCapPhatTaiSanRequest request, Long tenantId) {
        // 1. Luu phan cung
        if (request.getDanhSachPhanCung() != null) {
            for (ChiTietCapPhatPhanCungRequest rq : request.getDanhSachPhanCung()) {
                DanhSachThietBiPhanCung tb = thietBiPhanCungRepository
                        .findByIdAndIdDonViAndThoiGianXoaIsNull(rq.getDanhSachThietBiPhanCungId(), tenantId)
                        .orElseThrow(() -> new NghiepVuException("Không tìm thấy thiết bị phần cứng ID "
                                + rq.getDanhSachThietBiPhanCungId() + " trong đơn vị", 400));

                if (tb.getTrangThai() != TrangThaiVanHanhEnum.HOAT_DONG) {
                    throw new NghiepVuException("Thiết bị phần cứng với thẻ " + tb.getMaTheTaiSan()
                            + " không ở trạng thái sẵn sàng để cấp phát", 400);
                }

                // Chuyen trang thai thiet bi
                tb.setTrangThai(TrangThaiVanHanhEnum.CAP_PHAT);
                thietBiPhanCungRepository.save(tb);

                // Tao chi tiet cap phat
                ChiTietCapPhatPhanCung ct = new ChiTietCapPhatPhanCung();
                ct.setPhieuCapPhatTaiSan(phieu);
                ct.setDanhSachThietBiPhanCungId(tb.getId());
                if (tb.getTaiSanPhanCung() != null) {
                    ct.setTaiSanPhanCungId(tb.getTaiSanPhanCung().getId());
                }
                ct.setTinhTrangLucGiao(rq.getTinhTrangLucGiao());
                ct.setPhuKienKemTheo(rq.getPhuKienKemTheo());
                ct.setGhiChu(rq.getGhiChu());
                chiTietCapPhatPhanCungRepository.save(ct);
            }
        }

        // 2. Luu phan mem
        if (request.getDanhSachPhanMem() != null) {
            for (ChiTietCapPhatPhanMemRequest rq : request.getDanhSachPhanMem()) {
                DanhSachThietBiPhanMem tb = thietBiPhanMemRepository
                        .findByIdAndIdDonViAndThoiGianXoaIsNull(rq.getDanhSachThietBiPhanMemId(), tenantId)
                        .orElseThrow(() -> new NghiepVuException("Không tìm thấy thiết bị phần mềm ID "
                                + rq.getDanhSachThietBiPhanMemId() + " trong đơn vị", 400));

                if (tb.getTrangThai() != TrangThaiVanHanhEnum.HOAT_DONG) {
                    throw new NghiepVuException(
                            "Phần mềm với key " + tb.getKeyBanQuyen() + " không ở trạng thái sẵn sàng để cấp phát",
                            400);
                }

                // Chuyen trang thai thiet bi
                tb.setTrangThai(TrangThaiVanHanhEnum.CAP_PHAT);
                thietBiPhanMemRepository.save(tb);

                // Tao chi tiet
                ChiTietCapPhatPhanMem ct = new ChiTietCapPhatPhanMem();
                ct.setPhieuCapPhatTaiSan(phieu);
                ct.setDanhSachThietBiPhanMemId(tb.getId());
                if (tb.getTaiSanPhanMem() != null) {
                    ct.setTaiSanPhanMemId(tb.getTaiSanPhanMem().getId());
                }
                ct.setDanhSachThietBiPhanCungId(rq.getDanhSachThietBiPhanCungId());
                ct.setMaKeyKichHoat(rq.getMaKeyKichHoat());
                ct.setTrangThai(TrangThaiVanHanhEnum.CAP_PHAT);
                ct.setGhiChu(rq.getGhiChu());
                chiTietCapPhatPhanMemRepository.save(ct);
            }
        }

        // 3. Luu linh kien
        if (request.getDanhSachLinhKien() != null) {
            for (ChiTietCapPhatLinhKienRequest rq : request.getDanhSachLinhKien()) {
                LinhKienPhanCung lk = linhKienPhanCungRepository
                        .findByIdAndIdDonViAndThoiGianXoaIsNull(rq.getLinhKienPhanCungId(), tenantId)
                        .orElseThrow(() -> new NghiepVuException(
                                "Không tìm thấy linh kiện ID " + rq.getLinhKienPhanCungId() + " trong đơn vị", 400));

                if (lk.getTrangThai() != TrangThaiVanHanhEnum.HOAT_DONG) {
                    throw new NghiepVuException(
                            "Linh kiện với số serial " + lk.getSoSerial() + " không ở trạng thái sẵn sàng để cấp phát",
                            400);
                }

                // Chuyen trang thai lk
                lk.setTrangThai(TrangThaiVanHanhEnum.CAP_PHAT);
                linhKienPhanCungRepository.save(lk);

                // Tao chi tiet
                ChiTietCapPhatLinhKien ct = new ChiTietCapPhatLinhKien();
                ct.setPhieuCapPhatTaiSan(phieu);
                ct.setLinhKienPhanCungId(lk.getId());
                ct.setTaiSanPhanCungId(rq.getTaiSanPhanCungId());
                ct.setTinhTrangLucGiao(rq.getTinhTrangLucGiao());
                ct.setGhiChu(rq.getGhiChu());
                chiTietCapPhatLinhKienRepository.save(ct);
            }
        }
    }

    private void khoiPhucTaiSanVaXoaCungChiTietCu(PhieuCapPhatTaiSan phieu) {
        // 1. Khoi phuc phan cung
        List<ChiTietCapPhatPhanCung> pcList = chiTietCapPhatPhanCungRepository
                .findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
        for (ChiTietCapPhatPhanCung pc : pcList) {
            if (pc.getDanhSachThietBiPhanCungId() != null) {
                thietBiPhanCungRepository.findById(pc.getDanhSachThietBiPhanCungId()).ifPresent(tb -> {
                    tb.setTrangThai(TrangThaiVanHanhEnum.HOAT_DONG);
                    thietBiPhanCungRepository.save(tb);
                });
            }
        }
        if (!pcList.isEmpty()) {
            chiTietCapPhatPhanCungRepository.deleteAll(pcList);
        }

        // 2. Khoi phuc phan mem
        List<ChiTietCapPhatPhanMem> pmList = chiTietCapPhatPhanMemRepository
                .findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
        for (ChiTietCapPhatPhanMem pm : pmList) {
            if (pm.getDanhSachThietBiPhanMemId() != null) {
                thietBiPhanMemRepository.findById(pm.getDanhSachThietBiPhanMemId()).ifPresent(tb -> {
                    tb.setTrangThai(TrangThaiVanHanhEnum.HOAT_DONG);
                    thietBiPhanMemRepository.save(tb);
                });
            }
        }
        if (!pmList.isEmpty()) {
            chiTietCapPhatPhanMemRepository.deleteAll(pmList);
        }

        // 3. Khoi phuc linh kien
        List<ChiTietCapPhatLinhKien> lkList = chiTietCapPhatLinhKienRepository
                .findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
        for (ChiTietCapPhatLinhKien lk : lkList) {
            if (lk.getLinhKienPhanCungId() != null) {
                linhKienPhanCungRepository.findById(lk.getLinhKienPhanCungId()).ifPresent(lkEntity -> {
                    lkEntity.setTrangThai(TrangThaiVanHanhEnum.HOAT_DONG);
                    linhKienPhanCungRepository.save(lkEntity);
                });
            }
        }
        if (!lkList.isEmpty()) {
            chiTietCapPhatLinhKienRepository.deleteAll(lkList);
        }
    }

    private void khoiPhucTaiSanVaXoaMemChiTietCu(PhieuCapPhatTaiSan phieu) {
        // 1. Khoi phuc phan cung
        List<ChiTietCapPhatPhanCung> pcList = chiTietCapPhatPhanCungRepository
                .findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
        for (ChiTietCapPhatPhanCung pc : pcList) {
            if (pc.getDanhSachThietBiPhanCungId() != null) {
                thietBiPhanCungRepository.findById(pc.getDanhSachThietBiPhanCungId()).ifPresent(tb -> {
                    tb.setTrangThai(TrangThaiVanHanhEnum.HOAT_DONG);
                    thietBiPhanCungRepository.save(tb);
                });
            }
            pc.setThoiGianXoa(LocalDateTime.now());
            pc.setLyDoXoa("Xóa phiếu cấp phát");
            chiTietCapPhatPhanCungRepository.save(pc);
        }

        // 2. Khoi phuc phan mem
        List<ChiTietCapPhatPhanMem> pmList = chiTietCapPhatPhanMemRepository
                .findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
        for (ChiTietCapPhatPhanMem pm : pmList) {
            if (pm.getDanhSachThietBiPhanMemId() != null) {
                thietBiPhanMemRepository.findById(pm.getDanhSachThietBiPhanMemId()).ifPresent(tb -> {
                    tb.setTrangThai(TrangThaiVanHanhEnum.HOAT_DONG);
                    thietBiPhanMemRepository.save(tb);
                });
            }
            pm.setThoiGianXoa(LocalDateTime.now());
            pm.setLyDoXoa("Xóa phiếu cấp phát");
            chiTietCapPhatPhanMemRepository.save(pm);
        }

        // 3. Khoi phuc linh kien
        List<ChiTietCapPhatLinhKien> lkList = chiTietCapPhatLinhKienRepository
                .findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
        for (ChiTietCapPhatLinhKien lk : lkList) {
            if (lk.getLinhKienPhanCungId() != null) {
                linhKienPhanCungRepository.findById(lk.getLinhKienPhanCungId()).ifPresent(lkEntity -> {
                    lkEntity.setTrangThai(TrangThaiVanHanhEnum.HOAT_DONG);
                    linhKienPhanCungRepository.save(lkEntity);
                });
            }
            lk.setThoiGianXoa(LocalDateTime.now());
            lk.setLyDoXoa("Xóa phiếu cấp phát");
            chiTietCapPhatLinhKienRepository.save(lk);
        }
    }

    // Hàm này dùng để mapping to dto tránh n + 1 query
    private List<PhieuCapPhatTaiSanResponse> mapToResponseList(List<PhieuCapPhatTaiSan> phieuList) {
        if (phieuList.isEmpty())
            return new ArrayList<>();

        Set<Long> userIds = new java.util.HashSet<>();
        Set<Long> deptIds = new java.util.HashSet<>();
        for (PhieuCapPhatTaiSan p : phieuList) {
            if (p.getIdNguoiNhan() != null)
                userIds.add(p.getIdNguoiNhan());
            if (p.getIdNguoiLap() != null)
                userIds.add(p.getIdNguoiLap());
            if (p.getIdNguoiPheDuyet() != null)
                userIds.add(p.getIdNguoiPheDuyet());
            if (p.getIdPhongBanNhan() != null)
                deptIds.add(p.getIdPhongBanNhan());
        }

        Map<Long, String> userMap = nguoiDungRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(NguoiDung::getId, this::getHoTenNguoiDung));
        Map<Long, String> deptMap = phongBanRepository.findAllById(deptIds).stream()
                .collect(Collectors.toMap(PhongBan::getId, PhongBan::getTenPhongBan));

        List<PhieuCapPhatTaiSanResponse> responses = new ArrayList<>();
        for (PhieuCapPhatTaiSan phieu : phieuList) {
            PhieuCapPhatTaiSanResponse res = PhieuCapPhatTaiSanResponse.builder()
                    .id(phieu.getId())
                    .idDonVi(phieu.getIdDonVi())
                    .maPhiepCapPhat(phieu.getMaPhiepCapPhat())
                    .idNguoiNhan(phieu.getIdNguoiNhan())
                    .tenNguoiNhan(userMap.get(phieu.getIdNguoiNhan()))
                    .idPhongBanNhan(phieu.getIdPhongBanNhan())
                    .tenPhongBanNhan(deptMap.get(phieu.getIdPhongBanNhan()))
                    .idNguoiLap(phieu.getIdNguoiLap())
                    .tenNguoiLap(userMap.get(phieu.getIdNguoiLap()))
                    .idNguoiPheDuyet(phieu.getIdNguoiPheDuyet())
                    .tenNguoiPheDuyet(userMap.get(phieu.getIdNguoiPheDuyet()))
                    .thoiGianBanGiao(phieu.getThoiGianBanGiao())
                    .trangThai(phieu.getTrangThai() != null ? phieu.getTrangThai().getValue() : null)
                    .mucDichSuDung(phieu.getMucDichSuDung())
                    .thoiGianTao(phieu.getThoiGianTao())
                    .thoiGianCapNhat(phieu.getThoiGianCapNhat())
                    .build();
            responses.add(res);
        }
        return responses;
    }

    private PhieuCapPhatTaiSanResponse mapToResponse(PhieuCapPhatTaiSan phieu, boolean includeDetails) {
        String tenNguoiNhan = null;
        if (phieu.getIdNguoiNhan() != null) {
            tenNguoiNhan = nguoiDungRepository.findById(phieu.getIdNguoiNhan())
                    .map(this::getHoTenNguoiDung)
                    .orElse(null);
        }

        String tenPhongBanNhan = null;
        if (phieu.getIdPhongBanNhan() != null) {
            tenPhongBanNhan = phongBanRepository.findById(phieu.getIdPhongBanNhan())
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

        List<ChiTietCapPhatGeneralResponse> danhSachTaiSan = new ArrayList<>();
        if (includeDetails) {
            // 1. Map phan cung
            List<ChiTietCapPhatPhanCung> pcList = chiTietCapPhatPhanCungRepository
                    .findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
            for (ChiTietCapPhatPhanCung pc : pcList) {
                String tenTaiSan = "";
                String soSerial = "";
                String maThe = "";
                if (pc.getDanhSachThietBiPhanCungId() != null) {
                    var tb = thietBiPhanCungRepository.findById(pc.getDanhSachThietBiPhanCungId()).orElse(null);
                    if (tb != null) {
                        soSerial = tb.getSoSerial();
                        maThe = tb.getMaTheTaiSan();
                        if (tb.getTaiSanPhanCung() != null) {
                            tenTaiSan = tb.getTaiSanPhanCung().getTenMau();
                        }
                    }
                }
                boolean daThuHoi = chiTietThuHoiPhanCungRepository
                        .findByChiTietCapPhatPhanCungIdAndThoiGianXoaIsNull(pc.getId()).isPresent();
                danhSachTaiSan.add(ChiTietCapPhatGeneralResponse.builder()
                        .idChiTietCapPhat(pc.getId())
                        .idTaiSan(pc.getDanhSachThietBiPhanCungId())
                        .tenTaiSan(tenTaiSan)
                        .soSerial(soSerial)
                        .maTheTaiSan(maThe)
                        .loai("PHAN_CUNG")
                        .tinhTrangLucGiao(pc.getTinhTrangLucGiao())
                        .trangThaiCapPhat(daThuHoi ? "DA_THU_HOI" : "DANG_CAP_PHAT")
                        .ghiChu(pc.getGhiChu())
                        .build());
            }

            // 2. Map phan mem
            List<ChiTietCapPhatPhanMem> pmList = chiTietCapPhatPhanMemRepository
                    .findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
            for (ChiTietCapPhatPhanMem pm : pmList) {
                String tenTaiSan = "";
                String keyBanQuyen = "";
                if (pm.getDanhSachThietBiPhanMemId() != null) {
                    var tb = thietBiPhanMemRepository.findById(pm.getDanhSachThietBiPhanMemId()).orElse(null);
                    if (tb != null) {
                        keyBanQuyen = tb.getKeyBanQuyen();
                        if (tb.getTaiSanPhanMem() != null) {
                            tenTaiSan = tb.getTaiSanPhanMem().getTenMau();
                        }
                    }
                }
                boolean daThuHoi = chiTietThuHoiPhanMemRepository
                        .findByChiTietCapPhatPhanMemIdAndThoiGianXoaIsNull(pm.getId()).isPresent();
                danhSachTaiSan.add(ChiTietCapPhatGeneralResponse.builder()
                        .idChiTietCapPhat(pm.getId())
                        .idTaiSan(pm.getDanhSachThietBiPhanMemId())
                        .tenTaiSan(tenTaiSan)
                        .soSerial(null)
                        .maTheTaiSan(keyBanQuyen)
                        .loai("PHAN_MEM")
                        .tinhTrangLucGiao(null)
                        .trangThaiCapPhat(daThuHoi ? "DA_THU_HOI" : "DANG_CAP_PHAT")
                        .ghiChu(pm.getGhiChu())
                        .build());
            }

            // 3. Map linh kien
            List<ChiTietCapPhatLinhKien> lkList = chiTietCapPhatLinhKienRepository
                    .findByPhieuCapPhatTaiSanIdAndThoiGianXoaIsNull(phieu.getId());
            for (ChiTietCapPhatLinhKien lk : lkList) {
                String tenTaiSan = "";
                String soSerial = "";
                if (lk.getLinhKienPhanCungId() != null) {
                    var lkEntity = linhKienPhanCungRepository.findById(lk.getLinhKienPhanCungId()).orElse(null);
                    if (lkEntity != null) {
                        soSerial = lkEntity.getSoSerial();
                        if (lkEntity.getTaiSanPhanCung() != null) {
                            tenTaiSan = lkEntity.getTaiSanPhanCung().getTenMau();
                        }
                    }
                }
                boolean daThuHoi = chiTietThuHoiLinhKienRepository
                        .findByChiTietCapPhatLinhKienIdAndThoiGianXoaIsNull(lk.getId()).isPresent();
                danhSachTaiSan.add(ChiTietCapPhatGeneralResponse.builder()
                        .idChiTietCapPhat(lk.getId())
                        .idTaiSan(lk.getLinhKienPhanCungId())
                        .tenTaiSan(tenTaiSan)
                        .soSerial(soSerial)
                        .maTheTaiSan(null)
                        .loai("LINH_KIEN")
                        .tinhTrangLucGiao(lk.getTinhTrangLucGiao())
                        .trangThaiCapPhat(daThuHoi ? "DA_THU_HOI" : "DANG_CAP_PHAT")
                        .ghiChu(lk.getGhiChu())
                        .build());
            }
        }

        return PhieuCapPhatTaiSanResponse.builder()
                .id(phieu.getId())
                .idDonVi(phieu.getIdDonVi())
                .maPhiepCapPhat(phieu.getMaPhiepCapPhat())
                .idNguoiNhan(phieu.getIdNguoiNhan())
                .tenNguoiNhan(tenNguoiNhan)
                .idPhongBanNhan(phieu.getIdPhongBanNhan())
                .tenPhongBanNhan(tenPhongBanNhan)
                .idNguoiLap(phieu.getIdNguoiLap())
                .tenNguoiLap(tenNguoiLap)
                .idNguoiPheDuyet(phieu.getIdNguoiPheDuyet())
                .tenNguoiPheDuyet(tenNguoiPheDuyet)
                .thoiGianBanGiao(phieu.getThoiGianBanGiao())
                .trangThai(phieu.getTrangThai() != null ? phieu.getTrangThai().getValue() : null)
                .mucDichSuDung(phieu.getMucDichSuDung())
                .danhSachTaiSan(danhSachTaiSan)
                .thoiGianTao(phieu.getThoiGianTao())
                .thoiGianCapNhat(phieu.getThoiGianCapNhat())
                .build();
    }
}
