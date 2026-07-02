package com.example.backend.modules.lifecycle.controller;

import com.example.backend.modules.lifecycle.dto.PhieuCapPhatTaiSanRequest;
import com.example.backend.modules.lifecycle.dto.PhieuCapPhatTaiSanResponse;
import com.example.backend.modules.lifecycle.service.interfaces.PhieuCapPhatTaiSanService;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/phieu-cap-phat")
@RequiredArgsConstructor
public class PhieuCapPhatTaiSanController {

    private final PhieuCapPhatTaiSanService phieuCapPhatTaiSanService;

    @GetMapping
    @PreAuthorize("hasAuthority('XEM_PHIEU_CAP_PHAT')")
    public ApiResponse<PageResponse<PhieuCapPhatTaiSanResponse>> layDanhSach(
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) Long idPhongBan,
            @RequestParam(required = false) LocalDate tuNgayBanGiao,
            @RequestParam(required = false) LocalDate denNgayBanGiao,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        return ApiResponse.success(phieuCapPhatTaiSanService.layDanhSach(trangThai, idPhongBan, tuNgayBanGiao,
                denNgayBanGiao, page, size, sort));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('XEM_PHIEU_CAP_PHAT')")
    public ApiResponse<PhieuCapPhatTaiSanResponse> layTheoId(@PathVariable Long id) {
        return ApiResponse.success(phieuCapPhatTaiSanService.layTheoId(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('THEM_PHIEU_CAP_PHAT')")
    public ApiResponse<PhieuCapPhatTaiSanResponse> themMoi(@Valid @RequestBody PhieuCapPhatTaiSanRequest request) {
        return ApiResponse.success(phieuCapPhatTaiSanService.themMoi(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUA_PHIEU_CAP_PHAT')")
    public ApiResponse<PhieuCapPhatTaiSanResponse> capNhat(
            @PathVariable Long id,
            @Valid @RequestBody PhieuCapPhatTaiSanRequest request) {
        return ApiResponse.success(phieuCapPhatTaiSanService.capNhat(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('XOA_PHIEU_CAP_PHAT')")
    public ApiResponse<String> xoaMem(@PathVariable Long id) {
        phieuCapPhatTaiSanService.xoaMem(id);
        return ApiResponse.success("Xóa mềm phiếu cấp phát thành công");
    }

    @PutMapping("/{id}/yeu-cau-phe-duyet")
    @PreAuthorize("hasAuthority('YEU_CAU_PHE_DUYET_PHIEU_CAP_PHAT')")
    public ApiResponse<String> yeuCauPheDuyet(@PathVariable Long id) {
        phieuCapPhatTaiSanService.yeuCauPheDuyet(id);
        return ApiResponse.success("Gửi yêu cầu phê duyệt thành công");
    }

    @PutMapping("/{id}/phe-duyet")
    @PreAuthorize("hasAuthority('PHE_DUYET_PHIEU_CAP_PHAT')")
    public ApiResponse<String> pheDuyet(@PathVariable Long id) {
        phieuCapPhatTaiSanService.pheDuyet(id);
        return ApiResponse.success("Phê duyệt phiếu cấp phát thành công");
    }

    @PutMapping("/{id}/hoan-thanh")
    @PreAuthorize("hasAuthority('HOAN_THANH_PHIEU_CAP_PHAT')")
    public ApiResponse<String> hoanThanh(@PathVariable Long id) {
        phieuCapPhatTaiSanService.hoanThanh(id);
        return ApiResponse.success("Hoàn thành cấp phát thành công");
    }

    @PutMapping("/{id}/tu-choi")
    @PreAuthorize("hasAuthority('PHE_DUYET_PHIEU_CAP_PHAT')")
    public ApiResponse<String> tuChoiPheDuyet(
            @PathVariable Long id,
            @RequestParam String lyDoTuChoi) {
        phieuCapPhatTaiSanService.tuChoiPheDuyet(id, lyDoTuChoi);
        return ApiResponse.success("Từ chối phê duyệt phiếu cấp phát thành công");
    }
}
