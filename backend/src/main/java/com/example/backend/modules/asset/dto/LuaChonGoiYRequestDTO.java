package com.example.backend.modules.asset.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Yêu cầu tạo/cập nhật lựa chọn gợi ý cho thuộc tính")
public class LuaChonGoiYRequestDTO {

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
