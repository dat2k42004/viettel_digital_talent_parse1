package com.example.backend.modules.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class XacThucResponse {
    private String accessToken;
    private String refreshToken;
    private Long idDonVi;
    private String username;
    
    private NguoiDungResponse thongTinNguoiDung;
}
