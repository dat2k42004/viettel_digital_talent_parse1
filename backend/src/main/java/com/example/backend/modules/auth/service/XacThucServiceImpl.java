package com.example.backend.modules.auth.service;

import com.example.backend.modules.auth.service.interfaces.XacThucService;
import com.example.backend.modules.auth.service.interfaces.NguoiDungService;
import com.example.backend.modules.auth.dto.XacThucResponse;
import com.example.backend.modules.auth.dto.DangNhapRequest;
import com.example.backend.modules.auth.dto.RefreshTokenRequest;
import com.example.backend.modules.auth.dto.QuenMatKhauRequest;
import com.example.backend.modules.auth.dto.DatLaiMatKhauRequest;
import com.example.backend.modules.auth.dto.NguoiDungResponse;
import com.example.backend.modules.auth.dto.DoiMatKhauRequest;
import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.auth.model.PhienDangNhap;
import com.example.backend.modules.auth.model.MaXacThucOTP;
import com.example.backend.modules.tenant.model.CauHinhDonVi;
import com.example.backend.modules.auth.repository.PhienDangNhapRepository;
import com.example.backend.modules.auth.repository.NguoiDungRepository;
import com.example.backend.modules.auth.repository.NguoiDungVaiTroRepository;
import com.example.backend.modules.auth.repository.NguoiDungQuyenRepository;
import com.example.backend.modules.auth.repository.VaiTroRepository;
import com.example.backend.modules.auth.repository.QuyenRepository;
import com.example.backend.modules.auth.repository.MaXacThucOTPRepository;
import com.example.backend.modules.auth.security.NguoiDungUserDetails;
import com.example.backend.modules.auth.security.JwtTokenProvider;
import com.example.backend.modules.tenant.model.DonVi;
import com.example.backend.modules.tenant.repository.DonViRepository;
import com.example.backend.modules.tenant.repository.CauHinhDonViRepository;
import com.example.backend.modules.tenant.dto.DonViResponse;
import com.example.backend.modules.tenant.dto.CauHinhDonViResponse;
import com.example.backend.shared.exception.NghiepVuException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import com.example.backend.modules.auth.event.DangNhapEvent;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import com.example.backend.shared.dto.MailEvent;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.redis.core.RedisTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class XacThucServiceImpl implements XacThucService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final PhienDangNhapRepository phienDangNhapRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final NguoiDungVaiTroRepository nguoiDungVaiTroRepository;
    private final NguoiDungQuyenRepository nguoiDungQuyenRepository;
    private final DonViRepository donViRepository;
    private final CauHinhDonViRepository cauHinhDonViRepository;
    private final MaXacThucOTPRepository maXacThucOTPRepository;
    private final QuyenRepository quyenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final ApplicationEventPublisher eventPublisher;
    private final RabbitTemplate rabbitTemplate;
    private final NguoiDungService nguoiDungService;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    @Transactional
    public XacThucResponse login(DangNhapRequest request, HttpServletRequest httpRequest) {
        NguoiDung nguoiDung = nguoiDungRepository.findByTenDangNhapAndThoiGianXoaIsNull(request.getUsername())
                .orElseThrow(() -> new NghiepVuException("Tên đăng nhập hoặc mật khẩu không chính xác", 401));

        if (!"HOAT_DONG".equals(nguoiDung.getTrangThai())) {
            throw new NghiepVuException("Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động", 401);
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            NguoiDungUserDetails userDetails = (NguoiDungUserDetails) authentication.getPrincipal();
            String accessToken = tokenProvider.generateAccessToken(userDetails);
            String refreshToken = tokenProvider.generateRefreshToken(userDetails);

            // Ghi nhận Phiên Đăng Nhập
            PhienDangNhap phien = new PhienDangNhap();
            phien.setNguoiDung(nguoiDung);
            phien.setIdDonVi(nguoiDung.getIdDonVi());
            phien.setTokenTruyCap(accessToken);
            phien.setTokenLamMoi(refreshToken);
            phien.setDiaChiIp(httpRequest.getRemoteAddr());
            phien.setTrinhDuyet(httpRequest.getHeader("User-Agent"));
            phien.setTrangThai("HOAT_DONG");
            phien.setThoiGianHetHan(LocalDateTime.now().plusDays(30)); // Refresh Token sống 30 ngày
            phienDangNhapRepository.save(phien);

            // Phát sự kiện đăng nhập thành công
            eventPublisher.publishEvent(new DangNhapEvent(
                    nguoiDung, request.getUsername(), "THANH_CONG", 
                    httpRequest.getRemoteAddr(), httpRequest.getHeader("User-Agent")
            ));

            return XacThucResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .idDonVi(nguoiDung.getIdDonVi())
                    .username(nguoiDung.getTenDangNhap())
                    .thongTinNguoiDung(mapToNguoiDungResponse(nguoiDung))
                    .build();

        } catch (Exception e) {
            // Phát sự kiện đăng nhập thất bại
            eventPublisher.publishEvent(new DangNhapEvent(
                    null, request.getUsername(), "THAT_BAI", 
                    httpRequest.getRemoteAddr(), httpRequest.getHeader("User-Agent")
            ));
            if (e instanceof NghiepVuException) {
                throw (NghiepVuException) e;
            }
            throw new NghiepVuException("Tên đăng nhập hoặc mật khẩu không chính xác", 401);
        }
    }

    @Override
    @Transactional
    public void logout(String accessToken, String refreshToken) {
        if (accessToken != null && accessToken.startsWith("Bearer ")) {
            accessToken = accessToken.substring(7);
        }

        // 1. Đẩy accessToken vào blacklist trên Redis với TTL bằng thời gian sống còn lại của token
        if (accessToken != null && tokenProvider.validateToken(accessToken)) {
            try {
                long expirationTime = tokenProvider.getExpirationTimeFromToken(accessToken);
                if (expirationTime > 0) {
                    redisTemplate.opsForValue().set(
                            "jwt_blacklist:" + accessToken, 
                            "blacklisted", 
                            java.time.Duration.ofMillis(expirationTime)
                    );
                    log.info("Access Token đã được đưa vào blacklist thành công.");
                }
            } catch (Exception e) {
                log.error("Lỗi khi thêm access token vào blacklist: {}", e.getMessage());
            }
        }

        // 2. Vô hiệu hóa refresh token trong DB
        if (org.springframework.util.StringUtils.hasText(refreshToken)) {
            Optional<PhienDangNhap> phienOpt = phienDangNhapRepository.findByTokenLamMoiAndThoiGianXoaIsNull(refreshToken);
            if (phienOpt.isPresent()) {
                PhienDangNhap phien = phienOpt.get();
                phien.setTrangThai("EXPIRED");
                phien.setThoiGianXoa(LocalDateTime.now());
                phien.setLyDoXoa("Đăng xuất chủ động");
                phienDangNhapRepository.save(phien);
                log.info("Refresh Token đã được vô hiệu hóa thành công.");
            }
        }
    }

    @Override
    @Transactional
    public XacThucResponse refreshToken(String refreshToken, HttpServletRequest httpRequest) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new NghiepVuException("Refresh token không hợp lệ hoặc đã hết hạn", 401);
        }

        PhienDangNhap phienCu = phienDangNhapRepository.findByTokenLamMoiAndThoiGianXoaIsNull(refreshToken)
                .orElseThrow(() -> new NghiepVuException("Phiên đăng nhập không tồn tại hoặc đã bị đăng xuất", 401));

        // Kiểm tra thời gian hết hạn phiên
        if (phienCu.getThoiGianHetHan().isBefore(LocalDateTime.now())) {
            phienCu.setTrangThai("HET_HAN");
            phienCu.setThoiGianXoa(LocalDateTime.now());
            phienCu.setLyDoXoa("Hết hạn phiên đăng nhập");
            phienDangNhapRepository.save(phienCu);
            throw new NghiepVuException("Phiên đăng nhập đã hết hạn", 401);
        }

        // Xóa mềm phiên cũ
        phienCu.setTrangThai("DA_LAM_MOI");
        phienCu.setThoiGianXoa(LocalDateTime.now());
        phienCu.setLyDoXoa("Làm mới token");
        phienDangNhapRepository.save(phienCu);

        NguoiDung user = phienCu.getNguoiDung();
        if (user == null || !"HOAT_DONG".equals(user.getTrangThai()) || user.getThoiGianXoa() != null) {
            throw new NghiepVuException("Tài khoản người dùng đã bị khóa hoặc xóa", 401);
        }

        // Tạo UserDetails để sinh token mới
        String username = tokenProvider.getUsernameFromToken(refreshToken);
        if (!username.equals(user.getTenDangNhap())) {
            throw new NghiepVuException("Tên đăng nhập không khớp", 401);
        }

        // Tự động load lại User Details & Authorities giống loadUserByUsername qua Cache
        List<String> userPermissions = nguoiDungService.resolveAndCacheUserPermissions(user.getId());
        List<org.springframework.security.core.GrantedAuthority> authorities = userPermissions.stream()
                .map(org.springframework.security.core.authority.SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
        NguoiDungUserDetails userDetails = new NguoiDungUserDetails(user, authorities);

        String newAccessToken = tokenProvider.generateAccessToken(userDetails);
        String newRefreshToken = tokenProvider.generateRefreshToken(userDetails);

        // Tạo phiên mới
        PhienDangNhap phienMoi = new PhienDangNhap();
        phienMoi.setNguoiDung(user);
        phienMoi.setIdDonVi(user.getIdDonVi());
        phienMoi.setTokenTruyCap(newAccessToken);
        phienMoi.setTokenLamMoi(newRefreshToken);
        phienMoi.setDiaChiIp(httpRequest.getRemoteAddr());
        phienMoi.setTrinhDuyet(httpRequest.getHeader("User-Agent"));
        phienMoi.setTrangThai("HOAT_DONG");
        phienMoi.setThoiGianHetHan(LocalDateTime.now().plusDays(30));
        phienDangNhapRepository.save(phienMoi);

        return XacThucResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .idDonVi(user.getIdDonVi())
                .username(user.getTenDangNhap())
                .thongTinNguoiDung(mapToNguoiDungResponse(user))
                .build();
    }

    @Override
    @Transactional
    public void guiOtpQuenMatKhau(QuenMatKhauRequest request) {
        NguoiDung user = nguoiDungRepository.findByEmailAndThoiGianXoaIsNull(request.getEmail())
                .orElseThrow(() -> new NghiepVuException("Email không tồn tại trong hệ thống hoặc tài khoản đã bị xóa", 404));

        if (!"HOAT_DONG".equals(user.getTrangThai())) {
            throw new NghiepVuException("Tài khoản liên kết với email này hiện đang bị khóa", 400);
        }

        // Sinh OTP 6 chữ số
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));

        // Save new OTP
        MaXacThucOTP otpEntity = new MaXacThucOTP();
        otpEntity.setNguoiDung(user);
        otpEntity.setIdDonVi(user.getIdDonVi());
        otpEntity.setMaXacThucHash(passwordEncoder.encode(otp));
        otpEntity.setLoaiMa("QUEN_MAT_KHAU");
        otpEntity.setPhuongThucGui("EMAIL");
        otpEntity.setSoLanSaiHienTai(0);
        otpEntity.setTrangThai("HIEU_LUC");
        otpEntity.setThoiGianHetHan(LocalDateTime.now().plusMinutes(5)); // Hết hạn trong 5 phút
        maXacThucOTPRepository.save(otpEntity);

        // Gửi email qua RabbitMQ
        MailEvent event = new MailEvent(request.getEmail(), "QUEN_MAT_KHAU", otp);
        rabbitTemplate.convertAndSend("mail.queue", event);
    }

    @Override
    @Transactional
    public void xacNhanOtpVaDatLaiMatKhau(DatLaiMatKhauRequest request) {
        MaXacThucOTP otpEntity = maXacThucOTPRepository
                .findFirstByNguoiDung_EmailAndLoaiMaAndTrangThaiOrderByThoiGianTaoDesc(
                        request.getEmail(), "QUEN_MAT_KHAU", "HIEU_LUC")
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy mã OTP hoặc mã OTP đã hết hạn", 400));

        if (otpEntity.getThoiGianHetHan().isBefore(LocalDateTime.now())) {
            otpEntity.setTrangThai("HET_HAN");
            maXacThucOTPRepository.save(otpEntity);
            throw new NghiepVuException("Mã OTP đã hết hạn", 400);
        }

        if (otpEntity.getSoLanSaiHienTai() >= 5) {
            otpEntity.setTrangThai("KHOA");
            maXacThucOTPRepository.save(otpEntity);
            throw new NghiepVuException("Mã OTP đã bị khóa do nhập sai quá 5 lần", 400);
        }

        if (!passwordEncoder.matches(request.getMaOtp(), otpEntity.getMaXacThucHash())) {
            otpEntity.setSoLanSaiHienTai(otpEntity.getSoLanSaiHienTai() + 1);
            maXacThucOTPRepository.save(otpEntity);
            throw new NghiepVuException("Mã OTP không chính xác", 400);
        }

        // OTP hợp lệ
        otpEntity.setTrangThai("DA_SU_DUNG");
        otpEntity.setThoiGianXoa(LocalDateTime.now());
        otpEntity.setLyDoXoa("Đặt lại mật khẩu thành công");
        maXacThucOTPRepository.save(otpEntity);

        NguoiDung user = otpEntity.getNguoiDung();
        if (user == null || user.getThoiGianXoa() != null) {
            throw new NghiepVuException("Tài khoản người dùng không tồn tại hoặc đã bị xóa", 404);
        }

        user.setMatKhau(passwordEncoder.encode(request.getMatKhauMoi()));
        nguoiDungRepository.save(user);
    }

    private NguoiDungResponse mapToNguoiDungResponse(NguoiDung nguoiDung) {
        List<com.example.backend.modules.auth.dto.VaiTroResponse> danhSachVaiTro = 
                nguoiDungVaiTroRepository.findByNguoiDungId(nguoiDung.getId()).stream()
                .map(nv -> com.example.backend.modules.auth.dto.VaiTroResponse.builder()
                        .id(nv.getVaiTro().getId())
                        .maVaiTro(nv.getVaiTro().getMaVaiTro())
                        .tenVaiTro(nv.getVaiTro().getTenVaiTro())
                        .build())
                .collect(Collectors.toList());

        return NguoiDungResponse.builder()
                .id(nguoiDung.getId())
                .idDonVi(nguoiDung.getIdDonVi())
                .tenDangNhap(nguoiDung.getTenDangNhap())
                .hoNguoiDung(nguoiDung.getHoNguoiDung())
                .tenDemNguoiDung(nguoiDung.getTenDemNguoiDung())
                .tenNguoiDung(nguoiDung.getTenNguoiDung())
                .chucVu(nguoiDung.getChucVu())
                .email(nguoiDung.getEmail())
                .soDienThoai(nguoiDung.getSoDienThoai())
                .danhDaiDienUrl(nguoiDung.getDanhDaiDienUrl())
                .trangThai(nguoiDung.getTrangThai())
                .danhSachVaiTro(danhSachVaiTro)
                .build();
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "user_permissions", key = "#userId")
    public void doiMatKhau(Long userId, DoiMatKhauRequest request) {
        NguoiDung user = nguoiDungRepository.findByIdAndThoiGianXoaIsNull(userId)
                .orElseThrow(() -> new NghiepVuException("Không tìm thấy người dùng", 404));

        if (!passwordEncoder.matches(request.getMatKhauCu(), user.getMatKhau())) {
            throw new NghiepVuException("Mật khẩu cũ không chính xác", 400);
        }

        user.setMatKhau(passwordEncoder.encode(request.getMatKhauMoi()));
        nguoiDungRepository.save(user);
    }

    @Override
    public NguoiDungResponse layHoSoCaNhan(Long userId) {
        return nguoiDungService.layTheoId(userId);
    }

    private DonViResponse mapToDonViResponse(DonVi donVi) {
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

    private CauHinhDonViResponse mapToCauHinhResponse(CauHinhDonVi entity) {
        return CauHinhDonViResponse.builder()
                .id(entity.getId())
                .idDonVi(entity.getDonVi().getId())
                .idDanhMucCauHinh(entity.getDanhMucCauHinh().getId())
                .maCauHinh(entity.getDanhMucCauHinh().getMaCauHinh())
                .tenCauHinh(entity.getDanhMucCauHinh().getTenCauHinh())
                .giaTriCauHinh(entity.getGiaTriCauHinh())
                .build();
    }
}
