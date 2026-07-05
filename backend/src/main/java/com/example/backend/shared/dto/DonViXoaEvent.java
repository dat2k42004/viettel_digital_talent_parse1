package com.example.backend.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonViXoaEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long idDonVi;
    private LocalDateTime thoiGianXoa;
    private String lyDoXoa;
}
