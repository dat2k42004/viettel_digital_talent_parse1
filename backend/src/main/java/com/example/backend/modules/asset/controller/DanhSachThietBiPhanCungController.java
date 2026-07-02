package com.example.backend.modules.asset.controller;

import com.example.backend.modules.asset.dto.DanhSachThietBiPhanCungRequest;
import com.example.backend.modules.asset.dto.DanhSachThietBiPhanCungResponse;
import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.modules.asset.service.interfaces.DanhSachThietBiPhanCungService;
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
@RequestMapping("/api/thiet-bi-phan-cung")
@RequiredArgsConstructor
public class DanhSachThietBiPhanCungController {

    private final DanhSachThietBiPhanCungService thietBiPhanCungService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_THIET_BI_PHAN_CUNG')")
    public ApiResponse<PageResponse<DanhSachThietBiPhanCungResponse>> layDanhSach(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) LocalDate tuNgayMua,
            @RequestParam(required = false) LocalDate denNgayMua,
            @RequestParam(required = false) String trangThaiKho,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        return ApiResponse.success(thietBiPhanCungService.layDanhSach(keyword, trangThai, tuNgayMua, denNgayMua, trangThaiKho, page, size, sort));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('XEM_THIET_BI_PHAN_CUNG')")
    public ApiResponse<DanhSachThietBiPhanCungResponse> layTheoId(@PathVariable Long id) {
        return ApiResponse.success(thietBiPhanCungService.layTheoId(id));
    }

    @GetMapping("/select-options")
    @PreAuthorize("hasAuthority('XEM_THIET_BI_PHAN_CUNG')")
    public ApiResponse<List<SelectOption>> laySelectOptions(@RequestParam(required = false) Long idTaiSanPhanCung) {
        return ApiResponse.success(thietBiPhanCungService.laySelectOptions(idTaiSanPhanCung));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('THEM_THIET_BI_PHAN_CUNG')")
    public ApiResponse<DanhSachThietBiPhanCungResponse> themMoi(@Valid @RequestBody DanhSachThietBiPhanCungRequest request) {
        return ApiResponse.success(thietBiPhanCungService.themMoi(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_THIET_BI_PHAN_CUNG')")
    public ApiResponse<DanhSachThietBiPhanCungResponse> capNhat(
            @PathVariable Long id,
            @Valid @RequestBody DanhSachThietBiPhanCungRequest request
    ) {
        return ApiResponse.success(thietBiPhanCungService.capNhat(id, request));
    }

    @PutMapping("/{id}/trang-thai")
    @PreAuthorize("hasAuthority('CAP_NHAT_TRANG_THAI_THIET_BI_PHAN_CUNG')")
    public ApiResponse<String> capNhatTrangThai(
            @PathVariable Long id,
            @Valid @RequestBody TrangThaiRequest request
    ) {
        thietBiPhanCungService.capNhatTrangThai(id, request);
        return ApiResponse.success("Cập nhật trạng thái thiết bị phần cứng thành công");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_THIET_BI_PHAN_CUNG')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        thietBiPhanCungService.xoaMem(id);
        return ApiResponse.success("Xóa mềm thiết bị phần cứng thành công");
    }
}
