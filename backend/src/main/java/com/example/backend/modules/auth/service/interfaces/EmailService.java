package com.example.backend.modules.auth.service.interfaces;

public interface EmailService {
    void guiOtpQuenMatKhau(String toEmail, String otp);
    void guiOtpKichHoatDonVi(String toEmail, String otp);
    void guiEmailDonGian(String toEmail, String tieuDe, String noiDung);
}
