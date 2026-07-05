package com.example.backend.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DangKyDonViEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long idDonVi;
    private String tenDangNhapAdmin;
    private String matKhauAdmin;
    private String tenAdmin;
    private String emailAdmin;
}
