package com.example.backend.modules.tenant.service;

import com.example.backend.modules.tenant.service.interfaces.DonViService;

import com.example.backend.modules.auth.model.MaXacThucOTP;
import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.auth.model.Quyen;
import com.example.backend.modules.auth.model.VaiTro;
import com.example.backend.modules.auth.model.VaiTroQuyen;
import com.example.backend.modules.auth.model.NguoiDungVaiTro;
import com.example.backend.modules.auth.repository.MaXacThucOTPRepository;
import com.example.backend.modules.auth.repository.NguoiDungRepository;
import com.example.backend.modules.auth.repository.QuyenRepository;
import com.example.backend.modules.auth.repository.VaiTroRepository;
import com.example.backend.modules.auth.repository.VaiTroQuyenRepository;
import com.example.backend.modules.auth.repository.NguoiDungVaiTroRepository;
import java.util.stream.Collectors;
import com.example.backend.modules.tenant.dto.DangKyDonViRequest;
import com.example.backend.modules.tenant.dto.XacThucOtpRequest;
import com.example.backend.modules.tenant.dto.DonViResponse;
import com.example.backend.modules.tenant.dto.DonViUpdateRequest;
import com.example.backend.modules.tenant.dto.DonViTrangThaiRequest;
import com.example.backend.modules.tenant.dto.GiaHanHopDongRequest;
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
    private final NguoiDungRepository nguoiDungRepository;
    private final MaXacThucOTPRepository maXacThucOTPRepository;
    private final PasswordEncoder passwordEncoder;
    private final PhongBanRepository phongBanRepository;
    private final ViTriRepository viTriRepository;
    private final VaiTroRepository vaiTroRepository;
    private final CauHinhDonViRepository cauHinhDonViRepository;
    private final RabbitTemplate rabbitTemplate;
    private final QuyenRepository quyenRepository;
    private final VaiTroQuyenRepository vaiTroQuyenRepository;
    private final NguoiDungVaiTroRepository nguoiDungVaiTroRepository;

    @Override
    @Transactional
    public void dangKyDonVi(DangKyDonViRequest request) {
        if (nguoiDungRepository.existsByTenDangNhapAndThoiGianXoaIsNull(request.getTenDangNhapAdmin())) {
            throw new NghiepVuException("Tên đăng nhập admin đã tồn tại", 400);
        }
        if (nguoiDungRepository.existsByEmailAndThoiGianXoaIsNull(request.getEmailAdmin())) {
            throw new NghiepVuException("Email admin đã được sử dụng", 400);
        }
        if (donViRepository.existsByTenMienHeThongAndThoiGianXoaIsNull(request.getTenMienHeThong().trim())) {
            throw new NghiepVuException("Tên miền hệ thống này đã bị đăng ký bởi đơn vị khác", 400);
        }

        // 1. Tạo Đơn Vị (Tenant)
        DonVi donVi = new DonVi();
        donVi.setMaDonVi("DV" + System.currentTimeMillis());
        donVi.setTenPhapLy(request.getTenPhapLy());
        donVi.setTenMienHeThong(request.getTenMienHeThong().trim());
        donVi.setMaSoThue(request.getMaSoThue());
        donVi.setTenNguoiDaiDien(request.getTenNguoiDaiDien());
        donVi.setTrangThai("CHO_XAC_THUC");
        donVi = donViRepository.save(donVi);

        // 2. Tạo Tài khoản Admin Đơn Vị
        NguoiDung admin = new NguoiDung();
        admin.setIdDonVi(donVi.getId());
        admin.setTenDangNhap(request.getTenDangNhapAdmin());
        admin.setMatKhau(passwordEncoder.encode(request.getMatKhauAdmin()));
        admin.setTenNguoiDung(request.getTenAdmin());
        admin.setEmail(request.getEmailAdmin());
        admin.setTrangThai("CHO_XAC_THUC");
        admin = nguoiDungRepository.save(admin);

        // 3. Tạo vai trò Admin Đơn Vị cụ thể cho đơn vị này (độc lập, không trùng lặp)
        VaiTro vaiTro = new VaiTro();
        vaiTro.setIdDonVi(donVi.getId());
        vaiTro.setMaVaiTro("ADMIN_" + donVi.getMaDonVi());
        vaiTro.setTenVaiTro("Admin Đơn vị " + donVi.getTenPhapLy());
        vaiTro.setMoTaVaiTro("Vai trò quản trị tối cao của đơn vị " + donVi.getTenPhapLy());
        vaiTro.setLaHeThong(false);
        vaiTro.setTrangThai("HOAT_DONG");
        final VaiTro savedVaiTro = vaiTroRepository.save(vaiTro);

        // 4. Gán các quyền có loại là QUYEN_DON_VI cho vai trò này
        List<Quyen> corporatePermissions = quyenRepository.findByLoaiQuyenAndTrangThaiAndThoiGianXoaIsNull("QUYEN_DON_VI", "HOAT_DONG");
        List<VaiTroQuyen> vaiTroQuyens = corporatePermissions.stream().map(q -> {
            VaiTroQuyen vq = new VaiTroQuyen();
            vq.setVaiTro(savedVaiTro);
            vq.setQuyen(q);
            return vq;
        }).collect(Collectors.toList());
        vaiTroQuyenRepository.saveAll(vaiTroQuyens);

        // 5. Gán vai trò cho tài khoản admin mới tạo
        NguoiDungVaiTro ndvt = new NguoiDungVaiTro();
        ndvt.setNguoiDung(admin);
        ndvt.setVaiTro(savedVaiTro);
        ndvt.setThoiGianBatDau(LocalDateTime.now());
        nguoiDungVaiTroRepository.save(ndvt);

        // 6. Sinh mã OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        log.info("============== MÃ OTP ĐĂNG KÝ ĐƠN VỊ DÀNH CHO EMAIL {} ==============", request.getEmailAdmin());
        log.info("Mã OTP: {}", otp);
        log.info("=====================================================================");

        // 7. Lưu mã OTP vào DB (mã hóa BCRYPT)
        MaXacThucOTP otpEntity = new MaXacThucOTP();
        otpEntity.setNguoiDung(admin);
        otpEntity.setIdDonVi(donVi.getId());
        otpEntity.setMaXacThucHash(passwordEncoder.encode(otp));
        otpEntity.setLoaiMa("KICH_HOAT_DON_VI");
        otpEntity.setPhuongThucGui("EMAIL");
        otpEntity.setSoLanSaiHienTai(0);
        otpEntity.setTrangThai("HIEU_LUC");
        otpEntity.setThoiGianHetHan(LocalDateTime.now().plusMinutes(15));
        maXacThucOTPRepository.save(otpEntity);
        
        // Gửi sự kiện kích hoạt đơn vị qua RabbitMQ để gửi email nền
        MailEvent mailEvent = new MailEvent(request.getEmailAdmin(), "KICH_HOAT_DON_VI", otp);
        rabbitTemplate.convertAndSend("mail.queue", mailEvent);

        // Bắn sự kiện khởi tạo quyền trực tiếp cho tài khoản admin chạy ngầm
        rabbitTemplate.convertAndSend("tenant.init-admin-permissions.queue", admin.getId());
    }

    @Override
    @Transactional
    public void xacThucOtp(XacThucOtpRequest request) {
        MaXacThucOTP otpEntity = maXacThucOTPRepository
                .findFirstByNguoiDung_EmailAndLoaiMaAndTrangThaiOrderByThoiGianTaoDesc(
                        request.getEmail(), "KICH_HOAT_DON_VI", "HIEU_LUC")
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy mã OTP hiệu lực cho email này", 400));

        if (otpEntity.getThoiGianHetHan().isBefore(LocalDateTime.now())) {
            otpEntity.setTrangThai("HET_HAN");
            maXacThucOTPRepository.save(otpEntity);
            throw new NghiepVuException("Mã OTP đã hết hạn", 400);
        }

        if (otpEntity.getSoLanSaiHienTai() >= 5) {
            otpEntity.setTrangThai("KHOA");
            maXacThucOTPRepository.save(otpEntity);
            throw new NghiepVuException("Bạn đã nhập sai quá nhiều lần. Mã OTP bị khóa.", 400);
        }

        if (!passwordEncoder.matches(request.getOtp(), otpEntity.getMaXacThucHash())) {
            otpEntity.setSoLanSaiHienTai(otpEntity.getSoLanSaiHienTai() + 1);
            maXacThucOTPRepository.save(otpEntity);
            throw new NghiepVuException("Mã OTP không chính xác", 400);
        }

        // OTP hợp lệ
        otpEntity.setTrangThai("DA_SU_DUNG");
        maXacThucOTPRepository.save(otpEntity);

        NguoiDung admin = otpEntity.getNguoiDung();
        admin.setTrangThai("HOAT_DONG");
        nguoiDungRepository.save(admin);

        DonVi donVi = donViRepository.findByIdAndThoiGianXoaIsNull(admin.getIdDonVi())
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy đơn vị", 404));
        donVi.setTrangThai("HOAT_DONG");
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

        if (!"HOAT_DONG".equals(donVi.getTrangThai())) {
            throw new NghiepVuException("Đơn vị hiện đang bị khóa hoặc ngừng hoạt động", 400);
        }

        return mapToResponse(donVi);
    }

    @Override
    public PageResponse<DonViResponse> layDanhSach(String ten, String maDonVi, String trangThai, String maSoThue, int page, int size) {
        Long tenantId = DonViContextHolder.getTenantId();
        if (tenantId != null) {
            throw new NghiepVuException("Chỉ người dùng hệ thống mới có quyền xem danh sách đơn vị", 403);
        }

        Specification<DonVi> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("thoiGianXoa")));
            predicates.add(cb.equal(root.get("trangThai"), "HOAT_DONG"));

            if (ten != null && !ten.trim().isEmpty()) {
                String likePattern = "%" + ten.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("tenPhapLy")), likePattern),
                        cb.like(cb.lower(root.get("tenThuongMai")), likePattern)
                ));
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

        donVi.setTrangThai(trangThai);
        donViRepository.save(donVi);

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

        // Cascade xóa mềm các thực thể phụ thuộc
        nguoiDungRepository.softDeleteByIdDonVi(id, now, "Đơn vị bị xóa");
        phongBanRepository.softDeleteByDonViId(id, now, "Đơn vị bị xóa");
        viTriRepository.softDeleteByDonViId(id, now, "Đơn vị bị xóa");
        vaiTroRepository.softDeleteByIdDonVi(id, now, "Đơn vị bị xóa");
        cauHinhDonViRepository.softDeleteByDonViId(id, now, "Đơn vị bị xóa");
        maXacThucOTPRepository.softDeleteByIdDonVi(id, now, "Đơn vị bị xóa");
    }

    private DonViResponse mapToResponse(DonVi donVi) {
        if (donVi == null) return null;
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
                .trangThai(donVi.getTrangThai())
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
}

