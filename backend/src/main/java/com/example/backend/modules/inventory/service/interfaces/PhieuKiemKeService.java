package com.example.backend.modules.inventory.service.interfaces;

import com.example.backend.modules.inventory.dto.*;
import com.example.backend.shared.response.PageResponse;
import java.time.LocalDate;
import java.util.List;

public interface PhieuKiemKeService {
     PhieuKiemKeResponse themMoi(PhieuKiemKeRequest request);

     PhieuKiemKeResponse capNhat(Long id, PhieuKiemKeRequest request);

     void xoaMem(Long id);

     void thucHienKiemKe(Long id, ExecuteKiemKeRequest request);

     List<TienDoPhongBanResponse> theoDoiTienDoThucHien(Long dotKiemKeId);

     void xacNhanHoanThanhPhongBan(Long id);

     PageResponse<PhieuKiemKeResponse> layDanhSach(String trangThai, Long idPhongBan, LocalDate tuNgay,
               LocalDate denNgay, int page, int size, String sort);

     PhieuKiemKeResponse layTheoId(Long id);

     TaiSanTheoPhongBanResponse layTaiSanTheoPhongBan(Long idPhongBan);

     List<LuaChonDotKiemKeResponse> layDotKiemKeKichHoat();

     void nhacNhoKiemKe();

     void nhacNhoTruongPhongKiemKe(Long idDotKiemKe);
}