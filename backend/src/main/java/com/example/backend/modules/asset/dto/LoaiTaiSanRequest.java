package com.example.backend.modules.asset.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoaiTaiSanRequest {

    @Size(max = 50, message = "Mã loại không vượt quá 50 ký tự")
    private String maLoai;

    @NotBlank(message = "Tên loại không được để trống")
    @Size(max = 100, message = "Tên loại không vượt quá 100 ký tự")
    private String tenLoai;

    @Size(max = 10, message = "Tiền tố mã thẻ không vượt quá 10 ký tự")
    private String tienToMaThe;

    @Min(value = 0, message = "Thời gian khấu hao phải lớn hơn hoặc bằng 0")
    private Integer thoiGianKhauHao;

    private String ghiChu;

    @NotBlank(message = "Trạng thái không được để trống")
    @Size(max = 30, message = "Trạng thái không vượt quá 30 ký tự")
    private String trangThai;
}
