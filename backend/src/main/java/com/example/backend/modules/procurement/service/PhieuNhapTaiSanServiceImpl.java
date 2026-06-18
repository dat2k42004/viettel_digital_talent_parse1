package com.example.backend.modules.procurement.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.modules.procurement.dto.ChiTietNhapLinhKienRequest;
import com.example.backend.modules.procurement.dto.ChiTietNhapLinhKienResponse;
import com.example.backend.modules.procurement.dto.ChiTietNhapPhanCungRequest;
import com.example.backend.modules.procurement.dto.ChiTietNhapPhanCungResponse;
import com.example.backend.modules.procurement.dto.ChiTietNhapPhanMemRequest;
import com.example.backend.modules.procurement.dto.ChiTietNhapPhanMemResponse;
import com.example.backend.modules.procurement.dto.PhieuNhapTaiSanRequest;
import com.example.backend.modules.procurement.dto.PhieuNhapTaiSanResponse;
import com.example.backend.modules.procurement.model.ChiTietDonHangPhanCung;
import com.example.backend.modules.procurement.model.ChiTietDonHangPhanMem;
import com.example.backend.modules.procurement.model.ChiTietNhapLinhKien;
import com.example.backend.modules.procurement.model.ChiTietNhapPhanCung;
import com.example.backend.modules.procurement.model.ChiTietNhapPhanMem;
import com.example.backend.modules.procurement.model.DonHangMuaSam;
import com.example.backend.modules.procurement.model.PhieuNhapTaiSan;
import com.example.backend.modules.procurement.repository.ChiTietDonHangPhanCungRepository;
import com.example.backend.modules.procurement.repository.ChiTietDonHangPhanMemRepository;
import com.example.backend.modules.procurement.repository.ChiTietNhapLinhKienRepository;
import com.example.backend.modules.procurement.repository.ChiTietNhapPhanCungRepository;
import com.example.backend.modules.procurement.repository.ChiTietNhapPhanMemRepository;
import com.example.backend.modules.procurement.repository.DonHangMuaSamRepository;
import com.example.backend.modules.procurement.repository.PhieuNhapTaiSanRepository;
import com.example.backend.modules.procurement.service.interfaces.PhieuNhapTaiSanService;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.tenant.DonViContextHolder;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PhieuNhapTaiSanServiceImpl implements PhieuNhapTaiSanService {

     private final PhieuNhapTaiSanRepository phieuNhapTaiSanRepository;
     private final ChiTietNhapPhanCungRepository chiTietNhapPhanCungRepository;
     private final ChiTietNhapLinhKienRepository chiTietNhapLinhKienRepository;
     private final ChiTietNhapPhanMemRepository chiTietNhapPhanMemRepository;

     private final DonHangMuaSamRepository donHangMuaSamRepository;
     private final ChiTietDonHangPhanCungRepository chiTietDonHangPhanCungRepository;
     private final ChiTietDonHangPhanMemRepository chiTietDonHangPhanMemRepository;

     @Override
     @Transactional(readOnly = true)
     public PageResponse<PhieuNhapTaiSanResponse> layDanhSach(String maPhieuNhap, String soHoaDonVat,
               Long idDonHangMuaSam, String trangThai, int page, int size, String sort) {
          String[] sortParts = sort.split(",");
          Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
          String sortBy = sortParts[0];

          PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));
          Long currentTenantId = DonViContextHolder.getTenantId();

          Specification<PhieuNhapTaiSan> spec = (root, query, cb) -> {
               List<Predicate> predicates = new ArrayList<>();

               predicates.add(cb.isNull(root.get("thoiGianXoa")));
               predicates.add(cb.equal(root.get("idDonVi"), currentTenantId));

               if (maPhieuNhap != null && !maPhieuNhap.trim().isEmpty()) {
                    predicates.add(
                              cb.like(cb.lower(root.get("maPhieuNhap")), "%" + maPhieuNhap.trim().toLowerCase() + "%"));
               }
               if (soHoaDonVat != null && !soHoaDonVat.trim().isEmpty()) {
                    predicates.add(
                              cb.like(cb.lower(root.get("soHoaDonVat")), "%" + soHoaDonVat.trim().toLowerCase() + "%"));
               }
               if (idDonHangMuaSam != null) {
                    predicates.add(cb.equal(root.get("donHangMuaSam").get("id"), idDonHangMuaSam));
               }
               if (trangThai != null && !trangThai.trim().isEmpty()) {
                    predicates.add(cb.equal(root.get("trangThai"), trangThai.trim()));
               }

               return cb.and(predicates.toArray(new Predicate[0]));
          };

          Page<PhieuNhapTaiSan> pageResult = phieuNhapTaiSanRepository.findAll(spec, pageRequest);
          Page<PhieuNhapTaiSanResponse> responsePage = pageResult.map(this::mapToResponseWithoutDetails);
          return PageResponse.from(responsePage);
     }

     @Override
     @Transactional(readOnly = true)
     public PhieuNhapTaiSanResponse layTheoId(Long id) {
          Long currentTenantId = DonViContextHolder.getTenantId();
          PhieuNhapTaiSan pnts = phieuNhapTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, currentTenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy phiếu nhập kho tài sản hợp lệ", 404));
          return mapToResponseWithDetails(pnts);
     }

     @Override
     @Transactional
     public PhieuNhapTaiSanResponse themMoi(PhieuNhapTaiSanRequest request) {
          Long currentTenantId = DonViContextHolder.getTenantId();

          DonHangMuaSam dh = donHangMuaSamRepository
                    .findByIdAndIdDonViAndThoiGianXoaIsNull(request.getIdDonHangMuaSam(), currentTenantId)
                    .orElseThrow(() -> new NghiepVuException("Đơn hàng mua sắm tham chiếu không tồn tại", 400));

          PhieuNhapTaiSan pnts = new PhieuNhapTaiSan();
          pnts.setIdDonVi(currentTenantId);
          pnts.setDonHangMuaSam(dh);
          pnts.setIdNguoiNhap(request.getIdNguoiNhap());
          pnts.setMaPhieuNhap(request.getMaPhieuNhap());
          pnts.setSoHoaDonVat(request.getSoHoaDonVat());
          pnts.setMaBienBanGiaoHang(request.getMaBienBanGiaoHang());
          pnts.setThoiGianNhapKho(
                    request.getThoiGianNhapKho() != null ? request.getThoiGianNhapKho() : LocalDateTime.now());
          pnts.setTrangThai("HOAN_THANH");
          pnts.setGhiChu(request.getGhiChu());

          PhieuNhapTaiSan savedPnts = phieuNhapTaiSanRepository.save(pnts);

          // Lưu chi tiết phần cứng
          if (request.getChiTietPhanCung() != null) {
               for (ChiTietNhapPhanCungRequest pcReq : request.getChiTietPhanCung()) {
                    ChiTietDonHangPhanCung ctdhPc = chiTietDonHangPhanCungRepository
                              .findById(pcReq.getIdChiTietDonHangPhanCung())
                              .orElseThrow(
                                        () -> new NghiepVuException("Chi tiết đặt hàng phần cứng không hợp lệ", 400));

                    ChiTietNhapPhanCung pc = new ChiTietNhapPhanCung();
                    pc.setPhieuNhapTaiSan(savedPnts);
                    pc.setIdTaiSanPhanCung(pcReq.getIdTaiSanPhanCung());
                    pc.setIdDanhSachThietBiPhanCung(pcReq.getIdDanhSachThietBiPhanCung());
                    pc.setChiTietDonHangPhanCung(ctdhPc);
                    pc.setGiaNhapThuTe(pcReq.getGiaNhapThuTe());
                    pc.setTinhTrangLucNhap(pcReq.getTinhTrangLucNhap());
                    chiTietNhapPhanCungRepository.save(pc);
               }
          }

          // Lưu chi tiết linh kiện
          if (request.getChiTietLinhKien() != null) {
               for (ChiTietNhapLinhKienRequest lkReq : request.getChiTietLinhKien()) {
                    ChiTietDonHangPhanCung ctdhPc = chiTietDonHangPhanCungRepository
                              .findById(lkReq.getIdChiTietDonHangPhanCung())
                              .orElseThrow(() -> new NghiepVuException(
                                        "Chi tiết đặt hàng liên kết linh kiện không hợp lệ", 400));

                    ChiTietNhapLinhKien lk = new ChiTietNhapLinhKien();
                    lk.setPhieuNhapTaiSan(savedPnts);
                    lk.setIdTaiSanPhanCung(lkReq.getIdTaiSanPhanCung());
                    lk.setIdLinhKienPhanCung(lkReq.getIdLinhKienPhanCung());
                    lk.setChiTietDonHangPhanCung(ctdhPc);
                    lk.setGiaNhapThucTe(lkReq.getGiaNhapThucTe());
                    lk.setTinhTrangLucNhap(lkReq.getTinhTrangLucNhap());
                    chiTietNhapLinhKienRepository.save(lk);
               }
          }

          // Lưu chi tiết phần mềm
          if (request.getChiTietPhanMem() != null) {
               for (ChiTietNhapPhanMemRequest pmReq : request.getChiTietPhanMem()) {
                    ChiTietDonHangPhanMem ctdhPm = chiTietDonHangPhanMemRepository
                              .findById(pmReq.getIdChiTietDonHangPhanMem())
                              .orElseThrow(() -> new NghiepVuException("Chi tiết đặt hàng phần mềm không hợp lệ", 400));

                    ChiTietNhapPhanMem pm = new ChiTietNhapPhanMem();
                    pm.setPhieuNhapTaiSan(savedPnts);
                    pm.setIdTaiSanPhanMem(pmReq.getIdTaiSanPhanMem());
                    pm.setIdDanhSachThietBiPhanMem(pmReq.getIdDanhSachThietBiPhanMem());
                    pm.setChiTietDonHangPhanMem(ctdhPm);
                    pm.setSoLuongGheNhap(pmReq.getSoLuongGheNhap());
                    pm.setGiaNhapThucTe(pmReq.getGiaNhapThucTe());
                    chiTietNhapPhanMemRepository.save(pm);
               }
          }

          return mapToResponseWithDetails(savedPnts);
     }

     @Override
     @Transactional
     public PhieuNhapTaiSanResponse capNhat(Long id, PhieuNhapTaiSanRequest request) {
          Long currentTenantId = DonViContextHolder.getTenantId();
          PhieuNhapTaiSan pnts = phieuNhapTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, currentTenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin phiếu nhập kho cần chỉnh sửa",
                              404));

          pnts.setIdNguoiNhap(request.getIdNguoiNhap());
          pnts.setMaPhieuNhap(request.getMaPhieuNhap());
          pnts.setSoHoaDonVat(request.getSoHoaDonVat());
          pnts.setMaBienBanGiaoHang(request.getMaBienBanGiaoHang());
          pnts.setThoiGianNhapKho(request.getThoiGianNhapKho());
          pnts.setGhiChu(request.getGhiChu());

          PhieuNhapTaiSan savedPnts = phieuNhapTaiSanRepository.save(pnts);

          // Clear dữ liệu mảng con cũ
          List<ChiTietNhapPhanCung> oldPc = chiTietNhapPhanCungRepository
                    .findByPhieuNhapTaiSanAndThoiGianXoaIsNull(savedPnts);
          oldPc.forEach(pc -> {
               pc.setThoiGianXoa(LocalDateTime.now());
               pc.setLyDoXoa("Cập nhật lại phiếu nhập");
               chiTietNhapPhanCungRepository.save(pc);
          });

          List<ChiTietNhapLinhKien> oldLk = chiTietNhapLinhKienRepository
                    .findByPhieuNhapTaiSanAndThoiGianXoaIsNull(savedPnts);
          oldLk.forEach(lk -> {
               lk.setThoiGianXoa(LocalDateTime.now());
               lk.setLyDoXoa("Cập nhật lại phiếu nhập");
               chiTietNhapLinhKienRepository.save(lk);
          });

          List<ChiTietNhapPhanMem> oldPm = chiTietNhapPhanMemRepository
                    .findByPhieuNhapTaiSanAndThoiGianXoaIsNull(savedPnts);
          oldPm.forEach(pm -> {
               pm.setThoiGianXoa(LocalDateTime.now());
               pm.setLyDoXoa("Cập nhật lại phiếu nhập");
               chiTietNhapPhanMemRepository.save(pm);
          });

          // Nạp lại dữ liệu mới từ request tựa như các phần khác của Đạt
          if (request.getChiTietPhanCung() != null) {
               for (ChiTietNhapPhanCungRequest pcReq : request.getChiTietPhanCung()) {
                    ChiTietDonHangPhanCung ctdhPc = chiTietDonHangPhanCungRepository
                              .findById(pcReq.getIdChiTietDonHangPhanCung()).orElseThrow();
                    ChiTietNhapPhanCung pc = new ChiTietNhapPhanCung();
                    pc.setPhieuNhapTaiSan(savedPnts);
                    pc.setIdTaiSanPhanCung(pcReq.getIdTaiSanPhanCung());
                    pc.setIdDanhSachThietBiPhanCung(pcReq.getIdDanhSachThietBiPhanCung());
                    pc.setChiTietDonHangPhanCung(ctdhPc);
                    pc.setGiaNhapThuTe(pcReq.getGiaNhapThuTe());
                    pc.setTinhTrangLucNhap(pcReq.getTinhTrangLucNhap());
                    chiTietNhapPhanCungRepository.save(pc);
               }
          }

          return mapToResponseWithDetails(savedPnts);
     }

     @Override
     @Transactional
     public void capNhatTrangThai(Long id, TrangThaiRequest request) {
          Long currentTenantId = DonViContextHolder.getTenantId();
          PhieuNhapTaiSan pnts = phieuNhapTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, currentTenantId)
                    .orElseThrow(() -> new NghiepVuException(
                              "Không tìm thấy thông tin phiếu nhập cần cập nhật trạng thái", 404));

          pnts.setTrangThai(request.getTrangThai());
          phieuNhapTaiSanRepository.save(pnts);
     }

     @Override
     @Transactional
     public void xoaMem(Long id) {
          Long currentTenantId = DonViContextHolder.getTenantId();
          PhieuNhapTaiSan pnts = phieuNhapTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, currentTenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin phiếu nhập cần xóa", 404));

          pnts.setThoiGianXoa(LocalDateTime.now());
          pnts.setLyDoXoa("Xóa mềm từ luồng nghiệp vụ kho");
          phieuNhapTaiSanRepository.save(pnts);
     }

     private PhieuNhapTaiSanResponse mapToResponseWithoutDetails(PhieuNhapTaiSan model) {
          return PhieuNhapTaiSanResponse.builder()
                    .id(model.getId())
                    .idDonVi(model.getIdDonVi())
                    .idDonHangMuaSam(model.getDonHangMuaSam() != null ? model.getDonHangMuaSam().getId() : null)
                    .maDonHangMuaSam(model.getDonHangMuaSam() != null ? model.getDonHangMuaSam().getMaDonHang() : null)
                    .idNguoiNhap(model.getIdNguoiNhap())
                    .maPhieuNhap(model.getMaPhieuNhap())
                    .soHoaDonVat(model.getSoHoaDonVat())
                    .maBienBanGiaoHang(model.getMaBienBanGiaoHang())
                    .thoiGianNhapKho(model.getThoiGianNhapKho())
                    .trangThai(model.getTrangThai())
                    .ghiChu(model.getGhiChu())
                    .thoiGianTao(model.getThoiGianTao())
                    .thoiGianCapNhat(model.getThoiGianCapNhat())
                    .build();
     }

     private PhieuNhapTaiSanResponse mapToResponseWithDetails(PhieuNhapTaiSan model) {
          PhieuNhapTaiSanResponse response = mapToResponseWithoutDetails(model);

          // Ép kiểu tường minh cho phần tử trong List của Stream để triệt tiêu hoàn toàn
          // lỗi không thể suy luận kiểu của Java Compiler
          List<ChiTietNhapPhanCungResponse> pcList = chiTietNhapPhanCungRepository
                    .findByPhieuNhapTaiSanAndThoiGianXoaIsNull(model).stream()
                    .map(pc -> ChiTietNhapPhanCungResponse.builder()
                              .id(pc.getId())
                              .idTaiSanPhanCung(pc.getIdTaiSanPhanCung())
                              .idDanhSachThietBiPhanCung(pc.getIdDanhSachThietBiPhanCung())
                              .idChiTietDonHangPhanCung(
                                        pc.getChiTietDonHangPhanCung() != null ? pc.getChiTietDonHangPhanCung().getId()
                                                  : null)
                              .giaNhapThuTe(pc.getGiaNhapThuTe())
                              .tinhTrangLucNhap(pc.getTinhTrangLucNhap())
                              .thoiGianTao(pc.getThoiGianTao())
                              .thoiGianCapNhat(pc.getThoiGianCapNhat())
                              .build())
                    .collect(Collectors.toList());

          List<ChiTietNhapLinhKienResponse> lkList = chiTietNhapLinhKienRepository
                    .findByPhieuNhapTaiSanAndThoiGianXoaIsNull(model).stream()
                    .map(lk -> ChiTietNhapLinhKienResponse.builder()
                              .id(lk.getId())
                              .idTaiSanPhanCung(lk.getIdTaiSanPhanCung())
                              .idLinhKienPhanCung(lk.getIdLinhKienPhanCung())
                              .idChiTietDonHangPhanCung(
                                        lk.getChiTietDonHangPhanCung() != null ? lk.getChiTietDonHangPhanCung().getId()
                                                  : null)
                              .giaNhapThucTe(lk.getGiaNhapThucTe())
                              .tinhTrangLucNhap(lk.getTinhTrangLucNhap())
                              .thoiGianTao(lk.getThoiGianTao())
                              .thoiGianCapNhat(lk.getThoiGianCapNhat())
                              .build())
                    .collect(Collectors.toList());

          List<ChiTietNhapPhanMemResponse> pmList = chiTietNhapPhanMemRepository
                    .findByPhieuNhapTaiSanAndThoiGianXoaIsNull(model).stream()
                    .map(pm -> ChiTietNhapPhanMemResponse.builder()
                              .id(pm.getId())
                              .idTaiSanPhanMem(pm.getIdTaiSanPhanMem())
                              .idDanhSachThietBiPhanMem(pm.getIdDanhSachThietBiPhanMem())
                              .idChiTietDonHangPhanMem(
                                        pm.getChiTietDonHangPhanMem() != null ? pm.getChiTietDonHangPhanMem().getId()
                                                  : null)
                              .soLuongGheNhap(pm.getSoLuongGheNhap())
                              .giaNhapThucTe(pm.getGiaNhapThucTe())
                              .thoiGianTao(pm.getThoiGianTao())
                              .thoiGianCapNhat(pm.getThoiGianCapNhat())
                              .build())
                    .collect(Collectors.toList());

          response.setChiTietPhanCung(pcList);
          response.setChiTietLinhKien(lkList);
          response.setChiTietPhanMem(pmList);
          return response;
     }
}
