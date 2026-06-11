package com.example.backend.modules.auth.event;

import com.example.backend.modules.auth.model.NguoiDung;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DangNhapEvent {
    private NguoiDung nguoiDung;
    private String tenDangNhap;
    private String ketQua; // "THANH_CONG", "THAT_BAI"
    private String diaChiIp;
    private String trinhDuyet;
}
