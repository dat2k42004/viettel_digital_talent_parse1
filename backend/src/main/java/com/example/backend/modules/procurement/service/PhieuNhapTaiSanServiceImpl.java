package com.example.backend.modules.procurement.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.modules.procurement.dto.ChiTietNhapLinhKienRequest;
import com.example.backend.modules.procurement.dto.ChiTietNhapPhanCungRequest;
import com.example.backend.modules.procurement.dto.ChiTietNhapPhanMemRequest;
import com.example.backend.modules.procurement.dto.ChiTietNhapTaiSanGeneralResponse;
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
import com.example.backend.modules.auth.repository.NguoiDungRepository;
import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.asset.repository.TaiSanPhanCungRepository;
import com.example.backend.modules.asset.repository.TaiSanPhanMemRepository;
import com.example.backend.modules.asset.model.TaiSanPhanCung;
import com.example.backend.modules.asset.model.TaiSanPhanMem;
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

     private final NguoiDungRepository nguoiDungRepository;
     private final TaiSanPhanCungRepository taiSanPhanCungRepository;
     private final TaiSanPhanMemRepository taiSanPhanMemRepository;

     @Autowired
     @Lazy
     private RabbitTemplate rabbitTemplate;

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
                    try {
                         predicates.add(cb.equal(root.get("trangThai"),
                                   com.example.backend.shared.model.TrangThaiPhieuEnum.fromValue(trangThai.trim())));
                    } catch (IllegalArgumentException e) {
                         throw new NghiepVuException(e.getMessage(), 400);
                    }
               }

               return cb.and(predicates.toArray(new Predicate[0]));
          };

          Page<PhieuNhapTaiSan> pageResult = phieuNhapTaiSanRepository.findAll(spec, pageRequest);

          // Collect all user IDs to avoid N+1 queries
          java.util.Set<Long> userIds = new java.util.HashSet<>();
          for (PhieuNhapTaiSan p : pageResult.getContent()) {
               if (p.getIdNguoiNhap() != null) {
                    userIds.add(p.getIdNguoiNhap());
               }
          }

          java.util.Map<Long, String> userMap = new java.util.HashMap<>();
          if (!userIds.isEmpty()) {
               userMap = nguoiDungRepository.findAllById(userIds).stream()
                         .collect(Collectors.toMap(NguoiDung::getId, this::getHoTenNguoiDung));
          }

          final java.util.Map<Long, String> finalUserMap = userMap;
          List<PhieuNhapTaiSanResponse> responses = pageResult.getContent().stream()
                    .map(p -> mapToResponseWithoutDetails(p, finalUserMap))
                    .collect(Collectors.toList());

          return PageResponse.from(new org.springframework.data.domain.PageImpl<>(responses, pageRequest,
                    pageResult.getTotalElements()));
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
          pnts.setMaPhieuNhap("PN-" + currentTenantId + "-" + System.currentTimeMillis());
          pnts.setSoHoaDonVat(request.getSoHoaDonVat());
          pnts.setMaBienBanGiaoHang(request.getMaBienBanGiaoHang());
          pnts.setThoiGianNhapKho(
                    request.getThoiGianNhapKho() != null ? request.getThoiGianNhapKho() : LocalDateTime.now());
          pnts.setTrangThai(com.example.backend.shared.model.TrangThaiPhieuEnum.TAO_MOI);
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
                    pc.setGiaNhapThucTe(pcReq.getGiaNhapThuTe());
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

          if (pnts.getTrangThai() != com.example.backend.shared.model.TrangThaiPhieuEnum.TAO_MOI) {
               throw new NghiepVuException("Chỉ được sửa phiếu nhập tài sản khi ở trạng thái Tạo mới (TAO_MOI)", 400);
          }

          pnts.setIdNguoiNhap(request.getIdNguoiNhap());
          pnts.setSoHoaDonVat(request.getSoHoaDonVat());
          pnts.setMaBienBanGiaoHang(request.getMaBienBanGiaoHang());
          pnts.setThoiGianNhapKho(request.getThoiGianNhapKho());
          pnts.setGhiChu(request.getGhiChu());

          PhieuNhapTaiSan savedPnts = phieuNhapTaiSanRepository.save(pnts);

          // Clear dữ liệu mảng con cũ
          List<ChiTietNhapPhanCung> oldPc = chiTietNhapPhanCungRepository
                    .findByPhieuNhapTaiSanAndThoiGianXoaIsNull(savedPnts);
          if (!oldPc.isEmpty()) {
               chiTietNhapPhanCungRepository.deleteAll(oldPc);
          }

          List<ChiTietNhapLinhKien> oldLk = chiTietNhapLinhKienRepository
                    .findByPhieuNhapTaiSanAndThoiGianXoaIsNull(savedPnts);
          if (!oldLk.isEmpty()) {
               chiTietNhapLinhKienRepository.deleteAll(oldLk);
          }

          List<ChiTietNhapPhanMem> oldPm = chiTietNhapPhanMemRepository
                    .findByPhieuNhapTaiSanAndThoiGianXoaIsNull(savedPnts);
          if (!oldPm.isEmpty()) {
               chiTietNhapPhanMemRepository.deleteAll(oldPm);
          }

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
                    pc.setGiaNhapThucTe(pcReq.getGiaNhapThuTe());
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

          com.example.backend.shared.model.TrangThaiPhieuEnum targetStatus;
          try {
               targetStatus = com.example.backend.shared.model.TrangThaiPhieuEnum.fromValue(request.getTrangThai());
          } catch (IllegalArgumentException e) {
               throw new NghiepVuException(e.getMessage(), 400);
          }

          if (targetStatus != com.example.backend.shared.model.TrangThaiPhieuEnum.HOAN_THANH) {
               throw new NghiepVuException("Phiếu nhập tài sản chỉ có thể cập nhật trạng thái thành HOAN_THANH", 400);
          }

          if (!pnts.getTrangThai().canTransitionTo(targetStatus)) {
               throw new NghiepVuException("Không thể chuyển đổi trạng thái từ " + pnts.getTrangThai().getMoTa()
                         + " sang " + targetStatus.getMoTa(), 400);
          }

          pnts.setTrangThai(targetStatus);
          phieuNhapTaiSanRepository.save(pnts);

          // Cập nhật luôn đơn hàng mua sắm tương ứng thành hoàn thành
          DonHangMuaSam dh = pnts.getDonHangMuaSam();
          if (dh != null) {
               dh.setTrangThai(com.example.backend.shared.model.TrangThaiPhieuEnum.HOAN_THANH);
               donHangMuaSamRepository.save(dh);
          }

          // đẩy sự kiện đi cập nhật báo cáo tồn kho
          List<ChiTietNhapPhanCung> pcList = chiTietNhapPhanCungRepository
                    .findByPhieuNhapTaiSanAndThoiGianXoaIsNull(pnts);
          for (ChiTietNhapPhanCung pc : pcList) {
               if (pc.getIdDanhSachThietBiPhanCung() != null) {
                    com.example.backend.shared.dto.BienDongTonKhoEvent eventBus = com.example.backend.shared.dto.BienDongTonKhoEvent
                              .builder()
                              .idDonVi(currentTenantId)
                              .idTaiSanCuThe(pc.getIdDanhSachThietBiPhanCung())
                              .loaiTaiSan("PHAN_CUNG")
                              .idViTriKho(1L) // Mặc định ID phân khu kho bãi tiếp nhận (ví dụ: 1L) hoặc bổ sung trường
                                              // idViTri từ Request
                              .viTriKhoChiTiet(
                                        pc.getTinhTrangLucNhap() != null ? pc.getTinhTrangLucNhap() : "Mới nhập kho")
                              .trangThaiMoi("SAN_SANG")
                              .idChungTuGoc(pnts.getId())
                              .maChungTuGoc(pnts.getMaPhieuNhap())
                              .hanhDong(com.example.backend.shared.dto.HanhDongTonKhoEnum.NHAP_KHO)
                              .build();

                    rabbitTemplate.convertAndSend("inventory.bien-dong-ton-kho.queue", eventBus);
               }
          }

          List<ChiTietNhapLinhKien> lkList = chiTietNhapLinhKienRepository
                    .findByPhieuNhapTaiSanAndThoiGianXoaIsNull(pnts);
          for (ChiTietNhapLinhKien lk : lkList) {
               if (lk.getIdLinhKienPhanCung() != null) {
                    com.example.backend.shared.dto.BienDongTonKhoEvent eventBus = com.example.backend.shared.dto.BienDongTonKhoEvent
                              .builder()
                              .idDonVi(currentTenantId)
                              .idTaiSanCuThe(lk.getIdLinhKienPhanCung())
                              .loaiTaiSan("LINH_KIEN")
                              .idViTriKho(1L)
                              .viTriKhoChiTiet(
                                        lk.getTinhTrangLucNhap() != null ? lk.getTinhTrangLucNhap() : "Linh kiện mới")
                              .trangThaiMoi("SAN_SANG")
                              .idChungTuGoc(pnts.getId())
                              .maChungTuGoc(pnts.getMaPhieuNhap())
                              .hanhDong(com.example.backend.shared.dto.HanhDongTonKhoEnum.NHAP_KHO)
                              .build();

                    rabbitTemplate.convertAndSend("inventory.bien-dong-ton-kho.queue", eventBus);
               }
          }

          List<ChiTietNhapPhanMem> pmList = chiTietNhapPhanMemRepository
                    .findByPhieuNhapTaiSanAndThoiGianXoaIsNull(pnts);
          for (ChiTietNhapPhanMem pm : pmList) {
               if (pm.getIdDanhSachThietBiPhanMem() != null) {
                    com.example.backend.shared.dto.BienDongTonKhoEvent eventBus = com.example.backend.shared.dto.BienDongTonKhoEvent
                              .builder()
                              .idDonVi(currentTenantId)
                              .idTaiSanCuThe(pm.getIdDanhSachThietBiPhanMem())
                              .loaiTaiSan("PHAN_MEM")
                              .idViTriKho(1L)
                              .viTriKhoChiTiet("Kích hoạt bản quyền")
                              .trangThaiMoi("SAN_SANG")
                              .idChungTuGoc(pnts.getId())
                              .maChungTuGoc(pnts.getMaPhieuNhap())
                              .hanhDong(com.example.backend.shared.dto.HanhDongTonKhoEnum.NHAP_KHO)
                              .build();

                    rabbitTemplate.convertAndSend("inventory.bien-dong-ton-kho.queue", eventBus);
               }
          }
     }

     @Override
     @Transactional
     public void xoaMem(Long id) {
          Long currentTenantId = DonViContextHolder.getTenantId();
          PhieuNhapTaiSan pnts = phieuNhapTaiSanRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, currentTenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin phiếu nhập cần xóa", 404));

          if (pnts.getTrangThai() != com.example.backend.shared.model.TrangThaiPhieuEnum.TAO_MOI) {
               throw new NghiepVuException("Chỉ được xóa phiếu nhập tài sản khi ở trạng thái Tạo mới", 400);
          }

          pnts.setThoiGianXoa(LocalDateTime.now());
          pnts.setLyDoXoa("Xóa mềm từ luồng nghiệp vụ kho");
          phieuNhapTaiSanRepository.save(pnts);
     }

     private PhieuNhapTaiSanResponse mapToResponseWithoutDetails(PhieuNhapTaiSan model,
               java.util.Map<Long, String> userMap) {
          return PhieuNhapTaiSanResponse.builder()
                    .id(model.getId())
                    .idDonVi(model.getIdDonVi())
                    .idDonHangMuaSam(model.getDonHangMuaSam() != null ? model.getDonHangMuaSam().getId() : null)
                    .maDonHangMuaSam(model.getDonHangMuaSam() != null ? model.getDonHangMuaSam().getMaDonHang() : null)
                    .tenNguoiNhap(model.getIdNguoiNhap() != null ? userMap.get(model.getIdNguoiNhap()) : null)
                    .maPhieuNhap(model.getMaPhieuNhap())
                    .soHoaDonVat(model.getSoHoaDonVat())
                    .maBienBanGiaoHang(model.getMaBienBanGiaoHang())
                    .thoiGianNhapKho(model.getThoiGianNhapKho())
                    .trangThai(model.getTrangThai() != null ? model.getTrangThai().getValue() : null)
                    .ghiChu(model.getGhiChu())
                    .thoiGianTao(model.getThoiGianTao())
                    .thoiGianCapNhat(model.getThoiGianCapNhat())
                    .build();
     }

     private PhieuNhapTaiSanResponse mapToResponseWithDetails(PhieuNhapTaiSan model) {
          java.util.Set<Long> userIds = new java.util.HashSet<>();
          if (model.getIdNguoiNhap() != null) {
               userIds.add(model.getIdNguoiNhap());
          }

          java.util.Map<Long, String> userMap = new java.util.HashMap<>();
          if (!userIds.isEmpty()) {
               userMap = nguoiDungRepository.findAllById(userIds).stream()
                         .collect(Collectors.toMap(NguoiDung::getId, this::getHoTenNguoiDung));
          }

          PhieuNhapTaiSanResponse response = mapToResponseWithoutDetails(model, userMap);

          List<ChiTietNhapTaiSanGeneralResponse> chiTietList = new ArrayList<>();

          // Fetch all items from repositories
          List<ChiTietNhapPhanCung> pcList = chiTietNhapPhanCungRepository
                    .findByPhieuNhapTaiSanAndThoiGianXoaIsNull(model);
          List<ChiTietNhapLinhKien> lkList = chiTietNhapLinhKienRepository
                    .findByPhieuNhapTaiSanAndThoiGianXoaIsNull(model);
          List<ChiTietNhapPhanMem> pmList = chiTietNhapPhanMemRepository
                    .findByPhieuNhapTaiSanAndThoiGianXoaIsNull(model);

          // Collect asset IDs
          java.util.Set<Long> pcIds = new java.util.HashSet<>();
          for (ChiTietNhapPhanCung pc : pcList) {
               if (pc.getIdTaiSanPhanCung() != null) {
                    pcIds.add(pc.getIdTaiSanPhanCung());
               }
          }
          for (ChiTietNhapLinhKien lk : lkList) {
               if (lk.getIdTaiSanPhanCung() != null) {
                    pcIds.add(lk.getIdTaiSanPhanCung());
               }
          }

          java.util.Set<Long> pmIds = new java.util.HashSet<>();
          for (ChiTietNhapPhanMem pm : pmList) {
               if (pm.getIdTaiSanPhanMem() != null) {
                    pmIds.add(pm.getIdTaiSanPhanMem());
               }
          }

          // Fetch asset names in batch
          java.util.Map<Long, String> pcNameMap = new java.util.HashMap<>();
          if (!pcIds.isEmpty()) {
               pcNameMap = taiSanPhanCungRepository.findAllById(pcIds).stream()
                         .collect(Collectors.toMap(TaiSanPhanCung::getId, TaiSanPhanCung::getTenMau));
          }

          java.util.Map<Long, String> pmNameMap = new java.util.HashMap<>();
          if (!pmIds.isEmpty()) {
               pmNameMap = taiSanPhanMemRepository.findAllById(pmIds).stream()
                         .collect(Collectors.toMap(TaiSanPhanMem::getId, TaiSanPhanMem::getTenMau));
          }

          // Map hardware
          for (ChiTietNhapPhanCung pc : pcList) {
               chiTietList.add(ChiTietNhapTaiSanGeneralResponse.builder()
                         .id(pc.getId())
                         .idTaiSan(pc.getIdTaiSanPhanCung())
                         .tenTaiSan(pc.getIdTaiSanPhanCung() != null ? pcNameMap.get(pc.getIdTaiSanPhanCung()) : null)
                         .idThietBi(pc.getIdDanhSachThietBiPhanCung())
                         .idChiTietDonHang(
                                   pc.getChiTietDonHangPhanCung() != null ? pc.getChiTietDonHangPhanCung().getId()
                                             : null)
                         .giaNhapThucTe(pc.getGiaNhapThucTe())
                         .tinhTrangLucNhap(pc.getTinhTrangLucNhap())
                         .soLuongGheNhap(null)
                         .loai("PHAN_CUNG")
                         .thoiGianTao(pc.getThoiGianTao())
                         .thoiGianCapNhat(pc.getThoiGianCapNhat())
                         .build());
          }

          // Map linh kien
          for (ChiTietNhapLinhKien lk : lkList) {
               chiTietList.add(ChiTietNhapTaiSanGeneralResponse.builder()
                         .id(lk.getId())
                         .idTaiSan(lk.getIdTaiSanPhanCung())
                         .tenTaiSan(lk.getIdTaiSanPhanCung() != null ? pcNameMap.get(lk.getIdTaiSanPhanCung()) : null)
                         .idThietBi(lk.getIdLinhKienPhanCung())
                         .idChiTietDonHang(
                                   lk.getChiTietDonHangPhanCung() != null ? lk.getChiTietDonHangPhanCung().getId()
                                             : null)
                         .giaNhapThucTe(lk.getGiaNhapThucTe())
                         .tinhTrangLucNhap(lk.getTinhTrangLucNhap())
                         .soLuongGheNhap(null)
                         .loai("LINH_KIEN")
                         .thoiGianTao(lk.getThoiGianTao())
                         .thoiGianCapNhat(lk.getThoiGianCapNhat())
                         .build());
          }

          // Map software
          for (ChiTietNhapPhanMem pm : pmList) {
               chiTietList.add(ChiTietNhapTaiSanGeneralResponse.builder()
                         .id(pm.getId())
                         .idTaiSan(pm.getIdTaiSanPhanMem())
                         .tenTaiSan(pm.getIdTaiSanPhanMem() != null ? pmNameMap.get(pm.getIdTaiSanPhanMem()) : null)
                         .idThietBi(pm.getIdDanhSachThietBiPhanMem())
                         .idChiTietDonHang(
                                   pm.getChiTietDonHangPhanMem() != null ? pm.getChiTietDonHangPhanMem().getId() : null)
                         .giaNhapThucTe(pm.getGiaNhapThucTe())
                         .tinhTrangLucNhap(null)
                         .soLuongGheNhap(pm.getSoLuongGheNhap())
                         .loai("PHAN_MEM")
                         .thoiGianTao(pm.getThoiGianTao())
                         .thoiGianCapNhat(pm.getThoiGianCapNhat())
                         .build());
          }

          response.setChiTietTaiSan(chiTietList);
          return response;
     }

     private String getHoTenNguoiDung(NguoiDung nd) {
          if (nd == null)
               return null;
          StringBuilder sb = new StringBuilder();
          if (nd.getHoNguoiDung() != null)
               sb.append(nd.getHoNguoiDung().trim()).append(" ");
          if (nd.getTenDemNguoiDung() != null)
               sb.append(nd.getTenDemNguoiDung().trim()).append(" ");
          if (nd.getTenNguoiDung() != null)
               sb.append(nd.getTenNguoiDung().trim());
          return sb.toString().trim();
     }
}
