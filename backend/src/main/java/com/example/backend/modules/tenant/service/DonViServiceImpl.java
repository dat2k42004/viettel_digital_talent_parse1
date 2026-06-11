package com.example.backend.modules.tenant.service;

import com.example.backend.modules.tenant.service.interfaces.DonViService;

import com.example.backend.modules.auth.model.MaXacThucOTP;
import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.auth.repository.MaXacThucOTPRepository;
import com.example.backend.modules.auth.repository.NguoiDungRepository;
import com.example.backend.modules.tenant.dto.DangKyDonViRequest;
import com.example.backend.modules.tenant.dto.XacThucOtpRequest;
import com.example.backend.modules.tenant.model.DonVi;
import com.example.backend.modules.tenant.repository.DonViRepository;
import com.example.backend.shared.exception.NghiepVuException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class DonViServiceImpl implements DonViService {

    private final DonViRepository donViRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final MaXacThucOTPRepository maXacThucOTPRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void dangKyDonVi(DangKyDonViRequest request) {
        if (nguoiDungRepository.existsByTenDangNhapAndThoiGianXoaIsNull(request.getTenDangNhapAdmin())) {
            throw new NghiepVuException("Tên đăng nhập admin đã tồn tại", 400);
        }
        if (nguoiDungRepository.existsByEmailAndThoiGianXoaIsNull(request.getEmailAdmin())) {
            throw new NghiepVuException("Email admin đã được sử dụng", 400);
        }

        // 1. Tạo Đơn Vị (Tenant)
        DonVi donVi = new DonVi();
        donVi.setMaDonVi("DV" + System.currentTimeMillis());
        donVi.setTenPhapLy(request.getTenPhapLy());
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

        // 3. Sinh mã OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        log.info("============== MÃ OTP ĐĂNG KÝ ĐƠN VỊ DÀNH CHO EMAIL {} ==============", request.getEmailAdmin());
        log.info("Mã OTP: {}", otp);
        log.info("=====================================================================");

        // 4. Lưu mã OTP vào DB (mã hóa BCRYPT)
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
        
        // TODO: Tích hợp gửi Email thực tế qua JavaMailSender tại đây
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
    }
}

