package com.example.backend.modules.tenant.service;

import com.example.backend.modules.tenant.service.interfaces.DonViService;

import com.example.backend.shared.dto.DangKyDonViEvent;
import com.example.backend.shared.dto.XacThucOtpEvent;
import com.example.backend.shared.dto.DonViXoaEvent;
import org.springframework.context.ApplicationEventPublisher;
import java.util.stream.Collectors;
import com.example.backend.modules.tenant.dto.DangKyDonViRequest;
import com.example.backend.modules.tenant.dto.XacThucOtpRequest;
import com.example.backend.modules.tenant.dto.DonViResponse;
import com.example.backend.modules.tenant.dto.DonViUpdateRequest;
import com.example.backend.modules.tenant.dto.DonViTrangThaiRequest;
import com.example.backend.modules.tenant.dto.GiaHanHopDongRequest;
import com.example.backend.shared.model.TrangThaiCoBanEnum;
import com.example.backend.modules.tenant.model.DonVi;
import com.example.backend.modules.tenant.repository.DonViRepository;
import com.example.backend.modules.tenant.repository.PhongBanRepository;
import com.example.backend.modules.tenant.repository.ViTriRepository;
import com.example.backend.modules.tenant.repository.CauHinhDonViRepository;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.tenant.DonViContextHolder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;

