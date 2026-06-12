package com.example.backend.modules.auth.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class NguoiDungQuyenUpdateRequest {
    @NotNull(message = "Danh sách ID quyền không được null")
    private List<Long> danhSachIdQuyen;
}
