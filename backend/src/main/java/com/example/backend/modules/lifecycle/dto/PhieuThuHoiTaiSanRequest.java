package com.example.backend.modules.lifecycle.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhieuThuHoiTaiSanRequest {

    @NotNull(message = "Nhân viên trả không được để trống")
    private Long idNhanVienTra;

    @NotNull(message = "Phòng ban trả không được để trống")
    private Long idPhongBanTra;

    private String lyDoThuHoi;

    private List<@Valid ChiTietThuHoiPhanCungRequest> danhSachPhanCung;
    private List<@Valid ChiTietThuHoiPhanMemRequest> danhSachPhanMem;
    private List<@Valid ChiTietThuHoiLinhKienRequest> danhSachLinhKien;
}
