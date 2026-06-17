package com.example.backend.modules.asset.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
@Schema(description = "Yêu cầu tạo/cập nhật danh mục thuộc tính")
public class DanhMucThuocTinhRequest {

    @NotBlank(message = "Mã thuộc tính không được để trống")
    @Size(max = 50, message = "Mã thuộc tính không vượt quá 50 ký tự")
    @Schema(description = "Mã thuộc tính duy nhất", example = "RAM_SIZE")
    private String maThuocTinh;

    @NotBlank(message = "Tên thuộc tính không được để trống")
    @Size(max = 100, message = "Tên thuộc tính không vượt quá 100 ký tự")
    @Schema(description = "Tên thuộc tính hiển thị", example = "Dung lượng RAM")
    private String tenThuocTinh;

    @NotBlank(message = "Kiểu dữ liệu không được để trống")
    @Size(max = 30, message = "Kiểu dữ liệu không vượt quá 30 ký tự")
    @Schema(description = "Kiểu dữ liệu (TEXT, NUMBER, SELECT, ...)", example = "SELECT")
    private String kieuDuLieu;

    @NotBlank(message = "Áp dụng cho không được để trống")
    @Size(max = 50, message = "Áp dụng cho không vượt quá 50 ký tự")
    @Pattern(regexp = "PHAN_CUNG|PHAN_MEM|LINH_KIEN", message = "Áp dụng cho chỉ chấp nhận PHAN_CUNG, PHAN_MEM hoặc LINH_KIEN")
    @Schema(description = "Phân hệ áp dụng (PHAN_CUNG, PHAN_MEM, LINH_KIEN)", example = "PHAN_CUNG")
    private String apDungCho;

    @NotNull(message = "Bắt buộc nhập không được để trống")
    @Schema(description = "Trường này có bắt buộc nhập hay không", example = "true")
    private Boolean batBuocNhap;

    @Size(max = 255, message = "Giá trị mặc định không vượt quá 255 ký tự")
    @Schema(description = "Giá trị mặc định của thuộc tính", example = "8GB")
    private String giaTriMacDinh;

    @NotBlank(message = "Trạng thái không được để trống")
    @Size(max = 30, message = "Trạng thái không vượt quá 30 ký tự")
    @Schema(description = "Trạng thái hoạt động (HOAT_DONG/KHOA)", example = "HOAT_DONG")
    private String trangThai;

    @Valid
    @Builder.Default
    @Schema(description = "Danh sách tùy chọn gợi ý đi kèm (Aggregate)")
    private List<LuaChonGoiYSubRequest> luaChonGoiY = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Yêu cầu cấu hình một lựa chọn gợi ý lồng")
    public static class LuaChonGoiYSubRequest {

        @Schema(description = "ID của lựa chọn gợi ý (null nếu thêm mới, có ID nếu cập nhật)", example = "1")
        private Long id;

        @NotBlank(message = "Giá trị gợi ý không được để trống")
        @Size(max = 150, message = "Giá trị gợi ý không vượt quá 150 ký tự")
        @Schema(description = "Giá trị hiển thị của lựa chọn", example = "16GB")
        private String giaTri;

        @NotBlank(message = "Trạng thái không được để trống")
        @Size(max = 30, message = "Trạng thái không vượt quá 30 ký tự")
        @Schema(description = "Trạng thái hoạt động (HOAT_DONG/KHOA)", example = "HOAT_DONG")
        private String trangThai;

        @NotNull(message = "Thứ tự hiển thị không được để trống")
        @Schema(description = "Thứ tự sắp xếp hiển thị", example = "1")
        private Integer thuTuHienThi;
    }
}
