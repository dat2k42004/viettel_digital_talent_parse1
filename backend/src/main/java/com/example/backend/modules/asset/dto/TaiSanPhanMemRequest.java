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
public class TaiSanPhanMemRequest {

    @NotNull(message = "Danh mục tài sản không được để trống")
    private Long idDanhMucTaiSan;

    @NotNull(message = "Loại tài sản không được để trống")
    private Long idLoaiTaiSan;

    @NotNull(message = "Hãng sản xuất không được để trống")
    private Long idHangSanXuat;

    @NotBlank(message = "Mã mẫu không được để trống")
    @Size(max = 50, message = "Mã mẫu không vượt quá 50 ký tự")
    private String maMau;

    @NotBlank(message = "Tên mẫu không được để trống")
    @Size(max = 150, message = "Tên mẫu không vượt quá 150 ký tự")
    private String tenMau;

    @Size(max = 255, message = "Đường dẫn hình ảnh không vượt quá 255 ký tự")
    private String hinhAnh;

    @Size(max = 50, message = "Hình thức triển khai không vượt quá 50 ký tự")
    private String hinhThucTrienKhai;

    @Size(max = 100, message = "Nền tảng hỗ trợ không vượt quá 100 ký tự")
    private String nenTangHoTro;

    @Size(max = 50, message = "Hình thức cấp phép không vượt quá 50 ký tự")
    private String hinhThucCapPhep;

    private String moTa;

    @NotBlank(message = "Trạng thái không được để trống")
    @Size(max = 30, message = "Trạng thái không vượt quá 30 ký tự")
    private String trangThai;
}
