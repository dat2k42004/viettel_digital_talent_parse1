package com.example.backend.modules.procurement.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.modules.procurement.dto.PhieuNhapTaiSanRequest;
import com.example.backend.modules.procurement.dto.PhieuNhapTaiSanResponse;
import com.example.backend.modules.procurement.service.interfaces.PhieuNhapTaiSanService;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/phieu-nhap-tai-san")
@RequiredArgsConstructor
public class PhieuNhapTaiSanController {

     private final PhieuNhapTaiSanService phieuNhapTaiSanService;

     @GetMapping
     @PreAuthorize("hasAuthority('XEM_PHIEU_NHAP_TAI_SAN')")
     public ApiResponse<PageResponse<PhieuNhapTaiSanResponse>> layDanhSach(
               @RequestParam(required = false) String maPhieuNhap,
               @RequestParam(required = false) String soHoaDonVat,
               @RequestParam(required = false) Long idDonHangMuaSam,
               @RequestParam(required = false) String trangThai,
               @RequestParam(defaultValue = "0") int page,
               @RequestParam(defaultValue = "10") int size,
               @RequestParam(defaultValue = "id,desc") String sort) {
          return ApiResponse.success(phieuNhapTaiSanService.layDanhSach(
                    maPhieuNhap, soHoaDonVat, idDonHangMuaSam, trangThai, page, size, sort));
     }

     @GetMapping("/{id}")
     @PreAuthorize("hasAuthority('XEM_PHIEU_NHAP_TAI_SAN')")
     public ApiResponse<PhieuNhapTaiSanResponse> layTheoId(@PathVariable Long id) {
          return ApiResponse.success(phieuNhapTaiSanService.layTheoId(id));
     }

     @PostMapping
     @PreAuthorize("hasAuthority('THEM_PHIEU_NHAP_TAI_SAN')")
     public ApiResponse<PhieuNhapTaiSanResponse> themMoi(@Valid @RequestBody PhieuNhapTaiSanRequest request) {
          return ApiResponse.success(phieuNhapTaiSanService.themMoi(request));
     }

     @PutMapping("/{id}")
     @PreAuthorize("hasAuthority('SUA_PHIEU_NHAP_TAI_SAN')")
     public ApiResponse<PhieuNhapTaiSanResponse> capNhat(
               @PathVariable Long id,
               @Valid @RequestBody PhieuNhapTaiSanRequest request) {
          return ApiResponse.success(phieuNhapTaiSanService.capNhat(id, request));
     }

     @PutMapping("/{id}/trang-thai")
     @PreAuthorize("hasAuthority('CAP_NHAT_TRANG_THAI_PHIEU_NHAP_TAI_SAN')")
     public ApiResponse<String> capNhatTrangThai(
               @PathVariable Long id,
               @Valid @RequestBody TrangThaiRequest request) {
          phieuNhapTaiSanService.capNhatTrangThai(id, request);
          return ApiResponse.success("Cập nhật trạng thái phiếu nhập kho tài sản thành công");
     }

     @DeleteMapping("/{id}")
     @PreAuthorize("hasAuthority('XOA_PHIEU_NHAP_TAI_SAN')")
     public ApiResponse<String> xoaMem(@PathVariable Long id) {
          phieuNhapTaiSanService.xoaMem(id);
          return ApiResponse.success("Xóa mềm phiếu nhập kho tài sản thành công");
     }
}
