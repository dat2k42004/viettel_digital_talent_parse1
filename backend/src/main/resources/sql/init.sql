// tạo database
CREATE DATABASE itam_db;
USE itam_db;

// tạo phân quyền
-- =======================================================================
-- BƯỚC 1: KHỞI TẠO 21 NHÓM QUYỀN CHA (QUẢN LÝ DANH MỤC MENU)
-- Không truyền cột 'id' để hệ thống tự động tăng (GenerationType.IDENTITY)
-- =======================================================================
INSERT INTO quyen (id_quyen_cha, ma_quyen, ten_quyen, loai_quyen, duong_dan, biu_tuong, thu_tu_hien_thi, phuong_thuc_http, trang_thai, thoi_gian_tao, thoi_gian_cap_nhat) 
VALUES
(NULL, 'NHOM_XAC_THUC_PHAN_QUYEN', 'Xác thực và Phân quyền', 'NHOM_QUYEN', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(NULL, 'NHOM_QUAN_LY_DON_VI', 'Đơn vị và Doanh nghiệp', 'NHOM_QUYEN', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(NULL, 'NHOM_CAU_HINH_DON_VI', 'Cấu hình đơn vị', 'NHOM_QUYEN', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW()),
(NULL, 'NHOM_QUAN_LY_PHONG_BAN', 'Phòng ban', 'NHOM_QUYEN', NULL, NULL, 4, NULL, 'HOAT_DONG', NOW(), NOW()),
(NULL, 'NHOM_QUAN_LY_VI_TRI', 'Vị trí', 'NHOM_QUYEN', NULL, NULL, 5, NULL, 'HOAT_DONG', NOW(), NOW()),
(NULL, 'NHOM_QUAN_LY_TAI_LIEU', 'Quản lý tài liệu', 'NHOM_QUYEN', NULL, NULL, 6, NULL, 'HOAT_DONG', NOW(), NOW()),
(NULL, 'NHOM_DANH_MUC_TAI_SAN', 'Danh mục tài sản', 'NHOM_QUYEN', NULL, NULL, 7, NULL, 'HOAT_DONG', NOW(), NOW()),
(NULL, 'NHOM_MAU_TAI_SAN', 'Mẫu tài sản định hình', 'NHOM_QUYEN', NULL, NULL, 8, NULL, 'HOAT_DONG', NOW(), NOW()),
(NULL, 'NHOM_THIET_BI_THUC_THE', 'Thiết bị thực thể', 'NHOM_QUYEN', NULL, NULL, 9, NULL, 'HOAT_DONG', NOW(), NOW()),
(NULL, 'NHOM_PHIEU_CAP_PHAT', 'Phiếu cấp phát tài sản', 'NHOM_QUYEN', NULL, NULL, 10, NULL, 'HOAT_DONG', NOW(), NOW()),
(NULL, 'NHOM_PHIEU_THU_HOI', 'Phiếu thu hồi tài sản', 'NHOM_QUYEN', NULL, NULL, 11, NULL, 'HOAT_DONG', NOW(), NOW()),
(NULL, 'NHOM_PHIEU_DIEU_CHUYEN', 'Phiếu điều chuyển tài sản', 'NHOM_QUYEN', NULL, NULL, 12, NULL, 'HOAT_DONG', NOW(), NOW()),
(NULL, 'NHOM_PHIEU_THANH_LY', 'Phiếu thanh lý tài sản', 'NHOM_QUYEN', NULL, NULL, 13, NULL, 'HOAT_DONG', NOW(), NOW()),
(NULL, 'NHOM_NHA_CUNG_CAP', 'Nhà cung cấp', 'NHOM_QUYEN', NULL, NULL, 14, NULL, 'HOAT_DONG', NOW(), NOW()),
(NULL, 'NHOM_DON_HANG_MUA_SAM', 'Đơn hàng mua sắm', 'NHOM_QUYEN', NULL, NULL, 15, NULL, 'HOAT_DONG', NOW(), NOW()),
(NULL, 'NHOM_PHIEU_NHAP_KHO', 'Phiếu nhập kho', 'NHOM_QUYEN', NULL, NULL, 16, NULL, 'HOAT_DONG', NOW(), NOW()),
(NULL, 'NHOM_KE_HOACH_BAO_TRI', 'Kế hoạch bảo trì định kỳ', 'NHOM_QUYEN', NULL, NULL, 17, NULL, 'HOAT_DONG', NOW(), NOW()),
(NULL, 'NHOM_PHIEU_SUA_CHUA', 'Phiếu sửa chữa bảo trì', 'NHOM_QUYEN', NULL, NULL, 18, NULL, 'HOAT_DONG', NOW(), NOW()),
(NULL, 'NHOM_DOT_KIEM_KE', 'Đợt kiểm kê', 'NHOM_QUYEN', NULL, NULL, 19, NULL, 'HOAT_DONG', NOW(), NOW()),
(NULL, 'NHOM_PHIEU_KIEM_KE', 'Phiếu kiểm kê phòng ban', 'NHOM_QUYEN', NULL, NULL, 20, NULL, 'HOAT_DONG', NOW(), NOW()),
(NULL, 'NHOM_BAO_CAO_THONG_KE', 'Báo cáo và Thống kê', 'NHOM_QUYEN', NULL, NULL, 21, NULL, 'HOAT_DONG', NOW(), NOW());

-- =======================================================================
-- BƯỚC 2: KHỞI TẠO 154 BẢN GHI QUYỀN CON THAO TÁC (TỰ ĐỘNG TĂNG ID)
-- (Đã map cứng id_quyen_cha từ 1 đến 21 tương ứng với nhóm cha tạo trước đó)
-- =======================================================================
INSERT INTO quyen (id_quyen_cha, ma_quyen, ten_quyen, loai_quyen, duong_dan, biu_tuong, thu_tu_hien_thi, phuong_thuc_http, trang_thai, thoi_gian_tao, thoi_gian_cap_nhat) 
VALUES
-- Nhóm 1: Auth & IAM (id_quyen_cha = 1)
(1, 'XEM_NGUOI_DUNG', 'Xem người dùng', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(1, 'THEM_NGUOI_DUNG', 'Thêm người dùng', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(1, 'SUA_NGUOI_DUNG', 'Sửa người dùng', 'THAO_TAC', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW()),
(1, 'XOA_NGUOI_DUNG', 'Xóa người dùng', 'THAO_TAC', NULL, NULL, 4, NULL, 'HOAT_DONG', NOW(), NOW()),
(1, 'CAP_NHAT_TRANG_THAI_NGUOI_DUNG', 'Cập nhật trạng thái người dùng', 'THAO_TAC', NULL, NULL, 5, NULL, 'HOAT_DONG', NOW(), NOW()),
(1, 'CAP_NHAT_QUYEN_NGUOI_DUNG', 'Cập nhật quyền người dùng', 'THAO_TAC', NULL, NULL, 6, NULL, 'HOAT_DONG', NOW(), NOW()),
(1, 'XEM_VAI_TRO', 'Xem vai trò', 'THAO_TAC', NULL, NULL, 7, NULL, 'HOAT_DONG', NOW(), NOW()),
(1, 'THEM_VAI_TRO', 'Thêm vai trò', 'THAO_TAC', NULL, NULL, 8, NULL, 'HOAT_DONG', NOW(), NOW()),
(1, 'SUA_VAI_TRO', 'Sửa vai trò', 'THAO_TAC', NULL, NULL, 9, NULL, 'HOAT_DONG', NOW(), NOW()),
(1, 'XOA_VAI_TRO', 'Xóa vai trò', 'THAO_TAC', NULL, NULL, 10, NULL, 'HOAT_DONG', NOW(), NOW()),
(1, 'CAP_NHAT_TRANG_THAI_VAI_TRO', 'Cập nhật trạng thái vai trò', 'THAO_TAC', NULL, NULL, 11, NULL, 'HOAT_DONG', NOW(), NOW()),
(1, 'CAP_NHAT_QUYEN_VAI_TRO', 'Cập nhật quyền vai trò', 'THAO_TAC', NULL, NULL, 12, NULL, 'HOAT_DONG', NOW(), NOW()),
(1, 'XEM_QUYEN', 'Xem quyền', 'THAO_TAC', NULL, NULL, 13, NULL, 'HOAT_DONG', NOW(), NOW()),

-- Nhóm 2: Đơn vị / Tenant (id_quyen_cha = 2)
(2, 'XEM_DON_VI', 'Xem đơn vị', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(2, 'SUA_DON_VI', 'Sửa đơn vị', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(2, 'XOA_DON_VI', 'Xóa đơn vị', 'THAO_TAC', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW()),
(2, 'KHOA_DON_VI', 'Khóa đơn vị', 'THAO_TAC', NULL, NULL, 4, NULL, 'HOAT_DONG', NOW(), NOW()),
(2, 'GIA_HAN_DON_VI', 'Gia hạn đơn vị', 'THAO_TAC', NULL, NULL, 5, NULL, 'HOAT_DONG', NOW(), NOW()),

-- Nhóm 3: Cấu hình đơn vị (id_quyen_cha = 3)
(3, 'XEM_CAU_HINH_DON_VI', 'Xem cấu hình đơn vị', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(3, 'THEM_CAU_HINH_DON_VI', 'Thêm cấu hình đơn vị', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(3, 'SUA_CAU_HINH_DON_VI', 'Sửa cấu hình đơn vị', 'THAO_TAC', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW()),
(3, 'XOA_CAU_HINH_DON_VI', 'Xóa cấu hình đơn vị', 'THAO_TAC', NULL, NULL, 4, NULL, 'HOAT_DONG', NOW(), NOW()),
(3, 'XEM_DANH_MUC_CAU_HINH', 'Xem danh mục cấu hình', 'THAO_TAC', NULL, NULL, 5, NULL, 'HOAT_DONG', NOW(), NOW()),
(3, 'THEM_DANH_MUC_CAU_HINH', 'Thêm danh mục cấu hình', 'THAO_TAC', NULL, NULL, 6, NULL, 'HOAT_DONG', NOW(), NOW()),
(3, 'SUA_DANH_MUC_CAU_HINH', 'Sửa danh mục cấu hình', 'THAO_TAC', NULL, NULL, 7, NULL, 'HOAT_DONG', NOW(), NOW()),
(3, 'XOA_DANH_MUC_CAU_HINH', 'Xóa danh mục cấu hình', 'THAO_TAC', NULL, NULL, 8, NULL, 'HOAT_DONG', NOW(), NOW()),

-- Nhóm 4: Phòng ban (id_quyen_cha = 4)
(4, 'XEM_PHONG_BAN', 'Xem phòng ban', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(4, 'THEM_PHONG_BAN', 'Thêm phòng ban', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(4, 'SUA_PHONG_BAN', 'Sửa phòng ban', 'THAO_TAC', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW()),
(4, 'XOA_PHONG_BAN', 'Xóa phòng ban', 'THAO_TAC', NULL, NULL, 4, NULL, 'HOAT_DONG', NOW(), NOW()),
(4, 'CAP_NHAT_TRANG_THAI_PHONG_BAN', 'Cập nhật trạng thái phòng ban', 'THAO_TAC', NULL, NULL, 5, NULL, 'HOAT_DONG', NOW(), NOW()),

-- Nhóm 5: Vị trí (id_quyen_cha = 5)
(5, 'XEM_VI_TRI', 'Xem vị trí', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(5, 'THEM_VI_TRI', 'Thêm vị trí', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(5, 'SUA_VI_TRI', 'Sửa vị trí', 'THAO_TAC', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW()),
(5, 'XOA_VI_TRI', 'Xóa vị trí', 'THAO_TAC', NULL, NULL, 4, NULL, 'HOAT_DONG', NOW(), NOW()),
(5, 'CAP_NHAT_TRANG_THAI_VI_TRI', 'Cập nhật trạng thái vị trí', 'THAO_TAC', NULL, NULL, 5, NULL, 'HOAT_DONG', NOW(), NOW()),

-- Nhóm 6: File Manager (id_quyen_cha = 6)
(6, 'TAI_LEN_FILE', 'Tải lên file', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(6, 'TAI_XUONG_FILE', 'Tải xuống file', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),

-- Nhóm 7: Danh mục tài sản (id_quyen_cha = 7)
(7, 'XEM_LOAI_TAI_SAN', 'Xem loại tài sản', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(7, 'THEM_LOAI_TAI_SAN', 'Thêm loại tài sản', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(7, 'SUA_LOAI_TAI_SAN', 'Sửa loại tài sản', 'THAO_TAC', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW()),
(7, 'XOA_LOAI_TAI_SAN', 'Xóa loại tài sản', 'THAO_TAC', NULL, NULL, 4, NULL, 'HOAT_DONG', NOW(), NOW()),
(7, 'CAP_NHAT_TRANG_THAI_LOAI_TAI_SAN', 'Cập nhật trạng thái loại tài sản', 'THAO_TAC', NULL, NULL, 5, NULL, 'HOAT_DONG', NOW(), NOW()),
(7, 'XEM_HANG_SAN_XUAT', 'Xem hãng sản xuất', 'THAO_TAC', NULL, NULL, 6, NULL, 'HOAT_DONG', NOW(), NOW()),
(7, 'THEM_HANG_SAN_XUAT', 'Thêm hãng sản xuất', 'THAO_TAC', NULL, NULL, 7, NULL, 'HOAT_DONG', NOW(), NOW()),
(7, 'SUA_HANG_SAN_XUAT', 'Sửa hãng sản xuất', 'THAO_TAC', NULL, NULL, 8, NULL, 'HOAT_DONG', NOW(), NOW()),
(7, 'XOA_HANG_SAN_XUAT', 'Xóa hãng sản xuất', 'THAO_TAC', NULL, NULL, 9, NULL, 'HOAT_DONG', NOW(), NOW()),
(7, 'CAP_NHAT_TRANG_THAI_HANG_SAN_XUAT', 'Cập nhật trạng thái hãng sản xuất', 'THAO_TAC', NULL, NULL, 10, NULL, 'HOAT_DONG', NOW(), NOW()),
(7, 'XEM_DANH_MUC_TAI_SAN', 'Xem danh mục tài sản', 'THAO_TAC', NULL, NULL, 11, NULL, 'HOAT_DONG', NOW(), NOW()),
(7, 'THEM_DANH_MUC_TAI_SAN', 'Thêm danh mục tài sản', 'THAO_TAC', NULL, NULL, 12, NULL, 'HOAT_DONG', NOW(), NOW()),
(7, 'SUA_DANH_MUC_TAI_SAN', 'Sửa danh mục tài sản', 'THAO_TAC', NULL, NULL, 13, NULL, 'HOAT_DONG', NOW(), NOW()),
(7, 'XOA_DANH_MUC_TAI_SAN', 'Xóa danh mục tài sản', 'THAO_TAC', NULL, NULL, 14, NULL, 'HOAT_DONG', NOW(), NOW()),
(7, 'XEM_DANH_MUC_THUOC_TINH', 'Xem danh mục thuộc tính', 'THAO_TAC', NULL, NULL, 15, NULL, 'HOAT_DONG', NOW(), NOW()),
(7, 'THEM_DANH_MUC_THUOC_TINH', 'Thêm danh mục thuộc tính', 'THAO_TAC', NULL, NULL, 16, NULL, 'HOAT_DONG', NOW(), NOW()),
(7, 'SUA_DANH_MUC_THUOC_TINH', 'Sửa danh mục thuộc tính', 'THAO_TAC', NULL, NULL, 17, NULL, 'HOAT_DONG', NOW(), NOW()),
(7, 'XOA_DANH_MUC_THUOC_TINH', 'Xóa danh mục thuộc tính', 'THAO_TAC', NULL, NULL, 18, NULL, 'HOAT_DONG', NOW(), NOW()),
(7, 'CAP_NHAT_TRANG_THAI_DANH_MUC_THUOC_TINH', 'Cập nhật trạng thái danh mục thuộc tính', 'THAO_TAC', NULL, NULL, 19, NULL, 'HOAT_DONG', NOW(), NOW()),
(7, 'XEM_GIA_TRI_THUOC_TINH', 'Xem giá trị thuộc tính', 'THAO_TAC', NULL, NULL, 20, NULL, 'HOAT_DONG', NOW(), NOW()),
(7, 'LUU_GIA_TRI_THUOC_TINH', 'Lưu giá trị thuộc tính', 'THAO_TAC', NULL, NULL, 21, NULL, 'HOAT_DONG', NOW(), NOW()),

-- Nhóm 8: Mẫu tài sản (id_quyen_cha = 8)
(8, 'XEM_TAI_SAN_PHAN_CUNG', 'Xem tài sản phần cứng', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(8, 'THEM_TAI_SAN_PHAN_CUNG', 'Thêm tài sản phần cứng', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(8, 'SUA_TAI_SAN_PHAN_CUNG', 'Sửa tài sản phần cứng', 'THAO_TAC', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW()),
(8, 'XOA_TAI_SAN_PHAN_CUNG', 'Xóa tài sản phần cứng', 'THAO_TAC', NULL, NULL, 4, NULL, 'HOAT_DONG', NOW(), NOW()),
(8, 'CAP_NHAT_TRANG_THAI_TAI_SAN_PHAN_CUNG', 'Cập nhật trạng thái tài sản phần cứng', 'THAO_TAC', NULL, NULL, 5, NULL, 'HOAT_DONG', NOW(), NOW()),
(8, 'XEM_TAI_SAN_PHAN_MEM', 'Xem tài sản phần mềm', 'THAO_TAC', NULL, NULL, 6, NULL, 'HOAT_DONG', NOW(), NOW()),
(8, 'THEM_TAI_SAN_PHAN_MEM', 'Thêm tài sản phần mềm', 'THAO_TAC', NULL, NULL, 7, NULL, 'HOAT_DONG', NOW(), NOW()),
(8, 'SUA_TAI_SAN_PHAN_MEM', 'Sửa tài sản phần mềm', 'THAO_TAC', NULL, NULL, 8, NULL, 'HOAT_DONG', NOW(), NOW()),
(8, 'XOA_TAI_SAN_PHAN_MEM', 'Xóa tài sản phần mềm', 'THAO_TAC', NULL, NULL, 9, NULL, 'HOAT_DONG', NOW(), NOW()),
(8, 'CAP_NHAT_TRANG_THAI_TAI_SAN_PHAN_MEM', 'Cập nhật trạng thái tài sản phần mềm', 'THAO_TAC', NULL, NULL, 10, NULL, 'HOAT_DONG', NOW(), NOW()),

-- Nhóm 9: Thiết bị thực thể (id_quyen_cha = 9)
(9, 'XEM_THIET_BI_PHAN_CUNG', 'Xem thiết bị phần cứng', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(9, 'THEM_THIET_BI_PHAN_CUNG', 'Thêm thiết bị phần cứng', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(9, 'SUA_THIET_BI_PHAN_CUNG', 'Sửa thiết bị phần cứng', 'THAO_TAC', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW()),
(9, 'XOA_THIET_BI_PHAN_CUNG', 'Xóa thiết bị phần cứng', 'THAO_TAC', NULL, NULL, 4, NULL, 'HOAT_DONG', NOW(), NOW()),
(9, 'CAP_NHAT_TRANG_THAI_THIET_BI_PHAN_CUNG', 'Cập nhật trạng thái thiết bị phần cứng', 'THAO_TAC', NULL, NULL, 5, NULL, 'HOAT_DONG', NOW(), NOW()),
(9, 'XEM_THIET_BI_PHAN_MEM', 'Xem thiết bị phần mềm', 'THAO_TAC', NULL, NULL, 6, NULL, 'HOAT_DONG', NOW(), NOW()),
(9, 'THEM_THIET_BI_PHAN_MEM', 'Thêm thiết bị phần mềm', 'THAO_TAC', NULL, NULL, 7, NULL, 'HOAT_DONG', NOW(), NOW()),
(9, 'SUA_THIET_BI_PHAN_MEM', 'Sửa thiết bị phần mềm', 'THAO_TAC', NULL, NULL, 8, NULL, 'HOAT_DONG', NOW(), NOW()),
(9, 'XOA_THIET_BI_PHAN_MEM', 'Xóa thiết bị phần mềm', 'THAO_TAC', NULL, NULL, 9, NULL, 'HOAT_DONG', NOW(), NOW()),
(9, 'CAP_NHAT_TRANG_THAI_THIET_BI_PHAN_MEM', 'Cập nhật trạng thái thiết bị phần mềm', 'THAO_TAC', NULL, NULL, 10, NULL, 'HOAT_DONG', NOW(), NOW()),
(9, 'XEM_LINH_KIEN_PHAN_CUNG', 'Xem linh kiện phần cứng', 'THAO_TAC', NULL, NULL, 11, NULL, 'HOAT_DONG', NOW(), NOW()),
(9, 'THEM_LINH_KIEN_PHAN_CUNG', 'Thêm linh kiện phần cứng', 'THAO_TAC', NULL, NULL, 12, NULL, 'HOAT_DONG', NOW(), NOW()),
(9, 'SUA_LINH_KIEN_PHAN_CUNG', 'Sửa linh kiện phần cứng', 'THAO_TAC', NULL, NULL, 13, NULL, 'HOAT_DONG', NOW(), NOW()),
(9, 'XOA_LINH_KIEN_PHAN_CUNG', 'Xóa linh kiện phần cứng', 'THAO_TAC', NULL, NULL, 14, NULL, 'HOAT_DONG', NOW(), NOW()),
(9, 'CAP_NHAT_TRANG_THAI_LINH_KIEN_PHAN_CUNG', 'Cập nhật trạng thái linh kiện phần cứng', 'THAO_TAC', NULL, NULL, 15, NULL, 'HOAT_DONG', NOW(), NOW()),
(9, 'XEM_LAP_RAP_LINH_KIEN', 'Xem lắp ráp linh kiện', 'THAO_TAC', NULL, NULL, 16, NULL, 'HOAT_DONG', NOW(), NOW()),
(9, 'THEM_LAP_RAP_LINH_KIEN', 'Thêm lắp ráp linh kiện', 'THAO_TAC', NULL, NULL, 17, NULL, 'HOAT_DONG', NOW(), NOW()),
(9, 'SUA_LAP_RAP_LINH_KIEN', 'Sửa lắp ráp linh kiện', 'THAO_TAC', NULL, NULL, 18, NULL, 'HOAT_DONG', NOW(), NOW()),

-- Nhóm 10: Phiếu cấp phát (id_quyen_cha = 10)
(10, 'XEM_PHIEU_CAP_PHAT', 'Xem phiếu cấp phát', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(10, 'THEM_PHIEU_CAP_PHAT', 'Thêm phiếu cấp phát', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(10, 'SUA_PHIEU_CAP_PHAT', 'Sửa phiếu cấp phát', 'THAO_TAC', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW()),
(10, 'XOA_PHIEU_CAP_PHAT', 'Xóa phiếu cấp phát', 'THAO_TAC', NULL, NULL, 4, NULL, 'HOAT_DONG', NOW(), NOW()),
(10, 'YEU_CAU_PHE_DUYET_PHIEU_CAP_PHAT', 'Yêu cầu phê duyệt phiếu cấp phát', 'THAO_TAC', NULL, NULL, 5, NULL, 'HOAT_DONG', NOW(), NOW()),
(10, 'PHE_DUYET_PHIEU_CAP_PHAT', 'Phê duyệt phiếu cấp phát', 'THAO_TAC', NULL, NULL, 6, NULL, 'HOAT_DONG', NOW(), NOW()),
(10, 'HOAN_THANH_PHIEU_CAP_PHAT', 'Hoàn thành phiếu cấp phát', 'THAO_TAC', NULL, NULL, 7, NULL, 'HOAT_DONG', NOW(), NOW()),

-- Nhóm 11: Phiếu thu hồi (id_quyen_cha = 11)
(11, 'XEM_PHIEU_THU_HOI_TAI_SAN', 'Xem phiếu thu hồi tài sản', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(11, 'THEM_PHIEU_THU_HOI_TAI_SAN', 'Thêm phiếu thu hồi tài sản', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(11, 'SUA_PHIEU_THU_HOI_TAI_SAN', 'Sửa phiếu thu hồi tài sản', 'THAO_TAC', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW()),
(11, 'XOA_PHIEU_THU_HOI_TAI_SAN', 'Xóa phiếu thu hồi tài sản', 'THAO_TAC', NULL, NULL, 4, NULL, 'HOAT_DONG', NOW(), NOW()),
(11, 'YEU_CAU_PHE_DUYET_PHIEU_THU_HOI_TAI_SAN', 'Yêu cầu phê duyệt phiếu thu hồi tài sản', 'THAO_TAC', NULL, NULL, 5, NULL, 'HOAT_DONG', NOW(), NOW()),
(11, 'PHE_DUYET_PHIEU_THU_HOI_TAI_SAN', 'Phê duyệt phiếu thu hồi tài sản', 'THAO_TAC', NULL, NULL, 6, NULL, 'HOAT_DONG', NOW(), NOW()),
(11, 'HOAN_THANH_PHIEU_THU_HOI_TAI_SAN', 'Hoàn thành phiếu thu hồi tài sản', 'THAO_TAC', NULL, NULL, 7, NULL, 'HOAT_DONG', NOW(), NOW()),

-- Nhóm 12: Phiếu điều chuyển (id_quyen_cha = 12)
(12, 'XEM_PHIEU_DIEU_CHUYEN', 'Xem phiếu điều chuyển', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(12, 'THEM_PHIEU_DIEU_CHUYEN', 'Thêm phiếu điều chuyển', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(12, 'SUA_PHIEU_DIEU_CHUYEN', 'Sửa phiếu điều chuyển', 'THAO_TAC', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW()),
(12, 'XOA_PHIEU_DIEU_CHUYEN', 'Xóa phiếu điều chuyển', 'THAO_TAC', NULL, NULL, 4, NULL, 'HOAT_DONG', NOW(), NOW()),
(12, 'YEU_CAU_PHE_DUYET_DIEU_CHUYEN', 'Yêu cầu phê duyệt điều chuyển', 'THAO_TAC', NULL, NULL, 5, NULL, 'HOAT_DONG', NOW(), NOW()),
(12, 'PHE_DUYET_DIEU_CHUYEN', 'Phê duyệt điều chuyển', 'THAO_TAC', NULL, NULL, 6, NULL, 'HOAT_DONG', NOW(), NOW()),
(12, 'THAO_TAC_TAI_SAN', 'Thao tác tài sản', 'THAO_TAC', NULL, NULL, 7, NULL, 'HOAT_DONG', NOW(), NOW()),
(12, 'HOAN_THANH_DIEU_CHUYEN', 'Hoàn thành điều chuyển', 'THAO_TAC', NULL, NULL, 8, NULL, 'HOAT_DONG', NOW(), NOW()),

-- Nhóm 13: Phiếu thanh lý (id_quyen_cha = 13)
(13, 'XEM_PHIEU_THANH_LY', 'Xem phiếu thanh lý', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(13, 'THEM_PHIEU_THANH_LY', 'Thêm phiếu thanh lý', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(13, 'SUA_PHIEU_THANH_LY', 'Sửa phiếu thanh lý', 'THAO_TAC', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW()),
(13, 'XOA_PHIEU_THANH_LY', 'Xóa phiếu thanh lý', 'THAO_TAC', NULL, NULL, 4, NULL, 'HOAT_DONG', NOW(), NOW()),
(13, 'YEU_CAU_PHE_DUYET_THANH_LY', 'Yêu cầu phê duyệt thanh lý', 'THAO_TAC', NULL, NULL, 5, NULL, 'HOAT_DONG', NOW(), NOW()),
(13, 'PHE_DUYET_THANH_LY', 'Phê duyệt thanh lý', 'THAO_TAC', NULL, NULL, 6, NULL, 'HOAT_DONG', NOW(), NOW()),
(13, 'HOAN_THANH_THANH_LY', 'Hoàn thành thanh lý', 'THAO_TAC', NULL, NULL, 7, NULL, 'HOAT_DONG', NOW(), NOW()),

-- Nhóm 14: Nhà cung cấp (id_quyen_cha = 14)
(14, 'XEM_NHA_CUNG_CAP', 'Xem nhà cung cấp', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(14, 'THEM_NHA_CUNG_CAP', 'Thêm nhà cung cấp', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(14, 'SUA_NHA_CUNG_CAP', 'Sửa nhà cung cấp', 'THAO_TAC', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW()),
(14, 'XOA_NHA_CUNG_CAP', 'Xóa nhà cung cấp', 'THAO_TAC', NULL, NULL, 4, NULL, 'HOAT_DONG', NOW(), NOW()),
(14, 'CAP_NHAT_TRANG_THAI_NHA_CUNG_CAP', 'Cập nhật trạng thái nhà cung cấp', 'THAO_TAC', NULL, NULL, 5, NULL, 'HOAT_DONG', NOW(), NOW()),

-- Nhóm 15: Đơn hàng mua sắm (id_quyen_cha = 15)
(15, 'XEM_DON_HANG_MUA_SAM', 'Xem đơn hàng mua sắm', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(15, 'THEM_DON_HANG_MUA_SAM', 'Thêm đơn hàng mua sắm', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(15, 'SUA_DON_HANG_MUA_SAM', 'Sửa đơn hàng mua sắm', 'THAO_TAC', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW()),
(15, 'XOA_DON_HANG_MUA_SAM', 'Xóa đơn hàng mua sắm', 'THAO_TAC', NULL, NULL, 4, NULL, 'HOAT_DONG', NOW(), NOW()),
(15, 'YEU_CAU_PHE_DUYET_DON_HANG_MUA_SAM', 'Yêu cầu phê duyệt đơn hàng mua sắm', 'THAO_TAC', NULL, NULL, 5, NULL, 'HOAT_DONG', NOW(), NOW()),
(15, 'PHE_DUYET_DON_HANG_MUA_SAM', 'Phê duyệt đơn hàng mua sắm', 'THAO_TAC', NULL, NULL, 6, NULL, 'HOAT_DONG', NOW(), NOW()),

-- Nhóm 16: Phiếu nhập kho (id_quyen_cha = 16)
(16, 'XEM_PHIEU_NHAP_TAI_SAN', 'Xem phiếu nhập tài sản', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(16, 'THEM_PHIEU_NHAP_TAI_SAN', 'Thêm phiếu nhập tài sản', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(16, 'SUA_PHIEU_NHAP_TAI_SAN', 'Sửa phiếu nhập tài sản', 'THAO_TAC', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW()),
(16, 'XOA_PHIEU_NHAP_TAI_SAN', 'Xóa phiếu nhập tài sản', 'THAO_TAC', NULL, NULL, 4, NULL, 'HOAT_DONG', NOW(), NOW()),
(16, 'CAP_NHAT_TRANG_THAI_PHIEU_NHAP_TAI_SAN', 'Cập nhật trạng thái phiếu nhập tài sản', 'THAO_TAC', NULL, NULL, 5, NULL, 'HOAT_DONG', NOW(), NOW()),

-- Nhóm 17: Kế hoạch bảo trì định kỳ (id_quyen_cha = 17)
(17, 'XEM_DANH_SACH_KHBTDK', 'Xem danh sách kế hoạch bảo trì', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(17, 'XEM_CHI_TIET_KHBTDK', 'Xem chi tiết kế hoạch bảo trì', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(17, 'THEM_MOI_KHBTDK', 'Thêm mới kế hoạch bảo trì', 'THAO_TAC', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW()),
(17, 'CAP_NHAT_KHBTDK', 'Cập nhật kế hoạch bảo trì', 'THAO_TAC', NULL, NULL, 4, NULL, 'HOAT_DONG', NOW(), NOW()),
(17, 'XOA_KHBTDK', 'Xóa kế hoạch bảo trì', 'THAO_TAC', NULL, NULL, 5, NULL, 'HOAT_DONG', NOW(), NOW()),
(17, 'GUI_PHE_DUYET_KHBTDK', 'Gửi phê duyệt kế hoạch bảo trì', 'THAO_TAC', NULL, NULL, 6, NULL, 'HOAT_DONG', NOW(), NOW()),
(17, 'PHE_DUYET_KHBTDK', 'Phê duyệt kế hoạch bảo trì', 'THAO_TAC', NULL, NULL, 7, NULL, 'HOAT_DONG', NOW(), NOW()),

-- Nhóm 18: Phiếu sửa chữa bảo trì (id_quyen_cha = 18)
(18, 'XEM_DANH_SACH_PHIEU_SUA_CHUA_BAO_TRI', 'Xem danh sách phiếu sửa chữa bảo trì', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(18, 'XEM_CHI_TIET_PHIEU_SUA_CHUA_BAO_TRI', 'Xem chi tiết phiếu sửa chữa bảo trì', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(18, 'THEM_MOI_PHIEU_SUA_CHUA_BAO_TRI', 'Thêm mới phiếu sửa chữa bảo trì', 'THAO_TAC', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW()),
(18, 'CAP_NHAT_PHIEU_SUA_CHUA_BAO_TRI', 'Cập nhật phiếu sửa chữa bảo trì', 'THAO_TAC', NULL, NULL, 4, NULL, 'HOAT_DONG', NOW(), NOW()),
(18, 'XOA_PHIEU_SUA_CHUA_BAO_TRI', 'Xóa phiếu sửa chữa bảo trì', 'THAO_TAC', NULL, NULL, 5, NULL, 'HOAT_DONG', NOW(), NOW()),
(18, 'GUI_PHE_DUYET_PHIEU_SUA_CHUA_BAO_TRI', 'Gửi phê duyệt phiếu sửa chữa bảo trì', 'THAO_TAC', NULL, NULL, 6, NULL, 'HOAT_DONG', NOW(), NOW()),
(18, 'PHE_DUYET_PHIEU_SUA_CHUA_BAO_TRI', 'Phê duyệt phiếu sửa chữa bảo trì', 'THAO_TAC', NULL, NULL, 7, NULL, 'HOAT_DONG', NOW(), NOW()),
(18, 'CAP_NHAT_TIEN_DO_PSCBT', 'Cập nhật tiến độ phiếu sửa chữa bảo trì', 'THAO_TAC', NULL, NULL, 8, NULL, 'HOAT_DONG', NOW(), NOW()),

-- Nhóm 19: Đợt kiểm kê (id_quyen_cha = 19)
(19, 'XEM_DANH_SACH_DKK', 'Xem danh sách đợt kiểm kê', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(19, 'XEM_CHI_TIET_DKK', 'Xem chi tiết đợt kiểm kê', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(19, 'THEM_MOI_DKK', 'Thêm mới đợt kiểm kê', 'THAO_TAC', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW()),
(19, 'CAP_NHAT_DKK', 'Cập nhật đợt kiểm kê', 'THAO_TAC', NULL, NULL, 4, NULL, 'HOAT_DONG', NOW(), NOW()),
(19, 'XOA_DKK', 'Xóa đợt kiểm kê', 'THAO_TAC', NULL, NULL, 5, NULL, 'HOAT_DONG', NOW(), NOW()),
(19, 'GUI_PHE_DUYET_DKK', 'Gửi phê duyệt đợt kiểm kê', 'THAO_TAC', NULL, NULL, 6, NULL, 'HOAT_DONG', NOW(), NOW()),
(19, 'PHE_DUYET_DKK', 'Phê duyệt đợt kiểm kê', 'THAO_TAC', NULL, NULL, 7, NULL, 'HOAT_DONG', NOW(), NOW()),

-- Nhóm 20: Phiếu kiểm kê phòng ban (id_quyen_cha = 20)
(20, 'XEM_DANH_SACH_PHIEU_KIEM_KE', 'Xem danh sách phiếu kiểm kê', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(20, 'XEM_CHI_TIET_PHIEU_KIEM_KE', 'Xem chi tiết phiếu kiểm kê', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(20, 'THEM_MOI_PHIEU_KIEM_KE', 'Thêm mới phiếu kiểm kê', 'THAO_TAC', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW()),
(20, 'CAP_NHAT_PHIEU_KIEM_KE', 'Cập nhật phiếu kiểm kê', 'THAO_TAC', NULL, NULL, 4, NULL, 'HOAT_DONG', NOW(), NOW()),
(20, 'XOA_PHIEU_KIEM_KE', 'Xóa phiếu kiểm kê', 'THAO_TAC', NULL, NULL, 5, NULL, 'HOAT_DONG', NOW(), NOW()),
(20, 'THUC_HIEN_KIEM_KE_TAI_SAN', 'Thực hiện kiểm kê tài sản', 'THAO_TAC', NULL, NULL, 6, NULL, 'HOAT_DONG', NOW(), NOW()),
(20, 'XEM_TIEN_DO_KIEM_KE_DON_VI', 'Xem tiến độ kiểm kê đơn vị', 'THAO_TAC', NULL, NULL, 7, NULL, 'HOAT_DONG', NOW(), NOW()),
(20, 'XAC_NHAN_KET_QUA_KIEM_KE_PHONG_BAN', 'Xác nhận kết quả kiểm kê phòng ban', 'THAO_TAC', NULL, NULL, 8, NULL, 'HOAT_DONG', NOW(), NOW()),

-- Nhóm 21: Báo cáo & Dashboard (id_quyen_cha = 21)
(21, 'XEM_BAO_CAO', 'Xem báo cáo', 'THAO_TAC', NULL, NULL, 1, NULL, 'HOAT_DONG', NOW(), NOW()),
(21, 'XEM_QUAN_TRI_TOAN_SAN', 'Xem quản trị toàn sàn', 'THAO_TAC', NULL, NULL, 2, NULL, 'HOAT_DONG', NOW(), NOW()),
(21, 'XEM_NHAT_KY_THAO_TAC', 'Xem nhật ký thao tác', 'THAO_TAC', NULL, NULL, 3, NULL, 'HOAT_DONG', NOW(), NOW());

// tạo tài khoản cho super admin và vai trò tương ứng với super admin 
-- =======================================================================
-- BƯỚC 1: KHỞI TẠO VAI TRÒ SUPER ADMIN
-- (Bỏ trống cột 'id' để tự động tăng, id_don_vi = NULL để cô lập toàn sàn)
-- =======================================================================
INSERT INTO vai_tro (id_don_vi, ma_vai_tro, ten_vai_tro, mo_ta_vai_tro, la_he_thong, cap_do_uu_tien, trang_thai, thoi_gian_tao, thoi_gian_cap_nhat) 
VALUES 
(NULL, 'ROLE_SUPER_ADMIN', 'Quản trị viên tối cao hệ thống', 'Tài khoản đặc quyền tối cao của hệ thống. Kiểm soát toàn diện thiết lập, phân quyền và dữ liệu của tất cả các đơn vị.', 1, 1, 'HOAT_DONG', NOW(), NOW());


-- =======================================================================
-- BƯỚC 2: GÁN TOÀN BỘ QUYỀN TRONG BẢNG "QUYEN" CHO VAI TRÒ SUPER ADMIN
-- (Dùng SELECT để bốc tự động toàn bộ 175+ ID quyền mà không cần gõ cứng)
-- =======================================================================
INSERT INTO vai_tro_quyen (id_vai_tro, id_quyen, id_nguoi_cap_quyen, ghi_chu_cap_quyen, thoi_gian_tao, thoi_gian_cap_nhat)
SELECT 
    (SELECT id FROM vai_tro WHERE ma_vai_tro = 'ROLE_SUPER_ADMIN'), -- Tự động tìm ID của vai trò vừa tạo
    id,                                                             -- Bốc toàn bộ ID từ bảng quyền
    NULL, 
    'Hệ thống tự động cấp phát đặc quyền vĩ mô', 
    NOW(), 
    NOW()
FROM quyen;


-- =======================================================================
-- BƯỚC 3: TẠO TÀI KHOẢN NGƯỜI DÙNG SUPER ADMIN
-- username: admin / password: admin@123 (Đã mã hóa chuẩn BCrypt)
-- (Bỏ trống 'id', id_don_vi = NULL, id_phong_ban = NULL)
-- =======================================================================
INSERT INTO nguoi_dung (id_don_vi, id_phong_ban, ma_nguoi_dung, ten_dang_nhap, mat_khau, ho_nguoi_dung, ten_dem_nguoi_dung, ten_nguoi_dung, email, so_dien_thoai, trang_thai, thoi_gian_tao, thoi_gian_cap_nhat) 
VALUES 
(NULL, NULL, 'NV-00000', 'admin', '$2a$10$7R9rR5.2f93gQjU2p5fKneM8rS.b3qZ8h2Tz2R8xW/HjGZ9vH6w1S', 'Hệ Thống', 'Quản Trị', 'Tối Cao', 'superadmin@itam.com', '0123456789', 'HOAT_DONG', NOW(), NOW());


-- =======================================================================
-- BƯỚC 4: LIÊN KẾT TÀI KHOẢN "admin" VỚI VAI TRÒ "ROLE_SUPER_ADMIN"
-- (Dùng Subquery tìm ID tự động để ánh xạ vào bảng trung gian)
-- =======================================================================
INSERT INTO nguoi_dung_vai_tro (id_nguoi_dung, id_vai_tro, thoi_gian_bat_dau, thoi_gian_het_han, ghi_chu_gan, thoi_gian_tao, thoi_gian_cap_nhat) 
VALUES (
    (SELECT id FROM nguoi_dung WHERE ten_dang_nhap = 'admin'),      -- Tự động lấy ID user
    (SELECT id FROM vai_tro WHERE ma_vai_tro = 'ROLE_SUPER_ADMIN'), -- Tự động lấy ID role
    NOW(), 
    NULL, 
    'Kích hoạt đặc quyền quản trị tối cao toàn diện hệ thống', 
    NOW(), 
    NOW()
);

-- =======================================================================
-- BƯỚC 5: CẤP ĐẶC QUYỀN TRỰC TIẾP CHO TÀI KHOẢN SUPER ADMIN 
-- (Bảng: nguoi_dung_quyen)
-- Tự động quét và copy các trường thuộc tính từ bảng 'quyen' sang
-- =======================================================================
INSERT INTO nguoi_dung_quyen (
    id_nguoi_dung, 
    id_quyen, 
    id_don_vi, 
    ten_quyen, 
    loai_quyen, 
    duong_dan, 
    phuong_thuc_http, 
    thoi_gian, 
    thoi_gian_tao, 
    thoi_gian_cap_nhat
)
SELECT 
    (SELECT id FROM nguoi_dung WHERE ten_dang_nhap = 'admin'),  -- Tự động lấy ID của tài khoản admin
    id,                                                         -- Tự động lấy ID của từng quyền
    NULL,                                                       -- Super Admin không thuộc Đơn vị nào (NULL)
    ten_quyen,                                                  -- Ánh xạ trường ten_quyen
    loai_quyen,                                                 -- Ánh xạ trường loai_quyen
    duong_dan,                                                  -- Ánh xạ trường duong_dan
    phuong_thuc_http,                                           -- Ánh xạ trường phuong_thuc_http
    NOW(),                                                      -- Thời gian cấp đặc quyền
    NOW(),                                                      -- BaseEntity: thoi_gian_tao
    NOW()                                                       -- BaseEntity: thoi_gian_cap_nhat
FROM quyen;
