package com.example.backend.modules.lifecycle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhieuTonDongDto {
    private Long idNguoiLap;
    private String maChungTu;
    private String loaiChungTu; // "Cấp phát", "Thu hồi", "Điều chuyển", "Thanh lý"
    private LocalDateTime thoiGianCapNhat;
}
