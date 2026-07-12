package com.example.backend.modules.procurement.controller;

import com.example.backend.modules.procurement.dto.NhaCungCapRequest;
import com.example.backend.modules.procurement.dto.NhaCungCapResponse;
import com.example.backend.modules.procurement.dto.SelectOption;
import com.example.backend.modules.procurement.service.interfaces.NhaCungCapService;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nha-cung-cap")
@RequiredArgsConstructor
public class NhaCungCapController {

     private final NhaCungCapService nhaCungCapService;

     @GetMapping
     @PreAuthorize("hasAuthority('XEM_NHA_CUNG_CAP')")
     public ApiResponse<PageResponse<NhaCungCapResponse>> layDanhSach(
               @RequestParam(required = false) String keyword,
               @RequestParam(required = false) String trangThai,
               @RequestParam(defaultValue = "0") int page,
               @RequestParam(defaultValue = "10") int size,
               @RequestParam(defaultValue = "id,desc") String sort) {
          return ApiResponse.success(nhaCungCapService.layDanhSach(keyword, trangThai, page, size, sort));
     }

     @GetMapping("/{id}")
     @PreAuthorize("hasAuthority('XEM_NHA_CUNG_CAP')")
     public ApiResponse<NhaCungCapResponse> layTheoId(@PathVariable Long id) {
          return ApiResponse.success(nhaCungCapService.layTheoId(id));
     }

     @GetMapping("/select-options")
     @PreAuthorize("hasAuthority('XEM_NHA_CUNG_CAP')")
     public ApiResponse<List<SelectOption>> laySelectOptions(
             @RequestParam(required = false) String keyword
     ) {
          return ApiResponse.success(nhaCungCapService.laySelectOptions(keyword));
     }

     @PostMapping
     @PreAuthorize("hasAuthority('THEM_NHA_CUNG_CAP')")
     public ApiResponse<NhaCungCapResponse> themMoi(@Valid @RequestBody NhaCungCapRequest request) {
          return ApiResponse.success(nhaCungCapService.themMoi(request));
     }

     @PutMapping("/{id}")
     @PreAuthorize("hasAuthority('SUA_NHA_CUNG_CAP')")
     public ApiResponse<NhaCungCapResponse> capNhat(
               @PathVariable Long id,
               @Valid @RequestBody NhaCungCapRequest request) {
          return ApiResponse.success(nhaCungCapService.capNhat(id, request));
     }

     @PutMapping("/{id}/trang-thai")
     @PreAuthorize("hasAuthority('CAP_NHAT_TRANG_THAI_NHA_CUNG_CAP')")
     public ApiResponse<String> capNhatTrangThai(
               @PathVariable Long id,
               @Valid @RequestBody TrangThaiRequest request) {
          nhaCungCapService.capNhatTrangThai(id, request);
          return ApiResponse.success("Cập nhật trạng thái nhà cung cấp thành công");
     }

     @DeleteMapping("/{id}")
     @PreAuthorize("hasAuthority('XOA_NHA_CUNG_CAP')")
     public ApiResponse<String> xoaMem(@PathVariable Long id) {
          nhaCungCapService.xoaMem(id);
          return ApiResponse.success("Xóa mềm nhà cung cấp thành công");
     }
}
