package com.example.backend.modules.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuyenResponse {
    private Long id;
    private String maQuyen;
    private String tenQuyen;
}
