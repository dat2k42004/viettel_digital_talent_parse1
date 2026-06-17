package com.example.backend.modules.asset.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dữ liệu yêu cầu lắp ráp linh kiện vào thiết bị")
public class LapRapLinhKienRequest {
     @NotNull(message = "ID thiết bị phần cứng không được để trống")
     @Schema(description = "ID của thiết bị phần cứng tiếp nhận linh kiện", example = "1")
     private Long thietBiPhanCungId;

     @NotNull(message = "ID linh kiện phần cứng không được để trống")
     @Schema(description = "ID của linh kiện phần cứng lẻ cần mang đi lắp ráp", example = "5")
     private Long linhKienPhanCungId;

     @Schema(description = "Ghi chú bổ sung khi thực hiện lắp ráp", example = "Nâng cấp dung lượng RAM cho máy làm đồ họa")
     private String ghiChu;
}
