# TÀI LIỆU KHẢO SÁT & ĐẶC TẢ CHI TIẾT API DỰ ÁN

Tài liệu này ghi lại chi tiết toàn bộ các API đã được triển khai trong hệ thống backend của dự án. 

---

## 1. Cấu trúc chung (Common Standards)

### 1.1. Headers
* **Public APIs**:
  * `Content-Type`: `application/json`
* **Authenticated APIs**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <JWT_ACCESS_TOKEN>`
* **Upload File API**:
  * `Content-Type`: `multipart/form-data`
  * `Authorization`: `Bearer <JWT_ACCESS_TOKEN>`

### 1.2. Envelope phản hồi chung (Envelope Response)
Tất cả các API dạng JSON đều trả về cấu trúc chung bọc ngoài:
```json
{
  "code": 200,          // Mã lỗi/trạng thái nghiệp vụ (200, 400, 401, 403, 500)
  "message": "Success", // Thông điệp phản hồi
  "data": T             // Dữ liệu nghiệp vụ thực tế (Object, List, String, Page)
}
```

### 1.3. Cấu trúc dữ liệu Phân trang (Page Response)
Với các API lấy danh sách có phân trang, phần `data` sẽ có cấu trúc:
```json
{
  "content": [ ... ],   // Danh sách các bản ghi của trang hiện tại
  "totalElements": 100, // Tổng số bản ghi trên hệ thống
  "totalPages": 10,     // Tổng số trang
  "page": 0,            // Trang hiện tại (0-indexed)
  "size": 10            // Kích thước trang
}
```

---

## 2. Phân hệ Xác thực (Authentication Module)

### 2.1. Đăng nhập hệ thống (Login)
* **Endpoint**: `POST /api/auth/login`
* **Headers**: 
  * `Content-Type`: `application/json`
* **Quyền (Permission)**: Không yêu cầu (Public)
* **Status Code**:
  * `200 OK`: Đăng nhập thành công.
  * `400 Bad Request`: Thiếu thông tin bắt buộc hoặc sai định dạng.
  * `401 Unauthorized`: Sai tài khoản hoặc mật khẩu.
* **Payload**:
  ```json
  {
    "username": "admin (NotBlank)",
    "password": "password123 (NotBlank)"
  }
  ```
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
      "refreshToken": "d7486e9e-5b12-4fcf-8408...",
      "idDonVi": 1,
      "username": "admin",
      "thongTinNguoiDung": {
        "id": 1,
        "tenDangNhap": "admin",
        "hoNguoiDung": "Nguyễn",
        "tenDemNguoiDung": "Văn",
        "tenNguoiDung": "A",
        "chucVu": "Nhân viên",
        "email": "user@example.com",
        "soDienThoai": "0987654321",
        "danhDaiDienUrl": "https://...",
        "trangThai": "HOAT_DONG",
        "danhSachVaiTro": [
          {
            "id": 1,
            "maVaiTro": "USER",
            "tenVaiTro": "Người dùng"
          }
        ]
      }
    }
  }
  ```

### 2.2. Đăng xuất hệ thống (Logout)
* **Endpoint**: `POST /api/auth/logout`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: Yêu cầu đăng nhập hợp lệ
* **Status Code**: `200 OK`
* **Payload**:
  ```json
  {
    "refreshToken": "d7486e9e-5b12-4fcf-8408... (NotBlank)"
  }
  ```
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Đăng xuất thành công"
  }
  ```

### 2.3. Làm mới Token (Refresh Token)
* **Endpoint**: `POST /api/auth/refresh-token`
* **Headers**:
  * `Content-Type`: `application/json`
* **Quyền (Permission)**: Không yêu cầu
* **Status Code**:
  * `200 OK`: Làm mới token thành công.
  * `400 Bad Request`: Refresh token trống, không hợp lệ hoặc đã hết hạn.
* **Payload**:
  ```json
  {
    "refreshToken": "d7486e9e-5b12-4fcf-8408... (NotBlank)"
  }
  ```
* **Response**: Trả về cấu trúc giống Đăng nhập, chứa `accessToken` và `refreshToken` mới.

### 2.4. Yêu cầu mã OTP Quên mật khẩu (Forgot Password)
* **Endpoint**: `POST /api/auth/quen-mat-khau`
* **Headers**:
  * `Content-Type`: `application/json`
* **Quyền (Permission)**: Không yêu cầu
* **Status Code**:
  * `200 OK`: OTP được tạo và gửi thành công qua Email.
  * `400 Bad Request`: Định dạng email sai hoặc không tìm thấy người dùng sở hữu email.
* **Payload**:
  ```json
  {
    "email": "nguoidung@example.com (Email, NotBlank)"
  }
  ```
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Mã OTP đặt lại mật khẩu đã được gửi về email của bạn"
  }
  ```

### 2.5. Xác nhận OTP và Đặt lại mật khẩu (Reset Password)
* **Endpoint**: `POST /api/auth/dat-lai-mat-khau`
* **Headers**:
  * `Content-Type`: `application/json`
* **Quyền (Permission)**: Không yêu cầu
* **Status Code**:
  * `200 OK`: Đặt lại mật khẩu thành công.
  * `400 Bad Request`: Mã OTP sai hoặc hết hạn, mật khẩu mới không đủ độ dài.
* **Payload**:
  ```json
  {
    "email": "nguoidung@example.com (Email, NotBlank)",
    "maOtp": "123456 (NotBlank)",
    "matKhauMoi": "newPassword (Size min=6, NotBlank)"
  }
  ```
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Đặt lại mật khẩu thành công"
  }
  ```

### 2.6. Lấy danh sách Quyền của tôi (Get My Permissions)
* **Endpoint**: `GET /api/iam/my-permissions`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: Yêu cầu đăng nhập hợp lệ (Authenticated)
* **Caching**: Quyền hạn của user được cache tập trung trên Redis (`user_permissions` cache, key `#userId`, TTL 30 phút). Cache sẽ tự động bị xóa bỏ (`Evict`) khi người dùng bị cập nhật thông tin, thay đổi trạng thái, phân lại quyền trực tiếp, hoặc bị xóa.
* **Status Code**:
  * `200 OK`: Thành công.
* **Payload**: Không yêu cầu
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": [
      "XEM_NGUOI_DUNG",
      "THEM_NGUOI_DUNG"
    ]
  }
  ```

### 2.7. Đổi mật khẩu chủ động (Change Password)
* **Endpoint**: `POST /api/auth/doi-mat-khau`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: Yêu cầu đăng nhập hợp lệ (Authenticated)
* **Caching**: Khi đổi mật khẩu thành công, cache quyền hạn của user này (`user_permissions` cache) sẽ bị xóa (`Evict`) để đảm bảo an toàn thông tin.
* **Status Code**:
  * `200 OK`: Đổi mật khẩu thành công.
  * `400 Bad Request`: Mật khẩu cũ không chính xác hoặc mật khẩu mới quá ngắn.
* **Payload**:
  ```json
  {
    "matKhauCu": "password123 (NotBlank)",
    "matKhauMoi": "newSecuredPassword (Size min=6, NotBlank)"
  }
  ```
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Đổi mật khẩu thành công"
  }
  ```

### 2.8. Lấy hồ sơ cá nhân của tôi (Get My Profile)
* **Endpoint**: `GET /api/auth/me`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: Yêu cầu đăng nhập hợp lệ (Authenticated)
* **Status Code**:
  * `200 OK`: Thành công.
* **Payload**: Không yêu cầu
* **Response**: Trả về cấu trúc giống `NguoiDungResponse` bọc trong `ApiResponse`.
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "id": 1,
      "idDonVi": 1,
      "tenDangNhap": "admin",
      "hoNguoiDung": "Nguyễn",
      "tenDemNguoiDung": "Văn",
      "tenNguoiDung": "A",
      "chucVu": "Nhân viên",
      "email": "user@example.com",
      "soDienThoai": "0987654321",
      "danhDaiDienUrl": "https://...",
      "trangThai": "HOAT_DONG",
      "danhSachVaiTro": [
        {
          "id": 1,
          "maVaiTro": "USER",
          "tenVaiTro": "Người dùng"
        }
      ]
    }
  }
  ```

---

## 3. Phân hệ Người dùng (User Module)

### 3.1. Lấy danh sách Người dùng (Get List Users)
* **Endpoint**: `GET /api/nguoi-dung`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_NGUOI_DUNG`
* **Status Code**: 
  * `200 OK`: Thành công.
  * `403 Forbidden`: Tài khoản không có quyền xem người dùng.
* **Query Parameters**:
  * `search` (tùy chọn): Tìm theo tên đăng nhập, email, tên hiển thị.
  * `trangThai` (tùy chọn): `HOAT_DONG` hoặc `KHOA`.
  * `page` (mặc định 0): Số trang.
  * `size` (mặc định 10): Số bản ghi trên trang.
* **Response**: Trả về `PageResponse` của danh sách người dùng.

### 3.2. Lấy chi tiết Người dùng theo ID (Get User Detail)
* **Endpoint**: `GET /api/nguoi-dung/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_NGUOI_DUNG`
* **Status Code**:
  * `200 OK`: Thành công.
  * `404 Not Found`: Không tìm thấy người dùng.
* **Response**: `ApiResponse` chứa thông tin chi tiết người dùng và danh sách quyền/vai trò liên thuộc.

### 3.3. Thêm mới Người dùng (Create User)
* **Endpoint**: `POST /api/nguoi-dung`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_NGUOI_DUNG`
* **Status Code**:
  * `200 OK`: Tạo thành công.
  * `400 Bad Request`: Trùng thông tin duy nhất (tên đăng nhập hoặc email).
* **Payload**:
  ```json
  {
    "tenDangNhap": "vietnam123 (NotBlank)",
    "matKhau": "password123 (Bắt buộc)",
    "hoNguoiDung": "Nguyễn",
    "tenDemNguoiDung": "Văn",
    "tenNguoiDung": "Nam (NotBlank)",
    "chucVu": "Nhân viên",
    "email": "nam@example.com (Email)",
    "soDienThoai": "0987654321",
    "danhDaiDienUrl": "http://...",
    "danhSachIdVaiTro": [1]
  }
  ```
* **Response**: Trả về thông tin Người dùng vừa tạo.

### 3.4. Cập nhật Người dùng (Update User)
* **Endpoint**: `PUT /api/nguoi-dung/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_NGUOI_DUNG`
* **Status Code**: `200 OK` (Thành công), `404 Not Found` (Không tìm thấy người dùng)
* **Payload**: Giống cấu trúc Thêm mới (nếu trường `matKhau` để trống/null hệ thống giữ nguyên mật khẩu cũ).
* **Response**: Trả về thông tin Người dùng đã được cập nhật.

### 3.5. Xóa mềm Người dùng (Soft Delete User)
* **Endpoint**: `DELETE /api/nguoi-dung/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_NGUOI_DUNG`
* **Status Code**: `200 OK`
* **Response**: `ApiResponse` thông báo xóa thành công.

### 3.6. Cập nhật trạng thái Người dùng (Update User Status)
* **Endpoint**: `PUT /api/nguoi-dung/{id}/trang-thai`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `CAP_NHAT_TRANG_THAI_NGUOI_DUNG`
* **Status Code**: `200 OK`
* **Payload**:
  ```json
  {
    "trangThai": "KHOA / HOAT_DONG (NotBlank)"
  }
  ```
* **Response**: `ApiResponse` thông báo cập nhật thành công.

### 3.7. Cập nhật Quyền trực tiếp của Người dùng (Update Direct Permissions)
* **Endpoint**: `PUT /api/nguoi-dung/{id}/quyen`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `CAP_NHAT_QUYEN_NGUOI_DUNG`
* **Status Code**: `200 OK`
* **Payload**:
  ```json
  {
    "danhSachIdQuyen": [1, 2, 3]
  }
  ```
* **Response**: `ApiResponse` thông báo cập nhật quyền thành công.

---

## 4. Phân hệ Vai trò (Role Module)

### 4.1. Lấy danh sách Vai trò (Get List Roles)
* **Endpoint**: `GET /api/vai-tro`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_VAI_TRO`
* **Status Code**: `200 OK`
* **Query Parameters**: `tenVaiTro`, `maVaiTro`, `trangThai`, `page`, `size`
* **Response**: Trả về `PageResponse` của danh sách vai trò.

### 4.2. Lấy chi tiết Vai trò theo ID (Get Role Detail)
* **Endpoint**: `GET /api/vai-tro/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_VAI_TRO`
* **Status Code**: `200 OK`
* **Response**: `ApiResponse` thông tin vai trò kèm danh sách quyền chi tiết.

