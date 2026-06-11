package com.example.backend.modules.tenant.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ViTriResponse {
    private Long id;
    private Long idDonVi;
    private String maViTri;
    private String tenViTri;
    private String tenTiengAnh;
    private String loaiViTri;
    private Integer sucChuaToiDa;
    private BigDecimal dienTichM2;
    private BigDecimal chieuCaoM;
    private String capDoBaoMat;
    private Boolean laPhongKinh;
    private Boolean coDieuHoaTrungTam;
    private Boolean coHeThongPccc;
    private Boolean coKiemSoatCua;
    private String moTaChiTiet;
    private String trangThai;
}
