package com.example.backend.modules.asset.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin danh mục thuộc tính trả về")
public class DanhMucThuocTinhResponse {
    
    @Schema(description = "ID thuộc tính")
    private Long id;

    @Schema(description = "Mã thuộc tính")
    private String maThuocTinh;

    @Schema(description = "Tên thuộc tính")
    private String tenThuocTinh;

    @Schema(description = "Kiểu dữ liệu")
    private String kieuDuLieu;

    @Schema(description = "Áp dụng cho")
    private String apDungCho;

    @Schema(description = "Bắt buộc nhập")
    private Boolean batBuocNhap;

    @Schema(description = "Giá trị mặc định")
    private String giaTriMacDinh;

    @Schema(description = "Trạng thái")
    private String trangThai;

    @Schema(description = "Thời gian tạo")
    private LocalDateTime thoiGianTao;

    @Schema(description = "Thời gian cập nhật")
    private LocalDateTime thoiGianCapNhat;

    @Schema(description = "Danh sách tùy chọn gợi ý đi kèm")
    private List<LuaChonGoiYResponse> luaChonGoiY;
}
