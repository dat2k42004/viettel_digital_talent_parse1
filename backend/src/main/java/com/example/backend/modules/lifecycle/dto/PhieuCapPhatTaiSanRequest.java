package com.example.backend.modules.lifecycle.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhieuCapPhatTaiSanRequest {

    @NotNull(message = "Người nhận không được để trống")
    private Long idNguoiNhan;

    @NotNull(message = "Phòng ban nhận không được để trống")
    private Long idPhongBanNhan;

    private String mucDichSuDung;

    @Builder.Default
    private List<@Valid ChiTietCapPhatPhanCungRequest> danhSachPhanCung = new ArrayList<>();

    @Builder.Default
    private List<@Valid ChiTietCapPhatPhanMemRequest> danhSachPhanMem = new ArrayList<>();

    @Builder.Default
    private List<@Valid ChiTietCapPhatLinhKienRequest> danhSachLinhKien = new ArrayList<>();
}