### 4.3. Thêm mới Vai trò (Create Role)
* **Endpoint**: `POST /api/vai-tro`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_VAI_TRO`
* **Status Code**: `200 OK` (Thành công), `400 Bad Request`
* **Payload**:
  ```json
  {
    "maVaiTro": "Tự động sinh bởi Backend, không truyền",
    "tenVaiTro": "Điều hành viên (NotBlank)",
    "moTa": "Quản lý nội dung",
    "danhSachIdQuyen": [1, 2]
  }
  ```
* **Response**: Trả về thông tin Vai trò vừa tạo.

### 4.4. Cập nhật Vai trò (Update Role)
* **Endpoint**: `PUT /api/vai-tro/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_VAI_TRO`
* **Status Code**: `200 OK`
* **Payload**: Giống cấu trúc Thêm mới vai trò.
* **Response**: Trả về thông tin Vai trò sau cập nhật.

### 4.5. Xóa mềm Vai trò (Soft Delete Role)
* **Endpoint**: `DELETE /api/vai-tro/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_VAI_TRO`
* **Status Code**: `200 OK`
* **Response**: Thông báo xóa thành công.

### 4.6. Cập nhật danh sách Quyền của Vai trò (Update Role Permissions)
* **Endpoint**: `PUT /api/vai-tro/{id}/quyen`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `CAP_NHAT_QUYEN_VAI_TRO`
* **Status Code**: `200 OK`
* **Payload**:
  ```json
  {
    "danhSachIdQuyen": [1, 2, 3, 4]
  }
  ```
* **Response**: Thông báo thành công.

### 4.7. Cập nhật trạng thái Vai trò (Update Role Status)
* **Endpoint**: `PUT /api/vai-tro/{id}/trang-thai`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `CAP_NHAT_TRANG_THAI_VAI_TRO`
* **Status Code**: `200 OK`
* **Payload**:
  ```json
  {
    "trangThai": "HOAT_DONG / KHOA (NotBlank)"
  }
  ```
* **Response**: Thông báo thành công.

---

## 5. Phân hệ Quyền (Permission Module)

### 5.1. Lấy tất cả Quyền trong hệ thống (Get All Permissions)
* **Endpoint**: `GET /api/quyen`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_QUYEN`
* **Caching**: Danh mục quyền tĩnh toàn hệ thống được cache tập trung trên Redis (`global_permissions` cache, key `'all'`, TTL 24 giờ) nhằm tối ưu hóa hiệu năng đọc.
* **Status Code**: `200 OK`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": [
      {
        "id": 1,
        "maQuyen": "XEM_NGUOI_DUNG",
        "tenQuyen": "Xem danh sách người dùng"
      }
    ]
  }
  ```

---

## 6. Phân hệ Đơn vị / Tenant (Tenant Module)

### 6.1. Đăng ký Đơn vị (Register Tenant)
* **Endpoint**: `POST /api/don-vi/dang-ky`
* **Headers**:
  * `Content-Type`: `application/json`
* **Quyền (Permission)**: Không yêu cầu (Public)
* **Status Code**: `200 OK`
* **Payload**:
  ```json
  {
    "tenPhapLy": "Công ty TNHH CNTT (NotBlank)",
    "tenMienHeThong": "domain.itam.vn (NotBlank)",
    "maSoThue": "0100109106",
    "tenNguoiDaiDien": "Nguyễn Văn A (NotBlank)",
    "tenDangNhapAdmin": "admin_system (NotBlank)",
    "matKhauAdmin": "adminPassword123 (NotBlank)",
    "tenAdmin": "Nguyễn Văn Admin (NotBlank)",
    "emailAdmin": "admin@tenant.com (Email, NotBlank)"
  }
  ```
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Đăng ký thành công. Vui lòng kiểm tra email để lấy mở OTP."
  }
  ```

### 6.2. Xác thực OTP kích hoạt Đơn vị (Verify OTP Tenant)
* **Endpoint**: `POST /api/don-vi/xac-thuc-otp`
* **Headers**:
  * `Content-Type`: `application/json`
* **Quyền (Permission)**: Không yêu cầu
* **Status Code**: `200 OK` (Kích hoạt thành công), `400 Bad Request` (Sai mã OTP)
* **Payload**:
  ```json
  {
    "email": "admin@tenant.com (Email, NotBlank)",
    "otp": "123456 (NotBlank)"
  }
  ```
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Kích hoạt đơn vị thành công. Bạn có thể đăng nhập."
  }
  ```
* **Nghiệp vụ ngầm**: Ngay khi xác thực OTP thành công và đơn vị được chuyển sang trạng thái `HOAT_DONG`, hệ thống sẽ tự động bắn một sự kiện qua RabbitMQ đến queue `tenant.init-config.queue`. Tiến trình nền sẽ lắng nghe và tự động chèn hàng loạt (Bulk Insert) các cặp giá trị cấu hình mặc định từ bảng `danh_muc_cau_hinh` sang `cau_hinh_don_vi` cho đơn vị mới, giúp đơn vị hoạt động ngay lập tức.

### 6.3. Lấy thông tin Đơn vị theo ID (Get Tenant Detail)
* **Endpoint**: `GET /api/don-vi/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_DON_VI`
* **Status Code**: `200 OK`
* **Response**: Trả về dữ liệu thông tin chi tiết Đơn vị.

### 6.4. Lấy danh sách Đơn vị phân trang (Get List Tenants)
* **Endpoint**: `GET /api/don-vi`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_DON_VI`
* **Status Code**: `200 OK`
* **Query Parameters**: `ten`, `maDonVi`, `trangThai`, `maSoThue`, `page`, `size`
* **Response**: Trả về `PageResponse` danh sách Đơn vị.

### 6.5. Cập nhật thông tin Đơn vị (Update Tenant)
* **Endpoint**: `PUT /api/don-vi/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_DON_VI`
* **Status Code**: `200 OK`
* **Payload**:
  ```json
  {
    "tenPhapLy": "Công ty TNHH CNTT và Truyền Thông (NotBlank)",
    "tenThuongMai": "IT-Telecom Corp",
    "maSoThue": "0100109106",
    "maQuocGiaDienThoai": "84",
    "soDienThoaiCoDinh": "0243123456",
    "soDienThoaiDiDong": "0987654321",
    "emailChinhThuc": "contact@tenant.com (Email)",
    "tenMienHeThong": "it-telecom.itam.vn",
    "duongDanWebsite": "https://tenant.com",
    "soNhaTenDuong": "Số 1 Lý Thường Kiệt",
    "phuongXa": "Phan Chu Trinh",
    "quanHuyen": "Hoàn Kiếm",
    "tinhThanhPho": "Hà Nội",
    "maBuuChinh": "10000",
    "maQuocGia": "VN",
    "hoNguoiDaiDien": "Nguyễn",
    "tenNguoiDaiDien": "A",
    "tenDemNguoiDaiDien": "Văn",
    "chucVuNguoiDaiDien": "Giám đốc",
    "thoiGianThanhLap": "2018-06-15",
    "thoiGianBatDauHopDong": "2026-06-01",
    "thoiGianHetHanHopDong": "2029-06-01"
  }
  ```
* **Response**: Trả về thông tin Đơn vị đã cập nhật.

### 6.6. Khóa/Kích hoạt lại Đơn vị (Update Tenant Status)
* **Endpoint**: `PUT /api/don-vi/{id}/trang-thai`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `KHOA_DON_VI`
* **Status Code**: `200 OK`
* **Payload**:
  ```json
  {
    "trangThai": "KHOA / HOAT_DONG (NotBlank)"
  }
  ```
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Cập nhật trạng thái đơn vị và các thực thể liên quan thành công"
  }
  ```

### 6.7. Xóa mềm Đơn vị (Soft Delete Tenant)
* **Endpoint**: `DELETE /api/don-vi/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_DON_VI`
* **Status Code**: `200 OK`
* **Response**: Thông báo thành công.

### 6.8. Kiểm tra trùng lặp Tên miền Hệ thống (Check Domain Availability)
* **Endpoint**: `GET /api/don-vi/check-domain`
* **Headers**: công khai (Public)
* **Quyền (Permission)**: Không yêu cầu
* **Query Parameters**:
  * `domain` (Bắt buộc): Tên miền cần kiểm tra (Ví dụ: `viettel.itam.vn`).
* **Status Code**:
  * `200 OK`: Thành công.
* **Payload**: Không yêu cầu
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "available": true
    }
  }
  ```

### 6.9. Gia hạn Hợp đồng Đơn vị (Extend Tenant Contract)
* **Endpoint**: `PUT /api/don-vi/{id}/gia-han`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: Yêu cầu quyền của Super Admin (`GIA_HAN_DON_VI` authority)
* **Caching**: Khi gia hạn thành công, cache cấu hình đơn vị này (`tenant_configs` cache) sẽ bị xóa (`Evict`) trên Redis.
* **Status Code**:
  * `200 OK`: Thành công.
  * `400 Bad Request`: Ngày gia hạn không hợp lệ (phải ở tương lai).
  * `403 Forbidden`: Người dùng không có thẩm quyền.
* **Payload**:
  ```json
  {
    "ngayHetHanMoi": "2029-06-01 (LocalDate, NotNull)",
    "ghiChuGiaHan": "Gia hạn hợp đồng dịch vụ thêm 3 năm"
  }
  ```
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Gia hạn hợp đồng đơn vị thành công"
  }
  ```

---

## 7. Phân hệ Phòng ban (Department Module)

### 7.1. Lấy danh sách Phòng ban phân trang (Get List Departments)
* **Endpoint**: `GET /api/phong-ban`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_PHONG_BAN`
* **Query Parameters**: `tenPhongBan`, `maPhongBan`, `trangThai`, `page`, `size`
* **Response**: Trả về `PageResponse` của danh sách phòng ban.

### 7.2. Lấy chi tiết Phòng ban (Get Department Detail)
* **Endpoint**: `GET /api/phong-ban/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_PHONG_BAN`
* **Status Code**: `200 OK`
* **Response**: Chi tiết phòng ban.

### 7.3. Thêm mới Phòng ban (Create Department)
* **Endpoint**: `POST /api/phong-ban`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_PHONG_BAN`
* **Status Code**: `200 OK`
* **Payload**:
  ```json
  {
    "maPhongBan": "Tự động sinh bởi Backend, không truyền",
    "tenPhongBan": "Phòng Nhân Sự (NotBlank)",
    "tenTiengAnh": "Human Resources Department",
    "tenVietTat": "HR",
    "soMayLe": "101",
    "soHotlinePhong": "0243123456",
    "emailNhom": "hr@company.com",
    "loaiPhongBan": "ADMINISTRATIVE",
    "hanMucNganSach": 10000000.00,
    "maTrungTamChiPhi": "CC_HR",
    "moTaChucNang": "Quản lý nhân sự",
    "trangThai": "HOAT_DONG",
    "thoiGianThanhLap": "2020-01-01"
  }
  ```
* **Response**: Chi tiết phòng ban được tạo.

### 7.4. Cập nhật Phòng ban (Update Department)
* **Endpoint**: `PUT /api/phong-ban/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_PHONG_BAN`
* **Payload**: Giống Thêm mới.
* **Response**: Trả về thông tin phòng ban sau cập nhật.

### 7.5. Xóa mềm Phòng ban (Soft Delete Department)
* **Endpoint**: `DELETE /api/phong-ban/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_PHONG_BAN`
* **Response**: Thông báo thành công.

### 7.6. Cập nhật trạng thái Phòng ban (Update Department Status)
* **Endpoint**: `PUT /api/phong-ban/{id}/trang-thai`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `CAP_NHAT_TRANG_THAI_PHONG_BAN`
* **Payload**:
  ```json
  {
    "trangThai": "HOAT_DONG / KHOA (NotBlank)"
  }
  ```
* **Response**: Thông báo thành công.

---

## 8. Phân hệ Vị trí (Location Module)

### 8.1. Lấy danh sách Vị trí phân trang (Get List Locations)
* **Endpoint**: `GET /api/vi-tri`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_VI_TRI`
* **Query Parameters**: `tenViTri`, `maViTri`, `trangThai`, `loaiViTri`, `page`, `size`
* **Response**: Trả về `PageResponse` danh sách vị trí.

### 8.2. Lấy chi tiết Vị trí (Get Location Detail)
* **Endpoint**: `GET /api/vi-tri/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_VI_TRI`
* **Response**: Chi tiết vị trí.

### 8.3. Thêm mới Vị trí (Create Location)
* **Endpoint**: `POST /api/vi-tri`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_VI_TRI`
* **Payload**:
  ```json
  {
    "maViTri": "Tự động sinh bởi Backend, không truyền",
    "tenViTri": "Văn phòng Tầng 5 (NotBlank)",
    "tenTiengAnh": "Office Floor 5",
    "loaiViTri": "OFFICE",
    "sucChuaToiDa": 100,
    "dienTichM2": 300.00,
    "chieuCaoM": 3.20,
    "capDoBaoMat": "NORMAL",
    "laPhongKinh": true,
    "coDieuHoaTrungTam": true,
    "coHeThongPccc": true,
    "coKiemSoatCua": true,
    "moTaChiTiet": "Phòng làm việc chung tầng 5",
    "trangThai": "HOAT_DONG"
  }
  ```
* **Response**: Trả về thông tin vị trí vừa tạo.

### 8.4. Cập nhật Vị trí (Update Location)
* **Endpoint**: `PUT /api/vi-tri/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_VI_TRI`
* **Payload**: Giống cấu trúc thêm mới.
* **Response**: Trả về thông tin vị trí sau cập nhật.

### 8.5. Xóa mềm Vị trí (Soft Delete Location)
* **Endpoint**: `DELETE /api/vi-tri/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_VI_TRI`
* **Response**: Thông báo thành công.

### 8.6. Cập nhật trạng thái Vị trí (Update Location Status)
* **Endpoint**: `PUT /api/vi-tri/{id}/trang-thai`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `CAP_NHAT_TRANG_THAI_VI_TRI`
* **Payload**:
  ```json
  {
    "trangThai": "HOAT_DONG / KHOA (NotBlank)"
  }
  ```
* **Response**: Thông báo thành công.

---

## 9. Danh mục Cấu hình (Configuration Catalog Module)

### 9.1. Lấy danh sách Danh mục Cấu hình (Get List Catalog Configs)
* **Endpoint**: `GET /api/danh-muc-cau-hinh`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_DANH_MUC_CAU_HINH`
* **Query Parameters**: `tenCauHinh`, `maCauHinh`, `page`, `size`
* **Caching**: Được cache tập trung trên Redis (`global_catalog_configs` cache, key `'all'`, TTL 24 giờ). Cache tự động bị xóa bỏ (`Evict`) trên toàn hệ thống khi thực hiện thêm mới, cập nhật, hoặc xóa danh mục cấu hình.
* **Response**: Trả về `PageResponse` danh sách danh mục cấu hình.

### 9.2. Lấy chi tiết Danh mục Cấu hình (Get Catalog Config Detail)
* **Endpoint**: `GET /api/danh-muc-cau-hinh/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_DANH_MUC_CAU_HINH`
* **Response**: Chi tiết danh mục cấu hình.

### 9.3. Thêm mới Danh mục Cấu hình (Create Catalog Config)
* **Endpoint**: `POST /api/danh-muc-cau-hinh`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_DANH_MUC_CAU_HINH`
* **Payload**:
  ```json
  {
    "maCauHinh": "Tự động sinh bởi Backend, không truyền",
    "tenCauHinh": "Thời gian hết hạn mật khẩu (ngày) (NotBlank)",
    "moTaCauHinh": "Thời gian yêu cầu người dùng đổi mật khẩu định kỳ",
    "nhomCauHinh": "SECURITY",
    "loaiDuLieu": "INTEGER",
    "giaTriMacDinh": "90",
    "trangThai": "HOAT_DONG"
  }
  ```
* **Response**: Chi tiết cấu hình được tạo.

### 9.4. Cập nhật Danh mục Cấu hình (Update Catalog Config)
* **Endpoint**: `PUT /api/danh-muc-cau-hinh/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_DANH_MUC_CAU_HINH`
* **Payload**: Giống cấu trúc thêm mới.
* **Response**: Chi tiết cấu hình đã cập nhật.

### 9.5. Xóa mềm Danh mục Cấu hình (Soft Delete Catalog Config)
* **Endpoint**: `DELETE /api/danh-muc-cau-hinh/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_DANH_MUC_CAU_HINH`
* **Response**: Thông báo thành công.

---

## 10. Cấu hình Đơn vị (Tenant Config Module)

### 10.1. Lấy danh sách Cấu hình Đơn vị (Get Tenant Configs)
* **Endpoint**: `GET /api/cau-hinh-don-vi`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_CAU_HINH_DON_VI`
* **Query Parameters**: `tenCauHinh`, `page`, `size`
* **Response**: `PageResponse` danh sách các cấu hình đã áp cho đơn vị hiện tại.

