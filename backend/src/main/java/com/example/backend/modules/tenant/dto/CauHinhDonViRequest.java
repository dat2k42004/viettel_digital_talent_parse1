package com.example.backend.modules.tenant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CauHinhDonViRequest {
    @NotNull(message = "ID danh mởc cấu hình khng ức ? trảng")
    private Long idDanhMucCauHinh;

    @NotBlank(message = "Gi trả cấu hình khng ức ? trảng")
    private String giaTriCauHinh;
}
