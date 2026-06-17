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
@Schema(description = "Thông tin giá trị thuộc tính thực tế của tài sản")
public class GiaTriThuocTinhResponse {

    @Schema(description = "ID giá trị thuộc tính")
    private Long id;

    @Schema(description = "ID đơn vị quản lý (Tenant ID)")
    private Long idDonVi;

    @Schema(description = "ID danh mục thuộc tính")
    private Long danhMucThuocTinhId;

    @Schema(description = "Tên thuộc tính")
    private String danhMucThuocTinhTen;

    @Schema(description = "Mã thuộc tính")
    private String danhMucThuocTinhMa;

    @Schema(description = "ID lựa chọn gợi ý (nếu chọn option có sẵn)")
    private Long luaChonId;

    @Schema(description = "Giá trị của lựa chọn gợi ý")
    private String luaChonGiaTri;

    @Schema(description = "Loại tài sản (PHAN_CUNG, PHAN_MEM, LINH_KIEN)")
    private String loaiTaiSan;

    @Schema(description = "ID tài sản cụ thể")
    private Long idTaiSan;

    @Schema(description = "Giá trị thực tế lưu trữ")
    private String giaTri;

    @Schema(description = "Thời gian tạo")
    private LocalDateTime thoiGianTao;

    @Schema(description = "Thời gian cập nhật")
    private LocalDateTime thoiGianCapNhat;
}
