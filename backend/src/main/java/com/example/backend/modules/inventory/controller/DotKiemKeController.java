package com.example.backend.modules.inventory.controller;

import com.example.backend.modules.inventory.dto.DotKiemKeRequest;
import com.example.backend.modules.inventory.dto.DotKiemKeResponse;
import com.example.backend.modules.inventory.service.interfaces.DotKiemKeService;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/dot-kiem-ke")
@RequiredArgsConstructor
public class DotKiemKeController {

     private final DotKiemKeService dotKiemKeService;

     @PostMapping
     @PreAuthorize("hasAuthority('THEM_MOI_DKK')")
     public ApiResponse<DotKiemKeResponse> themMoi(@Valid @RequestBody DotKiemKeRequest request) {
          return ApiResponse.success(dotKiemKeService.themMoi(request));
     }

     @PutMapping("/{id}")
     @PreAuthorize("hasAuthority('CAP_NHAT_DKK')")
     public ApiResponse<DotKiemKeResponse> capNhat(@PathVariable Long id,
               @Valid @RequestBody DotKiemKeRequest request) {
          return ApiResponse.success(dotKiemKeService.capNhat(id, request));
     }

     @DeleteMapping("/{id}")
     @PreAuthorize("hasAuthority('XOA_DKK')")
     public ApiResponse<String> xoaMem(@PathVariable Long id) {
          dotKiemKeService.xoaMem(id);
          return ApiResponse.success("Xóa mềm chiến dịch đợt kiểm kê tài sản thành công");
     }

     @PutMapping("/{id}/yeu-cau-phe-duyet")
     @PreAuthorize("hasAuthority('GUI_PHE_DUYET_DKK')")
     public ApiResponse<String> yeuCauPheDuyet(@PathVariable Long id) {
          dotKiemKeService.yeuCauPheDuyet(id);
          return ApiResponse.success("Gửi yêu cầu phê duyệt đợt kiểm kê tài sản thành công");
     }

     @PutMapping("/{id}/phe-duyet")
     @PreAuthorize("hasAuthority('PHE_DUYET_DKK')")
     public ApiResponse<String> pheDuyet(@PathVariable Long id) {
          dotKiemKeService.pheDuyet(id);
          return ApiResponse.success("Phê duyệt thông qua đợt kiểm kê tài sản thành công");
     }

     @GetMapping
     @PreAuthorize("hasAuthority('XEM_DANH_SACH_DKK')")
     public ApiResponse<PageResponse<DotKiemKeResponse>> layDanhSach(
               @RequestParam(required = false) String trangThai,
               @RequestParam(required = false) LocalDate tuNgay,
               @RequestParam(required = false) LocalDate denNgay,
               @RequestParam(defaultValue = "0") int page,
               @RequestParam(defaultValue = "10") int size,
               @RequestParam(defaultValue = "id,desc") String sort) {
          return ApiResponse.success(dotKiemKeService.layDanhSach(trangThai, tuNgay, denNgay, page, size, sort));
     }

     @GetMapping("/{id}")
     @PreAuthorize("hasAuthority('XEM_CHI_TIET_DKK')")
     public ApiResponse<DotKiemKeResponse> layTheoId(@PathVariable Long id) {
          return ApiResponse.success(dotKiemKeService.layTheoId(id));
     }
}