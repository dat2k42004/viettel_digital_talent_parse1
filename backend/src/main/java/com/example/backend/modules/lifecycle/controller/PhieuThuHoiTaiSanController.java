package com.example.backend.modules.lifecycle.controller;

import com.example.backend.modules.lifecycle.dto.ActiveAllocationResponse;
import com.example.backend.modules.lifecycle.dto.PhieuThuHoiTaiSanRequest;
import com.example.backend.modules.lifecycle.dto.PhieuThuHoiTaiSanResponse;
import com.example.backend.modules.lifecycle.service.interfaces.PhieuThuHoiTaiSanService;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/phieu-thu-hoi")
@RequiredArgsConstructor
public class PhieuThuHoiTaiSanController {

    private final PhieuThuHoiTaiSanService phieuThuHoiTaiSanService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_PHIEU_THU_HOI_TAI_SAN')")
    public ApiResponse<PageResponse<PhieuThuHoiTaiSanResponse>> layDanhSach(
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) Long idPhongBan,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        return ApiResponse.success(phieuThuHoiTaiSanService.layDanhSach(trangThai, idPhongBan, tuNgay, denNgay, page, size, sort));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('XEM_PHIEU_THU_HOI_TAI_SAN')")
    public ApiResponse<PhieuThuHoiTaiSanResponse> layTheoId(@PathVariable Long id) {
        return ApiResponse.success(phieuThuHoiTaiSanService.layTheoId(id));
    }

    @GetMapping("/active-allocations")
    @PreAuthorize("hasAuthority('THEM_PHIEU_THU_HOI_TAI_SAN')")
    public ApiResponse<ActiveAllocationResponse> layAllocationsCuaNhanVien(@RequestParam Long idNhanVien) {
        return ApiResponse.success(phieuThuHoiTaiSanService.layAllocationsCuaNhanVien(idNhanVien));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('THEM_PHIEU_THU_HOI_TAI_SAN')")
    public ApiResponse<PhieuThuHoiTaiSanResponse> themMoi(@Valid @RequestBody PhieuThuHoiTaiSanRequest request) {
        return ApiResponse.success(phieuThuHoiTaiSanService.themMoi(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_PHIEU_THU_HOI_TAI_SAN')")
    public ApiResponse<PhieuThuHoiTaiSanResponse> capNhat(
            @PathVariable Long id,
            @Valid @RequestBody PhieuThuHoiTaiSanRequest request
    ) {
        return ApiResponse.success(phieuThuHoiTaiSanService.capNhat(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_PHIEU_THU_HOI_TAI_SAN')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        phieuThuHoiTaiSanService.xoaMem(id);
        return ApiResponse.success("Xóa mềm phiếu thu hồi tài sản thành công");
    }

    @PutMapping("/{id}/yeu-cau-phe-duyet")
    @PreAuthorize("hasAuthority('YEU_CAU_PHE_DUYET_PHIEU_THU_HOI_TAI_SAN')")
    public ApiResponse<String> yeuCauPheDuyet(@PathVariable Long id) {
        phieuThuHoiTaiSanService.yeuCauPheDuyet(id);
        return ApiResponse.success("Gửi yêu cầu phê duyệt thành công");
    }

    @PutMapping("/{id}/phe-duyet")
    @PreAuthorize("hasAuthority('PHE_DUYET_PHIEU_THU_HOI_TAI_SAN')")
    public ApiResponse<String> pheDuyet(@PathVariable Long id) {
        phieuThuHoiTaiSanService.pheDuyet(id);
        return ApiResponse.success("Phê duyệt phiếu thu hồi tài sản thành công");
    }

    @PutMapping("/{id}/hoan-thanh")
    @PreAuthorize("hasAuthority('HOAN_THANH_PHIEU_THU_HOI_TAI_SAN')")
    public ApiResponse<String> hoanThanh(@PathVariable Long id) {
        phieuThuHoiTaiSanService.hoanThanh(id);
        return ApiResponse.success("Hoàn thành thu hồi tài sản thành công");
    }

    @PutMapping("/{id}/tu-choi")
    @PreAuthorize("hasAuthority('THAO_TAC_TAI_SAN')")
    public ApiResponse<String> tuChoiPheDuyet(
            @PathVariable Long id,
            @RequestParam String lyDoTuChoi
    ) {
        phieuThuHoiTaiSanService.tuChoiPheDuyet(id, lyDoTuChoi);
        return ApiResponse.success("Từ chối phê duyệt phiếu thu hồi thành công");
    }
}
