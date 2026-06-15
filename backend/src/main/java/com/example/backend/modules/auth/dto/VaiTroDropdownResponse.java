package com.example.backend.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VaiTroDropdownResponse {
    private Long id;
    private String maVaiTro;
    private String tenVaiTro;
}
