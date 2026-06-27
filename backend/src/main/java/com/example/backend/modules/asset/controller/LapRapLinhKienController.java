package com.example.backend.modules.asset.controller;

import com.example.backend.modules.asset.dto.LapRapLinhKienRequest;
import com.example.backend.modules.asset.dto.LapRapLinhKienResponse;
import com.example.backend.modules.asset.service.interfaces.LapRapLinhKienService;
import com.example.backend.shared.response.ApiResponse;
import com.example.backend.shared.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lap-rap")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class LapRapLinhKienController {

     private final LapRapLinhKienService lapRapLinhKienService;

     @GetMapping
     @PreAuthorize("hasAuthority('XEM_LAP_RAP_LINH_KIEN')")
     public ApiResponse<PageResponse<LapRapLinhKienResponse>> layDanhSach(
               @RequestParam(required = false) Long thietBiPhanCungId,
               @RequestParam(required = false) Long linhKienPhanCungId,
               @RequestParam(required = false) String trangThaiLienKet,
               @RequestParam(defaultValue = "0") int page,
               @RequestParam(defaultValue = "10") int size,
               @RequestParam(defaultValue = "id,desc") String sort) {
          return ApiResponse.success(lapRapLinhKienService.layDanhSach(
                    thietBiPhanCungId, linhKienPhanCungId, trangThaiLienKet, page, size, sort));
     }

     @PostMapping
     @ResponseStatus(HttpStatus.CREATED)
     @PreAuthorize("hasAuthority('THEM_LAP_RAP_LINH_KIEN')")
     @ApiResponses(value = {
               @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Thao tác liên kết thành công", content = @Content(schema = @Schema(implementation = LapRapLinhKienResponse.class))),
               @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Linh kiện không ở trạng thái sẵn sàng TRONG_KHO")
     })
     public ApiResponse<LapRapLinhKienResponse> themMoi(@Valid @RequestBody LapRapLinhKienRequest request) {
          return ApiResponse.success(lapRapLinhKienService.themMoi(request));
     }

     @PutMapping("/{id}/thao-do")
     @PreAuthorize("hasAuthority('SUA_LAP_RAP_LINH_KIEN')")
     public ApiResponse<String> capNhatThaoDo(
               @Parameter(description = "ID của bản ghi lịch sử liên kết cần tháo dỡ", required = true, example = "12") @PathVariable Long id) {
          lapRapLinhKienService.capNhatThaoDo(id);
          return ApiResponse.success("Thực hiện tháo dỡ linh kiện rời ra khỏi thiết bị phần cứng thành công");
     }
}