package com.example.backend.modules.auth.listener;

import com.example.backend.modules.auth.model.MaXacThucOTP;
import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.auth.repository.MaXacThucOTPRepository;
import com.example.backend.modules.auth.repository.NguoiDungRepository;
import com.example.backend.shared.dto.DangKyDonViEvent;
import com.example.backend.shared.dto.MailEvent;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.model.TrangThaiCoBanEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DangKyDonViListener {

    private final NguoiDungRepository nguoiDungRepository;
    private final MaXacThucOTPRepository maXacThucOTPRepository;
    private final PasswordEncoder passwordEncoder;
    private final RabbitTemplate rabbitTemplate;

    @EventListener
    @Transactional
    public void onDangKyDonVi(DangKyDonViEvent event) {
        log.info("Nhận sự kiện đăng ký đơn vị cho email: {}", event.getEmailAdmin());

        // 1. Kiểm tra chốt chặn tài khoản tồn tại trong phân hệ Auth
        if (nguoiDungRepository.existsByTenDangNhapAndThoiGianXoaIsNull(event.getTenDangNhapAdmin())) {
            throw new NghiepVuException("Tên đăng nhập admin đã tồn tại", 400);
        }
        if (nguoiDungRepository.existsByEmailAndThoiGianXoaIsNull(event.getEmailAdmin())) {
            throw new NghiepVuException("Email admin đã được sử dụng", 400);
        }

        // 2. Tạo Tài khoản Admin Đơn Vị
        NguoiDung admin = new NguoiDung();
        admin.setIdDonVi(event.getIdDonVi());
        admin.setMaNguoiDung("ND-" + (event.getIdDonVi() == null ? 0 : event.getIdDonVi()) + "-" + System.currentTimeMillis());
        admin.setTenDangNhap(event.getTenDangNhapAdmin());
        admin.setMatKhau(passwordEncoder.encode(event.getMatKhauAdmin()));
        admin.setTenNguoiDung(event.getTenAdmin());
        admin.setEmail(event.getEmailAdmin());
        admin.setTrangThai(TrangThaiCoBanEnum.CHO_XAC_THUC);
        admin = nguoiDungRepository.save(admin);

        // 3. Sinh mã OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        log.info("============== MÃ OTP ĐĂNG KÝ ĐƠN VỊ DÀNH CHO EMAIL {} ==============", event.getEmailAdmin());
        log.info("Mã OTP: {}", otp);
        log.info("=====================================================================");

        // 4. Lưu mã OTP vào DB (mã hóa BCRYPT)
        MaXacThucOTP otpEntity = new MaXacThucOTP();
        otpEntity.setNguoiDung(admin);
        otpEntity.setIdDonVi(event.getIdDonVi());
        otpEntity.setMaXacThucHash(passwordEncoder.encode(otp));
        otpEntity.setLoaiMa("KICH_HOAT_DON_VI");
        otpEntity.setPhuongThucGui("EMAIL");
        otpEntity.setSoLanSaiHienTai(0);
        otpEntity.setTrangThai("HIEU_LUC");
        otpEntity.setThoiGianHetHan(LocalDateTime.now().plusMinutes(15));
        maXacThucOTPRepository.save(otpEntity);

        // 5. Gửi email kích hoạt đơn vị qua RabbitMQ
        MailEvent mailEvent = new MailEvent(event.getEmailAdmin(), "KICH_HOAT_DON_VI", otp);
        rabbitTemplate.convertAndSend("mail.queue", mailEvent);
    }
}
