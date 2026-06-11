package com.example.backend.modules.auth.dto;

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
    private List<String> permissions; // Danh sch mở quyền (Tiếng Việt nh yu cấu)
}
