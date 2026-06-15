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
    "maVaiTro": "ROLE_MOD (NotBlank)",
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
    "maPhongBan": "PB_HR (NotBlank)",
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
    "maViTri": "VT_TANG_5 (NotBlank)",
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
    "maCauHinh": "PASSWORD_EXPIRY_DAYS (NotBlank)",
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


