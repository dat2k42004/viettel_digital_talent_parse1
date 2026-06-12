package com.example.backend.modules.auth.dto;

import com.example.backend.modules.tenant.dto.DonViResponse;
import com.example.backend.modules.tenant.dto.CauHinhDonViResponse;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class XacThucResponse {
    private String accessToken;
    private String refreshToken;
    private Long idDonVi;
    private String username;
    private List<String> permissions; // Danh sách các quyền (Tiếng Việt như yêu cầu)
    
    private NguoiDungResponse thongTinNguoiDung;
    private DonViResponse thongTinDonVi;
    private List<CauHinhDonViResponse> cauHinhDonVi;
}