### 10.2. Lấy chi tiết Cấu hình Đơn vị (Get Tenant Config Detail)
* **Endpoint**: `GET /api/cau-hinh-don-vi/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_CAU_HINH_DON_VI`
* **Response**: Chi tiết cấu hình.

### 10.3. Thêm cấu hình mới cho Đơn vị (Apply Tenant Config)
* **Endpoint**: `POST /api/cau-hinh-don-vi`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_CAU_HINH_DON_VI`
* **Payload**:
  ```json
  {
    "idDanhMucCauHinh": 1, // Long (NotNull)
    "giaTriCauHinh": "45 (NotBlank)"
  }
  ```
* **Response**: Chi tiết cấu hình vừa được áp.

### 10.4. Cập nhật cấu hình Đơn vị (Update Tenant Config)
* **Endpoint**: `PUT /api/cau-hinh-don-vi/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_CAU_HINH_DON_VI`
* **Payload**: Giống thêm mới.
* **Response**: Thông tin cấu hình đã cập nhật.

### 10.5. Xóa cấu hình Đơn vị (Delete Tenant Config)
* **Endpoint**: `DELETE /api/cau-hinh-don-vi/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_CAU_HINH_DON_VI`
* **Response**: Thông báo thành công.

### 10.6. Lấy cấu hình của đơn vị tôi (Get My Tenant Configs)
* **Endpoint**: `GET /api/cau-hinh-don-vi/mine`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: Yêu cầu đăng nhập hợp lệ (Authenticated)
* **Caching**: Được cache tập trung trên Redis theo đơn vị/tenant (`tenant_configs` cache, key `#idDonVi`, TTL 12 giờ) giúp cô lập dữ liệu giữa các tenant. Cache sẽ tự động bị xóa bỏ (`Evict`) đối với tenant tương ứng khi thực hiện thêm mới, cập nhật hoặc xóa cấu hình đơn vị.
* **Status Code**:
  * `200 OK`: Thành công.
* **Payload**: Không yêu cầu
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": [
      {
        "id": 1,
        "idDonVi": 1,
        "idDanhMucCauHinh": 1,
        "maCauHinh": "THOI_GIAN_KHOA_PHIEU",
        "tenCauHinh": "Thời gian khóa phiếu",
        "giaTriCauHinh": "24"
      }
    ]
  }
  ```

---

## 11. Quản lý Tệp tin (File Manager Module)

### 11.1. Tải lên nhiều tệp tin lên R2 (Upload Files)
* **Endpoint**: `POST /api/files/upload`
* **Headers**:
  * `Content-Type`: `multipart/form-data`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `TAI_LEN_FILE`
* **Status Code**:
  * `200 OK`: Tải lên thành công.
  * `400 Bad Request`: Định dạng tệp tin hoặc kích thước tệp tin không hợp lệ.
  * `403 Forbidden`: Tài khoản không được cấp quyền upload.
* **Payload**:
  * Gửi danh sách file qua tham số kiểu `multipart/form-data` với key là: `files` (Mảng chứa các tệp tin).
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": [
      "https://pub-your-cloudflare-r2-url.com/shared-bucket/unique-file-id-1.png",
      "https://pub-your-cloudflare-r2-url.com/shared-bucket/unique-file-id-2.pdf"
    ]
  }
  ```

### 11.2. Lấy liên kết tải xuống tệp tin (Download File Pre-signed URL)
* **Endpoint**: `GET /api/files/download`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `TAI_XUONG_FILE`
* **Status Code**:
  * `200 OK`: Thành công.
  * `400 Bad Request`: Thiếu key hoặc sai thư mục bảo mật.
  * `500 Internal Server Error`: Không thể tạo pre-signed URL từ Cloudflare R2.
* **Response**: [ApiResponse](file:///g:/documents/viettel_digital_talent/practice/practice_pharse_1/source_code/backend/src/main/java/com/example/backend/shared/response/ApiResponse.java)<`String`> (Trả về Pre-signed URL truy xuất tệp tin trực tiếp từ Cloudflare R2 có thời hạn sống 5 phút)
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "https://itam.f10d418fce8f37155b57fb15f65919a9.r2.cloudflarestorage.com/shared/20260613/uuid_name.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=..."
  }
  ```

---

## 12. Triển khai bổ sung các API Mới (Phòng chống rò rỉ phiên & Tối ưu Dropdown)

### 12.1. Cưỡng chế Đăng xuất / Thu hồi tất cả phiên của một User (Force Logout)
* **Endpoint**: `POST /api/nguoi-dung/{id}/thu-hoi-phien`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `CAP_NHAT_TRANG_THAI_NGUOI_DUNG`
* **Logic / Multi-tenant check**: Chỉ cho phép quản trị viên thuộc cùng đơn vị hoặc Super Admin hệ thống thu hồi phiên. Khi thực hiện, toàn bộ phiên đăng nhập hoạt động của người dùng sẽ bị đưa về trạng thái `EXPIRED` trong cơ sở dữ liệu và Access Token tương ứng sẽ bị ghi nhận vào danh sách đen trên Redis (Blacklist) để ngăn chặn việc sử dụng tiếp.
* **Status Code**:
  * `200 OK`: Thành công.
  * `403 Forbidden`: Người dùng thuộc đơn vị khác.
  * `404 Not Found`: Người dùng không tồn tại.
* **Payload**: Không yêu cầu
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Đã cưỡng chế đăng xuất và hủy toàn bộ phiên làm việc của người dùng thành công"
  }
  ```

### 12.2. Lấy danh sách Quyền phân nhóm theo Phân hệ (Get Permissions Grouped)
* **Endpoint**: `GET /api/quyen/phan-nhom`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_QUYEN`
* **Caching**: Được cache tập trung trên Redis (`global_permissions_grouped` cache, key `'all'`) vì danh mục quyền tĩnh.
* **Status Code**:
  * `200 OK`: Thành công.
* **Payload**: Không yêu cầu
* **Response**: Trả về một `Map` cấu trúc nhóm theo tên phân hệ (`NGUOI_DUNG`, `VAI_TRO`, `DON_VI`, `PHONG_BAN`, `VI_TRI`, `CAU_HINH`, `QUYEN`, `OTHERS`), mỗi phân hệ chứa mảng danh sách các quyền hạn rút gọn tương ứng.

### 12.3. Lấy danh sách Vai trò rút gọn cho Dropdown (Get Tenant Role Dropdown)
* **Endpoint**: `GET /api/vai-tro/dropdown`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_VAI_TRO`
* **Logic / Multi-tenant check**: Chỉ trả về các vai trò hoạt động thuộc đơn vị hiện tại (nếu Admin đơn vị) hoặc vai trò hệ thống (nếu Super Admin).
* **Status Code**:
  * `200 OK`: Thành công.
* **Payload**: Không yêu cầu
* **Response**: Trả về danh sách vai trò rút gọn (chỉ gồm `id`, `maVaiTro`, `tenVaiTro` để tối ưu hóa băng thông mạng).
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": [
      {
        "id": 1,
        "maVaiTro": "ADMIN_DV123",
        "tenVaiTro": "Quản trị viên Đơn vị"
      }
    ]
  }
  ```

---

## 13. Phân hệ Quản lý tài sản (Asset Module)

### 13.1. Loại tài sản (LoaiTaiSan)

#### 13.1.1. Lấy danh sách Loại tài sản phân trang
* **Endpoint**: `GET /api/loai-tai-san`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_LOAI_TAI_SAN`
* **Status Code**: `200 OK`
* **Query Parameters**:
  * `keyword` (tùy chọn): Tìm kiếm theo `maLoai` hoặc `tenLoai`.
  * `trangThai` (tùy chọn): `HOAT_DONG` hoặc `KHOA`.
  * `page` (mặc định 0): Số trang.
  * `size` (mặc định 10): Số bản ghi trên trang.
  * `sort` (mặc định `id,desc`): Tiêu chí sắp xếp.
* **Caching**: Được cache tập trung trên Redis (`loai_tai_san_list_cache` cache, key gồm các query parameters).
* **Response**: Trả về `PageResponse` chứa danh sách Loại tài sản.

#### 13.1.2. Lấy chi tiết Loại tài sản theo ID
* **Endpoint**: `GET /api/loai-tai-san/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_LOAI_TAI_SAN`
* **Status Code**: 
  * `200 OK`: Thành công.
  * `400 Bad Request`: Thực thể đang bị khóa hoặc ngừng hoạt động (trạng thái khác `HOAT_DONG`).
  * `404 Not Found`: Không tìm thấy loại tài sản.
* **Caching**: Được cache tập trung trên Redis (`loai_tai_san_cache` cache, key `#id`).
* **Response**: `ApiResponse` chứa thông tin chi tiết Loại tài sản.

#### 13.1.3. Lấy danh sách Loại tài sản rút gọn cho Dropdown (Select options)
* **Endpoint**: `GET /api/loai-tai-san/select-options`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_LOAI_TAI_SAN`
* **Status Code**: `200 OK`
* **Response**: `ApiResponse` chứa danh sách các tùy chọn gồm `id` và `ten` của Loại tài sản đang hoạt động (`HOAT_DONG`).

#### 13.1.4. Thêm mới Loại tài sản
* **Endpoint**: `POST /api/loai-tai-san`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_LOAI_TAI_SAN`
* **Status Code**:
  * `200 OK`: Thành công.
  * `400 Bad Request`: Trùng mã loại tài sản đã tồn tại.
* **Caching**: Tự động xóa bỏ (`Evict`) cache danh sách và cache chi tiết loại tài sản trên Redis.
* **Payload**:
  ```json
  {
    "maLoai": "Tự động sinh bởi Backend, không truyền",
    "tenLoai": "Máy tính xách tay (NotBlank)",
    "tienToMaThe": "LT",
    "thoiGianKhauHao": 36,
    "ghiChu": "Thiết bị CNTT cấp phát cho nhân viên",
    "trangThai": "HOAT_DONG"
  }
  ```
* **Response**: Trả về thông tin Loại tài sản vừa tạo.

#### 13.1.5. Cập nhật Loại tài sản
* **Endpoint**: `PUT /api/loai-tai-san/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_LOAI_TAI_SAN`
* **Status Code**: `200 OK` (Thành công), `404 Not Found` (Không tìm thấy loại tài sản)
* **Caching**: Tự động xóa bỏ (`Evict`) cache danh sách và cache chi tiết loại tài sản trên Redis.
* **Payload**: Giống cấu trúc Thêm mới.
* **Response**: Trả về thông tin Loại tài sản sau cập nhật.

#### 13.1.6. Cập nhật trạng thái Loại tài sản
* **Endpoint**: `PUT /api/loai-tai-san/{id}/trang-thai`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `CAP_NHAT_TRANG_THAI_LOAI_TAI_SAN`
* **Status Code**: `200 OK`
* **Caching**: Tự động xóa bỏ (`Evict`) cache danh sách và cache chi tiết loại tài sản trên Redis.
* **Payload**:
  ```json
  {
    "trangThai": "KHOA / HOAT_DONG (NotBlank)"
  }
  ```
* **Response**: `ApiResponse` thông báo cập nhật thành công.

#### 13.1.7. Xóa mềm Loại tài sản
* **Endpoint**: `DELETE /api/loai-tai-san/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_LOAI_TAI_SAN`
* **Caching**: Tự động xóa bỏ (`Evict`) cache danh sách và cache chi tiết loại tài sản trên Redis.
* **Response**: `ApiResponse` thông báo xóa mềm thành công (thiết lập lý do là "Người dùng xóa").

---

### 13.2. Hãng sản xuất (HangSanXuat)

#### 13.2.1. Lấy danh sách Hãng sản xuất phân trang
* **Endpoint**: `GET /api/hang-san-xuat`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_HANG_SAN_XUAT`
* **Status Code**: `200 OK`
* **Query Parameters**:
  * `keyword` (tùy chọn): Tìm kiếm theo `maHang` hoặc `tenHang`.
  * `trangThai` (tùy chọn): `HOAT_DONG` hoặc `KHOA`.
  * `page` (mặc định 0): Số trang.
  * `size` (mặc định 10): Số bản ghi trên trang.
  * `sort` (mặc định `id,desc`): Tiêu chí sắp xếp.
* **Caching**: Được cache tập trung trên Redis (`hang_san_xuat_list_cache` cache, key gồm các query parameters).
* **Response**: Trả về `PageResponse` chứa danh sách Hãng sản xuất.

#### 13.2.2. Lấy chi tiết Hãng sản xuất theo ID
* **Endpoint**: `GET /api/hang-san-xuat/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_HANG_SAN_XUAT`
* **Status Code**: 
  * `200 OK`: Thành công.
  * `400 Bad Request`: Thực thể đang bị khóa hoặc ngừng hoạt động.
  * `404 Not Found`: Không tìm thấy hãng sản xuất.
* **Caching**: Được cache tập trung trên Redis (`hang_san_xuat_cache` cache, key `#id`).
* **Response**: `ApiResponse` chứa thông tin chi tiết Hãng sản xuất.

#### 13.2.3. Lấy danh sách Hãng sản xuất rút gọn cho Dropdown (Select options)
* **Endpoint**: `GET /api/hang-san-xuat/select-options`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_HANG_SAN_XUAT`
* **Status Code**: `200 OK`
* **Response**: `ApiResponse` chứa danh sách các tùy chọn gồm `id` và `ten` của Hãng sản xuất đang hoạt động (`HOAT_DONG`).

#### 13.2.4. Thêm mới Hãng sản xuất
* **Endpoint**: `POST /api/hang-san-xuat`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_HANG_SAN_XUAT`
* **Status Code**:
  * `200 OK`: Thành công.
  * `400 Bad Request`: Trùng mã hãng sản xuất đã tồn tại.
