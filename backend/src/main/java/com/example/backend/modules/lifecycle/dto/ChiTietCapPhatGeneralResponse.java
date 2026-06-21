package com.example.backend.modules.lifecycle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietCapPhatGeneralResponse {
    private Long idChiTietCapPhat;
    private Long idTaiSan;
    private String tenTaiSan;
    private String soSerial;
    private String maTheTaiSan; // Mã thẻ tài sản (hoặc Key bản quyền đối với phần mềm)
    private String loai; // PHAN_CUNG, PHAN_MEM, LINH_KIEN
    private String tinhTrangLucGiao;
    private String trangThaiCapPhat; // DANG_CAP_PHAT hoặc DA_THU_HOI
    private String ghiChu;
}
