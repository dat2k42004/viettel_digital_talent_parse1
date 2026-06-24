package com.example.backend.modules.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ExecuteKiemKeRequest {
     @NotNull(message = "Lựa chọn hình thức lưu (true: Gửi báo cáo, false: Lưu nháp tiến độ) không được để trống")
     private Boolean isSubmit;

     @Valid
     private List<UpdateThietBiItem> danhSachThietBi;

     @Valid
     private List<UpdateLinhKienItem> danhSachLinhKien;

     @Valid
     private List<UpdatePhanMemItem> danhSachPhanMem;

     @Data
     public static class UpdateThietBiItem {
          @NotNull(message = "ID dòng chi tiết thiết bị không được để trống")
          private Long idChiTiet;
          private String tinhTrangThucTe;
          @NotBlank(message = "Kết luận kiểm kê thiết bị không được để trống")
          private String ketLuan; // KHOP, THIEU_HUT, SAI_VI_TRI
          private String ghiChu;
          private Long idNhanVienSuDungThucTe;
     }

     @Data
     public static class UpdateLinhKienItem {
          @NotNull(message = "ID dòng chi tiết linh kiện không được để trống")
          private Long idChiTiet;
          private String viTriThucTe;
          private String tinhTrangThucTe;
          @NotBlank(message = "Kết luận kiểm kê linh kiện không được để trống")
          private String ketLuan; // KHOP, THIEU_HUT, SAI_VI_TRI
          private String ghiChu;
     }

     @Data
     public static class UpdatePhanMemItem {
          @NotNull(message = "ID dòng chi tiết phần mềm không được để trống")
          private Long idChiTiet;
          private String trangThaiBanQuyen; // ACTIVE, EXPIRED, ILLEGAL
          @NotBlank(message = "Kết luận kiểm kê bản quyền không được để trống")
          private String ketLuan; // KHOP, THIEU_HUT
          private String ghiChu;
     }
}