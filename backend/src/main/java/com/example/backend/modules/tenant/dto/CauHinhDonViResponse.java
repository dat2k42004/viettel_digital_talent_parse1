package com.example.backend.modules.tenant.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CauHinhDonViResponse {
    private Long id;
    private Long idDonVi;
    private Long idDanhMucCauHinh;
    private String maCauHinh; // Extra field cho tiện hiển thị
    private String tenCauHinh; // Extra field cho tiện hiển thị
    private String giaTriCauHinh;
}
