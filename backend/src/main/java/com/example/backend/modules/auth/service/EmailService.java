package com.example.backend.modules.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void guiOtpQuenMatKhau(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Mã OTP Đặt Lại Mật Khẩu");
        message.setText("Chào bạn,\n\nBạn đã yêu cầu đặt lại mật khẩu cho tài khoản hệ thống của mình.\n"
                + "Mã OTP của bạn là: " + otp + "\n"
                + "Mã này có hiệu lực trong vòng 5 phút.\n\n"
                + "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n"
                + "Trân trọng,\nBan quản trị hệ thống.");
        mailSender.send(message);
    }

    public void guiOtpKichHoatDonVi(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Mã OTP Kích Hoạt Đơn Vị Mới");
        message.setText("Chào bạn,\n\nBạn đã đăng ký đơn vị mới trên hệ thống.\n"
                + "Mã OTP kích hoạt tài khoản của bạn là: " + otp + "\n"
                + "Mã này có hiệu lực trong vòng 15 phút.\n\n"
                + "Trân trọng,\nBan quản trị hệ thống.");
        mailSender.send(message);
    }
}