* **Caching**: Tự động xóa bỏ (`Evict`) cache danh sách và cache chi tiết hãng sản xuất trên Redis.
* **Payload**:
  ```json
  {
    "maHang": "Tự động sinh bởi Backend, không truyền",
    "tenHang": "Dell Technologies (NotBlank)",
    "websiteHoTro": "https://support.dell.com",
    "hotlineHoTro": "1800-8109",
    "emailHoTro": "support@dell.com",
    "ghiChu": "Nhà cung cấp máy tính, server chính",
    "trangThai": "HOAT_DONG"
  }
  ```
* **Response**: Trả về thông tin Hãng sản xuất vừa tạo.

#### 13.2.5. Cập nhật Hãng sản xuất
* **Endpoint**: `PUT /api/hang-san-xuat/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_HANG_SAN_XUAT`
* **Status Code**: `200 OK` (Thành công), `404 Not Found` (Không tìm thấy hãng sản xuất)
* **Caching**: Tự động xóa bỏ (`Evict`) cache danh sách và cache chi tiết hãng sản xuất trên Redis.
* **Payload**: Giống cấu trúc Thêm mới.
* **Response**: Trả về thông tin Hãng sản xuất sau cập nhật.

#### 13.2.6. Cập nhật trạng thái Hãng sản xuất
* **Endpoint**: `PUT /api/hang-san-xuat/{id}/trang-thai`
* **HTTP Method**: `PUT`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `@PreAuthorize("hasAuthority('CAP_NHAT_TRANG_THAI_HANG_SAN_XUAT')")`
* **Payload**:
  ```json
  {
    "trangThai": "HOAT_DONG"
  }
  ```
  * **Bảng giải thích giá trị trạng thái (TrangThaiCoBanEnum)**:
  | Giá trị Enum | Tên hiển thị / Mô tả | Ý nghĩa nghiệp vụ |
  | :--- | :--- | :--- |
  | `HOAT_DONG` | Hoạt động | Hãng sản xuất hoạt động bình thường, được phép liên kết dữ liệu mới. |
  | `KHOA` | Khóa | Hãng sản xuất bị khóa, không cho phép tạo mới các liên kết đến hãng này. |

* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Cập nhật trạng thái hãng sản xuất thành công"
  }
  ```

#### 13.2.7. Xóa mềm Hãng sản xuất
* **Endpoint**: `DELETE /api/hang-san-xuat/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_HANG_SAN_XUAT`
* **Caching**: Tự động xóa bỏ (`Evict`) cache danh sách và cache chi tiết hãng sản xuất trên Redis.
* **Response**: `ApiResponse` thông báo xóa mềm thành công.

---

### 13.3. Danh mục tài sản (DanhMucTaiSan)

#### 13.3.1. Lấy danh sách Danh mục tài sản phân trang
* **Endpoint**: `GET /api/danh-muc-tai-san`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_DANH_MUC_TAI_SAN`
* **Status Code**: `200 OK`
* **Query Parameters**:
  * `keyword` (tùy chọn): Tìm kiếm theo `maDanhMuc` hoặc `tenDanhMuc`.
  * `trangThai` (tùy chọn): `HOAT_DONG` hoặc `KHOA`.
  * `page` (mặc định 0): Số trang.
  * `size` (mặc định 10): Số bản ghi trên trang.
  * `sort` (mặc định `id,desc`): Tiêu chí sắp xếp.
* **Caching**: Được cache tập trung trên Redis (`danh_muc_tai_san_list_cache` cache, key gồm các query parameters).
* **Response**: Trả về `PageResponse` chứa danh sách Danh mục tài sản.

#### 13.3.2. Lấy chi tiết Danh mục tài sản theo ID
* **Endpoint**: `GET /api/danh-muc-tai-san/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_DANH_MUC_TAI_SAN`
* **Status Code**: 
  * `200 OK`: Thành công.
  * `400 Bad Request`: Thực thể đang bị khóa hoặc ngừng hoạt động.
  * `404 Not Found`: Không tìm thấy danh mục tài sản.
* **Caching**: Được cache tập trung trên Redis (`danh_muc_tai_san_cache` cache, key `#id`).
* **Response**: `ApiResponse` chứa thông tin chi tiết Danh mục tài sản.

#### 13.3.3. Lấy danh sách Danh mục tài sản rút gọn cho Dropdown (Select options)
* **Endpoint**: `GET /api/danh-muc-tai-san/select-options`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_DANH_MUC_TAI_SAN`
* **Status Code**: `200 OK`
* **Response**: `ApiResponse` chứa danh sách các tùy chọn gồm `id` và `ten` của Danh mục tài sản đang hoạt động (`HOAT_DONG`).

#### 13.3.4. Thêm mới Danh mục tài sản
* **Endpoint**: `POST /api/danh-muc-tai-san`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_DANH_MUC_TAI_SAN`
* **Status Code**:
  * `200 OK`: Thành công.
  * `400 Bad Request`: Trùng mã danh mục tài sản đã tồn tại.
* **Caching**: Tự động xóa bỏ (`Evict`) cache danh sách và cache chi tiết danh mục tài sản trên Redis.
* **Payload**:
  ```json
  {
    "maDanhMuc": "Tự động sinh bởi Backend, không truyền",
    "tenDanhMuc": "Tài sản văn phòng (NotBlank)",
    "moTa": "Các tài sản dùng cho hoạt động hành chính văn phòng",
    "trangThai": "HOAT_DONG"
  }
  ```
* **Response**: Trả về thông tin Danh mục tài sản vừa tạo.

#### 13.3.5. Cập nhật Danh mục tài sản
* **Endpoint**: `PUT /api/danh-muc-tai-san/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_DANH_MUC_TAI_SAN`
* **Status Code**: `200 OK` (Thành công), `404 Not Found` (Không tìm thấy danh mục tài sản)
* **Caching**: Tự động xóa bỏ (`Evict`) cache danh sách và cache chi tiết danh mục tài sản trên Redis.
* **Payload**: Giống cấu trúc Thêm mới.
* **Response**: Trả về thông tin Danh mục tài sản sau cập nhật.

#### 13.3.6. Cập nhật trạng thái Danh mục tài sản
* **Endpoint**: `PUT /api/danh-muc-tai-san/{id}/trang-thai`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `CAP_NHAT_TRANG_THAI_DANH_MUC_TAI_SAN`
* **Status Code**: `200 OK`
* **Caching**: Tự động xóa bỏ (`Evict`) cache danh sách và cache chi tiết danh mục tài sản trên Redis.
* **Payload**:
  ```json
  {
    "trangThai": "KHOA / HOAT_DONG (NotBlank)"
  }
  ```
* **Response**: `ApiResponse` thông báo cập nhật thành công.

#### 13.3.7. Xóa mềm Danh mục tài sản
* **Endpoint**: `DELETE /api/danh-muc-tai-san/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_DANH_MUC_TAI_SAN`
* **Caching**: Tự động xóa bỏ (`Evict`) cache danh sách và cache chi tiết danh mục tài sản trên Redis.
* **Response**: `ApiResponse` thông báo xóa mềm thành công.

---

### 13.4. Mẫu phần cứng (TaiSanPhanCung)

#### 13.4.1. Lấy danh sách Mẫu phần cứng phân trang
* **Endpoint**: `GET /api/tai-san-phan-cung`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_TAI_SAN_PHAN_CUNG`
* **Status Code**: `200 OK`
* **Query Parameters**:
  * `keyword` (tùy chọn): Tìm kiếm theo `maMau` hoặc `tenMau`.
  * `trangThai` (tùy chọn): `HOAT_DONG` hoặc `KHOA`.
  * `page` (mặc định 0): Số trang.
  * `size` (mặc định 10): Số bản ghi trên trang.
  * `sort` (mặc định `id,desc`): Tiêu chí sắp xếp.
* **Caching**: Được cache tập trung trên Redis (`tai_san_phan_cung_list_cache` cache, key gồm các query parameters).
* **Response**: Trả về `PageResponse` chứa danh sách Mẫu phần cứng.

#### 13.4.2. Lấy chi tiết Mẫu phần cứng theo ID
* **Endpoint**: `GET /api/tai-san-phan-cung/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_TAI_SAN_PHAN_CUNG`
* **Status Code**: 
  * `200 OK`: Thành công.
  * `400 Bad Request`: Mẫu phần cứng hiện đang bị khóa hoặc ngừng hoạt động.
  * `404 Not Found`: Không tìm thấy mẫu phần cứng.
* **Caching**: Được cache tập trung trên Redis (`tai_san_phan_cung_cache` cache, key `#id`).
* **Response**: `ApiResponse` chứa thông tin chi tiết Mẫu phần cứng.

#### 13.4.3. Lấy danh sách Mẫu phần cứng rút gọn cho Dropdown
* **Endpoint**: `GET /api/tai-san-phan-cung/select-options`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_TAI_SAN_PHAN_CUNG`
* **Status Code**: `200 OK`
* **Response**: `ApiResponse` chứa danh sách tùy chọn gợi ý của Mẫu phần cứng đang hoạt động.

#### 13.4.4. Thêm mới Mẫu phần cứng
* **Endpoint**: `POST /api/tai-san-phan-cung`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_TAI_SAN_PHAN_CUNG`
* **Status Code**:
  * `200 OK`: Thành công.
  * `400 Bad Request`: Trùng mã mẫu đã tồn tại, hoặc không tìm thấy danh mục/loại/hãng liên quan.
* **Caching**: Tự động xóa bỏ (`Evict`) cache danh sách và cache chi tiết trên Redis.
* **Payload**:
  ```json
  {
    "idDanhMucTaiSan": 1,
    "idLoaiTaiSan": 1,
    "idHangSanXuat": 1,
    "maMau": "Tự động sinh bởi Backend, không truyền",
    "tenMau": "Dell Latitude 5420 i5 (NotBlank)",
    "hinhAnh": "http://...",
    "coTheThaoLap": true,
    "moTa": "Mẫu laptop văn phòng",
    "trangThai": "HOAT_DONG"
  }
  ```
* **Response**: Trả về thông tin Mẫu phần cứng vừa tạo.

#### 13.4.5. Cập nhật Mẫu phần cứng
* **Endpoint**: `PUT /api/tai-san-phan-cung/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_TAI_SAN_PHAN_CUNG`
* **Status Code**: `200 OK`, `404 Not Found`
* **Caching**: Tự động xóa bỏ (`Evict`) cache danh sách và chi tiết trên Redis.
* **Payload**: Giống cấu trúc Thêm mới.
* **Response**: Trả về thông tin sau khi cập nhật.

#### 13.4.6. Cập nhật trạng thái Mẫu phần cứng
* **Endpoint**: `PUT /api/tai-san-phan-cung/{id}/trang-thai`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `CAP_NHAT_TRANG_THAI_TAI_SAN_PHAN_CUNG`
* **Payload**:
  ```json
  {
    "trangThai": "KHOA / HOAT_DONG (NotBlank)"
  }
  ```
* **Response**: Thông báo thành công.

#### 13.4.7. Xóa mềm Mẫu phần cứng
* **Endpoint**: `DELETE /api/tai-san-phan-cung/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_TAI_SAN_PHAN_CUNG`
* **Response**: Thông báo xóa mềm thành công.

---

### 13.5. Mẫu phần mềm (TaiSanPhanMem)

#### 13.5.1. Lấy danh sách Mẫu phần mềm phân trang
* **Endpoint**: `GET /api/tai-san-phan-mem`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_TAI_SAN_PHAN_MEM`
* **Status Code**: `200 OK`
* **Query Parameters**:
  * `keyword`, `trangThai`, `page`, `size`, `sort`
* **Caching**: Được cache tập trung trên Redis (`tai_san_phan_mem_list_cache`).
* **Response**: Trả về `PageResponse` danh sách Mẫu phần mềm.

#### 13.5.2. Lấy chi tiết Mẫu phần mềm theo ID
* **Endpoint**: `GET /api/tai-san-phan-mem/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_TAI_SAN_PHAN_MEM`
* **Status Code**: `200 OK`, `400 Bad Request` (Nếu bị khóa), `404 Not Found`
* **Caching**: Được cache tập trung trên Redis (`tai_san_phan_mem_cache`, key `#id`).
* **Response**: `ApiResponse` chi tiết Mẫu phần mềm.

#### 13.5.3. Lấy danh sách Mẫu phần mềm rút gọn cho Dropdown
* **Endpoint**: `GET /api/tai-san-phan-mem/select-options`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_TAI_SAN_PHAN_MEM`
* **Response**: `ApiResponse` danh sách tùy chọn Mẫu phần mềm hoạt động.

#### 13.5.4. Thêm mới Mẫu phần mềm
* **Endpoint**: `POST /api/tai-san-phan-mem`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_TAI_SAN_PHAN_MEM`
* **Payload**:
  ```json
  {
    "idDanhMucTaiSan": 1,
    "idLoaiTaiSan": 2,
    "idHangSanXuat": 2,
    "maMau": "Tự động sinh bởi Backend, không truyền",
    "tenMau": "Windows 11 Professional (NotBlank)",
    "hinhAnh": "http://...",
    "hinhThucTrienKhai": "ON_PREMISE",
    "nenTangHoTro": "x64",
    "hinhThucCapPhep": "PERPETUAL",
    "moTa": "Hệ điều hành Windows 11",
    "trangThai": "HOAT_DONG"
  }
  ```
* **Response**: Thông tin Mẫu phần mềm vừa tạo.

#### 13.5.5. Cập nhật Mẫu phần mềm
* **Endpoint**: `PUT /api/tai-san-phan-mem/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_TAI_SAN_PHAN_MEM`
* **Payload**: Giống cấu trúc Thêm mới.
* **Response**: Thông tin Mẫu phần mềm đã cập nhật.

#### 13.5.6. Cập nhật trạng thái Mẫu phần mềm
* **Endpoint**: `PUT /api/tai-san-phan-mem/{id}/trang-thai`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `CAP_NHAT_TRANG_THAI_TAI_SAN_PHAN_MEM`
* **Payload**:
  ```json
  {
    "trangThai": "KHOA / HOAT_DONG"
  }
  ```
* **Response**: Thông báo thành công.

#### 13.5.7. Xóa mềm Mẫu phần mềm
* **Endpoint**: `DELETE /api/tai-san-phan-mem/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_TAI_SAN_PHAN_MEM`
* **Response**: Thông báo thành công.

