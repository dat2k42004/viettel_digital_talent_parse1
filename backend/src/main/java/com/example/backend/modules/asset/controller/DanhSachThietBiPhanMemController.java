package com.example.backend.modules.asset.controller;

import com.example.backend.modules.asset.dto.DanhSachThietBiPhanMemRequest;
import com.example.backend.modules.asset.dto.DanhSachThietBiPhanMemResponse;
import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.modules.asset.service.interfaces.DanhSachThietBiPhanMemService;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/thiet-bi-phan-mem")
@RequiredArgsConstructor
public class DanhSachThietBiPhanMemController {

    private final DanhSachThietBiPhanMemService thietBiPhanMemService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_THIET_BI_PHAN_MEM')")
    public ApiResponse<PageResponse<DanhSachThietBiPhanMemResponse>> layDanhSach(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) LocalDate tuNgayMua,
            @RequestParam(required = false) LocalDate denNgayMua,
            @RequestParam(required = false) LocalDate tuNgayHetHan,
            @RequestParam(required = false) LocalDate denNgayHetHan,
            @RequestParam(required = false) String trangThaiKho,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        return ApiResponse.success(thietBiPhanMemService.layDanhSach(keyword, trangThai, tuNgayMua, denNgayMua, tuNgayHetHan, denNgayHetHan, trangThaiKho, page, size, sort));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('XEM_THIET_BI_PHAN_MEM')")
    public ApiResponse<DanhSachThietBiPhanMemResponse> layTheoId(@PathVariable Long id) {
        return ApiResponse.success(thietBiPhanMemService.layTheoId(id));
    }

    @GetMapping("/select-options")
    @PreAuthorize("hasAuthority('XEM_THIET_BI_PHAN_MEM')")
    public ApiResponse<List<SelectOption>> laySelectOptions(
            @RequestParam(required = false) String keyword
    ) {
        return ApiResponse.success(thietBiPhanMemService.laySelectOptions(keyword));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('THEM_THIET_BI_PHAN_MEM')")
    public ApiResponse<DanhSachThietBiPhanMemResponse> themMoi(@Valid @RequestBody DanhSachThietBiPhanMemRequest request) {
        return ApiResponse.success(thietBiPhanMemService.themMoi(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_THIET_BI_PHAN_MEM')")
    public ApiResponse<DanhSachThietBiPhanMemResponse> capNhat(
            @PathVariable Long id,
            @Valid @RequestBody DanhSachThietBiPhanMemRequest request
    ) {
        return ApiResponse.success(thietBiPhanMemService.capNhat(id, request));
    }

    @PutMapping("/{id}/trang-thai")
    @PreAuthorize("hasAuthority('CAP_NHAT_TRANG_THAI_THIET_BI_PHAN_MEM')")
    public ApiResponse<String> capNhatTrangThai(
            @PathVariable Long id,
            @Valid @RequestBody TrangThaiRequest request
    ) {
        thietBiPhanMemService.capNhatTrangThai(id, request);
        return ApiResponse.success("Cập nhật trạng thái key bản quyền phần mềm thành công");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_THIET_BI_PHAN_MEM')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        thietBiPhanMemService.xoaMem(id);
        return ApiResponse.success("Xóa mềm key bản quyền phần mềm thành công");
    }
}
