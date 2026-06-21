package com.example.backend.modules.lifecycle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin chi tiết phẳng của phiếu thu hồi tài sản")
public class ChiTietThuHoiGeneralResponse {
    private Long id;

    @Schema(description = "ID chi tiết cấp phát tương ứng")
    private Long idChiTietCapPhat;

    @Schema(description = "ID của thiết bị hoặc linh kiện được thu hồi")
    private Long idTaiSan;

    @Schema(description = "Tên tài sản (mẫu thiết bị/phần mềm/linh kiện)")
    private String tenTaiSan;

    @Schema(description = "Số serial của thiết bị hoặc linh kiện")
    private String soSerial;

    @Schema(description = "Mã thẻ tài sản (hoặc Key bản quyền đối với phần mềm)")
    private String maTheTaiSan;

    @Schema(description = "Tình trạng lúc thu hồi")
    private String tinhTrangLucThuHoi;

    @Schema(description = "Phụ kiện đi kèm thu hồi")
    private String phuKienThuHoi;

    @Schema(description = "Thời gian thực hiện thu hồi (dành riêng cho phần mềm)")
    private LocalDateTime thoiGianThuHoi;

    @Schema(description = "Ghi chú")
    private String ghiChu;

    @Schema(description = "Phân loại tài sản (PHAN_CUNG, PHAN_MEM, LINH_KIEN)")
    private String loai;
}
