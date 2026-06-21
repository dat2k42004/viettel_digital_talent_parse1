package com.example.backend.modules.procurement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NhaCungCapRequest {

     @Size(max = 50, message = "Mã nhà cung cấp không được vượt quá 50 ký tự")
     private String maNhaCungCap;

     @NotBlank(message = "Tên nhà cung cấp không được để trống")
     @Size(max = 255, message = "Tên nhà cung cấp không được vượt quá 255 ký tự")
     private String tenNhaCungCap;

     @Size(max = 20, message = "Mã số thuế không được vượt quá 20 ký tự")
     private String maSoThue;

     @Size(max = 100, message = "Tên người liên hệ không được vượt quá 100 ký tự")
     private String nguoiLienHe;

     @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
     private String soDienThoai;

     @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
     private String email;

     @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
     private String diaChi;

     private String ghiChu;
}
