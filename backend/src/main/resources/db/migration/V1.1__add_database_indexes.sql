-- 1. DonVi
CREATE INDEX idx_don_vi_ma_trang_thai_xoa ON don_vi (ma_don_vi, trang_thai, thoi_gian_xoa);

-- 2. PhongBan
CREATE INDEX idx_phong_ban_don_vi_xoa ON phong_ban (id_don_vi, thoi_gian_xoa);
CREATE INDEX idx_phong_ban_ma_don_vi_xoa ON phong_ban (ma_phong_ban, id_don_vi, thoi_gian_xoa);

-- 3. ViTri
CREATE INDEX idx_vi_tri_don_vi_xoa ON vi_tri (id_don_vi, thoi_gian_xoa);
CREATE INDEX idx_vi_tri_ma_don_vi_xoa ON vi_tri (ma_vi_tri, id_don_vi, thoi_gian_xoa);

-- 4. DanhMucCauHinh
CREATE INDEX idx_dm_cau_hinh_ma_xoa ON danh_muc_cau_hinh (ma_cau_hinh, thoi_gian_xoa);

-- 5. CauHinhDonVi
CREATE INDEX idx_ch_don_vi_don_vi_xoa ON cau_hinh_don_vi (id_don_vi, thoi_gian_xoa);
CREATE INDEX idx_ch_don_vi_danh_muc_don_vi ON cau_hinh_don_vi (id_danh_muc_cau_hinh, id_don_vi, thoi_gian_xoa);

-- 6. NguoiDung
CREATE INDEX idx_nguoi_dung_ten_dang_nhap ON nguoi_dung (ten_dang_nhap, thoi_gian_xoa);
CREATE INDEX idx_nguoi_dung_email ON nguoi_dung (email, thoi_gian_xoa);
CREATE INDEX idx_nguoi_dung_don_vi ON nguoi_dung (id_don_vi, thoi_gian_xoa);

-- 7. VaiTro
CREATE INDEX idx_vai_tro_don_vi_xoa ON vai_tro (id_don_vi, thoi_gian_xoa);
CREATE INDEX idx_vai_tro_ma_don_vi_xoa ON vai_tro (ma_vai_tro, id_don_vi, thoi_gian_xoa);

-- 8. Quyen
CREATE INDEX idx_quyen_ma_xoa ON quyen (ma_quyen, thoi_gian_xoa);

-- 9. PhienDangNhap
CREATE INDEX idx_phien_token_truy_cap ON phien_dang_nhap (token_truy_cap(255), thoi_gian_xoa);
CREATE INDEX idx_phien_token_lam_moi ON phien_dang_nhap (token_lam_moi(255), thoi_gian_xoa);
CREATE INDEX idx_phien_nguoi_dung ON phien_dang_nhap (id_nguoi_dung, thoi_gian_xoa);

-- 10. NhatKyDangNhap
CREATE INDEX idx_nk_dang_nhap_nguoi_dung ON nhat_ky_dang_nhap (id_nguoi_dung);
CREATE INDEX idx_nk_dang_nhap_don_vi ON nhat_ky_dang_nhap (id_don_vi);

-- 11. MaXacThucOTP
CREATE INDEX idx_otp_nguoi_dung_loai_trang_thai ON ma_xac_thuc_otp (id_nguoi_dung, loai_ma, trang_thai, thoi_gian_tao DESC);

-- 12. Cac bang quan he nhieu-nhieu
CREATE INDEX idx_vai_tro_quyen_vai_tro_quyen ON vai_tro_quyen (id_vai_tro, id_quyen);
CREATE INDEX idx_nd_vai_tro_nguoi_dung_vai_tro ON nguoi_dung_vai_tro (id_nguoi_dung, id_vai_tro);
CREATE INDEX idx_nd_quyen_nguoi_dung_quyen ON nguoi_dung_quyen (id_nguoi_dung, id_quyen);
