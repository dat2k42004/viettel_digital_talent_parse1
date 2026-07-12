package com.example.backend.modules.procurement.controller;

import com.example.backend.modules.procurement.dto.DonHangMuaSamRequest;
import com.example.backend.modules.procurement.dto.DonHangMuaSamResponse;
import com.example.backend.modules.procurement.dto.SelectOption;
import com.example.backend.modules.procurement.service.interfaces.DonHangMuaSamService;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/don-hang-mua-sam")
@RequiredArgsConstructor
public class DonHangMuaSamController {

     private final DonHangMuaSamService donHangMuaSamService;

     @GetMapping
     @PreAuthorize("hasAuthority('XEM_DON_HANG_MUA_SAM')")
     public ApiResponse<PageResponse<DonHangMuaSamResponse>> layDanhSach(
               @RequestParam(required = false) String maDonHang,
               @RequestParam(required = false) Long idNhaCungCap,
               @RequestParam(required = false) String trangThai,
               @RequestParam(defaultValue = "0") int page,
               @RequestParam(defaultValue = "10") int size,
               @RequestParam(defaultValue = "id,desc") String sort) {
          return ApiResponse
                    .success(donHangMuaSamService.layDanhSach(maDonHang, idNhaCungCap, trangThai, page, size, sort));
     }

     @GetMapping("/{id}")
     @PreAuthorize("hasAuthority('XEM_DON_HANG_MUA_SAM')")
     public ApiResponse<DonHangMuaSamResponse> layTheoId(@PathVariable Long id) {
          return ApiResponse.success(donHangMuaSamService.layTheoId(id));
     }

     @GetMapping("/select-options")
     @PreAuthorize("hasAuthority('XEM_DON_HANG_MUA_SAM')")
     public ApiResponse<List<SelectOption>> laySelectOptions(
             @RequestParam(required = false) String keyword
     ) {
          return ApiResponse.success(donHangMuaSamService.laySelectOptions(keyword));
     }

     @PostMapping
     @PreAuthorize("hasAuthority('THEM_DON_HANG_MUA_SAM')")
     public ApiResponse<DonHangMuaSamResponse> themMoi(@Valid @RequestBody DonHangMuaSamRequest request) {
          return ApiResponse.success(donHangMuaSamService.themMoi(request));
     }

     @PutMapping("/{id}")
     @PreAuthorize("hasAuthority('SUA_DON_HANG_MUA_SAM')")
     public ApiResponse<DonHangMuaSamResponse> capNhat(
               @PathVariable Long id,
               @Valid @RequestBody DonHangMuaSamRequest request) {
          return ApiResponse.success(donHangMuaSamService.capNhat(id, request));
     }

     @PutMapping("/{id}/yeu-cau-phe-duyet")
     @PreAuthorize("hasAuthority('YEU_CAU_PHE_DUYET_DON_HANG_MUA_SAM')")
     public ApiResponse<String> yeuCauPheDuyet(@PathVariable Long id) {
          donHangMuaSamService.yeuCauPheDuyet(id);
          return ApiResponse.success("Gửi yêu cầu phê duyệt đơn hàng mua sắm thành công");
     }

     @PutMapping("/{id}/phe-duyet")
     @PreAuthorize("hasAuthority('PHE_DUYET_DON_HANG_MUA_SAM')")
     public ApiResponse<String> pheDuyet(@PathVariable Long id) {
          donHangMuaSamService.pheDuyet(id);
          return ApiResponse.success("Phê duyệt đơn hàng mua sắm thành công");
     }

     @DeleteMapping("/{id}")
     @PreAuthorize("hasAuthority('XOA_DON_HANG_MUA_SAM')")
     public ApiResponse<String> xoaMem(@PathVariable Long id) {
          donHangMuaSamService.xoaMem(id);
          return ApiResponse.success("Xóa mềm đơn hàng mua sắm thành công");
     }
}