---

### 13.6. Thiết bị phần cứng cụ thể (DanhSachThietBiPhanCung)

> [!NOTE]
> Các API dưới đây được cô lập hoàn toàn theo Đơn vị (Multi-tenant) dựa trên người dùng đăng nhập. `idDonVi` sẽ được hệ thống gán tự động ngầm định từ session token của người dùng.

#### 13.6.1. Lấy danh sách Thiết bị phần cứng phân trang (Advanced Filters)
* **Endpoint**: `GET /api/thiet-bi-phan-cung`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_THIET_BI_PHAN_CUNG`
* **Status Code**: `200 OK`
* **Query Parameters**:
  * `keyword` (tùy chọn): Tìm theo `soSerial` hoặc `maTheTaiSan`.
  * `trangThai` (tùy chọn): `HOAT_DONG` hoặc `KHOA`.
  * `tuNgayMua` (tùy chọn): Ngày bắt đầu mua (`YYYY-MM-DD`).
  * `denNgayMua` (tùy chọn): Ngày kết thúc mua (`YYYY-MM-DD`).
  * `trangThaiKho` (tùy chọn): Trạng thái kho.
  * `page`, `size`, `sort`
* **Caching**: Được cache tập trung trên Redis (`thiet_bi_phan_cung_list_cache`, key phân tách riêng biệt theo từng đơn vị/tenant).
* **Response**: Trả về `PageResponse` chứa danh sách thiết bị thuộc đơn vị.

#### 13.6.2. Lấy chi tiết Thiết bị phần cứng theo ID
* **Endpoint**: `GET /api/thiet-bi-phan-cung/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_THIET_BI_PHAN_CUNG`
* **Status Code**: 
  * `200 OK`: Thành công.
  * `400 Bad Request`: Thiết bị đang bị khóa hoặc ngừng hoạt động.
  * `403 Forbidden`: Thiết bị này thuộc đơn vị khác.
  * `404 Not Found`: Không tìm thấy thiết bị phần cứng.
* **Caching**: Được cache tập trung trên Redis (`thiet_bi_phan_cung_cache`).
* **Response**: `ApiResponse` chi tiết thiết bị phần cứng.

#### 13.6.3. Lấy danh sách Thiết bị phần cứng rút gọn cho Dropdown
* **Endpoint**: `GET /api/thiet-bi-phan-cung/select-options`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_THIET_BI_PHAN_CUNG`
* **Response**: `ApiResponse` danh sách tùy chọn (chứa `id`, `ten` hiển thị dạng `Mã thẻ - Số serial`).

#### 13.6.4. Thêm mới Thiết bị phần cứng
* **Endpoint**: `POST /api/thiet-bi-phan-cung`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_THIET_BI_PHAN_CUNG`
* **Status Code**:
  * `200 OK`: Thành công.
  * `400 Bad Request`: Trùng `soSerial` hoặc `maTheTaiSan` trong cùng một đơn vị.
* **Payload**:
  ```json
  {
    "idTaiSanPhanCung": 1,
    "idNhaCungCap": 1,
    "soSerial": "S123456789 (NotBlank)",
    "maTheTaiSan": "Tự động sinh bởi Backend, không truyền",
    "giaMua": 15000000.00,
    "thoiGianMua": "2026-01-15",
    "hanBaoHanhThang": 24,
    "trangThaiKho": "CAP_PHAT",
    "viTriKho": "Kho khu A",
    "trangThai": "HOAT_DONG"
  }
  ```
* **Response**: Trả về thông tin thiết bị vừa tạo.

#### 13.6.5. Cập nhật Thiết bị phần cứng
* **Endpoint**: `PUT /api/thiet-bi-phan-cung/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_THIET_BI_PHAN_CUNG`
* **Status Code**: `200 OK`, `400 Bad Request` (Trùng lặp serial/mã thẻ), `403 Forbidden`, `404 Not Found`
* **Payload**: Giống cấu trúc Thêm mới.
* **Response**: Trả về thông tin sau cập nhật.

#### 13.6.6. Cập nhật trạng thái Thiết bị phần cứng
* **Endpoint**: `PUT /api/thiet-bi-phan-cung/{id}/trang-thai`
* **HTTP Method**: `PUT`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `@PreAuthorize("hasAuthority('CAP_NHAT_TRANG_THAI_THIET_BI_PHAN_CUNG')")`
* **Payload**:
  ```json
  {
    "trangThai": "HOAT_DONG"
  }
  ```
  * **Bảng giải thích giá trị trạng thái (TrangThaiVanHanhEnum)**:
  | Giá trị Enum | Tên hiển thị / Mô tả | Ý nghĩa nghiệp vụ |
  | :--- | :--- | :--- |
  | `HOAT_DONG` | Hoạt động - Trống, sẵn sàng cấp phát | Thiết bị ở trạng thái bình thường, sẵn sàng để bàn giao hoặc sử dụng. |
  | `KHOA` | Khóa | Thiết bị bị khóa tạm thời hoặc ngừng sử dụng, không thể mang đi cấp phát. |
  | `CAP_PHAT` | Đang cấp phát | Thiết bị đã được bàn giao cho một đơn vị/phòng ban/nhân viên cụ thể. |

* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Cập nhật trạng thái thiết bị phần cứng thành công"
  }
  ```

#### 13.6.7. Xóa mềm Thiết bị phần cứng
* **Endpoint**: `DELETE /api/thiet-bi-phan-cung/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_THIET_BI_PHAN_CUNG`
* **Response**: Thông báo thành công.

---

### 13.7. Key bản quyền phần mềm cụ thể (DanhSachThietBiPhanMem)

> [!NOTE]
> Các API dưới đây được cô lập theo Đơn vị (Multi-tenant).

#### 13.7.1. Lấy danh sách Key bản quyền phân trang (Advanced Filters)
* **Endpoint**: `GET /api/thiet-bi-phan-mem`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_THIET_BI_PHAN_MEM`
* **Query Parameters**:
  * `keyword` (tìm theo `keyBanQuyen` hoặc `maChungTuMua`).
  * `trangThai`
  * `tuNgayMua`, `denNgayMua`
  * `tuNgayHetHan`, `denNgayHetHan`
  * `trangThaiKho`
  * `page`, `size`, `sort`
* **Caching**: Được cache tập trung trên Redis (`thiet_bi_phan_mem_list_cache`, key phân tách theo tenant).
* **Response**: Trả về `PageResponse` danh sách key bản quyền thuộc đơn vị.

#### 13.7.2. Lấy chi tiết Key bản quyền theo ID
* **Endpoint**: `GET /api/thiet-bi-phan-mem/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_THIET_BI_PHAN_MEM`
* **Status Code**: `200 OK`, `400 Bad Request` (Bị khóa), `403 Forbidden` (Khác đơn vị), `404 Not Found`
* **Caching**: Được cache trên Redis (`thiet_bi_phan_mem_cache`).
* **Response**: Chi tiết key bản quyền.

#### 13.7.3. Lấy danh sách Key bản quyền rút gọn cho Dropdown
* **Endpoint**: `GET /api/thiet-bi-phan-mem/select-options`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_THIET_BI_PHAN_MEM`
* **Response**: Danh sách các key bản quyền hoạt động (`HOAT_DONG`).

#### 13.7.4. Thêm mới Key bản quyền
* **Endpoint**: `POST /api/thiet-bi-phan-mem`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_THIET_BI_PHAN_MEM`
* **Status Code**:
  * `200 OK`: Thành công.
  * `400 Bad Request`: Trùng `keyBanQuyen` trong cùng một đơn vị.
* **Payload**:
  ```json
  {
    "idTaiSanPhanMem": 1,
    "idNhaCungCap": 1,
    "keyBanQuyen": "XXXX-YYYY-ZZZZ-WWWW (NotBlank)",
    "maChungTuMua": "PO-2026-0001",
    "tongSoGhe": 50,
    "giaMua": 30000000.00,
    "thoiGianMua": "2026-02-20",
    "thoiGianHetHan": "2027-02-20",
    "trangThaiKho": "CAP_PHAT",
    "trangThai": "HOAT_DONG"
  }
  ```
* **Response**: Thông tin key bản quyền vừa tạo.

#### 13.7.5. Cập nhật Key bản quyền
* **Endpoint**: `PUT /api/thiet-bi-phan-mem/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_THIET_BI_PHAN_MEM`
* **Payload**: Giống cấu trúc Thêm mới.
* **Response**: Trả về thông tin sau cập nhật.

#### 13.7.6. Cập nhật trạng thái Key bản quyền
* **Endpoint**: `PUT /api/thiet-bi-phan-mem/{id}/trang-thai`
* **HTTP Method**: `PUT`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `@PreAuthorize("hasAuthority('CAP_NHAT_TRANG_THAI_THIET_BI_PHAN_MEM')")`
* **Payload**:
  ```json
  {
    "trangThai": "HOAT_DONG"
  }
  ```
  * **Bảng giải thích giá trị trạng thái (TrangThaiVanHanhEnum)**:
  | Giá trị Enum | Tên hiển thị / Mô tả | Ý nghĩa nghiệp vụ |
  | :--- | :--- | :--- |
  | `HOAT_DONG` | Hoạt động - Trống, sẵn sàng cấp phát | Key bản quyền ở trạng thái bình thường, sẵn sàng để kích hoạt/cấp phát. |
  | `KHOA` | Khóa | Key bản quyền bị khóa tạm thời, không cho phép cấp phát mới. |
  | `CAP_PHAT` | Đang cấp phát | Key bản quyền đang được gán sử dụng cho thiết bị/người dùng. |

* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Cập nhật trạng thái key bản quyền thành công"
  }
  ```

#### 13.7.7. Xóa mềm Key bản quyền
* **Endpoint**: `DELETE /api/thiet-bi-phan-mem/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_THIET_BI_PHAN_MEM`
* **Response**: Thông báo thành công.

---

### 13.8. Linh kiện phần cứng cụ thể (LinhKienPhanCung)

> [!NOTE]
> Các API dưới đây được cô lập theo Đơn vị (Multi-tenant).

#### 13.8.1. Lấy danh sách Linh kiện phần cứng phân trang (Advanced Filters)
* **Endpoint**: `GET /api/linh-kien-phan-cung`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_LINH_KIEN_PHAN_CUNG`
* **Query Parameters**:
  * `keyword` (tìm theo `soSerial`).
  * `trangThai`
  * `tuNgayMua`, `denNgayMua`
  * `trangThaiKho`
  * `page`, `size`, `sort`
* **Caching**: Được cache tập trung trên Redis (`linh_kien_phan_cung_list_cache`, key phân tách theo tenant).
* **Response**: Trả về `PageResponse` danh sách linh kiện thuộc đơn vị.

#### 13.8.2. Lấy chi tiết Linh kiện phần cứng theo ID
* **Endpoint**: `GET /api/linh-kien-phan-cung/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_LINH_KIEN_PHAN_CUNG`
* **Status Code**: `200 OK`, `400 Bad Request` (Bị khóa), `403 Forbidden` (Khác đơn vị), `404 Not Found`
* **Caching**: Được cache trên Redis (`linh_kien_phan_cung_cache`).
* **Response**: Chi tiết linh kiện phần cứng.

#### 13.8.3. Lấy danh sách Linh kiện phần cứng rút gọn cho Dropdown
* **Endpoint**: `GET /api/linh-kien-phan-cung/select-options`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_LINH_KIEN_PHAN_CUNG`
* **Response**: Danh sách các linh kiện đang hoạt động (`HOAT_DONG`).

#### 13.8.4. Thêm mới Linh kiện phần cứng
* **Endpoint**: `POST /api/linh-kien-phan-cung`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_LINH_KIEN_PHAN_CUNG`
* **Status Code**:
  * `200 OK`: Thành công.
  * `400 Bad Request`: Trùng `soSerial` trong cùng một đơn vị.
* **Payload**:
  ```json
  {
    "idTaiSanPhanCung": 1,
    "idNhaCungCap": 1,
    "soSerial": "RAM8GB-001 (NotBlank)",
    "giaMua": 1200000.00,
    "thoiGianMua": "2026-03-01",
    "hanBaoHanhThang": 36,
    "trangThaiKho": "TRONG_KHO",
    "viTriKho": "Kệ A1",
    "trangThai": "HOAT_DONG"
  }
  ```
* **Response**: Thông tin linh kiện vừa tạo.

#### 13.8.5. Cập nhật Linh kiện phần cứng
* **Endpoint**: `PUT /api/linh-kien-phan-cung/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_LINH_KIEN_PHAN_CUNG`
* **Payload**: Giống cấu trúc Thêm mới.
* **Response**: Trả về thông tin sau cập nhật.

#### 13.8.6. Cập nhật trạng thái Linh kiện phần cứng
* **Endpoint**: `PUT /api/linh-kien-phan-cung/{id}/trang-thai`
* **HTTP Method**: `PUT`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `@PreAuthorize("hasAuthority('CAP_NHAT_TRANG_THAI_LINH_KIEN_PHAN_CUNG')")`
* **Payload**:
  ```json
  {
    "trangThai": "HOAT_DONG"
  }
  ```
  * **Bảng giải thích giá trị trạng thái (TrangThaiVanHanhEnum)**:
  | Giá trị Enum | Tên hiển thị / Mô tả | Ý nghĩa nghiệp vụ |
  | :--- | :--- | :--- |
  | `HOAT_DONG` | Hoạt động - Trống, sẵn sàng cấp phát | Linh kiện hoạt động bình thường, sẵn sàng để lắp ráp hoặc bàn giao. |
  | `KHOA` | Khóa | Linh kiện bị khóa tạm thời, không thể mang đi sử dụng/lắp ráp. |
  | `CAP_PHAT` | Đang cấp phát | Linh kiện đang được lắp ráp gắn trong thiết bị phần cứng cụ thể. |

* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Cập nhật trạng thái linh kiện phần cứng thành công"
  }
  ```

#### 13.8.7. Xóa mềm Linh kiện phần cứng
* **Endpoint**: `DELETE /api/linh-kien-phan-cung/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_LINH_KIEN_PHAN_CUNG`
* **Response**: Thông báo thành công.

---

### 13.9. Lắp ráp và Tháo dỡ linh kiện (LapRapLinhKien)

