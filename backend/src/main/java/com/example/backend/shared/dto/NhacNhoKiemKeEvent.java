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
public class NhacNhoKiemKeEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long idDotKiemKe;
}
