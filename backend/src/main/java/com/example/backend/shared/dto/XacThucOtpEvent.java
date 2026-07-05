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
public class XacThucOtpEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private String email;
    private String otp;
    
    // Set by listener upon successful verification
    private Long idDonVi;
}