Hệ thống cho phép thực hiện việc lắp ráp linh kiện lẻ vào một thiết bị phần cứng chính (ví dụ: gắn thanh RAM 8GB vào Laptop Dell) và thực hiện tháo dỡ linh kiện ra khi cần bảo dưỡng, thay thế. Mọi lịch sử liên kết tháo lắp đều được ghi nhận phục vụ cho việc kiểm toán.

#### 13.9.1. Lấy danh sách lịch sử lắp ráp linh kiện (Get List Assemblies)
* **Endpoint**: `GET /api/lap-rap`
* **HTTP Method**: `GET`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `@PreAuthorize("hasAuthority('XEM_LAP_RAP_LINH_KIEN')")`
* **Query Parameters**:
  * `thietBiPhanCungId` (tùy chọn): Lọc theo ID thiết bị phần cứng chính.
  * `linhKienPhanCungId` (tùy chọn): Lọc theo ID linh kiện phần cứng.
  * `trangThaiLienKet` (tùy chọn): `ACTIVE` (đang liên kết/gắn trên máy) hoặc `INACTIVE` (đã tháo dỡ).
  * `page` (mặc định 0): Số trang.
  * `size` (mặc định 10): Số bản ghi trên trang.
  * `sort` (mặc định `id,desc`): Tiêu chí sắp xếp.
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "content": [
        {
          "id": 1,
          "thietBiPhanCungId": 1,
          "soSerialThietBi": "S123456789",
          "maTheTaiSanThietBi": "ASSET_0001",
          "linhKienPhanCungId": 5,
          "soSerialLinhKien": "RAM8GB-001",
          "thoiGianLap": "2026-06-20T09:00:00",
          "thoiGianThao": null,
          "trangThaiLienKet": "ACTIVE",
          "ghiChu": "Nâng cấp dung lượng RAM cho máy làm đồ họa",
          "thoiGianTao": "2026-06-20T09:00:00",
          "thoiGianCapNhat": "2026-06-20T09:00:00"
        }
      ],
      "totalElements": 1,
      "totalPages": 1,
      "page": 0,
      "size": 10
    }
  }
  ```

#### 13.9.2. Lắp ráp linh kiện vào thiết bị phần cứng (Assemble Component)
* **Endpoint**: `POST /api/lap-rap`
* **HTTP Method**: `POST`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `@PreAuthorize("hasAuthority('THEM_LAP_RAP_LINH_KIEN')")`
* **Payload**:
  ```json
  {
    "thietBiPhanCungId": 1,
    "linhKienPhanCungId": 5,
    "ghiChu": "Nâng cấp dung lượng RAM cho máy làm đồ họa"
  }
  ```
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "id": 1,
      "thietBiPhanCungId": 1,
      "soSerialThietBi": "S123456789",
      "maTheTaiSanThietBi": "ASSET_0001",
      "linhKienPhanCungId": 5,
      "soSerialLinhKien": "RAM8GB-001",
      "thoiGianLap": "2026-06-20T09:00:00",
      "thoiGianThao": null,
      "trangThaiLienKet": "ACTIVE",
      "ghiChu": "Nâng cấp dung lượng RAM cho máy làm đồ họa",
      "thoiGianTao": "2026-06-20T09:00:00",
      "thoiGianCapNhat": "2026-06-20T09:00:00"
    }
  }
  ```

#### 13.9.3. Tháo dỡ linh kiện rời khỏi thiết bị phần cứng (Disassemble Component)
* **Endpoint**: `PUT /api/lap-rap/{id}/thao-do`
* **HTTP Method**: `PUT`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `@PreAuthorize("hasAuthority('SUA_LAP_RAP_LINH_KIEN')")`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Thực hiện tháo dỡ linh kiện rời ra khỏi thiết bị phần cứng thành công"
  }
  ```

---

### 13.10. Thuộc tính động (Dynamic Attributes)

#### 13.10.1. Lấy danh sách Danh mục thuộc tính động phân trang (Kèm option gợi ý lồng)
* **Endpoint**: `GET /api/danh-muc-thuoc-tinh`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_DANH_MUC_THUOC_TINH`
* **Query Parameters**:
  * `keyword` (tùy chọn): Tìm kiếm theo mã hoặc tên thuộc tính.
  * `apDungCho` (tùy chọn): `PHAN_CUNG` / `PHAN_MEM` / `LINH_KIEN`.
  * `page`, `size`, `sort`
* **Caching**: Được cache tập trung trên Redis (`danh_muc_thuoc_tinh_list_cache` cache, key gồm các query parameters).
* **Response**: Trả về `PageResponse` danh sách thuộc tính. Mỗi thuộc tính chứa mảng `luaChonGoiY` đã được lọc (chưa bị xóa mềm) và sắp xếp theo `thuTuHienThi` tăng dần.

#### 13.10.2. Lấy chi tiết Danh mục thuộc tính động theo ID (Kèm option gợi ý lồng)
* **Endpoint**: `GET /api/danh-muc-thuoc-tinh/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_DANH_MUC_THUOC_TINH`
* **Status Code**: `200 OK`, `400 Bad Request` (Bị khóa), `404 Not Found`
* **Caching**: Được cache trên Redis (`danh_muc_thuoc_tinh_cache` cache, key `#id`).
* **Response**: Chi tiết danh mục thuộc tính lồng kèm toàn bộ danh sách gợi ý.

#### 13.10.3. Thêm mới Danh mục thuộc tính động và danh sách gợi ý lồng
* **Endpoint**: `POST /api/danh-muc-thuoc-tinh`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_DANH_MUC_THUOC_TINH`
* **Payload**:
  ```json
  {
    "maThuocTinh": "Tự động sinh bởi Backend, không truyền",
    "tenThuocTinh": "Dung lượng RAM (NotBlank)",
    "kieuDuLieu": "SELECT (NotBlank)",
    "apDungCho": "PHAN_CUNG (NotBlank)",
    "batBuocNhap": true,
    "giaTriMacDinh": "8GB",
    "trangThai": "HOAT_DONG",
    "luaChonGoiY": [
      {
        "giaTri": "8GB",
        "trangThai": "HOAT_DONG",
        "thuTuHienThi": 1
      },
      {
        "giaTri": "16GB",
        "trangThai": "HOAT_DONG",
        "thuTuHienThi": 2
      },
      {
        "giaTri": "Khác...",
        "trangThai": "HOAT_DONG",
        "thuTuHienThi": 99
      }
    ]
  }
  ```
* **Response**: Thông tin thuộc tính lồng kèm gợi ý vừa tạo.

#### 13.10.4. Cập nhật Danh mục thuộc tính động và đồng bộ danh sách gợi ý lồng
* **Endpoint**: `PUT /api/danh-muc-thuoc-tinh/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_DANH_MUC_THUOC_TINH`
* **Payload**:
  ```json
  {
    "maThuocTinh": "RAM_SIZE",
    "tenThuocTinh": "Dung lượng RAM",
    "kieuDuLieu": "SELECT",
    "apDungCho": "PHAN_CUNG",
    "batBuocNhap": true,
    "giaTriMacDinh": "8GB",
    "trangThai": "HOAT_DONG",
    "luaChonGoiY": [
      {
        "id": 1,
        "giaTri": "8GB",
        "trangThai": "HOAT_DONG",
        "thuTuHienThi": 1
      },
      {
        "id": null,
        "giaTri": "32GB",
        "trangThai": "HOAT_DONG",
        "thuTuHienThi": 3
      }
    ]
  }
  ```
* **Response**: Thông tin thuộc tính sau cập nhật và đồng bộ.

#### 13.10.5. Cập nhật trạng thái Danh mục thuộc tính động
* **Endpoint**: `PUT /api/danh-muc-thuoc-tinh/{id}/trang-thai`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `CAP_NHAT_TRANG_THAI_DANH_MUC_THUOC_TINH`
* **Payload**:
  ```json
  {
    "trangThai": "KHOA / HOAT_DONG"
  }
  ```
* **Response**: Thông báo cập nhật trạng thái thành công.

#### 13.10.6. Xóa mềm Danh mục thuộc tính động (Đồng thời xóa mềm toàn bộ gợi ý đi kèm)
* **Endpoint**: `DELETE /api/danh-muc-thuoc-tinh/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_DANH_MUC_THUOC_TINH`
* **Response**: Thông báo thành công.

#### 13.10.7. Lấy danh sách giá trị thuộc tính thực tế phân trang
* **Endpoint**: `GET /api/gia-tri-thuoc-tinh`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_GIA_TRI_THUOC_TINH`
* **Query Parameters**:
  * `id_tai_san` (tùy chọn): ID tài sản cụ thể.
  * `loai_tai_san` (tùy chọn): `PHAN_CUNG` / `PHAN_MEM` / `LINH_KIEN`.
  * `page`, `size`, `sort`
* **Caching**: Được cache trên Redis (`gia_tri_thuoc_tinh_list_cache`, key phân tách theo tenant).
* **Response**: `PageResponse` chứa danh sách giá trị thuộc tính của thiết bị thuộc đơn vị đang đăng nhập.

#### 13.10.8. Lưu hàng loạt thông số kỹ thuật (Bulk Insert/Update)
* **Endpoint**: `POST /api/gia-tri-thuoc-tinh/save-bulk`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `LUU_GIA_TRI_THUOC_TINH`
* **Payload**:
  ```json
  {
    "loaiTaiSan": "PHAN_CUNG (NotBlank)",
    "idTaiSan": 1,
    "values": [
      {
        "danhMucThuocTinhId": 1,
        "luaChonId": 2,
        "giaTri": null
      },
      {
        "danhMucThuocTinhId": 2,
        "luaChonId": 5, // ID của lựa chọn có giá trị "Khác..."
        "giaTri": "Giá trị tự nhập tay ở đây"
      }
    ]
  }
  ```
* **Response**: Danh sách các giá trị thuộc tính đã lưu thành công.

---

## 14. Phân hệ Quản lý Vòng đời tài sản (Lifecycle Module)

### 14.1. Lấy danh sách phiếu cấp phát phân trang (Lọc đa tiêu chí)
* **Endpoint**: `GET /api/phieu-cap-phat`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_PHIEU_CAP_PHAT`
* **Query Parameters**:
  * `trangThai` (tùy chọn): Lọc theo trạng thái phiếu (`TAO_MOI`, `GUI_PHE_DUYET`, `DA_PHE_DUYET`, `HOAN_THANH`).
  * `idPhongBan` (tùy chọn): Lọc theo ID phòng ban nhận.
  * `tuNgayBanGiao` (tùy chọn): Lọc ngày bàn giao từ (`yyyy-MM-dd`).
  * `denNgayBanGiao` (tùy chọn): Lọc ngày bàn giao đến (`yyyy-MM-dd`).
  * `page`, `size`, `sort`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "content": [
        {
          "id": 1,
          "idDonVi": 1,
          "maPhiepCapPhat": "PCP-1718873612000",
          "idNguoiNhan": 2,
          "tenNguoiNhan": "Nguyễn Văn B",
          "idPhongBanNhan": 3,
          "tenPhongBanNhan": "Phòng Công nghệ thông tin",
          "idNguoiLap": 1,
          "tenNguoiLap": "Nguyễn Văn A",
          "idNguoiPheDuyet": null,
          "tenNguoiPheDuyet": null,
          "thoiGianBanGiao": null,
          "trangThai": "TAO_MOI",
          "mucDichSuDung": "Cấp phát máy tính cho nhân viên mới",
          "danhSachTaiSan": [],
          "thoiGianTao": "2026-06-20T17:15:00",
          "thoiGianCapNhat": "2026-06-20T17:15:00"
        }
      ],
      "totalElements": 1,
      "totalPages": 1,
      "page": 0,
      "size": 10
    }
  }
  ```

### 14.2. Lấy chi tiết phiếu cấp phát theo ID (Kèm chi tiết tài sản & trạng thái thu hồi)
* **Endpoint**: `GET /api/phieu-cap-phat/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_PHIEU_CAP_PHAT`
* **Status Code**: `200 OK`, `404 Not Found`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "id": 1,
      "idDonVi": 1,
      "maPhiepCapPhat": "PCP-1718873612000",
      "idNguoiNhan": 2,
      "tenNguoiNhan": "Nguyễn Văn B",
      "idPhongBanNhan": 3,
      "tenPhongBanNhan": "Phòng Công nghệ thông tin",
      "idNguoiLap": 1,
      "tenNguoiLap": "Nguyễn Văn A",
      "idNguoiPheDuyet": 3,
      "tenNguoiPheDuyet": "Nguyễn Văn C",
      "thoiGianBanGiao": "2026-06-20T17:18:00",
      "trangThai": "HOAN_THANH",
      "mucDichSuDung": "Cấp phát máy tính cho nhân viên mới",
      "danhSachTaiSan": [
        {
          "idChiTietCapPhat": 1,
          "idTaiSan": 5,
          "tenTaiSan": "Laptop Dell Latitude 5420",
          "soSerial": "DELL5420-SN123",
          "maTheTaiSan": "TS-PC-0001",
          "loaiTaiSan": "PHAN_CUNG",
          "tinhTrangLucGiao": "Mới 100%",
          "trangThaiCapPhat": "DANG_CAP_PHAT",
          "ghiChu": "Không kèm balo"
        },
        {
          "idChiTietCapPhat": 2,
          "idTaiSan": 8,
          "tenTaiSan": "Microsoft Office 2021 Professional",
          "soSerial": null,
          "maTheTaiSan": "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX",
          "loaiTaiSan": "PHAN_MEM",
          "tinhTrangLucGiao": null,
          "trangThaiCapPhat": "DA_THU_HOI",
          "ghiChu": "Đã thu hồi key khi chuyển phòng ban"
        }
      ],
      "thoiGianTao": "2026-06-20T17:15:00",
      "thoiGianCapNhat": "2026-06-20T17:18:00"
    }
  }
  ```

### 14.3. Tạo mới phiếu cấp phát tài sản
* **Endpoint**: `POST /api/phieu-cap-phat`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_PHIEU_CAP_PHAT`
* **Status Code**: `200 OK`, `400 Bad Request`
* **Payload**:
  ```json
  {
    "idNguoiNhan": 2,
    "idPhongBanNhan": 3,
    "mucDichSuDung": "Cấp phát máy tính cho nhân viên mới",
    "danhSachPhanCung": [
      {
        "danhSachThietBiPhanCungId": 5,
        "tinhTrangLucGiao": "Mới 100%",
        "phuKienKemTheo": "Sạc Dell 65W",
        "ghiChu": "Bàn giao kèm hộp"
      }
    ],
    "danhSachPhanMem": [
      {
        "danhSachThietBiPhanMemId": 8,
        "danhSachThietBiPhanCungId": 5,
        "maKeyKichHoat": "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX",
        "ghiChu": "Kích hoạt bằng tài khoản công ty"
      }
    ],
    "danhSachLinhKien": []
  }
  ```
