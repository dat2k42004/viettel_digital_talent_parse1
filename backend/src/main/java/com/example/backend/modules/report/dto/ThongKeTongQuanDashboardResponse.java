package com.example.backend.modules.report.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThongKeTongQuanDashboardResponse {
     private Long idDonVi;
     private Long tongSoLuongThietBi;
     private BigDecimal tongGiaTriTaiSanVnd;
     private Long soLuongYeuCauCapPhatChoDuyet;
     private Long soLuongYeuCauBaoHongChoDuyet;

     // Bản đồ tỷ lệ trạng thái (Sẵn sàng, Đang cấp phát, Bảo trì, Hỏng) phục vụ vẽ
     // biểu đồ tròn
     private Map<String, Long> bieuDoTyLeTrangThai;

     // Bản đồ phân bổ số lượng thiết bị theo từng phòng ban phục vụ vẽ biểu đồ cột
     private Map<String, Long> bieuDoPhanBoPhongBan;
}