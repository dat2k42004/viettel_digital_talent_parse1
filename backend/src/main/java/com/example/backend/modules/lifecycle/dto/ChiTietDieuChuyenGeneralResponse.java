package com.example.backend.modules.lifecycle.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin chi tiết tài sản trong phiếu điều chuyển")
public class ChiTietDieuChuyenGeneralResponse {
     private Long id;

     @Schema(description = "ID vật lý của thiết bị hoặc linh kiện")
     private Long idTaiSan;

     @Schema(description = "ID dòng chi tiết cấp phát gốc tương ứng của người gửi")
     private Long chiTietCapPhatId;

     @Schema(description = "Tên mẫu tài sản")
     private String tenTaiSan;

     @Schema(description = "Số Serial định danh vật lý")
     private String soSerial;

     @Schema(description = "Mã thẻ tài sản (nếu là phần cứng, linh kiện trả về null)")
     private String maTheTaiSan;

     @Schema(description = "Tình trạng thiết bị do người chuyển giao ghi nhận")
     private String trangThaiXuat;

     @Schema(description = "Tình trạng thiết bị do đầu nhận đối soát thực tế")
     private String trangThaiNhan;

     @Schema(description = "Phân loại vật tư điều chuyển (PHAN_CUNG hoặc LINH_KIEN)")
     private String loai;

     private String ghiChu;
}