* **Response**: Thông tin phiếu cấp phát chi tiết sau khi tạo mới ở trạng thái `TAO_MOI`.

### 14.4. Cập nhật phiếu cấp phát tài sản (Chỉ khi ở trạng thái Tạo mới)
* **Endpoint**: `PUT /api/phieu-cap-phat/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_PHIEU_CAP_PHAT`
* **Status Code**: `200 OK`, `400 Bad Request` (Không ở trạng thái Tạo mới), `404 Not Found`
* **Payload**: Giống cấu trúc Tạo mới.
* **Response**: Thông tin phiếu cấp phát sau khi được cập nhật lại danh sách tài sản.

### 14.5. Xóa mềm phiếu cấp phát tài sản (Chỉ khi ở trạng thái Tạo mới)
* **Endpoint**: `DELETE /api/phieu-cap-phat/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_PHIEU_CAP_PHAT`
* **Status Code**: `200 OK`, `400 Bad Request` (Không phải trạng thái Tạo mới), `404 Not Found`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Xóa mềm phiếu cấp phát thành công"
  }
  ```

### 14.6. Yêu cầu phê duyệt phiếu cấp phát (Chuyển đổi trạng thái)
* **Endpoint**: `PUT /api/phieu-cap-phat/{id}/yeu-cau-phe-duyet`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `YEU_CAU_PHE_DUYET_PHIEU_CAP_PHAT`
* **Status Code**: `200 OK`, `400 Bad Request` (Không ở trạng thái Tạo mới hoặc chuyển đổi sai), `404 Not Found`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Gửi yêu cầu phê duyệt thành công"
  }
  ```

### 14.7. Phê duyệt phiếu cấp phát tài sản (Chuyển đổi trạng thái)
* **Endpoint**: `PUT /api/phieu-cap-phat/{id}/phe-duyet`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `PHE_DUYET_PHIEU_CAP_PHAT`
* **Status Code**: `200 OK`, `400 Bad Request` (Không ở trạng thái Gửi phê duyệt), `404 Not Found`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Phê duyệt phiếu cấp phát thành công"
  }
  ```

### 14.8. Hoàn thành cấp phát tài sản (Chuyển đổi trạng thái)
* **Endpoint**: `PUT /api/phieu-cap-phat/{id}/hoan-thanh`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `HOAN_THANH_PHIEU_CAP_PHAT`
* **Status Code**: `200 OK`, `400 Bad Request` (Không ở trạng thái Đã phê duyệt), `404 Not Found`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Hoàn thành cấp phát thành công"
  }
  ```

### 14.9. Lấy danh sách phiếu thu hồi phân trang (Lọc đa tiêu chí)
* **Endpoint**: `GET /api/phieu-thu-hoi`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_PHIEU_THU_HOI_TAI_SAN`
* **Query Parameters**:
  * `trangThai` (tùy chọn): Lọc theo trạng thái phiếu (`TAO_MOI`, `GUI_PHE_DUYET`, `DA_PHE_DUYET`, `HOAN_THANH`).
  * `idPhongBan` (tùy chọn): Lọc theo ID phòng ban trả.
  * `tuNgay` (tùy chọn): Lọc ngày thu hồi từ (`yyyy-MM-dd`).
  * `denNgay` (tùy chọn): Lọc ngày thu hồi đến (`yyyy-MM-dd`).
  * `page`, `size`, `sort`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "content": [
        {
          "id": 1,
          "idDonVi": 1,
          "maPhieuThuHoi": "PTH-1718873612000",
          "idNhanVienTra": 2,
          "tenNhanVienTra": "Nguyễn Văn B",
          "idPhongBanTra": 3,
          "tenPhongBanTra": "Phòng Công nghệ thông tin",
          "tenNguoiLap": "Nguyễn Văn A",
          "tenNguoiPheDuyet": null,
          "lyDoThuHoi": "Thu hồi thiết bị cũ để nâng cấp",
          "thoiGianThuHoi": null,
          "trangThai": "TAO_MOI",
          "chiTietTaiSan": [],
          "thoiGianTao": "2026-06-20T17:15:00",
          "thoiGianCapNhat": "2026-06-20T17:15:00"
        }
      ],
      "totalElements": 1,
      "totalPages": 1,
      "page": 0,
      "size": 10
    }
  }
  ```

### 14.10. Lấy chi tiết phiếu thu hồi theo ID (Kèm chi tiết tài sản thu hồi)
* **Endpoint**: `GET /api/phieu-thu-hoi/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_PHIEU_THU_HOI_TAI_SAN`
* **Status Code**: `200 OK`, `404 Not Found`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "id": 1,
      "idDonVi": 1,
      "maPhieuThuHoi": "PTH-1718873612000",
      "idNhanVienTra": 2,
      "tenNhanVienTra": "Nguyễn Văn B",
      "idPhongBanTra": 3,
      "tenPhongBanTra": "Phòng Công nghệ thông tin",
      "tenNguoiLap": "Nguyễn Văn A",
      "tenNguoiPheDuyet": "Nguyễn Văn C",
      "lyDoThuHoi": "Thu hồi thiết bị cũ để nâng cấp",
      "thoiGianThuHoi": "2026-06-20T17:18:00",
      "trangThai": "HOAN_THANH",
      "chiTietTaiSan": [
        {
          "id": 1,
          "idChiTietCapPhat": 1,
          "idTaiSan": 5,
          "tenTaiSan": "Laptop Dell Latitude 5420",
          "soSerial": "DELL5420-SN123",
          "maTheTaiSan": "TS-PC-0001",
          "tinhTrangLucThuHoi": "Cũ, xước nhẹ",
          "phuKienThuHoi": "Sạc Dell 65W",
          "thoiGianThuHoi": null,
          "ghiChu": "Hoạt động bình thường",
          "loai": "PHAN_CUNG"
        },
        {
          "id": 1,
          "idChiTietCapPhat": 2,
          "idTaiSan": 8,
          "tenTaiSan": "Microsoft Office 2021 Professional",
          "soSerial": null,
          "maTheTaiSan": "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX",
          "tinhTrangLucThuHoi": null,
          "phuKienThuHoi": null,
          "thoiGianThuHoi": "2026-06-20T17:18:00",
          "ghiChu": "Thu hồi key thành công",
          "loai": "PHAN_MEM"
        }
      ],
      "thoiGianTao": "2026-06-20T17:15:00",
      "thoiGianCapNhat": "2026-06-20T17:18:00"
    }
  }
  ```

### 14.11. Lấy danh sách tài sản cấp phát hoạt động của nhân viên (Để thu hồi)
* **Endpoint**: `GET /api/phieu-thu-hoi/active-allocations`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_PHIEU_THU_HOI_TAI_SAN`
* **Query Parameters**:
  * `idNhanVien` (bắt buộc): ID của nhân viên cần lấy danh sách tài sản đang giữ.
* **Status Code**: `200 OK`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "danhSachPhanCung": [
        {
          "chiTietCapPhatPhanCungId": 1,
          "danhSachThietBiPhanCungId": 5,
          "tenThietBi": "Laptop Dell Latitude 5420",
          "soSerial": "DELL5420-SN123",
          "maTheTaiSan": "TS-PC-0001",
          "tinhTrangLucGiao": "Mới 100%",
          "phuKienKemTheo": "Sạc Dell 65W"
        }
      ],
      "danhSachPhanMem": [
        {
          "chiTietCapPhatPhanMemId": 2,
          "danhSachThietBiPhanMemId": 8,
          "tenPhanMem": "Microsoft Office 2021 Professional",
          "keyBanQuyen": "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
        }
      ],
      "danhSachLinhKien": []
    }
  }
  ```

### 14.12. Tạo mới phiếu thu hồi tài sản
* **Endpoint**: `POST /api/phieu-thu-hoi`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_PHIEU_THU_HOI_TAI_SAN`
* **Status Code**: `200 OK`, `400 Bad Request`
* **Payload**:
  ```json
  {
    "idNhanVienTra": 2,
    "idPhongBanTra": 3,
    "lyDoThuHoi": "Thu hồi thiết bị cũ để nâng cấp",
    "danhSachPhanCung": [
      {
        "chiTietCapPhatPhanCungId": 1,
        "tinhTrangLucThuHoi": "Cũ, xước nhẹ",
        "phuKienThuHoi": "Sạc Dell 65W",
        "ghiChu": "Không lỗi lầm"
      }
    ],
    "danhSachPhanMem": [
      {
        "chiTietCapPhatPhanMemId": 2,
        "ghiChu": "Thu hồi bản quyền"
      }
    ],
    "danhSachLinhKien": []
  }
  ```
* **Response**: Thông tin phiếu thu hồi chi tiết sau khi tạo mới ở trạng thái `TAO_MOI`.

### 14.13. Cập nhật phiếu thu hồi tài sản (Chỉ khi ở trạng thái Tạo mới)
* **Endpoint**: `PUT /api/phieu-thu-hoi/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_PHIEU_THU_HOI_TAI_SAN`
* **Status Code**: `200 OK`, `400 Bad Request` (Không ở trạng thái Tạo mới), `404 Not Found`
* **Payload**: Giống cấu trúc Tạo mới.
* **Response**: Thông tin phiếu sau khi được cập nhật lại danh sách tài sản thu hồi.

### 14.14. Xóa mềm phiếu thu hồi tài sản (Chỉ khi ở trạng thái Tạo mới)
* **Endpoint**: `DELETE /api/phieu-thu-hoi/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_PHIEU_THU_HOI_TAI_SAN`
* **Status Code**: `200 OK`, `400 Bad Request` (Không phải trạng thái Tạo mới), `404 Not Found`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Xóa mềm phiếu thu hồi tài sản thành công"
  }
  ```

### 14.15. Yêu cầu phê duyệt phiếu thu hồi (Chuyển đổi trạng thái)
* **Endpoint**: `PUT /api/phieu-thu-hoi/{id}/yeu-cau-phe-duyet`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `YEU_CAU_PHE_DUYET_PHIEU_THU_HOI_TAI_SAN`
* **Status Code**: `200 OK`, `400 Bad Request` (Không ở trạng thái Tạo mới hoặc chuyển đổi sai), `404 Not Found`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Gửi yêu cầu phê duyệt thành công"
  }
  ```

### 14.16. Phê duyệt phiếu thu hồi tài sản (Chuyển đổi trạng thái)
* **Endpoint**: `PUT /api/phieu-thu-hoi/{id}/phe-duyet`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `PHE_DUYET_PHIEU_THU_HOI_TAI_SAN`
* **Status Code**: `200 OK`, `400 Bad Request` (Không ở trạng thái Gửi phê duyệt), `404 Not Found`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Phê duyệt phiếu thu hồi tài sản thành công"
  }
  ```
* **Nghiệp vụ ngầm**: Hệ thống tự động gán ID người phê duyệt (`idNguoiPheDuyet`) bằng ID người dùng hiện tại lấy từ phiên đăng nhập.

### 14.17. Hoàn thành thu hồi tài sản (Chuyển đổi trạng thái)
* **Endpoint**: `PUT /api/phieu-thu-hoi/{id}/hoan-thanh`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `HOAN_THANH_PHIEU_THU_HOI_TAI_SAN`
* **Status Code**: `200 OK`, `400 Bad Request` (Không ở trạng thái Đã phê duyệt), `404 Not Found`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Hoàn thành thu hồi tài sản thành công"
  }
  ```

---

## 15. Phân hệ Quản lý Mua sắm (Procurement Module)

### 15.1. Nhà cung cấp (NhaCungCap)

#### 15.1.1. Lấy danh sách Nhà cung cấp phân trang
* **Endpoint**: `GET /api/nha-cung-cap`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_NHA_CUNG_CAP`
* **Query Parameters**:
  * `keyword` (tùy chọn): Tìm kiếm theo mã hoặc tên nhà cung cấp.
  * `trangThai` (tùy chọn): `HOAT_DONG` hoặc `KHOA`.
  * `page` (mặc định 0): Số trang.
  * `size` (mặc định 10): Số bản ghi trên trang.
  * `sort` (mặc định `id,desc`): Sắp xếp.
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "content": [
        {
          "id": 1,
          "maNhaCungCap": "NCC_FPT",
          "idDonVi": 1,
          "tenNhaCungCap": "Công ty Cổ phần Bán lẻ Kỹ thuật số FPT",
          "maSoThue": "0105772650",
          "nguoiLienHe": "Nguyễn Văn D",
          "soDienThoai": "02473006600",
          "email": "contact@fpt.com.vn",
          "diaChi": "261-263 Khánh Hội, Phường 5, Quận 4, TP. Hồ Chí Minh",
          "ghiChu": "Nhà phân phối thiết bị chính",
          "trangThai": "HOAT_DONG",
          "thoiGianTao": "2026-06-20T10:00:00",
          "thoiGianCapNhat": "2026-06-20T10:00:00"
        }
      ],
      "totalElements": 1,
      "totalPages": 1,
      "page": 0,
      "size": 10
    }
  }
  ```

