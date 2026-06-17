package com.example.backend.modules.asset.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Yêu cầu lưu hàng loạt giá trị thuộc tính cho tài sản")
public class GiaTriThuocTinhBulkSaveRequest {

    @NotBlank(message = "Loại tài sản không được để trống")
    @Pattern(regexp = "PHAN_CUNG|PHAN_MEM|LINH_KIEN", message = "Loại tài sản chỉ chấp nhận PHAN_CUNG, PHAN_MEM hoặc LINH_KIEN")
    @Schema(description = "Loại tài sản cấu hình (PHAN_CUNG, PHAN_MEM, LINH_KIEN)", example = "PHAN_CUNG")
    private String loaiTaiSan;

    @NotNull(message = "ID tài sản không được để trống")
    @Schema(description = "ID của thiết bị hoặc key bản quyền cụ thể", example = "12")
    private Long idTaiSan;

    @NotEmpty(message = "Danh sách giá trị thuộc tính không được để trống")
    @Valid
    @Schema(description = "Danh sách giá trị thuộc tính chi tiết")
    private List<AttributeValueItem> values;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Chi tiết một giá trị thuộc tính")
    public static class AttributeValueItem {

        @NotNull(message = "ID danh mục thuộc tính không được để trống")
        @Schema(description = "ID danh mục thuộc tính", example = "1")
        private Long danhMucThuocTinhId;

        @Schema(description = "ID lựa chọn gợi ý (nếu chọn từ option có sẵn)", example = "2")
        private Long luaChonId;

        @Schema(description = "Giá trị tự nhập tay (hoặc đi kèm option Khác...)", example = "24GB")
        private String giaTri;
    }
}
