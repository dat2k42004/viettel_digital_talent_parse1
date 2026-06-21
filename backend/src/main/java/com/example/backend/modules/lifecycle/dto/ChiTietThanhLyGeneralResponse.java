package com.example.backend.modules.lifecycle.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin chi tiết tài sản trong phiếu thanh lý")
public class ChiTietThanhLyGeneralResponse {
     private Long id;

     @Schema(description = "ID vật lý của thiết bị/phần mềm/linh kiện")
     private Long idTaiSan;

     @Schema(description = "Tên mẫu tài sản")
     private String tenTaiSan;

     @Schema(description = "Số Serial định danh")
     private String soSerial;

     @Schema(description = "Mã thẻ tài sản (nếu có)")
     private String maTheTaiSan;

     @Schema(description = "Giá trị thu hồi dự kiến khi thanh lý con máy này")
     private BigDecimal tienThuHoi;

     private String lýDoChiTiet;
     private String loai; // PHAN_CUNG, PHAN_MEM, LINH_KIEN
     private String ghiChu;
}
