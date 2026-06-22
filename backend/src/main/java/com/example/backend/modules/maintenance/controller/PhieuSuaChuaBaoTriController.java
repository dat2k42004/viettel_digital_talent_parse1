package com.example.backend.modules.maintenance.controller;

import com.example.backend.modules.maintenance.dto.TienDoBaoTriChiTietRequest;
import com.example.backend.modules.maintenance.dto.PhieuSuaChuaBaoTriRequest;
import com.example.backend.modules.maintenance.dto.PhieuSuaChuaBaoTriResponse;
import com.example.backend.modules.maintenance.service.interfaces.PhieuSuaChuaBaoTriService;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/phieu-sua-chua-bao-tri")
@RequiredArgsConstructor
public class PhieuSuaChuaBaoTriController {

     private final PhieuSuaChuaBaoTriService phieuSuaChuaBaoTriService;

     @PostMapping
     @PreAuthorize("hasAuthority('THEM_MOI_PHIEU_SUA_CHUA_BAO_TRI')")
     public ApiResponse<PhieuSuaChuaBaoTriResponse> themMoi(@Valid @RequestBody PhieuSuaChuaBaoTriRequest request) {
          return ApiResponse.success(phieuSuaChuaBaoTriService.themMoi(request));
     }

     @PutMapping("/{id}")
     @PreAuthorize("hasAuthority('CAP_NHAT_PHIEU_SUA_CHUA_BAO_TRI')")
     public ApiResponse<PhieuSuaChuaBaoTriResponse> capNhat(@PathVariable Long id,
               @Valid @RequestBody PhieuSuaChuaBaoTriRequest request) {
          return ApiResponse.success(phieuSuaChuaBaoTriService.capNhat(id, request));
     }

     @DeleteMapping("/{id}")
     @PreAuthorize("hasAuthority('XOA_PHIEU_SUA_CHUA_BAO_TRI')")
     public ApiResponse<String> xoaMem(@PathVariable Long id) {
          phieuSuaChuaBaoTriService.xoaMem(id);
          return ApiResponse.success("Xóa mềm dữ liệu chứng từ phiếu sửa chữa bảo trì thành công");
     }

     @PutMapping("/{id}/yeu-cau-phe-duyet")
     @PreAuthorize("hasAuthority('GUI_PHE_DUYET_PHIEU_SUA_CHUA_BAO_TRI')")
     public ApiResponse<String> yeuCauPheDuyet(@PathVariable Long id) {
          phieuSuaChuaBaoTriService.yeuCauPheDuyet(id);
          return ApiResponse.success("Gửi yêu cầu phê duyệt quy trình sửa chữa thành công");
     }

     @PutMapping("/{id}/phe-duyet")
     @PreAuthorize("hasAuthority('PHE_DUYET_PHIEU_SUA_CHUA_BAO_TRI')")
     public ApiResponse<String> pheDuyet(@PathVariable Long id) {
          phieuSuaChuaBaoTriService.pheDuyet(id);
          return ApiResponse.success("Phê duyệt thông qua phiếu sửa chữa bảo trì tài sản thành công");
     }

     // CHỨC NĂNG 6: API ĐẦU NHẬN TẬP TRUNG THEO DÕI TIẾN ĐỘ THỰC HIỆN QUA PHIẾU TỔNG
     @PutMapping("/{id}/cap-nhat-tien-do")
     @PreAuthorize("hasAuthority('CAP_NHAT_TIEN_DO_PSCBT')")
     public ApiResponse<String> capNhatTienDoThucHien(@PathVariable Long id,
               @Valid @RequestBody List<TienDoBaoTriChiTietRequest> request) {
          phieuSuaChuaBaoTriService.capNhatTienDoThucHien(id, request);
          return ApiResponse.success("Cập nhật trạng thái tiến độ thực hiện chi tiết thành công");
     }

     @GetMapping
     @PreAuthorize("hasAuthority('XEM_DANH_SACH_PHIEU_SUA_CHUA_BAO_TRI')")
     public ApiResponse<PageResponse<PhieuSuaChuaBaoTriResponse>> layDanhSach(
               @RequestParam(required = false) String trangThai,
               @RequestParam(required = false) LocalDate tuNgay,
               @RequestParam(required = false) LocalDate denNgay,
               @RequestParam(defaultValue = "0") int page,
               @RequestParam(defaultValue = "10") int size,
               @RequestParam(defaultValue = "id,desc") String sort) {
          return ApiResponse
                    .success(phieuSuaChuaBaoTriService.layDanhSach(trangThai, tuNgay, denNgay, page, size, sort));
     }

     @GetMapping("/{id}")
     @PreAuthorize("hasAuthority('XEM_CHI_TIET_PHIEU_SUA_CHUA_BAO_TRI')")
     public ApiResponse<PhieuSuaChuaBaoTriResponse> layTheoId(@PathVariable Long id) {
          return ApiResponse.success(phieuSuaChuaBaoTriService.layTheoId(id));
     }
}