#### 15.1.2. Lấy chi tiết Nhà cung cấp theo ID
* **Endpoint**: `GET /api/nha-cung-cap/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_NHA_CUNG_CAP`
* **Status Code**: `200 OK`, `404 Not Found`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "id": 1,
      "maNhaCungCap": "NCC_FPT",
      "idDonVi": 1,
      "tenNhaCungCap": "Công ty Cổ phần Bán lẻ Kỹ thuật số FPT",
      "maSoThue": "0105772650",
      "nguoiLienHe": "Nguyễn Văn D",
      "soDienThoai": "02473006600",
      "email": "contact@fpt.com.vn",
      "diaChi": "261-263 Khánh Hội, Phường 5, Quận 4, TP. Hồ Chí Minh",
      "ghiChu": "Nhà phân phối thiết bị chính",
      "trangThai": "HOAT_DONG",
      "thoiGianTao": "2026-06-20T10:00:00",
      "thoiGianCapNhat": "2026-06-20T10:00:00"
    }
  }
  ```

#### 15.1.3. Lấy danh sách Nhà cung cấp rút gọn cho Dropdown (Select options)
* **Endpoint**: `GET /api/nha-cung-cap/select-options`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_NHA_CUNG_CAP`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": [
      {
        "id": 1,
        "ten": "Công ty Cổ phần Bán lẻ Kỹ thuật số FPT"
      }
    ]
  }
  ```

#### 15.1.4. Thêm mới Nhà cung cấp
* **Endpoint**: `POST /api/nha-cung-cap`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_NHA_CUNG_CAP`
* **Payload**:
  ```json
  {
    "maNhaCungCap": "Tự động sinh bởi Backend, không truyền",
    "tenNhaCungCap": "Công ty Cổ phần Bán lẻ Kỹ thuật số FPT",
    "maSoThue": "0105772650",
    "nguoiLienHe": "Nguyễn Văn D",
    "soDienThoai": "02473006600",
    "email": "contact@fpt.com.vn",
    "diaChi": "261-263 Khánh Hội, Phường 5, Quận 4, TP. Hồ Chí Minh",
    "ghiChu": "Nhà phân phối thiết bị chính"
  }
  ```
* **Response**: Trả về thông tin Nhà cung cấp vừa được tạo ở trạng thái mặc định là `HOAT_DONG`.

#### 15.1.5. Cập nhật Nhà cung cấp
* **Endpoint**: `PUT /api/nha-cung-cap/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_NHA_CUNG_CAP`
* **Payload**: Giống cấu trúc Thêm mới.
* **Response**: Trả về thông tin Nhà cung cấp sau cập nhật.

#### 15.1.6. Cập nhật trạng thái Nhà cung cấp
* **Endpoint**: `PUT /api/nha-cung-cap/{id}/trang-thai`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `CAP_NHAT_TRANG_THAI_NHA_CUNG_CAP`
* **Payload**:
  ```json
  {
    "trangThai": "KHOA / HOAT_DONG"
  }
  ```
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Cập nhật trạng thái nhà cung cấp thành công"
  }
  ```

#### 15.1.7. Xóa mềm Nhà cung cấp
* **Endpoint**: `DELETE /api/nha-cung-cap/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_NHA_CUNG_CAP`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Xóa mềm nhà cung cấp thành công"
  }
  ```

---

### 15.2. Đơn hàng mua sắm (DonHangMuaSam)

#### 15.2.1. Lấy danh sách Đơn hàng mua sắm phân trang
* **Endpoint**: `GET /api/don-hang-mua-sam`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_DON_HANG_MUA_SAM`
* **Query Parameters**:
  * `maDonHang` (tùy chọn): Lọc theo mã đơn hàng.
  * `idNhaCungCap` (tùy chọn): Lọc theo ID nhà cung cấp.
  * `trangThai` (tùy chọn): Lọc theo trạng thái (`TAO_MOI`, `GUI_PHE_DUYET`, `DA_PHE_DUYET`, `HOAN_THANH`).
  * `page`, `size`, `sort`
* **Response**: Trả về `PageResponse` chứa danh sách đơn hàng mua sắm (không kèm thông tin chi tiết mảng phần cứng/phần mềm).

#### 15.2.2. Lấy chi tiết Đơn hàng mua sắm theo ID
* **Endpoint**: `GET /api/don-hang-mua-sam/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_DON_HANG_MUA_SAM`
* **Status Code**: `200 OK`, `404 Not Found`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "id": 1,
      "idDonVi": 1,
      "idNhaCungCap": 1,
      "tenNhaCungCap": "Công ty Cổ phần Bán lẻ Kỹ thuật số FPT",
      "tenNguoiLap": "Nguyễn Văn A",
      "tenNguoiPheDuyet": "Nguyễn Văn C",
      "maDonHang": "PO-2026-0001",
      "soHopDongDinhKem": "HD-FPT-2026-01",
      "tongTienTruocThue": 150000000.00,
      "thueVat": 15000000.00,
      "tongTienSauThue": 165000000.00,
      "thoiGianGiaoDuKien": "2026-07-01",
      "trangThai": "TAO_MOI",
      "ghiChu": "Mua máy tính phục vụ dự án",
      "thoiGianTao": "2026-06-20T11:00:00",
      "thoiGianCapNhat": "2026-06-20T11:00:00",
      "chiTietTaiSan": [
        {
          "id": 1,
          "idTaiSan": 5,
          "tenTaiSan": "Dell Latitude 5420 i5",
          "soLuongDat": 10,
          "donGiaDat": 15000000.00,
          "thanhTien": 150000000.00,
          "soLuongDaNhap": 0,
          "ghiChu": "Dell Latitude 5420",
          "loai": "PHAN_CUNG",
          "thoiGianTao": "2026-06-20T11:00:00",
          "thoiGianCapNhat": "2026-06-20T11:00:00"
        }
      ]
    }
  }
  ```

#### 15.2.3. Lấy danh sách Đơn hàng mua sắm rút gọn cho Dropdown (Select options)
* **Endpoint**: `GET /api/don-hang-mua-sam/select-options`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_DON_HANG_MUA_SAM`
* **Response**: Trả về các đơn hàng mua sắm ở trạng thái `DA_PHE_DUYET` thuộc đơn vị hiện tại phục vụ cho việc lập phiếu nhập kho.
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": [
      {
        "id": 1,
        "ten": "PO-2026-0001"
      }
    ]
  }
  ```

#### 15.2.4. Tạo mới Đơn hàng mua sắm
* **Endpoint**: `POST /api/don-hang-mua-sam`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_DON_HANG_MUA_SAM`
* **Payload**:
  ```json
  {
    "idNhaCungCap": 1,
    "idNguoiLap": 2,
    "maDonHang": "Tự động sinh bởi Backend, không truyền",
    "soHopDongDinhKem": "HD-FPT-2026-01",
    "tongTienTruocThue": 150000000.00,
    "thueVat": 15000000.00,
    "tongTienSauThue": 165000000.00,
    "thoiGianGiaoDuKien": "2026-07-01",
    "ghiChu": "Mua máy tính phục vụ dự án",
    "chiTietPhanCung": [
      {
        "idTaiSanPhanCung": 5,
        "soLuongDat": 10,
        "donGiaDat": 15000000.00,
        "ghiChu": "Dell Latitude 5420"
      }
    ],
    "chiTietPhanMem": []
  }
  ```
* **Response**: Trả về thông tin Đơn hàng vừa tạo ở trạng thái mặc định ban đầu là `TAO_MOI`.

#### 15.2.5. Cập nhật Đơn hàng mua sắm (Chỉ khi ở trạng thái Tạo mới)
* **Endpoint**: `PUT /api/don-hang-mua-sam/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_DON_HANG_MUA_SAM`
* **Status Code**: `200 OK`, `400 Bad Request` (Nếu không ở trạng thái Tạo mới), `404 Not Found`
* **Payload**: Giống cấu trúc Tạo mới.
* **Response**: Trả về thông tin Đơn hàng sau cập nhật, xóa cứng các chi tiết cũ và tạo lại chi tiết mới.

#### 15.2.6. Xóa mềm Đơn hàng mua sắm (Chỉ khi ở trạng thái Tạo mới)
* **Endpoint**: `DELETE /api/don-hang-mua-sam/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_DON_HANG_MUA_SAM`
* **Status Code**: `200 OK`, `400 Bad Request` (Nếu không ở trạng thái Tạo mới), `404 Not Found`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Xóa mềm đơn hàng mua sắm thành công"
  }
  ```

#### 15.2.7. Gửi yêu cầu phê duyệt Đơn hàng mua sắm
* **Endpoint**: `PUT /api/don-hang-mua-sam/{id}/yeu-cau-phe-duyet`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `YEU_CAU_PHE_DUYET_DON_HANG_MUA_SAM`
* **Status Code**: `200 OK`, `400 Bad Request` (Nếu không ở trạng thái `TAO_MOI`), `404 Not Found`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Gửi yêu cầu phê duyệt đơn hàng mua sắm thành công"
  }
  ```

#### 15.2.8. Phê duyệt Đơn hàng mua sắm
* **Endpoint**: `PUT /api/don-hang-mua-sam/{id}/phe-duyet`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `PHE_DUYET_DON_HANG_MUA_SAM`
* **Status Code**: `200 OK`, `400 Bad Request` (Nếu không ở trạng thái `GUI_PHE_DUYET`), `404 Not Found`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Phê duyệt đơn hàng mua sắm thành công"
  }
  ```
* **Nghiệp vụ ngầm**: Hệ thống sẽ tự động gán ID người phê duyệt (`idNguoiPheDuyet`) bằng ID người dùng hiện tại lấy từ phiên đăng nhập.

---

### 15.3. Phiếu nhập tài sản (PhieuNhapTaiSan)

#### 15.3.1. Lấy danh sách Phiếu nhập tài sản phân trang
* **Endpoint**: `GET /api/phieu-nhap-tai-san`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_PHIEU_NHAP_TAI_SAN`
* **Query Parameters**:
  * `maPhieuNhap` (tùy chọn): Lọc theo mã phiếu nhập.
  * `soHoaDonVat` (tùy chọn): Lọc theo số hóa đơn VAT.
  * `idDonHangMuaSam` (tùy chọn): Lọc theo ID đơn đặt hàng mua sắm liên kết.
  * `trangThai` (tùy chọn): Lọc theo trạng thái (`TAO_MOI`, `HOAN_THANH`).
  * `page`, `size`, `sort`
* **Response**: Trả về `PageResponse` danh sách phiếu nhập kho (không kèm chi tiết).

#### 15.3.2. Lấy chi tiết Phiếu nhập tài sản theo ID
* **Endpoint**: `GET /api/phieu-nhap-tai-san/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XEM_PHIEU_NHAP_TAI_SAN`
* **Status Code**: `200 OK`, `404 Not Found`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "id": 1,
      "idDonVi": 1,
      "idDonHangMuaSam": 1,
      "maDonHangMuaSam": "PO-2026-0001",
      "tenNguoiNhap": "Nguyễn Văn B",
      "maPhieuNhap": "PN-2026-0001",
      "soHoaDonVat": "VAT-9992",
      "maBienBanGiaoHang": "BBGH-01",
      "thoiGianNhapKho": "2026-06-20T14:00:00",
      "trangThai": "TAO_MOI",
      "ghiChu": "Nhập kho đợt 1",
      "thoiGianTao": "2026-06-20T14:15:00",
      "thoiGianCapNhat": "2026-06-20T14:15:00",
      "chiTietTaiSan": [
        {
          "id": 1,
          "idTaiSan": 5,
          "tenTaiSan": "Dell Latitude 5420 i5",
          "idThietBi": 10,
          "idChiTietDonHang": 1,
          "giaNhapThucTe": 15000000.00,
          "tinhTrangLucNhap": "Mới 100%",
          "soLuongGheNhap": null,
          "loai": "PHAN_CUNG",
          "thoiGianTao": "2026-06-20T14:15:00",
          "thoiGianCapNhat": "2026-06-20T14:15:00"
        }
      ]
    }
  }
  ```

#### 15.3.3. Tạo mới Phiếu nhập tài sản
* **Endpoint**: `POST /api/phieu-nhap-tai-san`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `THEM_PHIEU_NHAP_TAI_SAN`
* **Payload**:
  ```json
  {
    "idDonHangMuaSam": 1,
    "idNguoiNhap": 2,
    "maPhieuNhap": "Tự động sinh bởi Backend, không truyền",
    "soHoaDonVat": "VAT-9992",
    "maBienBanGiaoHang": "BBGH-01",
    "thoiGianNhapKho": "2026-06-20T14:00:00",
    "ghiChu": "Nhập kho đợt 1",
    "chiTietPhanCung": [
      {
        "idTaiSanPhanCung": 5,
        "idDanhSachThietBiPhanCung": 10,
        "idChiTietDonHangPhanCung": 1,
        "giaNhapThuTe": 15000000.00,
        "tinhTrangLucNhap": "Mới 100%"
      }
    ],
    "chiTietLinhKien": [],
    "chiTietPhanMem": []
  }
  ```
* **Response**: Trả về thông tin Phiếu nhập vừa tạo ở trạng thái mặc định ban đầu là `TAO_MOI`.

#### 15.3.4. Cập nhật Phiếu nhập tài sản (Chỉ khi ở trạng thái Tạo mới)
* **Endpoint**: `PUT /api/phieu-nhap-tai-san/{id}`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `SUA_PHIEU_NHAP_TAI_SAN`
* **Status Code**: `200 OK`, `400 Bad Request` (Nếu không ở trạng thái Tạo mới), `404 Not Found`
* **Payload**: Giống cấu trúc Tạo mới.
* **Response**: Trả về thông tin Phiếu nhập sau cập nhật, xóa cứng các chi tiết con cũ và tạo lại chi tiết mới.

#### 15.3.5. Xóa mềm Phiếu nhập tài sản (Chỉ khi ở trạng thái Tạo mới)
* **Endpoint**: `DELETE /api/phieu-nhap-tai-san/{id}`
* **Headers**:
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `XOA_PHIEU_NHAP_TAI_SAN`
* **Status Code**: `200 OK`, `400 Bad Request` (Nếu không ở trạng thái Tạo mới), `404 Not Found`
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Xóa mềm phiếu nhập kho tài sản thành công"
  }
  ```

#### 15.3.6. Cập nhật trạng thái Phiếu nhập tài sản (Hoàn thành nhập kho)
* **Endpoint**: `PUT /api/phieu-nhap-tai-san/{id}/trang-thai`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <token>`
* **Quyền (Permission)**: `CAP_NHAT_TRANG_THAI_PHIEU_NHAP_TAI_SAN`
* **Status Code**: `200 OK`, `400 Bad Request` (Nếu chuyển sang trạng thái khác `HOAN_THANH` hoặc sai luồng), `404 Not Found`
* **Payload**:
  ```json
  {
    "trangThai": "HOAN_THANH"
  }
  ```
* **Response**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": "Cập nhật trạng thái phiếu nhập kho tài sản thành công"
  }
  ```
* **Nghiệp vụ ngầm**: Khi phiếu nhập tài sản chuyển sang trạng thái `HOAN_THANH` (nhập kho xong), hệ thống sẽ tự động cập nhật đơn hàng mua sắm liên quan (`DonHangMuaSam`) tương ứng thành trạng thái `HOAN_THANH`.
