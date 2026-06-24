package com.example.backend.shared.controller;

import com.example.backend.shared.dto.NhatKyThaoTacHeThongResponse;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.service.interfaces.NhatKyThaoTacHeThongService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/nhat-ky-thao-tac")
@RequiredArgsConstructor
public class NhatKyThaoTacHeThongController {

    private final NhatKyThaoTacHeThongService service;

    @GetMapping
    public ApiResponse<PageResponse<NhatKyThaoTacHeThongResponse>> layDanhSach(
            @RequestParam(required = false) Long idTaiKhoanThaoTac,
            @RequestParam(required = false) String phuongThucApi,
            @RequestParam(required = false) String thucTheTacDong,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageResponse<NhatKyThaoTacHeThongResponse> result = service.layDanhSach(
                idTaiKhoanThaoTac, phuongThucApi, thucTheTacDong, tuNgay, denNgay, page, size);
        return ApiResponse.success(result);
    }
}
