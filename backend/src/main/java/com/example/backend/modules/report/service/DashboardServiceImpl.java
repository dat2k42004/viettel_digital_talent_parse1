package com.example.backend.modules.report.service;

import com.example.backend.modules.report.dto.ThongKeTongQuanDashboardResponse;
import com.example.backend.modules.report.model.BaoCaoBaoTri;
import com.example.backend.modules.report.model.BaoCaoCapPhat;
import com.example.backend.modules.report.model.BaoCaoTonKho;
import com.example.backend.modules.report.repository.BaoCaoBaoTriRepository;
import com.example.backend.modules.report.repository.BaoCaoCapPhatRepository;
import com.example.backend.modules.report.repository.BaoCaoTonKhoRepository;
import com.example.backend.modules.report.service.interfaces.DashboardService;
import com.example.backend.modules.tenant.model.DonVi;
import com.example.backend.modules.tenant.repository.DonViRepository;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanCungRepository;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanMemRepository;
import com.example.backend.modules.asset.repository.LinhKienPhanCungRepository;
import com.example.backend.modules.lifecycle.repository.PhieuCapPhatTaiSanRepository;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.model.TrangThaiPhieuEnum;
import com.example.backend.shared.tenant.DonViContextHolder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {

     private final BaoCaoTonKhoRepository baoCaoTonKhoRepository;
     private final BaoCaoCapPhatRepository baoCaoCapPhatRepository;
     private final BaoCaoBaoTriRepository baoCaoBaoTriRepository;
     private final DonViRepository donViRepository;
     private final DanhSachThietBiPhanCungRepository thietBiPhanCungRepository;
     private final DanhSachThietBiPhanMemRepository thietBiPhanMemRepository;
     private final LinhKienPhanCungRepository linhKienPhanCungRepository;
     private final PhieuCapPhatTaiSanRepository phieuCapPhatTaiSanRepository;

     @Override
     @Transactional(readOnly = true)
     public ThongKeTongQuanDashboardResponse layThongKeDonViAdmin() {
          Long idDonVi = DonViContextHolder.getTenantId();
          if (idDonVi == null) {
               throw new NghiepVuException("Quyền truy cập bị từ chối. Không xác định được đơn vị quản lý", 403);
          }

          // CHUẨN PHÂN QUYỀN MỚI: Check theo danh sách chuỗi Authority tĩnh trong
          // UserDetails của mày
          boolean laQuanTriToanSan = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                    .anyMatch(a -> "XEM_QUAN_TRI_TOAN_SAN".equalsIgnoreCase(a.getAuthority()));
          if (laQuanTriToanSan) {
               throw new NghiepVuException("Quyền truy cập bị từ chối. Bạn chỉ được phép xem số liệu tổng hợp toàn sàn",
                         403);
          }

          // Thu thập số liệu tĩnh từ các Read Model Summary để render siêu tốc
          List<BaoCaoTonKho> listTonKho = baoCaoTonKhoRepository.findByIdDonViAndThoiGianXoaIsNull(idDonVi);
          List<BaoCaoCapPhat> listCapPhat = baoCaoCapPhatRepository.findByIdDonViAndThoiGianXoaIsNull(idDonVi);
          List<BaoCaoBaoTri> listBaoTri = baoCaoBaoTriRepository.findByIdDonViAndThoiGianXoaIsNull(idDonVi);

          long tongTonKho = listTonKho.stream().mapToLong(BaoCaoTonKho::getSoLuongTonKho).sum();
          long tongCapPhat = listCapPhat.stream().mapToLong(BaoCaoCapPhat::getSoLuongCap).sum();
          long tongSoLuongThietBi = tongTonKho + tongCapPhat;

          BigDecimal tongGiaTriTaiSanVnd = listCapPhat.stream()
                    .map(BaoCaoCapPhat::getTongGiaTriCap)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

          Map<String, Long> bieuDoTyLeTrangThai = new HashMap<>();
          bieuDoTyLeTrangThai.put("Sẵn sàng lưu kho", tongTonKho);
          bieuDoTyLeTrangThai.put("Đang cấp phát sử dụng", tongCapPhat);
          bieuDoTyLeTrangThai.put("Đang bảo trì sửa chữa",
                    listBaoTri.stream().mapToLong(BaoCaoBaoTri::getSoLuong).sum());

          Map<String, Long> bieuDoPhanBoPhongBan = listCapPhat.stream()
                    .filter(x -> x.getTenPhongBan() != null)
                    .collect(Collectors.groupingBy(
                              BaoCaoCapPhat::getTenPhongBan,
                              Collectors.summingLong(BaoCaoCapPhat::getSoLuongCap)));

          long choDuyetCapPhat = phieuCapPhatTaiSanRepository.countByIdDonViAndTrangThaiAndThoiGianXoaIsNull(idDonVi,
                    TrangThaiPhieuEnum.GUI_PHE_DUYET);

          return ThongKeTongQuanDashboardResponse.builder()
                    .idDonVi(idDonVi)
                    .tongSoLuongThietBi(tongSoLuongThietBi)
                    .tongGiaTriTaiSanVnd(tongGiaTriTaiSanVnd)
                    .soLuongYeuCauCapPhatChoDuyet(choDuyetCapPhat)
                    .soLuongYeuCauBaoHongChoDuyet(0L)
                    .bieuDoTyLeTrangThai(bieuDoTyLeTrangThai)
                    .bieuDoPhanBoPhongBan(bieuDoPhanBoPhongBan)
                    .build();
     }

     @Override
     @Transactional(readOnly = true)
     public Map<String, Object> layThongKeToanSanSuperAdmin() {
          Map<String, Object> result = new HashMap<>();

          long tongDonVi = donViRepository.countByThoiGianXoaIsNull();
          long tongPhanCung = thietBiPhanCungRepository.countByThoiGianXoaIsNull();
          long tongLinhKien = linhKienPhanCungRepository.countByThoiGianXoaIsNull(); // BỔ SUNG: Đếm số lượng linh kiện
                                                                                     // rời
          long tongPhanMem = thietBiPhanMemRepository.countByThoiGianXoaIsNull();

          result.put("tongTenantDonVi", tongDonVi);
          result.put("tongTaiSanPhanCung", tongPhanCung);
          result.put("tongTaiSanLinhKien", tongLinhKien); // BỔ SUNG: Đẩy dữ liệu linh kiện ra giao diện
          result.put("tongTaiSanPhanMem", tongPhanMem);

          List<BaoCaoCapPhat> allAllocations = baoCaoCapPhatRepository.findAll();
          Map<Long, Long> rawTenantCounts = allAllocations.stream()
                    .collect(Collectors.groupingBy(BaoCaoCapPhat::getIdDonVi,
                              Collectors.summingLong(BaoCaoCapPhat::getSoLuongCap)));

          Map<String, Long> bieuDoSoSanhTenant = new HashMap<>();
          rawTenantCounts.forEach((tenantId, count) -> {
               String tenDV = donViRepository.findById(tenantId)
                         .map(DonVi::getTenThuongMai).orElse("Doanh nghiệp #" + tenantId);
               bieuDoSoSanhTenant.put(tenDV, count);
          });
          result.put("bieuDoSoSanhTenant", bieuDoSoSanhTenant);

          return result;
     }
}