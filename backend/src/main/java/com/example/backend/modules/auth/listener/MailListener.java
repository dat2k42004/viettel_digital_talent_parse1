package com.example.backend.modules.auth.listener;

import com.example.backend.modules.auth.service.EmailService;
import com.example.backend.shared.dto.MailEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MailListener {

    private final EmailService emailService;

    @RabbitListener(queues = "mail.queue")
    public void processMailSending(MailEvent event) {
        log.info("Nhận sự kiện gửi email từ RabbitMQ cho email: {}, loại: {}", event.getToEmail(), event.getType());
        try {
            if ("QUEN_MAT_KHAU".equals(event.getType())) {
                emailService.guiOtpQuenMatKhau(event.getToEmail(), event.getOtp());
            } else if ("KICH_HOAT_DON_VI".equals(event.getType())) {
                emailService.guiOtpKichHoatDonVi(event.getToEmail(), event.getOtp());
            } else {
                log.warn("Loại email không hợp lệ: {}", event.getType());
            }
            log.info("Gửi email thành công tới: {}", event.getToEmail());
        } catch (Exception e) {
            log.error("Lỗi khi thực hiện gửi email nền: {}", e.getMessage(), e);
            throw e;
        }
    }
}
