package com.example.backend.modules.inventory.controller;

import com.example.backend.modules.inventory.dto.*;
import com.example.backend.modules.inventory.service.interfaces.PhieuKiemKeService;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/phieu-kiem-ke")
@RequiredArgsConstructor
public class PhieuKiemKeController {

     private final PhieuKiemKeService phieuKiemKeService;

     @PostMapping
     @PreAuthorize("hasAuthority('THEM_MOI_PHIEU_KIEM_KE')")
     public ApiResponse<PhieuKiemKeResponse> themMoi(@Valid @RequestBody PhieuKiemKeRequest request) {
          return ApiResponse.success(phieuKiemKeService.themMoi(request));
     }

     @PutMapping("/{id}")
     @PreAuthorize("hasAuthority('CAP_NHAT_PHIEU_KIEM_KE')")
     public ApiResponse<PhieuKiemKeResponse> capNhat(@PathVariable Long id,
               @Valid @RequestBody PhieuKiemKeRequest request) {
          return ApiResponse.success(phieuKiemKeService.capNhat(id, request));
     }

     @DeleteMapping("/{id}")
     @PreAuthorize("hasAuthority('XOA_PHIEU_KIEM_KE')")
     public ApiResponse<String> xoaMem(@PathVariable Long id) {
          phieuKiemKeService.xoaMem(id);
          return ApiResponse.success("Xóa mềm phiếu kiểm kê phòng ban thành công");
     }

     @PutMapping("/{id}/thuc-hien-kiem-ke")
     @PreAuthorize("hasAuthority('THUC_HIEN_KIEM_KE_TAI_SAN')")
     public ApiResponse<String> thucHienKiemKe(@PathVariable Long id,
               @Valid @RequestBody ExecuteKiemKeRequest request) {
          phieuKiemKeService.thucHienKiemKe(id, request);
          return ApiResponse.success("Ghi nhận số liệu đối soát hiện trường thành công");
     }

     @GetMapping("/tien-do/{dotKiemKeId}")
     @PreAuthorize("hasAuthority('XEM_TIEN_DO_KIEM_KE_DON_VI')")
     public ApiResponse<List<TienDoPhongBanResponse>> theoDoiTienDoThucHien(@PathVariable Long dotKiemKeId) {
          return ApiResponse.success(phieuKiemKeService.theoDoiTienDoThucHien(dotKiemKeId));
     }

     @PutMapping("/{id}/xac-nhan-hoan-thanh")
     @PreAuthorize("hasAuthority('XAC_NHAN_KET_QUA_KIEM_KE_PHONG_BAN')")
     public ApiResponse<String> xacNhanHoanThanhPhongBan(@PathVariable Long id) {
          phieuKiemKeService.xacNhanHoanThanhPhongBan(id);
          return ApiResponse.success("Phê duyệt xác nhận nghiệm thu kết quả kiểm kê phòng ban thành công");
     }

     @GetMapping
     @PreAuthorize("hasAuthority('XEM_DANH_SACH_PHIEU_KIEM_KE')")
     public ApiResponse<PageResponse<PhieuKiemKeResponse>> layDanhSach(
               @RequestParam(required = false) String trangThai,
               @RequestParam(required = false) Long idPhongBan,
               @RequestParam(required = false) LocalDate tuNgay,
               @RequestParam(required = false) LocalDate denNgay,
               @RequestParam(defaultValue = "0") int page,
               @RequestParam(defaultValue = "10") int size,
               @RequestParam(defaultValue = "id,desc") String sort) {
          return ApiResponse
                    .success(phieuKiemKeService.layDanhSach(trangThai, idPhongBan, tuNgay, denNgay, page, size, sort));
     }

     @GetMapping("/{id}")
     @PreAuthorize("hasAuthority('XEM_CHI_TIET_PHIEU_KIEM_KE')")
     public ApiResponse<PhieuKiemKeResponse> layTheoId(@PathVariable Long id) {
          return ApiResponse.success(phieuKiemKeService.layTheoId(id));
     }

     @GetMapping("/bo-tro/taisantheophong")
     @PreAuthorize("hasAuthority('XEM_DANH_SACH_PHIEU_KIEM_KE')")
     public ApiResponse<TaiSanTheoPhongBanResponse> layTaiSanTheoPhongBan(@RequestParam Long idPhongBan) {
          return ApiResponse.success(phieuKiemKeService.layTaiSanTheoPhongBan(idPhongBan));
     }

     @GetMapping("/bo-tro/dotkiemkekichhoat")
     @PreAuthorize("hasAuthority('THEM_MOI_PHIEU_KIEM_KE')")
     public ApiResponse<List<LuaChonDotKiemKeResponse>> layDotKiemKeKichHoat() {
          return ApiResponse.success(phieuKiemKeService.layDotKiemKeKichHoat());
     }
}