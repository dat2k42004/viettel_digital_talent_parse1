package com.example.backend.modules.procurement.service;

import com.example.backend.modules.procurement.dto.ChiTietDonHangPhanCungRequest;
import com.example.backend.modules.procurement.dto.ChiTietDonHangPhanCungResponse;
import com.example.backend.modules.procurement.dto.ChiTietDonHangPhanMemRequest;
import com.example.backend.modules.procurement.dto.ChiTietDonHangPhanMemResponse;
import com.example.backend.modules.procurement.dto.DonHangMuaSamRequest;
import com.example.backend.modules.procurement.dto.DonHangMuaSamResponse;
import com.example.backend.modules.procurement.dto.SelectOption;
import com.example.backend.modules.procurement.model.ChiTietDonHangPhanCung;
import com.example.backend.modules.procurement.model.ChiTietDonHangPhanMem;
import com.example.backend.modules.procurement.model.DonHangMuaSam;
import com.example.backend.modules.procurement.model.NhaCungCap;
import com.example.backend.modules.procurement.repository.ChiTietDonHangPhanCungRepository;
import com.example.backend.modules.procurement.repository.ChiTietDonHangPhanMemRepository;
import com.example.backend.modules.procurement.repository.DonHangMuaSamRepository;
import com.example.backend.modules.procurement.repository.NhaCungCapRepository;
import com.example.backend.modules.procurement.service.interfaces.DonHangMuaSamService;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.tenant.DonViContextHolder;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonHangMuaSamServiceImpl implements DonHangMuaSamService {

     private final DonHangMuaSamRepository donHangMuaSamRepository;
     private final ChiTietDonHangPhanCungRepository chiTietDonHangPhanCungRepository;
     private final ChiTietDonHangPhanMemRepository chiTietDonHangPhanMemRepository;
     private final NhaCungCapRepository nhaCungCapRepository;

     @Override
     @Transactional(readOnly = true)
     public PageResponse<DonHangMuaSamResponse> layDanhSach(String maDonHang, Long idNhaCungCap, String trangThai,
               int page, int size, String sort) {
          String[] sortParts = sort.split(",");
          Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
          String sortBy = sortParts[0];

          PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));
          Long currentTenantId = DonViContextHolder.getTenantId();

          Specification<DonHangMuaSam> spec = (root, query, cb) -> {
               List<Predicate> predicates = new ArrayList<>();

               predicates.add(cb.isNull(root.get("thoiGianXoa")));
               predicates.add(cb.equal(root.get("idDonVi"), currentTenantId));

               if (maDonHang != null && !maDonHang.trim().isEmpty()) {
                    predicates.add(
                              cb.like(cb.lower(root.get("maDonHang")), "%" + maDonHang.trim().toLowerCase() + "%"));
               }

               if (idNhaCungCap != null) {
                    predicates.add(cb.equal(root.get("nhaCungCap").get("id"), idNhaCungCap));
               }

               if (trangThai != null && !trangThai.trim().isEmpty()) {
                    predicates.add(cb.equal(root.get("trangThai"), trangThai.trim()));
               }

               return cb.and(predicates.toArray(new Predicate[0]));
          };

          Page<DonHangMuaSam> pageResult = donHangMuaSamRepository.findAll(spec, pageRequest);
          Page<DonHangMuaSamResponse> responsePage = pageResult.map(this::mapToResponseWithoutDetails);
          return PageResponse.from(responsePage);
     }

     @Override
     @Transactional(readOnly = true)
     public DonHangMuaSamResponse layTheoId(Long id) {
          Long currentTenantId = DonViContextHolder.getTenantId();
          DonHangMuaSam dh = donHangMuaSamRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, currentTenantId)
                    .orElseThrow(() -> new NghiepVuException(
                              "Không tìm thấy đơn hàng mua sắm hoặc dữ liệu không thuộc quyền quản lý", 404));
          return mapToResponseWithDetails(dh);
     }

     @Override
     @Transactional(readOnly = true)
     public List<SelectOption> laySelectOptions() {
          Long currentTenantId = DonViContextHolder.getTenantId();
          List<DonHangMuaSam> danhSach = donHangMuaSamRepository
                    .findByIdDonViAndTrangThaiAndThoiGianXoaIsNull(currentTenantId, "HOAT_DONG");
          return danhSach.stream()
                    .map(dh -> SelectOption.builder()
                              .id(dh.getId())
                              .ten(dh.getMaDonHang())
                              .build())
                    .collect(Collectors.toList());
     }

     @Override
     @Transactional
     public DonHangMuaSamResponse themMoi(DonHangMuaSamRequest request) {
          Long currentTenantId = DonViContextHolder.getTenantId();

          NhaCungCap ncc = nhaCungCapRepository
                    .findByIdAndIdDonViAndThoiGianXoaIsNull(request.getIdNhaCungCap(), currentTenantId)
                    .orElseThrow(() -> new NghiepVuException(
                              "Nhà cung cấp lựa chọn không tồn tại hoặc không thuộc đơn vị", 400));

          DonHangMuaSam dh = new DonHangMuaSam();
          dh.setIdDonVi(currentTenantId);
          dh.setNhaCungCap(ncc);
          dh.setIdNguoiLap(request.getIdNguoiLap());
          dh.setIdNguoiPheDuyet(request.getIdNguoiPheDuyet());
          dh.setMaDonHang(request.getMaDonHang());
          dh.setSoHopDongDinhKem(request.getSoHopDongDinhKem());
          dh.setTongTienTruocThue(request.getTongTienTruocThue());
          dh.setThueVat(request.getThueVat());
          dh.setTongTienSauThue(request.getTongTienSauThue());
          dh.setThoiGianGiaoDuKien(request.getThoiGianGiaoDuKien());
          dh.setGhiChu(request.getGhiChu());
          dh.setTrangThai("CHO_PHE_DUYET");

          DonHangMuaSam savedDh = donHangMuaSamRepository.save(dh);

          if (request.getChiTietPhanCung() != null) {
               for (ChiTietDonHangPhanCungRequest pcReq : request.getChiTietPhanCung()) {
                    ChiTietDonHangPhanCung pc = new ChiTietDonHangPhanCung();
                    pc.setDonHangMuaSam(savedDh);
                    pc.setIdTaiSanPhanCung(pcReq.getIdTaiSanPhanCung());
                    pc.setSoLuongDat(pcReq.getSoLuongDat());
                    pc.setDonGiaDat(pcReq.getDonGiaDat());
                    pc.setThanhTien(pcReq.getDonGiaDat().multiply(java.math.BigDecimal.valueOf(pcReq.getSoLuongDat())));
                    pc.setSoLuongDaNhap(0);
                    pc.setGhiChu(pcReq.getGhiChu());
                    chiTietDonHangPhanCungRepository.save(pc);
               }
          }

          if (request.getChiTietPhanMem() != null) {
               for (ChiTietDonHangPhanMemRequest pmReq : request.getChiTietPhanMem()) {
                    ChiTietDonHangPhanMem pm = new ChiTietDonHangPhanMem();
                    pm.setDonHangMuaSam(savedDh);
                    pm.setIdTaiSanPhanMem(pmReq.getIdTaiSanPhanMem());
                    pm.setSoLuongDat(pmReq.getSoLuongDat());
                    pm.setDonGiaDat(pmReq.getDonGiaDat());
                    pm.setThanhTien(pmReq.getDonGiaDat().multiply(java.math.BigDecimal.valueOf(pmReq.getSoLuongDat())));
                    pm.setSoLuongDaNhap(0);
                    pm.setGhiChu(pmReq.getGhiChu());
                    chiTietDonHangPhanMemRepository.save(pm);
               }
          }

          return mapToResponseWithDetails(savedDh);
     }

     @Override
     @Transactional
     public DonHangMuaSamResponse capNhat(Long id, DonHangMuaSamRequest request) {
          Long currentTenantId = DonViContextHolder.getTenantId();
          DonHangMuaSam dh = donHangMuaSamRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, currentTenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin đơn hàng mua sắm cần chỉnh sửa",
                              404));

          if (!"CHO_PHE_DUYET".equals(dh.getTrangThai())) {
               throw new NghiepVuException("Chỉ được sửa đơn hàng khi ở trạng thái CHO_PHE_DUYET", 400);
          }

          NhaCungCap ncc = nhaCungCapRepository
                    .findByIdAndIdDonViAndThoiGianXoaIsNull(request.getIdNhaCungCap(), currentTenantId)
                    .orElseThrow(() -> new NghiepVuException("Nhà cung cấp lựa chọn không tồn tại", 400));

          dh.setNhaCungCap(ncc);
          dh.setIdNguoiLap(request.getIdNguoiLap());
          dh.setMaDonHang(request.getMaDonHang());
          dh.setSoHopDongDinhKem(request.getSoHopDongDinhKem());
          dh.setTongTienTruocThue(request.getTongTienTruocThue());
          dh.setThueVat(request.getThueVat());
          dh.setTongTienSauThue(request.getTongTienSauThue());
          dh.setThoiGianGiaoDuKien(request.getThoiGianGiaoDuKien());
          dh.setGhiChu(request.getGhiChu());

          DonHangMuaSam savedDh = donHangMuaSamRepository.save(dh);

          // Xóa các chi tiết cũ để nạp lại theo cơ chế Aggregate Root phẳng
          List<ChiTietDonHangPhanCung> oldPcList = chiTietDonHangPhanCungRepository
                    .findByDonHangMuaSamAndThoiGianXoaIsNull(savedDh);
          for (ChiTietDonHangPhanCung pc : oldPcList) {
               pc.setThoiGianXoa(LocalDateTime.now());
               pc.setLyDoXoa("Cập nhật lại danh sách chi tiết đơn hàng");
               chiTietDonHangPhanCungRepository.save(pc);
          }

          List<ChiTietDonHangPhanMem> oldPmList = chiTietDonHangPhanMemRepository
                    .findByDonHangMuaSamAndThoiGianXoaIsNull(savedDh);
          for (ChiTietDonHangPhanMem pm : oldPmList) {
               pm.setThoiGianXoa(LocalDateTime.now());
               pm.setLyDoXoa("Cập nhật lại danh sách chi tiết đơn hàng");
               chiTietDonHangPhanMemRepository.save(pm);
          }

          // Thêm mới lại danh sách chi tiết từ Request
          if (request.getChiTietPhanCung() != null) {
               for (ChiTietDonHangPhanCungRequest pcReq : request.getChiTietPhanCung()) {
                    ChiTietDonHangPhanCung pc = new ChiTietDonHangPhanCung();
                    pc.setDonHangMuaSam(savedDh);
                    pc.setIdTaiSanPhanCung(pcReq.getIdTaiSanPhanCung());
                    pc.setSoLuongDat(pcReq.getSoLuongDat());
                    pc.setDonGiaDat(pcReq.getDonGiaDat());
                    pc.setThanhTien(pcReq.getDonGiaDat().multiply(java.math.BigDecimal.valueOf(pcReq.getSoLuongDat())));
                    pc.setSoLuongDaNhap(0);
                    pc.setGhiChu(pcReq.getGhiChu());
                    chiTietDonHangPhanCungRepository.save(pc);
               }
          }

          if (request.getChiTietPhanMem() != null) {
               for (ChiTietDonHangPhanMemRequest pmReq : request.getChiTietPhanMem()) {
                    ChiTietDonHangPhanMem pm = new ChiTietDonHangPhanMem();
                    pm.setDonHangMuaSam(savedDh);
                    pm.setIdTaiSanPhanMem(pmReq.getIdTaiSanPhanMem());
                    pm.setSoLuongDat(pmReq.getSoLuongDat());
                    pm.setDonGiaDat(pmReq.getDonGiaDat());
                    pm.setThanhTien(pmReq.getDonGiaDat().multiply(java.math.BigDecimal.valueOf(pmReq.getSoLuongDat())));
                    pm.setSoLuongDaNhap(0);
                    pm.setGhiChu(pmReq.getGhiChu());
                    chiTietDonHangPhanMemRepository.save(pm);
               }
          }

          return mapToResponseWithDetails(savedDh);
     }

     @Override
     @Transactional
     public void capNhatTrangThai(Long id, TrangThaiRequest request) {
          Long currentTenantId = DonViContextHolder.getTenantId();
          DonHangMuaSam dh = donHangMuaSamRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, currentTenantId)
                    .orElseThrow(() -> new NghiepVuException(
                              "Không tìm thấy thông tin đơn hàng mua sắm cần cập nhật trạng thái", 404));

          dh.setTrangThai(request.getTrangThai());
          donHangMuaSamRepository.save(dh);
     }

     @Override
     @Transactional
     public void xoaMem(Long id) {
          Long currentTenantId = DonViContextHolder.getTenantId();
          DonHangMuaSam dh = donHangMuaSamRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, currentTenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin đơn hàng mua sắm cần xóa", 404));

          dh.setThoiGianXoa(LocalDateTime.now());
          dh.setLyDoXoa("Xóa mềm từ luồng chức năng quản lý hệ thống");
          donHangMuaSamRepository.save(dh);
     }

     private DonHangMuaSamResponse mapToResponseWithoutDetails(DonHangMuaSam model) {
          return DonHangMuaSamResponse.builder()
                    .id(model.getId())
                    .idDonVi(model.getIdDonVi())
                    .idNhaCungCap(model.getNhaCungCap() != null ? model.getNhaCungCap().getId() : null)
                    .tenNhaCungCap(model.getNhaCungCap() != null ? model.getNhaCungCap().getTenNhaCungCap() : null)
                    .idNguoiLap(model.getIdNguoiLap())
                    .idNguoiPheDuyet(model.getIdNguoiPheDuyet())
                    .maDonHang(model.getMaDonHang())
                    .soHopDongDinhKem(model.getSoHopDongDinhKem())
                    .tongTienTruocThue(model.getTongTienTruocThue())
                    .thueVat(model.getThueVat())
                    .tongTienSauThue(model.getTongTienSauThue())
                    .thoiGianGiaoDuKien(model.getThoiGianGiaoDuKien())
                    .trangThai(model.getTrangThai())
                    .ghiChu(model.getGhiChu())
                    .thoiGianTao(model.getThoiGianTao())
                    .thoiGianCapNhat(model.getThoiGianCapNhat())
                    .build();
     }

     private DonHangMuaSamResponse mapToResponseWithDetails(DonHangMuaSam model) {
          DonHangMuaSamResponse response = mapToResponseWithoutDetails(model);

          List<ChiTietDonHangPhanCungResponse> pcList = chiTietDonHangPhanCungRepository
                    .findByDonHangMuaSamAndThoiGianXoaIsNull(model).stream()
                    .map(pc -> ChiTietDonHangPhanCungResponse.builder()
                              .id(pc.getId())
                              .idTaiSanPhanCung(pc.getIdTaiSanPhanCung())
                              .soLuongDat(pc.getSoLuongDat())
                              .donGiaDat(pc.getDonGiaDat())
                              .thanhTien(pc.getThanhTien())
                              .soLuongDaNhap(pc.getSoLuongDaNhap())
                              .ghiChu(pc.getGhiChu())
                              .thoiGianTao(pc.getThoiGianTao())
                              .thoiGianCapNhat(pc.getThoiGianCapNhat())
                              .build())
                    .collect(Collectors.toList());

          List<ChiTietDonHangPhanMemResponse> pmList = chiTietDonHangPhanMemRepository
                    .findByDonHangMuaSamAndThoiGianXoaIsNull(model).stream()
                    .map(pm -> ChiTietDonHangPhanMemResponse.builder()
                              .id(pm.getId())
                              .idTaiSanPhanMem(pm.getIdTaiSanPhanMem())
                              .soLuongDat(pm.getSoLuongDat())
                              .donGiaDat(pm.getDonGiaDat())
                              .thanhTien(pm.getThanhTien())
                              .soLuongDaNhap(pm.getSoLuongDaNhap())
                              .ghiChu(pm.getGhiChu())
                              .thoiGianTao(pm.getThoiGianTao())
                              .thoiGianCapNhat(pm.getThoiGianCapNhat())
                              .build())
                    .collect(Collectors.toList());

          response.setChiTietPhanCung(pcList);
          response.setChiTietPhanMem(pmList);
          return response;
     }
}