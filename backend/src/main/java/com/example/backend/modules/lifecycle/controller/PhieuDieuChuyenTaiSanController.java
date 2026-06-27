package com.example.backend.modules.lifecycle.controller;

import com.example.backend.modules.lifecycle.dto.PhieuDieuChuyenTaiSanRequest;
import com.example.backend.modules.lifecycle.dto.PhieuDieuChuyenTaiSanResponse;
import com.example.backend.modules.lifecycle.service.interfaces.PhieuDieuChuyenTaiSanService;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/phieu-dieu-chuyen")
@RequiredArgsConstructor
public class PhieuDieuChuyenTaiSanController {

     private PhieuDieuChuyenTaiSanService phieuDieuChuyenService;

     @GetMapping
     @PreAuthorize("hasAuthority('XEM_PHIEU_DIEU_CHUYEN')")
     public ApiResponse<PageResponse<PhieuDieuChuyenTaiSanResponse>> layDanhSach(
               @RequestParam(required = false) String trangThai,
               @RequestParam(required = false) Long idNguoiChuyen,
               @RequestParam(required = false) Long idNguoiNhan,
               @RequestParam(required = false) LocalDate tuNgay,
               @RequestParam(required = false) LocalDate denNgay,
               @RequestParam(defaultValue = "0") int page,
               @RequestParam(defaultValue = "10") int size,
               @RequestParam(defaultValue = "id,desc") String sort) {
          return ApiResponse.success(phieuDieuChuyenService.layDanhSach(trangThai, idNguoiChuyen, idNguoiNhan, tuNgay,
                    denNgay, page, size, sort));
     }

     @GetMapping("/{id}")
     @PreAuthorize("hasAuthority('XEM_PHIEU_DIEU_CHUYEN')")
     public ApiResponse<PhieuDieuChuyenTaiSanResponse> layTheoId(@PathVariable Long id) {
          return ApiResponse.success(phieuDieuChuyenService.layTheoId(id));
     }

     @PostMapping
     @PreAuthorize("hasAuthority('THEM_PHIEU_DIEU_CHUYEN')")
     public ApiResponse<PhieuDieuChuyenTaiSanResponse> themMoi(
               @Valid @RequestBody PhieuDieuChuyenTaiSanRequest request) {
          return ApiResponse.success(phieuDieuChuyenService.themMoi(request));
     }

     @PutMapping("/{id}")
     @PreAuthorize("hasAuthority('SUA_PHIEU_DIEU_CHUYEN')")
     public ApiResponse<PhieuDieuChuyenTaiSanResponse> capNhat(@PathVariable Long id,
               @Valid @RequestBody PhieuDieuChuyenTaiSanRequest request) {
          return ApiResponse.success(phieuDieuChuyenService.capNhat(id, request));
     }

     @DeleteMapping("/{id}")
     @PreAuthorize("hasAuthority('XOA_PHIEU_DIEU_CHUYEN')")
     public ApiResponse<String> xoaMem(@PathVariable Long id) {
          phieuDieuChuyenService.xoaMem(id);
          return ApiResponse.success("Xóa mềm hoặc hủy bỏ phiếu điều chuyển tài sản thành công");
     }

     @PutMapping("/{id}/yeu-cau-phe-duyet")
     @PreAuthorize("hasAuthority('YEU_CAU_PHE_DUYET_DIEU_CHUYEN')")
     public ApiResponse<String> yeuCauPheDuyet(@PathVariable Long id) {
          phieuDieuChuyenService.yeuCauPheDuyet(id);
          return ApiResponse.success("Gửi yêu cầu phê duyệt thành công");
     }

     @PutMapping("/{id}/phe-duyet")
     @PreAuthorize("hasAuthority('PHE_DUYET_DIEU_CHUYEN')")
     public ApiResponse<String> pheDuyet(@PathVariable Long id) {
          phieuDieuChuyenService.pheDuyet(id);
          return ApiResponse.success("Phê duyệt phiếu điều chuyển thành công");
     }

     @PutMapping("/{id}/hoan-thanh")
     @PreAuthorize("hasAuthority('HOAN_THANH_DIEU_CHUYEN')")
     public ApiResponse<String> hoanThanh(@PathVariable Long id) {
          phieuDieuChuyenService.hoanThanh(id);
          return ApiResponse.success("Xác nhận hoàn thành chu kỳ điều chuyển tài sản thành công");
     }

     @PutMapping("/{id}/tu-choi")
     @PreAuthorize("hasAuthority('THAO_TAC_TAI_SAN')")
     public ApiResponse<String> tuChoiPheDuyet(
               @PathVariable Long id,
               @RequestParam String lyDoTuChoi) {
          phieuDieuChuyenService.tuChoiPheDuyet(id, lyDoTuChoi);
          return ApiResponse.success("Từ chối phê duyệt phiếu điều chuyển thành công");
     }
}
