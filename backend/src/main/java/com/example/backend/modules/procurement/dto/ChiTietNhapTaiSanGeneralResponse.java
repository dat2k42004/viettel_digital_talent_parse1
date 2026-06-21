package com.example.backend.modules.procurement.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin chi tiết phẳng của phiếu nhập tài sản")
public class ChiTietNhapTaiSanGeneralResponse {
     private Long id;

     @Schema(description = "ID của vật tư tài sản")
     private Long idTaiSan;

     @Schema(description = "Tên vật tư tài sản")
     private String tenTaiSan;

     @Schema(description = "ID của thiết bị hoặc linh kiện thực nhập")
     private Long idThietBi;

     @Schema(description = "ID của chi tiết đơn hàng tương ứng")
     private Long idChiTietDonHang;

     @Schema(description = "Giá nhập thực tế")
     private BigDecimal giaNhapThucTe;

     @Schema(description = "Tình trạng lúc nhập")
     private String tinhTrangLucNhap;

     @Schema(description = "Số lượng ghế nhập (dành cho phần mềm)")
     private Integer soLuongGheNhap;

     @Schema(description = "Phân loại tài sản (PHAN_CUNG, LINH_KIEN, PHAN_MEM)")
     private String loai;

     private LocalDateTime thoiGianTao;
     private LocalDateTime thoiGianCapNhat;
}
