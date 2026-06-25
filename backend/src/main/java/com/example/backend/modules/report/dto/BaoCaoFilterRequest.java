package com.example.backend.modules.report.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BaoCaoFilterRequest {
     private String loaiBaoCao; // TON_KHO, CAP_PHAT, BAO_TRI
     private Long idPhongBan;
     private Long idViTri;
     private LocalDate tuNgay;
     private LocalDate denNgay;
     private String tuKhoaTimKiem; // Tìm kiếm theo mã Asset Tag, Số Serial
}