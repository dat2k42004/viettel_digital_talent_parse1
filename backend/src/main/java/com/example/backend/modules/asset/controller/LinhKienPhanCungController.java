package com.example.backend.modules.asset.controller;

import com.example.backend.modules.asset.dto.LinhKienPhanCungRequest;
import com.example.backend.modules.asset.dto.LinhKienPhanCungResponse;
import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.modules.asset.service.interfaces.LinhKienPhanCungService;
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
@RequestMapping("/api/linh-kien-phan-cung")
@RequiredArgsConstructor
public class LinhKienPhanCungController {

    private final LinhKienPhanCungService linhKienService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_LINH_KIEN_PHAN_CUNG')")
    public ApiResponse<PageResponse<LinhKienPhanCungResponse>> layDanhSach(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) LocalDate tuNgayMua,
            @RequestParam(required = false) LocalDate denNgayMua,
            @RequestParam(required = false) String trangThaiKho,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        return ApiResponse.success(linhKienService.layDanhSach(keyword, trangThai, tuNgayMua, denNgayMua, trangThaiKho, page, size, sort));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('XEM_LINH_KIEN_PHAN_CUNG')")
    public ApiResponse<LinhKienPhanCungResponse> layTheoId(@PathVariable Long id) {
        return ApiResponse.success(linhKienService.layTheoId(id));
    }

    @GetMapping("/select-options")
    @PreAuthorize("hasAuthority('XEM_LINH_KIEN_PHAN_CUNG')")
    public ApiResponse<List<SelectOption>> laySelectOptions(
            @RequestParam(required = false) Long idTaiSanPhanCung,
            @RequestParam(required = false) String keyword
    ) {
        return ApiResponse.success(linhKienService.laySelectOptions(idTaiSanPhanCung, keyword));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('THEM_LINH_KIEN_PHAN_CUNG')")
    public ApiResponse<LinhKienPhanCungResponse> themMoi(@Valid @RequestBody LinhKienPhanCungRequest request) {
        return ApiResponse.success(linhKienService.themMoi(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_LINH_KIEN_PHAN_CUNG')")
    public ApiResponse<LinhKienPhanCungResponse> capNhat(
            @PathVariable Long id,
            @Valid @RequestBody LinhKienPhanCungRequest request
    ) {
        return ApiResponse.success(linhKienService.capNhat(id, request));
    }

    @PutMapping("/{id}/trang-thai")
    @PreAuthorize("hasAuthority('CAP_NHAT_TRANG_THAI_LINH_KIEN_PHAN_CUNG')")
    public ApiResponse<String> capNhatTrangThai(
            @PathVariable Long id,
            @Valid @RequestBody TrangThaiRequest request
    ) {
        linhKienService.capNhatTrangThai(id, request);
        return ApiResponse.success("Cập nhật trạng thái linh kiện phần cứng thành công");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_LINH_KIEN_PHAN_CUNG')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        linhKienService.xoaMem(id);
        return ApiResponse.success("Xóa mềm linh kiện phần cứng thành công");
    }
}
