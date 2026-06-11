package com.example.backend.modules.tenant.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ViTriRequest {
    @NotBlank(message = "Mã vị trí không được để trống")
    private String maViTri;

    @NotBlank(message = "Tên vị trí không được để trống")
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
