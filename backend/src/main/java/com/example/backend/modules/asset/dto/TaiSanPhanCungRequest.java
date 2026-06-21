package com.example.backend.modules.asset.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaiSanPhanCungRequest {

    @NotNull(message = "Danh mục tài sản không được để trống")
    private Long idDanhMucTaiSan;

    @NotNull(message = "Loại tài sản không được để trống")
    private Long idLoaiTaiSan;

    @NotNull(message = "Hãng sản xuất không được để trống")
    private Long idHangSanXuat;

    @Size(max = 50, message = "Mã mẫu không vượt quá 50 ký tự")
    private String maMau;

    @NotBlank(message = "Tên mẫu không được để trống")
    @Size(max = 150, message = "Tên mẫu không vượt quá 150 ký tự")
    private String tenMau;

    @Size(max = 255, message = "Đường dẫn hình ảnh không vượt quá 255 ký tự")
    private String hinhAnh;

    @NotNull(message = "Thông tin có thể tháo lắp không được để trống")
    private Boolean coTheThaoLap;

    private String moTa;

    @NotBlank(message = "Trạng thái không được để trống")
    @Size(max = 30, message = "Trạng thái không vượt quá 30 ký tự")
    private String trangThai;
}
