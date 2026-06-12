package com.example.backend.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MailEvent {
    private String toEmail;
    private String type; // "QUEN_MAT_KHAU" hoặc "KICH_HOAT_DON_VI"
    private String otp;
}
