package com.example.backend.modules.maintenance.controller;

import com.example.backend.modules.maintenance.dto.KeHoachBaoTriDinhKyRequest;
import com.example.backend.modules.maintenance.dto.KeHoachBaoTriDinhKyResponse;
import com.example.backend.modules.maintenance.service.interfaces.KeHoachBaoTriDinhKyService;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/ke-hoach-bao-tri")
@RequiredArgsConstructor
public class KeHoachBaoTriController {

     private final KeHoachBaoTriDinhKyService keHoachBaoTriService;

     @PostMapping
     @PreAuthorize("hasAuthority('THEM_MOI_KHBTDK')")
     public ApiResponse<KeHoachBaoTriDinhKyResponse> themMoi(@Valid @RequestBody KeHoachBaoTriDinhKyRequest request) {
          return ApiResponse.success(keHoachBaoTriService.themMoi(request));
     }

     @PutMapping("/{id}")
     @PreAuthorize("hasAuthority('CAP_NHAT_KHBTDK')")
     public ApiResponse<KeHoachBaoTriDinhKyResponse> capNhat(@PathVariable Long id,
               @Valid @RequestBody KeHoachBaoTriDinhKyRequest request) {
          return ApiResponse.success(keHoachBaoTriService.capNhat(id, request));
     }

     @DeleteMapping("/{id}")
     @PreAuthorize("hasAuthority('XOA_KHBTDK')")
     public ApiResponse<String> xoaMem(@PathVariable Long id) {
          keHoachBaoTriService.xoaMem(id);
          return ApiResponse.success("Xóa mềm kế hoạch bảo trì định kỳ hệ thống thành công");
     }

     @PutMapping("/{id}/yeu-cau-phe-duyet")
     @PreAuthorize("hasAuthority('GUI_PHE_DUYET_KHBTDK')")
     public ApiResponse<String> yeuCauPheDuyet(@PathVariable Long id) {
          keHoachBaoTriService.yeuCauPheDuyet(id);
          return ApiResponse.success("Gửi yêu cầu phê duyệt kế hoạch bảo trì định kỳ thành công");
     }

     @PutMapping("/{id}/phe-duyet")
     @PreAuthorize("hasAuthority('PHE_DUYET_KHBTDK')")
     public ApiResponse<String> pheDuyet(@PathVariable Long id) {
          keHoachBaoTriService.pheDuyet(id);
          return ApiResponse.success("Phê duyệt thông qua kế hoạch bảo trì định kỳ thành công");
     }

     @PutMapping("/{id}/tu-choi")
     @PreAuthorize("hasAuthority('PHE_DUYET_KHBTDK')")
     public ApiResponse<String> tuChoiPheDuyet(@PathVariable Long id, @RequestParam String lyDoTuChoi) {
          keHoachBaoTriService.tuChoiPheDuyet(id, lyDoTuChoi);
          return ApiResponse.success("Từ chối phê duyệt kế hoạch bảo trì định kỳ thành công");
     }

     @GetMapping
     @PreAuthorize("hasAuthority('XEM_DANH_SACH_KHBTDK')")
     public ApiResponse<PageResponse<KeHoachBaoTriDinhKyResponse>> layDanhSach(
               @RequestParam(required = false) String trangThai,
               @RequestParam(required = false) LocalDate tuNgay,
               @RequestParam(required = false) LocalDate denNgay,
               @RequestParam(defaultValue = "0") int page,
               @RequestParam(defaultValue = "10") int size,
               @RequestParam(defaultValue = "id,desc") String sort) {
          return ApiResponse.success(keHoachBaoTriService.layDanhSach(trangThai, tuNgay, denNgay, page, size, sort));
     }

     @GetMapping("/{id}")
     @PreAuthorize("hasAuthority('XEM_CHI_TIET_KHBTDK')")
     public ApiResponse<KeHoachBaoTriDinhKyResponse> layTheoId(@PathVariable Long id) {
          return ApiResponse.success(keHoachBaoTriService.layTheoId(id));
     }
}