import com.example.backend.shared.dto.MailEvent;
import com.example.backend.shared.dto.TenantStatusEvent;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class DonViServiceImpl implements DonViService {

    private final DonViRepository donViRepository;
    private final PhongBanRepository phongBanRepository;
    private final ViTriRepository viTriRepository;
    private final CauHinhDonViRepository cauHinhDonViRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Autowired
    @Lazy
    private RabbitTemplate rabbitTemplate;

    @Override
    @Transactional
    public void dangKyDonVi(DangKyDonViRequest request) {
        if (donViRepository.existsByTenMienHeThongAndThoiGianXoaIsNull(request.getTenMienHeThong().trim())) {
            throw new NghiepVuException("Tên miền hệ thống này đã bị đăng ký bởi đơn vị khác", 400);
        }

        // 1. Tạo Đơn Vị (Tenant)
        DonVi donVi = new DonVi();
        donVi.setMaDonVi("DV-0-" + System.currentTimeMillis());
        donVi.setTenPhapLy(request.getTenPhapLy());
        donVi.setTenMienHeThong(request.getTenMienHeThong().trim());
        donVi.setMaSoThue(request.getMaSoThue());
        donVi.setTenNguoiDaiDien(request.getTenNguoiDaiDien());
        donVi.setTrangThai(TrangThaiCoBanEnum.CHO_XAC_THUC);
        donVi = donViRepository.save(donVi);

        // 2. Đồng bộ tạo tài khoản Admin qua Event
        eventPublisher.publishEvent(DangKyDonViEvent.builder()
                .idDonVi(donVi.getId())
                .tenDangNhapAdmin(request.getTenDangNhapAdmin())
                .matKhauAdmin(request.getMatKhauAdmin())
                .tenAdmin(request.getTenAdmin())
                .emailAdmin(request.getEmailAdmin())
                .build());
    }

    @Override
    @Transactional
    public void xacThucOtp(XacThucOtpRequest request) {
        XacThucOtpEvent event = XacThucOtpEvent.builder()
                .email(request.getEmail())
                .otp(request.getOtp())
                .build();

        // Đồng bộ yêu cầu xác thực OTP qua Event
        eventPublisher.publishEvent(event);

        Long idDonVi = event.getIdDonVi();
        if (idDonVi == null) {
            throw new NghiepVuException("Xác thực OTP thất bại", 400);
        }

        DonVi donVi = donViRepository.findByIdAndThoiGianXoaIsNull(idDonVi)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy đơn vị", 404));
        donVi.setTrangThai(TrangThaiCoBanEnum.KHOA);
        donViRepository.save(donVi);

        // Bắn sự kiện khởi tạo cấu hình mặc định
        rabbitTemplate.convertAndSend("tenant.init-config.queue", donVi.getId());
    }

    @Override
    public DonViResponse layTheoId(Long id) {
        Long tenantId = DonViContextHolder.getTenantId();
        if (tenantId != null && !tenantId.equals(id)) {
            throw new NghiepVuException("Bạn không có quyền xem thông tin đơn vị khác", 403);
        }

        DonVi donVi = donViRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy đơn vị", 404));

        if (donVi.getTrangThai() != TrangThaiCoBanEnum.HOAT_DONG) {
            throw new NghiepVuException("Đơn vị hiện đang bị khóa hoặc ngừng hoạt động", 400);
        }

        return mapToResponse(donVi);
    }

    @Override
    public PageResponse<DonViResponse> layDanhSach(String ten, String maDonVi, String trangThai, String maSoThue,
            int page, int size) {
        Long tenantId = DonViContextHolder.getTenantId();

        Specification<DonVi> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));

            if (tenantId != null) {
                predicates.add(cb.equal(root.get("id"), tenantId));
            }

            if (trangThai != null && !trangThai.trim().isEmpty()) {
                try {
                    predicates.add(cb.equal(root.get("trangThai"), TrangThaiCoBanEnum.fromValue(trangThai.trim())));
                } catch (IllegalArgumentException e) {
                    // Ignore
                }
            }

            if (ten != null && !ten.trim().isEmpty()) {
                String likePattern = "%" + ten.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("tenPhapLy")), likePattern),
                        cb.like(cb.lower(root.get("tenThuongMai")), likePattern)));
            }

            if (maDonVi != null && !maDonVi.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("maDonVi")), "%" + maDonVi.trim().toLowerCase() + "%"));
            }

            if (maSoThue != null && !maSoThue.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("maSoThue")), "%" + maSoThue.trim().toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<DonVi> donViPage = donViRepository.findAll(spec, PageRequest.of(page, size, Sort.by("id").descending()));
        Page<DonViResponse> responsePage = donViPage.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional
    public DonViResponse capNhatThongTin(Long id, DonViUpdateRequest request) {
        Long tenantId = DonViContextHolder.getTenantId();
        if (tenantId != null && !tenantId.equals(id)) {
            throw new NghiepVuException("Bạn không có quyền cập nhật thông tin đơn vị khác", 403);
        }

        DonVi donVi = donViRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy đơn vị", 404));

        donVi.setTenPhapLy(request.getTenPhapLy());
        donVi.setTenThuongMai(request.getTenThuongMai());
        donVi.setMaSoThue(request.getMaSoThue());
        donVi.setMaQuocGiaDienThoai(request.getMaQuocGiaDienThoai());
        donVi.setSoDienThoaiCoDinh(request.getSoDienThoaiCoDinh());
        donVi.setSoDienThoaiDiDong(request.getSoDienThoaiDiDong());
        donVi.setEmailChinhThuc(request.getEmailChinhThuc());
        donVi.setTenMienHeThong(request.getTenMienHeThong());
        donVi.setDuongDanWebsite(request.getDuongDanWebsite());
        donVi.setSoNhaTenDuong(request.getSoNhaTenDuong());
        donVi.setPhuongXa(request.getPhuongXa());
        donVi.setQuanHuyen(request.getQuanHuyen());
        donVi.setTinhThanhPho(request.getTinhThanhPho());
        donVi.setMaBuuChinh(request.getMaBuuChinh());
        donVi.setMaQuocGia(request.getMaQuocGia());
        donVi.setHoNguoiDaiDien(request.getHoNguoiDaiDien());
        donVi.setTenNguoiDaiDien(request.getTenNguoiDaiDien());
        donVi.setTenDemNguoiDaiDien(request.getTenDemNguoiDaiDien());
        donVi.setChucVuNguoiDaiDien(request.getChucVuNguoiDaiDien());
        donVi.setThoiGianThanhLap(request.getThoiGianThanhLap());
        donVi.setThoiGianBatDauHopDong(request.getThoiGianBatDauHopDong());
        donVi.setThoiGianHetHanHopDong(request.getThoiGianHetHanHopDong());

        donVi = donViRepository.save(donVi);
        return mapToResponse(donVi);
    }

    @Override
    @Transactional
    public void capNhatTrangThai(Long id, DonViTrangThaiRequest request) {
        Long tenantId = DonViContextHolder.getTenantId();
        if (tenantId != null) {
            throw new NghiepVuException("Chỉ người dùng hệ thống mới có quyền cập nhật trạng thái đơn vị", 403);
        }

        String trangThai = request.getTrangThai();
        if (!"HOAT_DONG".equals(trangThai) && !"KHOA".equals(trangThai)) {
            throw new NghiepVuException("Trạng thái không hợp lệ. Chỉ chấp nhận HOAT_DONG hoặc KHOA", 400);
        }

        DonVi donVi = donViRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy đơn vị", 404));

        TrangThaiCoBanEnum statusEnum = TrangThaiCoBanEnum.fromValue(trangThai);
        donVi.setTrangThai(statusEnum);
        donViRepository.save(donVi);

        // Cascade update PhongBan and ViTri (belonging to tenant module)
        phongBanRepository.updateTrangThaiByDonViId(id, statusEnum);
        viTriRepository.updateTrangThaiByDonViId(id, statusEnum);

        // Đẩy sự kiện cascade cập nhật sang các thực thể phụ thuộc qua RabbitMQ
        TenantStatusEvent statusEvent = new TenantStatusEvent(id, trangThai);
        rabbitTemplate.convertAndSend("tenant.status.queue", statusEvent);
    }

    @Override
    @Transactional
    public void xoaMem(Long id) {
        Long tenantId = DonViContextHolder.getTenantId();
        if (tenantId != null) {
            throw new NghiepVuException("Chỉ người dùng hệ thống mới có quyền xóa đơn vị", 403);
        }

        DonVi donVi = donViRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy đơn vị hoặc đơn vị đã bị xóa trước đó", 404));

        LocalDateTime now = LocalDateTime.now();
        String lyDo = "Hệ thống xóa mềm đơn vị";
        donVi.setThoiGianXoa(now);
        donVi.setLyDoXoa(lyDo);
        donViRepository.save(donVi);

        // Cascade xóa mềm các thực thể phụ thuộc của tenant module
        phongBanRepository.softDeleteByDonViId(id, now, lyDo);
        viTriRepository.softDeleteByDonViId(id, now, lyDo);
        cauHinhDonViRepository.softDeleteByDonViId(id, now, lyDo);

        // Phát sự kiện xóa đơn vị để các phân hệ khác (như Auth) tự dọn dẹp dữ liệu
        eventPublisher.publishEvent(new DonViXoaEvent(id, now, lyDo));
    }

    private DonViResponse mapToResponse(DonVi donVi) {
        if (donVi == null)
            return null;
        return DonViResponse.builder()
                .id(donVi.getId())
                .maDonVi(donVi.getMaDonVi())
                .tenPhapLy(donVi.getTenPhapLy())
                .tenThuongMai(donVi.getTenThuongMai())
                .maSoThue(donVi.getMaSoThue())
                .maQuocGiaDienThoai(donVi.getMaQuocGiaDienThoai())
                .soDienThoaiCoDinh(donVi.getSoDienThoaiCoDinh())
                .soDienThoaiDiDong(donVi.getSoDienThoaiDiDong())
                .emailChinhThuc(donVi.getEmailChinhThuc())
                .tenMienHeThong(donVi.getTenMienHeThong())
                .duongDanWebsite(donVi.getDuongDanWebsite())
                .soNhaTenDuong(donVi.getSoNhaTenDuong())
                .phuongXa(donVi.getPhuongXa())
                .quanHuyen(donVi.getQuanHuyen())
                .tinhThanhPho(donVi.getTinhThanhPho())
                .maBuuChinh(donVi.getMaBuuChinh())
                .maQuocGia(donVi.getMaQuocGia())
                .hoNguoiDaiDien(donVi.getHoNguoiDaiDien())
                .tenNguoiDaiDien(donVi.getTenNguoiDaiDien())
                .tenDemNguoiDaiDien(donVi.getTenDemNguoiDaiDien())
                .chucVuNguoiDaiDien(donVi.getChucVuNguoiDaiDien())
                .trangThai(donVi.getTrangThai() != null ? donVi.getTrangThai().getValue() : null)
                .thoiGianThanhLap(donVi.getThoiGianThanhLap())
                .thoiGianBatDauHopDong(donVi.getThoiGianBatDauHopDong())
                .thoiGianHetHanHopDong(donVi.getThoiGianHetHanHopDong())
                .thoiGianTao(donVi.getThoiGianTao())
                .thoiGianCapNhat(donVi.getThoiGianCapNhat())
                .build();
    }

    @Override
    public boolean checkDomain(String domain) {
        if (domain == null || domain.trim().isEmpty()) {
            throw new NghiepVuException("Tên miền không được để trống", 400);
        }
        return !donViRepository.existsByTenMienHeThongAndThoiGianXoaIsNull(domain.trim());
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "tenant_configs", key = "#id")
    public void giaHanHopDong(Long id, GiaHanHopDongRequest request) {
        Long tenantId = DonViContextHolder.getTenantId();
        if (tenantId != null) {
            throw new NghiepVuException("Chỉ người dùng hệ thống mới có quyền gia hạn hợp đồng", 403);
        }

        DonVi donVi = donViRepository.findByIdAndThoiGianXoaIsNull(id)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy đơn vị", 404));

        if (request.getNgayHetHanMoi().isBefore(java.time.LocalDate.now())) {
            throw new NghiepVuException("Ngày hết hạn mới phải ở tương lai", 400);
        }

        donVi.setThoiGianHetHanHopDong(request.getNgayHetHanMoi());
        donViRepository.save(donVi);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<DonViResponse> layTatCaDonViActive() {
        return donViRepository.findByThoiGianXoaIsNull().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<com.example.backend.modules.tenant.model.DonVi> layDonViEntityPage(org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<com.example.backend.modules.tenant.model.DonVi> spec = 
            (root, query, cb) -> cb.isNull(root.get("thoiGianXoa"));
        return donViRepository.findAll(spec, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public long demDonViActive() {
        return donViRepository.countByThoiGianXoaIsNull();
    }
}
