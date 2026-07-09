package com.example.backend.modules.report.controller;

import com.example.backend.modules.report.dto.*;
import com.example.backend.modules.report.service.interfaces.BaoCaoService;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bao-cao")
@RequiredArgsConstructor
public class BaoCaoController {

     private final BaoCaoService baoCaoService;

     @GetMapping("/ton-kho")
     @PreAuthorize("hasAuthority('XEM_BAO_CAO') or hasAuthority('XEM_QUAN_TRI_TOAN_SAN')")
     public ApiResponse<PageResponse<BaoCaoTonKhoResponse>> layBaoCaoTonKho(
               @Valid BaoCaoFilterRequest request,
               @RequestParam(defaultValue = "0") int page,
               @RequestParam(defaultValue = "10") int size) {
          return ApiResponse.success(baoCaoService.layBaoCaoTonKho(request, page, size));
     }

     @GetMapping("/cap-phat")
     @PreAuthorize("hasAuthority('XEM_BAO_CAO') or hasAuthority('XEM_QUAN_TRI_TOAN_SAN')")
     public ApiResponse<PageResponse<BaoCaoCapPhatResponse>> layBaoCaoCapPhat(
               @Valid BaoCaoFilterRequest request,
               @RequestParam(defaultValue = "0") int page,
               @RequestParam(defaultValue = "10") int size) {
          return ApiResponse.success(baoCaoService.layBaoCaoCapPhat(request, page, size));
     }

     @GetMapping("/bao-tri")
     @PreAuthorize("hasAuthority('XEM_BAO_CAO') or hasAuthority('XEM_QUAN_TRI_TOAN_SAN')")
     public ApiResponse<PageResponse<BaoCaoBaoTriResponse>> layBaoCaoBaoTri(
               @Valid BaoCaoFilterRequest request,
               @RequestParam(defaultValue = "0") int page,
               @RequestParam(defaultValue = "10") int size) {
          return ApiResponse.success(baoCaoService.layBaoCaoBaoTri(request, page, size));
     }

     @GetMapping("/toan-san")
     @PreAuthorize("hasAuthority('XEM_QUAN_TRI_TOAN_SAN')")
     public ApiResponse<PageResponse<BaoCaoToanSanSuperAdminResponse>> layTongHopToanSanSuperAdmin(
               @RequestParam(defaultValue = "0") int page,
               @RequestParam(defaultValue = "10") int size) {
          return ApiResponse.success(baoCaoService.layTongHopToanSanSuperAdmin(page, size));
     }

     @GetMapping("/xuat-file")
     @PreAuthorize("hasAuthority('XEM_BAO_CAO') or hasAuthority('XEM_QUAN_TRI_TOAN_SAN')")
     public ResponseEntity<byte[]> xuatFileBaoCao(
               @Valid BaoCaoFilterRequest request,
               @RequestParam String dinhDangFile) {
          byte[] fileData = baoCaoService.xuatFileBaoCao(request, dinhDangFile);

          String extension = "xlsx".equalsIgnoreCase(dinhDangFile) ? ".xlsx" : ".pdf";
          String contentType = "xlsx".equalsIgnoreCase(dinhDangFile)
                    ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    : "application/pdf";

          return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                              "attachment; filename=bao_cao_" + System.currentTimeMillis() + extension)
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(fileData);
     }

     @GetMapping("/toan-san/xuat-file")
     @PreAuthorize("hasAuthority('XEM_QUAN_TRI_TOAN_SAN')")
     public ResponseEntity<byte[]> xuatFileBaoCaoToanSanSuperAdmin() {
          byte[] fileData = baoCaoService.xuatFileBaoCaoToanSanSuperAdmin();

          return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                              "attachment; filename=bao_cao_toan_san_" + System.currentTimeMillis() + ".xlsx")
                    .contentType(MediaType
                              .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(fileData);
     }
}