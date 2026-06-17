package com.example.backend.modules.asset.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dữ liệu phản hồi thông tin lịch sử tháo lắp linh kiện")
public class LapRapLinhKienResponse {
     @Schema(description = "ID bản ghi liên kết tháo lắp")
     private Long id;

     @Schema(description = "ID thiết bị phần cứng")
     private Long thietBiPhanCungId;

     @Schema(description = "Số Serial của thiết bị phần cứng")
     private String soSerialThietBi;

     @Schema(description = "Mã thẻ tài sản của thiết bị phần cứng")
     private String maTheTaiSanThietBi;

     @Schema(description = "ID linh kiện phần cứng")
     private Long linhKienPhanCungId;

     @Schema(description = "Số Serial của linh kiện phần cứng")
     private String soSerialLinhKien;

     @Schema(description = "Thời gian thực hiện lắp ráp")
     private LocalDateTime thoiGianLap;

     @Schema(description = "Thời gian thực hiện tháo dỡ (null nếu đang liên kết)")
     private LocalDateTime thoiGianThao;

     @Schema(description = "Trạng thái liên kết (ACTIVE: Đang gắn, INACTIVE: Đã tháo)")
     private String trangThaiLienKet;

     @Schema(description = "Ghi chú tháo lắp")
     private String ghiChu;

     @Schema(description = "Thời gian tạo bản ghi")
     private LocalDateTime thoiGianTao;

     @Schema(description = "Thời gian cập nhật bản ghi")
     private LocalDateTime thoiGianCapNhat;
}
