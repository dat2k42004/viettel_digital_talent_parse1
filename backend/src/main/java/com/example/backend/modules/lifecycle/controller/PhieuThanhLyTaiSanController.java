package com.example.backend.modules.lifecycle.controller;

import com.example.backend.modules.lifecycle.dto.PhieuThanhLyTaiSanRequest;
import com.example.backend.modules.lifecycle.dto.PhieuThanhLyTaiSanResponse;
import com.example.backend.modules.lifecycle.service.interfaces.PhieuThanhLyTaiSanService;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/phieu-thanh-ly")
@RequiredArgsConstructor
public class PhieuThanhLyTaiSanController {

     private final PhieuThanhLyTaiSanService phieuThanhLyTaiSanService;

     @GetMapping
     @PreAuthorize("hasAuthority('XEM_PHIEU_THANH_LY')")
     public ApiResponse<PageResponse<PhieuThanhLyTaiSanResponse>> layDanhSach(
               @RequestParam(required = false) String trangThai,
               @RequestParam(required = false) LocalDate tuNgay,
               @RequestParam(required = false) LocalDate denNgay,
               @RequestParam(defaultValue = "0") int page,
               @RequestParam(defaultValue = "10") int size,
               @RequestParam(defaultValue = "id,desc") String sort
     ) {
          return ApiResponse.success(phieuThanhLyTaiSanService.layDanhSach(trangThai, tuNgay, denNgay, page, size, sort));
     }

     @GetMapping("/{id}")
     @PreAuthorize("hasAuthority('XEM_PHIEU_THANH_LY')")
     public ApiResponse<PhieuThanhLyTaiSanResponse> layTheoId(@PathVariable Long id) {
          return ApiResponse.success(phieuThanhLyTaiSanService.layTheoId(id));
     }

     @PostMapping
     @PreAuthorize("hasAuthority('THEM_PHIEU_THANH_LY')")
     public ApiResponse<PhieuThanhLyTaiSanResponse> themMoi(@Valid @RequestBody PhieuThanhLyTaiSanRequest request) {
          return ApiResponse.success(phieuThanhLyTaiSanService.themMoi(request));
     }

     @PutMapping("/{id}")
     @PreAuthorize("hasAuthority('SUA_PHIEU_THANH_LY')")
     public ApiResponse<PhieuThanhLyTaiSanResponse> capNhat(
               @PathVariable Long id,
               @Valid @RequestBody PhieuThanhLyTaiSanRequest request
     ) {
          return ApiResponse.success(phieuThanhLyTaiSanService.capNhat(id, request));
     }

     @DeleteMapping("/{id}")
     @PreAuthorize("hasAuthority('XOA_PHIEU_THANH_LY')")
     public ApiResponse<String> xoaMem(@PathVariable Long id) {
          phieuThanhLyTaiSanService.xoaMem(id);
          return ApiResponse.success("Xóa mềm phiếu thanh lý thành công");
     }

     @PutMapping("/{id}/yeu-cau-phe-duyet")
     @PreAuthorize("hasAuthority('YEU_CAU_PHE_DUYET_THANH_LY')")
     public ApiResponse<String> yeuCauPheDuyet(@PathVariable Long id) {
          phieuThanhLyTaiSanService.yeuCauPheDuyet(id);
          return ApiResponse.success("Gửi yêu cầu phê duyệt thành công");
     }

     @PutMapping("/{id}/phe-duyet")
     @PreAuthorize("hasAuthority('PHE_DUYET_THANH_LY')")
     public ApiResponse<String> pheDuyet(@PathVariable Long id) {
          phieuThanhLyTaiSanService.pheDuyet(id);
          return ApiResponse.success("Phê duyệt phiếu thanh lý thành công");
     }

     @PutMapping("/{id}/hoan-thanh")
     @PreAuthorize("hasAuthority('HOAN_THANH_THANH_LY')")
     public ApiResponse<String> hoanThanh(@PathVariable Long id) {
          phieuThanhLyTaiSanService.hoanThanh(id);
          return ApiResponse.success("Hoàn thành thanh lý thành công");
     }

     @PutMapping("/{id}/tu-choi")
     @PreAuthorize("hasAuthority('THAO_TAC_TAI_SAN')")
     public ApiResponse<String> tuChoiPheDuyet(
               @PathVariable Long id,
               @RequestParam String lyDoTuChoi
     ) {
          phieuThanhLyTaiSanService.tuChoiPheDuyet(id, lyDoTuChoi);
          return ApiResponse.success("Từ chối phê duyệt phiếu thanh lý thành công");
     }
}
