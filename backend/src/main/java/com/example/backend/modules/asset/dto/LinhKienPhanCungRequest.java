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
public class LinhKienPhanCungRequest {

    @NotNull(message = "Mẫu tài sản phần cứng không được để trống")
    private Long idTaiSanPhanCung;

    private Long idNhaCungCap;

    @NotBlank(message = "Số Serial không được để trống")
    @Size(max = 100, message = "Số Serial không vượt quá 100 ký tự")
    private String soSerial;

    @Min(value = 0, message = "Giá mua phải lớn hơn hoặc bằng 0")
    private BigDecimal giaMua;

    private LocalDate thoiGianMua;

    @Min(value = 0, message = "Hạn bảo hành phải lớn hơn hoặc bằng 0")
    private Integer hanBaoHanhThang;

    @Size(max = 50, message = "Trạng thái kho không vượt quá 50 ký tự")
    private String trangThaiKho;

    @Size(max = 100, message = "Vị trí kho không vượt quá 100 ký tự")
    private String viTriKho;

    @NotBlank(message = "Trạng thái không được để trống")
    @Size(max = 30, message = "Trạng thái không vượt quá 30 ký tự")
    private String trangThai;
}
