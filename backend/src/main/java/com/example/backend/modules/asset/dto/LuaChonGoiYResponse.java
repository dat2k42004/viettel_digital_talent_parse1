package com.example.backend.modules.asset.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin lựa chọn gợi ý trả về")
public class LuaChonGoiYResponse {

    @Schema(description = "ID lựa chọn")
    private Long id;

    @Schema(description = "ID danh mục thuộc tính cha")
    private Long idDanhMucThuocTinh;

    @Schema(description = "Giá trị gợi ý")
    private String giaTri;

    @Schema(description = "Trạng thái")
    private String trangThai;

    @Schema(description = "Thứ tự hiển thị")
    private Integer thuTuHienThi;

    @Schema(description = "Thời gian tạo")
    private LocalDateTime thoiGianTao;

    @Schema(description = "Thời gian cập nhật")
    private LocalDateTime thoiGianCapNhat;
}
