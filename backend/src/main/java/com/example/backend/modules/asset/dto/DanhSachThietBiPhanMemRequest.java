package com.example.backend.modules.asset.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DanhSachThietBiPhanMemRequest {

    @NotNull(message = "Mẫu tài sản phần mềm không được để trống")
    private Long idTaiSanPhanMem;

    private Long idNhaCungCap;

    @NotBlank(message = "Key bản quyền không được để trống")
    @Size(max = 255, message = "Key bản quyền không vượt quá 255 ký tự")
    private String keyBanQuyen;

    @Size(max = 100, message = "Mã chứng từ mua không vượt quá 100 ký tự")
    private String maChungTuMua;

    @Min(value = 1, message = "Tổng số ghế phải lớn hơn hoặc bằng 1")
    private Integer tongSoGhe;

    @Min(value = 0, message = "Giá mua phải lớn hơn hoặc bằng 0")
    private BigDecimal giaMua;

    private LocalDate thoiGianMua;

    private LocalDate thoiGianHetHan;

    @Size(max = 50, message = "Trạng thái kho không vượt quá 50 ký tự")
    private String trangThaiKho;

    @NotBlank(message = "Trạng thái không được để trống")
    @Size(max = 30, message = "Trạng thái không vượt quá 30 ký tự")
    private String trangThai;
}
