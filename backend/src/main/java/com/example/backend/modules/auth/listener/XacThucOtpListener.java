package com.example.backend.modules.auth.listener;

import com.example.backend.modules.auth.model.MaXacThucOTP;
import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.auth.repository.MaXacThucOTPRepository;
import com.example.backend.modules.auth.repository.NguoiDungRepository;
import com.example.backend.shared.dto.XacThucOtpEvent;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.model.TrangThaiCoBanEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class XacThucOtpListener {

    private final MaXacThucOTPRepository maXacThucOTPRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener
    @Transactional
    public void onXacThucOtp(XacThucOtpEvent event) {
        log.info("Nhận yêu cầu xác thực OTP kích hoạt cho email: {}", event.getEmail());

        MaXacThucOTP otpEntity = maXacThucOTPRepository
                .findFirstByNguoiDung_EmailAndLoaiMaAndTrangThaiOrderByThoiGianTaoDesc(
                        event.getEmail(), "KICH_HOAT_DON_VI", "HIEU_LUC")
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

        if (!passwordEncoder.matches(event.getOtp(), otpEntity.getMaXacThucHash())) {
            otpEntity.setSoLanSaiHienTai(otpEntity.getSoLanSaiHienTai() + 1);
            maXacThucOTPRepository.save(otpEntity);
            throw new NghiepVuException("Mã OTP không chính xác", 400);
        }

        // OTP hợp lệ
        otpEntity.setTrangThai("DA_SU_DUNG");
        maXacThucOTPRepository.save(otpEntity);

        NguoiDung admin = otpEntity.getNguoiDung();
        admin.setTrangThai(TrangThaiCoBanEnum.KHOA);
        nguoiDungRepository.save(admin);

        // Trả lại idDonVi cho event để publisher đọc
        event.setIdDonVi(admin.getIdDonVi());
        log.info("Xác thực OTP thành công. Kích hoạt tài khoản Admin cho đơn vị ID: {}", admin.getIdDonVi());
    }
}
