package com.example.backend.modules.auth.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class VaiTroResponse {
    private Long id;
    private Long idDonVi;
    private String maVaiTro;
    private String tenVaiTro;
    private String moTa;
    private String trangThai;
    private Boolean laHeThong;
    private Integer capDoUuTien;
    private List<QuyenResponse> danhSachQuyen;
}
