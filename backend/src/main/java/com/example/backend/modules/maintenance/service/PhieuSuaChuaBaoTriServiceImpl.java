package com.example.backend.modules.maintenance.service;

import com.example.backend.modules.maintenance.dto.*;
import com.example.backend.modules.maintenance.model.*;
import com.example.backend.modules.maintenance.repository.*;
import com.example.backend.modules.maintenance.service.interfaces.PhieuSuaChuaBaoTriService;
import com.example.backend.modules.asset.model.DanhSachThietBiPhanCung;
import com.example.backend.modules.asset.model.LinhKienPhanCung;
import com.example.backend.modules.asset.repository.DanhSachThietBiPhanCungRepository;
import com.example.backend.modules.asset.repository.LinhKienPhanCungRepository;
import com.example.backend.modules.asset.repository.TaiSanPhanCungRepository;
import com.example.backend.modules.auth.model.NguoiDung;
import com.example.backend.modules.auth.repository.NguoiDungRepository;
import com.example.backend.modules.auth.security.NguoiDungUserDetails;
import com.example.backend.modules.procurement.model.NhaCungCap;
import com.example.backend.modules.procurement.repository.NhaCungCapRepository;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.model.TrangThaiVanHanhEnum;
import com.example.backend.shared.model.TrangThaiPhieuEnum;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.tenant.DonViContextHolder;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhieuSuaChuaBaoTriServiceImpl implements PhieuSuaChuaBaoTriService {

     private final PhieuSuaChuaBaoTriRepository phieuSuaChuaBaoTriRepository;
     private final ChiTietBaoTriThietBiRepository chiTietBaoTriThietBiRepository;
     private final ChiTietBaoTriLinhKienRepository chiTietBaoTriLinhKienRepository;
     private final KeHoachBaoTriDinhKyRepository keHoachBaoTriDinhKyRepository;
     private final DanhSachThietBiPhanCungRepository thietBiPhanCungRepository;
     private final LinhKienPhanCungRepository linhKienPhanCungRepository;
     private final TaiSanPhanCungRepository taiSanPhanCungRepository;
     private final NhaCungCapRepository nhaCungCapRepository;
     private final NguoiDungRepository nguoiDungRepository;

     @Autowired
     @Lazy
     private RabbitTemplate rabbitTemplate;

     private Long getRequiredTenantId() {
          Long tenantId = DonViContextHolder.getTenantId();
          if (tenantId == null)
               throw new NghiepVuException("Không tìm thấy thông tin đơn vị từ phiên làm việc", 403);
          return tenantId;
     }

     private Long getCurrentUserId() {
          Authentication auth = SecurityContextHolder.getContext().getAuthentication();
          if (auth != null && auth.getPrincipal() instanceof NguoiDungUserDetails user) {
               return user.getNguoiDung().getId();
          }
          throw new NghiepVuException("Không tìm thấy thông tin nhân viên thao tác", 401);
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

     @Override
     @Transactional
     public PhieuSuaChuaBaoTriResponse themMoi(PhieuSuaChuaBaoTriRequest request) {
          Long tenantId = getRequiredTenantId();
          Long userId = getCurrentUserId();

          KeHoachBaoTriDinhKy kh = keHoachBaoTriDinhKyRepository
                    .findByIdAndIdDonViAndThoiGianXoaIsNull(request.getKeHoachBaoTriId(), tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy kế hoạch bảo trì định kỳ hợp lệ", 404));

          if (kh.getTrangThai() != TrangThaiPhieuEnum.DA_PHE_DUYET) {
               throw new NghiepVuException(
                         "Yêu cầu kế hoạch bảo trì định kỳ phải ở trạng thái Đã phê duyệt mới được lập phiếu", 400);
          }

          PhieuSuaChuaBaoTri phieu = new PhieuSuaChuaBaoTri();
          phieu.setIdDonVi(tenantId);
          phieu.setKeHoachBaoTriDinhKy(kh);
          phieu.setMaPhieuSuaChua("PSC-" + tenantId + "-" + System.currentTimeMillis());
          phieu.setIdNguoiLap(userId);
          phieu.setThoiGianLapPhieu(LocalDateTime.now());
          phieu.setThoiGianBatDau(request.getThoiGianBatDau());
          phieu.setThoiGianHoanThanhDuKien(request.getThoiGianHoanThanhDuKien());
          phieu.setTongChiPhiThucHien(BigDecimal.ZERO);
          phieu.setTrangThai(TrangThaiPhieuSuaChuaBaoTriEnum.TAO_MOI);
          phieu.setGhiChu(request.getGhiChu());

          PhieuSuaChuaBaoTri savedPhieu = phieuSuaChuaBaoTriRepository.save(phieu);

          // Lưu danh sách chi tiết thiết bị & Cập nhật trạng thái thiết bị sang KHÓA
          if (request.getDanhSachThietBi() != null) {
               for (ChiTietBaoTriThietBiRequest item : request.getDanhSachThietBi()) {
                    DanhSachThietBiPhanCung tb = thietBiPhanCungRepository
                              .findByIdAndIdDonViAndThoiGianXoaIsNull(item.getIdDanhSachThietBiPhanCung(), tenantId)
                              .orElseThrow(() -> new NghiepVuException(
                                        "Không tìm thấy thiết bị phần cứng ID: " + item.getIdDanhSachThietBiPhanCung(),
                                        400));

                    tb.setTrangThai(TrangThaiVanHanhEnum.KHOA);
                    thietBiPhanCungRepository.save(tb);

                    ChiTietBaoTriThietBi ct = new ChiTietBaoTriThietBi();
                    ct.setPhieuSuaChuaBaoTri(savedPhieu);
                    ct.setIdDanhSachThietBiPhanCung(tb.getId());
                    ct.setLoaiHinhXuLy(item.getLoaiHinhXuLy());
                    ct.setIdNhaCungCap("GUI_BAO_HANH".equalsIgnoreCase(item.getLoaiHinhXuLy()) ? tb.getIdNhaCungCap()
                              : item.getIdNhaCungCap());
                    ct.setTinhTrangThietBi(item.getTinhTrangThietBi());
                    ct.setTrangThaiThucHien(TrangThaiThucHienEnum.CHUA_GUI_DI);
                    ct.setChiPhi(item.getChiPhi() != null ? item.getChiPhi() : BigDecimal.ZERO);
                    chiTietBaoTriThietBiRepository.save(ct);
               }
          }

          // Lưu danh sách chi tiết linh kiện & Cập nhật trạng thái linh kiện sang KHÓA
          if (request.getDanhSachLinhKien() != null) {
               for (ChiTietBaoTriLinhKienRequest item : request.getDanhSachLinhKien()) {
                    LinhKienPhanCung lk = linhKienPhanCungRepository
                              .findByIdAndIdDonViAndThoiGianXoaIsNull(item.getIdLinhKienPhanCung(), tenantId)
                              .orElseThrow(() -> new NghiepVuException(
                                        "Không tìm thấy linh kiện ID: " + item.getIdLinhKienPhanCung(), 400));

                    lk.setTrangThai(TrangThaiVanHanhEnum.KHOA);
                    linhKienPhanCungRepository.save(lk);

                    ChiTietBaoTriLinhKien ct = new ChiTietBaoTriLinhKien();
                    ct.setPhieuSuaChuaBaoTri(savedPhieu);
                    ct.setIdLinhKienPhanCung(lk.getId());
                    ct.setLoaiHinhXuLy(item.getLoaiHinhXuLy());
                    ct.setIdNhaCungCap("GUI_BAO_HANH".equalsIgnoreCase(item.getLoaiHinhXuLy()) ? lk.getIdNhaCungCap()
                              : item.getIdNhaCungCap());
                    ct.setTinhTrangThietBi(item.getTinhTrangThietBi());
                    ct.setTrangThaiThucHien(TrangThaiThucHienEnum.CHUA_GUI_DI);
                    ct.setChiPhi(item.getChiPhi() != null ? item.getChiPhi() : BigDecimal.ZERO);
                    chiTietBaoTriLinhKienRepository.save(ct);
               }
          }

          return mapToResponse(savedPhieu, true);
     }

     @Override
     @Transactional
     public PhieuSuaChuaBaoTriResponse capNhat(Long id, PhieuSuaChuaBaoTriRequest request) {
          Long tenantId = getRequiredTenantId();
          PhieuSuaChuaBaoTri phieu = phieuSuaChuaBaoTriRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin phiếu sửa chữa bảo trì", 404));

          if (phieu.getTrangThai() != TrangThaiPhieuSuaChuaBaoTriEnum.TAO_MOI) {
               throw new NghiepVuException("Phiếu phải ở trạng thái Tạo mới (TAO_MOI) mới thực hiện sửa được", 400);
          }

          phieu.setThoiGianBatDau(request.getThoiGianBatDau());
          phieu.setThoiGianHoanThanhDuKien(request.getThoiGianHoanThanhDuKien());
          phieu.setGhiChu(request.getGhiChu());

          // Đối soát danh sách thiết bị
          List<ChiTietBaoTriThietBi> oldTbList = chiTietBaoTriThietBiRepository
                    .findByPhieuSuaChuaBaoTriIdAndThoiGianXoaIsNull(id);
          List<ChiTietBaoTriThietBiRequest> newTbReq = request.getDanhSachThietBi() != null
                    ? request.getDanhSachThietBi()
                    : new ArrayList<>();
          Set<Long> newTbIds = newTbReq.stream().map(ChiTietBaoTriThietBiRequest::getIdDanhSachThietBiPhanCung)
                    .collect(Collectors.toSet());

          // Xóa cứng các chi tiết bỏ chọn -> Cập nhật thiết bị về HOẠT ĐỘNG
          for (ChiTietBaoTriThietBi oldItem : oldTbList) {
               if (!newTbIds.contains(oldItem.getIdDanhSachThietBiPhanCung())) {
                    thietBiPhanCungRepository.findById(oldItem.getIdDanhSachThietBiPhanCung()).ifPresent(tb -> {
                         tb.setTrangThai(TrangThaiVanHanhEnum.HOAT_DONG);
                         thietBiPhanCungRepository.save(tb);
                    });
                    chiTietBaoTriThietBiRepository.delete(oldItem);
               }
          }
          // Thêm mới các chi tiết bổ sung -> Cập nhật thiết bị về KHÓA
          Map<Long, ChiTietBaoTriThietBi> oldTbMap = oldTbList.stream()
                    .collect(Collectors.toMap(ChiTietBaoTriThietBi::getIdDanhSachThietBiPhanCung, x -> x, (a, b) -> a));
          for (ChiTietBaoTriThietBiRequest req : newTbReq) {
               if (!oldTbMap.containsKey(req.getIdDanhSachThietBiPhanCung())) {
                    DanhSachThietBiPhanCung tb = thietBiPhanCungRepository
                              .findByIdAndIdDonViAndThoiGianXoaIsNull(req.getIdDanhSachThietBiPhanCung(), tenantId)
                              .orElseThrow(() -> new NghiepVuException("Không tìm thấy thiết bị phần cứng bổ sung ID: "
                                        + req.getIdDanhSachThietBiPhanCung(), 400));

                    tb.setTrangThai(TrangThaiVanHanhEnum.KHOA);
                    thietBiPhanCungRepository.save(tb);

                    ChiTietBaoTriThietBi ct = new ChiTietBaoTriThietBi();
                    ct.setPhieuSuaChuaBaoTri(phieu);
                    ct.setIdDanhSachThietBiPhanCung(tb.getId());
                    ct.setLoaiHinhXuLy(req.getLoaiHinhXuLy());
                    ct.setIdNhaCungCap("GUI_BAO_HANH".equalsIgnoreCase(req.getLoaiHinhXuLy()) ? tb.getIdNhaCungCap()
                              : req.getIdNhaCungCap());
                    ct.setTinhTrangThietBi(req.getTinhTrangThietBi());
                    ct.setTrangThaiThucHien(TrangThaiThucHienEnum.CHUA_GUI_DI);
                    ct.setChiPhi(req.getChiPhi() != null ? req.getChiPhi() : BigDecimal.ZERO); // standard cost
                                                                                               // setter mapping
                    ct.setChiPhi(req.getChiPhi() != null ? req.getChiPhi() : BigDecimal.ZERO);
                    chiTietBaoTriThietBiRepository.save(ct);
               }
          }

          // Đối soát danh sách linh kiện
          List<ChiTietBaoTriLinhKien> oldLkList = chiTietBaoTriLinhKienRepository
                    .findByPhieuSuaChuaBaoTriIdAndThoiGianXoaIsNull(id);
          List<ChiTietBaoTriLinhKienRequest> newLkReq = request.getDanhSachLinhKien() != null
                    ? request.getDanhSachLinhKien()
                    : new ArrayList<>();
          Set<Long> newLkIds = newLkReq.stream().map(ChiTietBaoTriLinhKienRequest::getIdLinhKienPhanCung)
                    .collect(Collectors.toSet());

          for (ChiTietBaoTriLinhKien oldItem : oldLkList) {
               if (!newLkIds.contains(oldItem.getIdLinhKienPhanCung())) {
                    linhKienPhanCungRepository.findById(oldItem.getIdLinhKienPhanCung()).ifPresent(lk -> {
                         lk.setTrangThai(TrangThaiVanHanhEnum.HOAT_DONG);
                         linhKienPhanCungRepository.save(lk);
                    });
                    chiTietBaoTriLinhKienRepository.delete(oldItem);
               }
          }
          Map<Long, ChiTietBaoTriLinhKien> oldLkMap = oldLkList.stream()
                    .collect(Collectors.toMap(ChiTietBaoTriLinhKien::getIdLinhKienPhanCung, x -> x, (a, b) -> a));
          for (ChiTietBaoTriLinhKienRequest req : newLkReq) {
               if (!oldLkMap.containsKey(req.getIdLinhKienPhanCung())) {
                    LinhKienPhanCung lk = linhKienPhanCungRepository
                              .findByIdAndIdDonViAndThoiGianXoaIsNull(req.getIdLinhKienPhanCung(), tenantId)
                              .orElseThrow(() -> new NghiepVuException(
                                        "Không tìm thấy linh kiện bổ sung ID: " + req.getIdLinhKienPhanCung(), 400));

                    lk.setTrangThai(TrangThaiVanHanhEnum.KHOA);
                    linhKienPhanCungRepository.save(lk);

                    ChiTietBaoTriLinhKien ct = new ChiTietBaoTriLinhKien();
                    ct.setPhieuSuaChuaBaoTri(phieu);
                    ct.setIdLinhKienPhanCung(lk.getId());
                    ct.setLoaiHinhXuLy(req.getLoaiHinhXuLy());
                    ct.setIdNhaCungCap("GUI_BAO_HANH".equalsIgnoreCase(req.getLoaiHinhXuLy()) ? lk.getIdNhaCungCap()
                              : req.getIdNhaCungCap());
                    ct.setTinhTrangThietBi(req.getTinhTrangThietBi());
                    ct.setTrangThaiThucHien(TrangThaiThucHienEnum.CHUA_GUI_DI);
                    ct.setChiPhi(req.getChiPhi() != null ? req.getChiPhi() : BigDecimal.ZERO);
                    chiTietBaoTriLinhKienRepository.save(ct);
               }
          }

          PhieuSuaChuaBaoTri saved = phieuSuaChuaBaoTriRepository.save(phieu);
          return mapToResponse(saved, true);
     }

     // ==========================================
     // CHỨC NĂNG 3: XÓA PHIẾU BẢO TRÌ SỬA CHỮA (XÓA MỀM)
     // ==========================================
     @Override
     @Transactional
     public void xoaMem(Long id) {
          Long tenantId = getRequiredTenantId();
          PhieuSuaChuaBaoTri phieu = phieuSuaChuaBaoTriRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin phiếu yêu cầu xóa", 404));

          if (phieu.getTrangThai() != TrangThaiPhieuSuaChuaBaoTriEnum.TAO_MOI) {
               throw new NghiepVuException("Phiếu phải ở trạng thái Tạo mới mới thực hiện xóa được", 400);
          }

          LocalDateTime now = LocalDateTime.now();
          phieu.setThoiGianXoa(now);
          phieu.setLyDoXoa("Xóa phiếu sửa chữa bảo trì tài sản");
          phieuSuaChuaBaoTriRepository.save(phieu);

          // Giải phóng hoàn trả toàn bộ thiết bị về trạng thái HOẠT ĐỘNG
          List<ChiTietBaoTriThietBi> tbList = chiTietBaoTriThietBiRepository
                    .findByPhieuSuaChuaBaoTriIdAndThoiGianXoaIsNull(id);
          for (ChiTietBaoTriThietBi ct : tbList) {
               ct.setThoiGianXoa(now);
               chiTietBaoTriThietBiRepository.save(ct);
               thietBiPhanCungRepository.findById(ct.getIdDanhSachThietBiPhanCung()).ifPresent(tb -> {
                    tb.setTrangThai(TrangThaiVanHanhEnum.HOAT_DONG);
                    thietBiPhanCungRepository.save(tb);
               });
          }

          // Giải phóng hoàn trả toàn bộ linh kiện về trạng thái HOẠT ĐỘNG
          List<ChiTietBaoTriLinhKien> lkList = chiTietBaoTriLinhKienRepository
                    .findByPhieuSuaChuaBaoTriIdAndThoiGianXoaIsNull(id);
          for (ChiTietBaoTriLinhKien ct : lkList) {
               ct.setThoiGianXoa(now);
               chiTietBaoTriLinhKienRepository.save(ct);
               linhKienPhanCungRepository.findById(ct.getIdLinhKienPhanCung()).ifPresent(lk -> {
                    lk.setTrangThai(TrangThaiVanHanhEnum.HOAT_DONG);
                    linhKienPhanCungRepository.save(lk);
               });
          }
     }

     // ==========================================
     // CHỨC NĂNG 4: GỬI YÊU CẦU PHÊ DUYỆT
     // ==========================================
     @Override
     @Transactional
     public void yeuCauPheDuyet(Long id) {
          Long tenantId = getRequiredTenantId();
          PhieuSuaChuaBaoTri phieu = phieuSuaChuaBaoTriRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin phiếu", 404));

          if (!phieu.getTrangThai().canTransitionTo(TrangThaiPhieuSuaChuaBaoTriEnum.GUI_PHE_DUYET)) {
               throw new NghiepVuException("Không được phép chuyển trạng thái phiếu từ "
                         + phieu.getTrangThai().getMoTa() + " sang Gửi phê duyệt", 400);
          }

          phieu.setTrangThai(TrangThaiPhieuSuaChuaBaoTriEnum.GUI_PHE_DUYET);
          phieuSuaChuaBaoTriRepository.save(phieu);
     }

     // ==========================================
     // CHỨC NĂNG 5: PHÊ DUYỆT PHIẾU
     // ==========================================
     @Override
     @Transactional
     public void pheDuyet(Long id) {
          Long tenantId = getRequiredTenantId();
          Long userId = getCurrentUserId();
          PhieuSuaChuaBaoTri phieu = phieuSuaChuaBaoTriRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin phiếu", 404));

          if (!phieu.getTrangThai().canTransitionTo(TrangThaiPhieuSuaChuaBaoTriEnum.DA_PHE_DUYET)) {
               throw new NghiepVuException("Không được phép chuyển trạng thái phiếu từ "
                         + phieu.getTrangThai().getMoTa() + " sang Đã phê duyệt", 400);
          }

          phieu.setTrangThai(TrangThaiPhieuSuaChuaBaoTriEnum.DA_PHE_DUYET);
          phieu.setIdNguoiPheDuyet(userId);
          phieuSuaChuaBaoTriRepository.save(phieu);
     }

     // ==========================================
     // CHỨC NĂNG 6: THEO DÕI & CẬP NHẬT TIẾN ĐỘ THỰC HIỆN TẬP TRUNG
     // ==========================================
     @Override
     @Transactional
     public void capNhatTienDoThucHien(Long id, List<TienDoBaoTriChiTietRequest> requestList) {
          Long tenantId = getRequiredTenantId();
          PhieuSuaChuaBaoTri phieu = phieuSuaChuaBaoTriRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException("Không tìm thấy thông tin phiếu bảo trì sửa chữa mục tiêu",
                              404));

          if (phieu.getTrangThai() != TrangThaiPhieuSuaChuaBaoTriEnum.DA_PHE_DUYET
                    && phieu.getTrangThai() != TrangThaiPhieuSuaChuaBaoTriEnum.DANG_THUC_HIEN) {
               throw new NghiepVuException(
                         "Phiếu phải ở trạng thái đã phê duyệt hoặc đang thực hiện mới cập nhật tiến độ được", 400);
          }

          for (TienDoBaoTriChiTietRequest item : requestList) {
               TrangThaiThucHienEnum itemStatusMoi = TrangThaiThucHienEnum.fromValue(item.getTrangThaiThucHienMoi());

               if ("THIET_BI".equalsIgnoreCase(item.getLoaiChiTiet())) {
                    ChiTietBaoTriThietBi ct = chiTietBaoTriThietBiRepository.findById(item.getIdChiTiet())
                              .orElseThrow(() -> new NghiepVuException(
                                        "Không tìm thấy chi tiết thiết bị ID: " + item.getIdChiTiet(), 400));

                    if (!ct.getTrangThaiThucHien().canTransitionTo(itemStatusMoi)) {
                         throw new NghiepVuException("Không thể cập nhật tiến độ dòng thiết bị từ "
                                   + ct.getTrangThaiThucHien().getMoTa() + " sang " + itemStatusMoi.getMoTa(), 400);
                    }

                    ct.setTrangThaiThucHien(itemStatusMoi);
                    if (item.getPhuongAnXuLy() != null)
                         ct.setPhuongAnXuLy(item.getPhuongAnXuLy());
                    if (item.getChiPhiThucTe() != null)
                         ct.setChiPhi(item.getChiPhiThucTe());
                    if (item.getIdLinhKienThayThe() != null)
                         ct.setIdLinhKienThayThe(item.getIdLinhKienThayThe());

                    // Đồng bộ máy trạng thái vật lý của Thiết bị phần cứng gốc
                    thietBiPhanCungRepository.findById(ct.getIdDanhSachThietBiPhanCung()).ifPresent(tb -> {
                         if (itemStatusMoi == TrangThaiThucHienEnum.DA_GUI_DI) {
                              tb.setTrangThai(TrangThaiVanHanhEnum.KHOA);
                         } else if (itemStatusMoi == TrangThaiThucHienEnum.DA_THU_LAI) {
                              tb.setTrangThai(TrangThaiVanHanhEnum.HOAT_DONG); // KHI HOÀN THÀNH (ĐÃ THU LẠI) -> ĐỔI VỀ
                                                                               // HOẠT ĐỘNG
                         }
                         thietBiPhanCungRepository.save(tb);
                    });
                    chiTietBaoTriThietBiRepository.save(ct);

               } else if ("LINH_KIEN".equalsIgnoreCase(item.getLoaiChiTiet())) {
                    ChiTietBaoTriLinhKien ct = chiTietBaoTriLinhKienRepository.findById(item.getIdChiTiet())
                              .orElseThrow(() -> new NghiepVuException(
                                        "Không tìm thấy chi tiết linh kiện ID: " + item.getIdChiTiet(), 400));

                    if (!ct.getTrangThaiThucHien().canTransitionTo(itemStatusMoi)) {
                         throw new NghiepVuException("Không thể cập nhật tiến độ dòng linh kiện từ "
                                   + ct.getTrangThaiThucHien().getMoTa() + " sang " + itemStatusMoi.getMoTa(), 400);
                    }

                    ct.setTrangThaiThucHien(itemStatusMoi);
                    if (item.getPhuongAnXuLy() != null)
                         ct.setPhuongAnXuLy(item.getPhuongAnXuLy());
                    if (item.getChiPhiThucTe() != null)
                         ct.setChiPhi(item.getChiPhiThucTe());

                    // Đồng bộ máy trạng thái vật lý của Linh kiện rời gốc
                    linhKienPhanCungRepository.findById(ct.getIdLinhKienPhanCung()).ifPresent(lk -> {
                         if (itemStatusMoi == TrangThaiThucHienEnum.DA_GUI_DI) {
                              lk.setTrangThai(TrangThaiVanHanhEnum.KHOA);
                         } else if (itemStatusMoi == TrangThaiThucHienEnum.DA_THU_LAI) {
                              lk.setTrangThai(TrangThaiVanHanhEnum.HOAT_DONG); // ĐỔI VỀ HOẠT ĐỘNG KHI THU HỒI XONG
                         }
                         linhKienPhanCungRepository.save(lk);
                    });
                    chiTietBaoTriLinhKienRepository.save(ct);
               }
          }

          // ĐỐI SOÁT ĐỂ ĐIỀU HƯỚNG TỰ ĐỘNG TRẠNG THÁI PHIẾU TỔNG
          List<ChiTietBaoTriThietBi> activeTb = chiTietBaoTriThietBiRepository
                    .findByPhieuSuaChuaBaoTriIdAndThoiGianXoaIsNull(id);
          List<ChiTietBaoTriLinhKien> activeLk = chiTietBaoTriLinhKienRepository
                    .findByPhieuSuaChuaBaoTriIdAndThoiGianXoaIsNull(id);

          boolean coItNhatMotCaiDaGuiDi = activeTb.stream()
                    .anyMatch(x -> x.getTrangThaiThucHien() == TrangThaiThucHienEnum.DA_GUI_DI)
                    || activeLk.stream().anyMatch(x -> x.getTrangThaiThucHien() == TrangThaiThucHienEnum.DA_GUI_DI);

          boolean tatCaDaThuLaiComplete = activeTb.stream()
                    .allMatch(x -> x.getTrangThaiThucHien() == TrangThaiThucHienEnum.DA_THU_LAI)
                    && activeLk.stream().allMatch(x -> x.getTrangThaiThucHien() == TrangThaiThucHienEnum.DA_THU_LAI);

          // Tính tổng kết chi phí thực hiện
          BigDecimal totalCost = BigDecimal.ZERO;
          for (ChiTietBaoTriThietBi tb : activeTb)
               totalCost = totalCost.add(tb.getChiPhi());
          for (ChiTietBaoTriLinhKien lk : activeLk)
               totalCost = totalCost.add(lk.getChiPhi());
          phieu.setTongChiPhiThucHien(totalCost);

          if (tatCaDaThuLaiComplete) {
               phieu.setTrangThai(TrangThaiPhieuSuaChuaBaoTriEnum.HOAN_THANH);
               phieu.setThoiGianHoanThanhThucTe(LocalDateTime.now());

               // >>> BẮT ĐẦU ĐOẠN CHÈN CODE BẮN SỰ KIỆN BẢO TRÌ CHẠY NGẦM <<<
               int soNgayGianDoan = 0;
               if (phieu.getThoiGianBatDau() != null && phieu.getThoiGianHoanThanhThucTe() != null) {
                    soNgayGianDoan = (int) java.time.temporal.ChronoUnit.DAYS.between(
                              phieu.getThoiGianBatDau(), phieu.getThoiGianHoanThanhThucTe());
                    if (soNgayGianDoan < 0)
                         soNgayGianDoan = 0;
               }

               // 1. Duyệt loạt thiết bị nghiệm thu thành công để bắn sang hàng đợi báo cáo
               for (ChiTietBaoTriThietBi tb : activeTb) {
                    com.example.backend.shared.dto.BienDongBaoTriEvent eventBus = com.example.backend.shared.dto.BienDongBaoTriEvent
                              .builder()
                              .idDonVi(tenantId)
                              .idTaiSanCuThe(tb.getIdDanhSachThietBiPhanCung())
                              .loaiTaiSan("PHAN_CUNG")
                              .idPhieuSuaChua(phieu.getId())
                              .maPhieuSuaChua(phieu.getMaPhieuSuaChua())
                              .chiPhiThucTe(tb.getChiPhi())
                              .thoiGianGianDoan(soNgayGianDoan)
                              .noiDungKhacPhuc(tb.getPhuongAnXuLy() != null ? tb.getPhuongAnXuLy()
                                        : "Sửa chữa thiết bị phần cứng")
                              .hanhDong(com.example.backend.shared.dto.HanhDongBaoTriEnum.GHI_NHAN_BAO_TRI)
                              .build();

                    rabbitTemplate.convertAndSend("inventory.bien-dong-bao-tri.queue", eventBus);
               }

               // 2. Duyệt loạt linh kiện nghiệm thu thành công để bắn sang hàng đợi báo cáo
               for (ChiTietBaoTriLinhKien lk : activeLk) {
                    com.example.backend.shared.dto.BienDongBaoTriEvent eventBus = com.example.backend.shared.dto.BienDongBaoTriEvent
                              .builder()
                              .idDonVi(tenantId)
                              .idTaiSanCuThe(lk.getIdLinhKienPhanCung())
                              .loaiTaiSan("LINH_KIEN")
                              .idPhieuSuaChua(phieu.getId())
                              .maPhieuSuaChua(phieu.getMaPhieuSuaChua())
                              .chiPhiThucTe(lk.getChiPhi())
                              .thoiGianGianDoan(soNgayGianDoan)
                              .noiDungKhacPhuc(lk.getPhuongAnXuLy() != null ? lk.getPhuongAnXuLy()
                                        : "Sửa chữa cấu phần linh kiện")
                              .hanhDong(com.example.backend.shared.dto.HanhDongBaoTriEnum.GHI_NHAN_BAO_TRI)
                              .build();

                    rabbitTemplate.convertAndSend("inventory.bien-dong-bao-tri.queue", eventBus);
               }
               // >>> KẾT THÚC ĐOẠN CHÈN CODE BẮN SỰ KIỆN <<<
          } else if (coItNhatMotCaiDaGuiDi) {
               phieu.setTrangThai(TrangThaiPhieuSuaChuaBaoTriEnum.DANG_THUC_HIEN);
          }

          phieuSuaChuaBaoTriRepository.save(phieu);
     }

     // ==========================================
     // CHỨC NĂNG 7: LẤY DANH SÁCH PHÂN TRANG (BATCH MAPPING CHỐNG N+1)
     // ==========================================
     @Override
     @Transactional(readOnly = true)
     public PageResponse<PhieuSuaChuaBaoTriResponse> layDanhSach(String trangThai, LocalDate tuNgay, LocalDate denNgay,
               int page, int size, String sort) {
          Long tenantId = DonViContextHolder.getTenantId();
          String[] sortParts = sort.split(",");
          Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
          PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortParts[0]));

          Specification<PhieuSuaChuaBaoTri> spec = (root, query, cb) -> {
               List<Predicate> predicates = new ArrayList<>();
               predicates.add(cb.isNull(root.get("thoiGianXoa")));
               if (tenantId != null) {
                    predicates.add(cb.equal(root.get("idDonVi"), tenantId));
               }

               if (trangThai != null && !trangThai.trim().isEmpty()) {
                    predicates.add(cb.equal(root.get("trangThai"),
                              TrangThaiPhieuSuaChuaBaoTriEnum.fromValue(trangThai.trim())));
               }
               if (tuNgay != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("thoiGianLapPhieu"), tuNgay.atStartOfDay()));
               }
               if (denNgay != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("thoiGianLapPhieu"), denNgay.atTime(LocalTime.MAX)));
               }
               return cb.and(predicates.toArray(new Predicate[0]));
          };

          Page<PhieuSuaChuaBaoTri> pageResult = phieuSuaChuaBaoTriRepository.findAll(spec, pageRequest);

          // Thu thập danh sách ID người dùng để Batch Mapping tăng tốc độ xử lý trên RAM
          Set<Long> userIds = new HashSet<>();
          for (PhieuSuaChuaBaoTri p : pageResult.getContent()) {
               if (p.getIdNguoiLap() != null)
                    userIds.add(p.getIdNguoiLap());
               if (p.getIdNguoiPheDuyet() != null)
                    userIds.add(p.getIdNguoiPheDuyet());
          }

          Map<Long, String> userMap = userIds.isEmpty() ? new HashMap<>()
                    : nguoiDungRepository.findAllByIdInAndThoiGianXoaIsNull(userIds).stream()
                              .collect(Collectors.toMap(NguoiDung::getId, this::getHoTenNguoiDung));

          List<PhieuSuaChuaBaoTriResponse> content = pageResult.getContent().stream()
                    .map(p -> PhieuSuaChuaBaoTriResponse.builder()
                              .id(p.getId()).idDonVi(p.getIdDonVi()).maPhieuSuaChua(p.getMaPhieuSuaChua())
                              .keHoachBaoTriId(
                                        p.getKeHoachBaoTriDinhKy() != null ? p.getKeHoachBaoTriDinhKy().getId() : null)
                              .maKeHoachBaoTri(
                                        p.getKeHoachBaoTriDinhKy() != null ? p.getKeHoachBaoTriDinhKy().getMaKeHoach()
                                                  : null)
                              .tenNguoiLap(userMap.get(p.getIdNguoiLap()))
                              .tenNguoiPheDuyet(userMap.get(p.getIdNguoiPheDuyet()))
                              .thoiGianLapPhieu(p.getThoiGianLapPhieu()).thoiGianBatDau(p.getThoiGianBatDau())
                              .thoiGianHoanThanhDuKien(p.getThoiGianHoanThanhDuKien())
                              .thoiGianHoanThanhThucTe(p.getThoiGianHoanThanhThucTe())
                              .tongChiPhiThucHien(p.getTongChiPhiThucHien()).trangThai(p.getTrangThai().getValue())
                              .ghiChu(p.getGhiChu())
                              .thoiGianTao(p.getThoiGianTao()).thoiGianCapNhat(p.getThoiGianCapNhat())
                              .chiTietTaiSan(new ArrayList<>()).build())
                    .collect(Collectors.toList());

          return PageResponse.from(new PageImpl<>(content, pageRequest, pageResult.getTotalElements()));
     }

     // ==========================================
     // CHỨC NĂNG 8: LẤY CHI TIẾT THEO ID (GỘP PHẲNG RESPONSE TRÁNH N+1)
     // ==========================================
     @Override
     @Transactional(readOnly = true)
     public PhieuSuaChuaBaoTriResponse layTheoId(Long id) {
          Long tenantId = getRequiredTenantId();
          PhieuSuaChuaBaoTri phieu = phieuSuaChuaBaoTriRepository.findByIdAndIdDonViAndThoiGianXoaIsNull(id, tenantId)
                    .orElseThrow(() -> new NghiepVuException(
                              "Không tìm thấy thông tin phiếu sửa chữa bảo trì tương ứng", 404));

          return mapToResponse(phieu, true);
     }

     private PhieuSuaChuaBaoTriResponse mapToResponse(PhieuSuaChuaBaoTri p, boolean includeDetails) {
          Set<Long> userIds = new HashSet<>();
          if (p.getIdNguoiLap() != null)
               userIds.add(p.getIdNguoiLap());
          if (p.getIdNguoiPheDuyet() != null)
               userIds.add(p.getIdNguoiPheDuyet());

          Map<Long, String> userMap = userIds.isEmpty() ? new HashMap<>()
                    : nguoiDungRepository.findAllByIdInAndThoiGianXoaIsNull(userIds).stream()
                              .collect(Collectors.toMap(NguoiDung::getId, this::getHoTenNguoiDung));

          List<ChiTietBaoTriGeneralResponse> detailsFlat = new ArrayList<>();

          if (includeDetails) {
               Set<Long> nccIds = new HashSet<>();

               // 1. Gộp mảng danh sách dòng Thiết bị phần cứng
               List<ChiTietBaoTriThietBi> tbList = chiTietBaoTriThietBiRepository
                         .findByPhieuSuaChuaBaoTriIdAndThoiGianXoaIsNull(p.getId());
               Set<Long> tbIds = tbList.stream().map(ChiTietBaoTriThietBi::getIdDanhSachThietBiPhanCung)
                         .collect(Collectors.toSet());
               Map<Long, DanhSachThietBiPhanCung> tbMap = tbIds.isEmpty() ? new HashMap<>()
                         : thietBiPhanCungRepository.findAllByIdInAndThoiGianXoaIsNull(tbIds).stream()
                                   .collect(Collectors
                                             .toMap(DanhSachThietBiPhanCung::getId,
                                                       java.util.function.Function.identity()));
               tbList.forEach(x -> {
                    if (x.getIdNhaCungCap() != null)
                         nccIds.add(x.getIdNhaCungCap());
               });

               // 2. Gộp mảng danh sách dòng Linh kiện rời
               List<ChiTietBaoTriLinhKien> lkList = chiTietBaoTriLinhKienRepository
                         .findByPhieuSuaChuaBaoTriIdAndThoiGianXoaIsNull(p.getId());
               Set<Long> lkIds = lkList.stream().map(ChiTietBaoTriLinhKien::getIdLinhKienPhanCung)
                         .collect(Collectors.toSet());
               Map<Long, LinhKienPhanCung> lkMap = lkIds.isEmpty() ? new HashMap<>()
                         : linhKienPhanCungRepository.findAllByIdInAndThoiGianXoaIsNull(lkIds).stream().collect(
                                   Collectors.toMap(LinhKienPhanCung::getId, java.util.function.Function.identity()));
               lkList.forEach(x -> {
                    if (x.getIdNhaCungCap() != null)
                         nccIds.add(x.getIdNhaCungCap());
               });

               // Gom tên nhà cung cấp đối tác dịch vụ
               Map<Long, String> nccMap = nccIds.isEmpty() ? new HashMap<>()
                         : nhaCungCapRepository.findAllByIdInAndThoiGianXoaIsNull(nccIds).stream()
                                   .collect(Collectors.toMap(NhaCungCap::getId, NhaCungCap::getTenNhaCungCap));

               // Đưa dữ liệu thiết bị về định dạng mảng phẳng (Flattened Response Layout)
               for (ChiTietBaoTriThietBi ct : tbList) {
                    String tenMau = "", serial = "", assetCard = "";
                    DanhSachThietBiPhanCung core = tbMap.get(ct.getIdDanhSachThietBiPhanCung());
                    if (core != null) {
                         serial = core.getSoSerial();
                         assetCard = core.getMaTheTaiSan();
                         if (core.getTaiSanPhanCung() != null)
                              tenMau = core.getTaiSanPhanCung().getTenMau() + " - " + serial + " - " + assetCard;
                    }
                    detailsFlat.add(ChiTietBaoTriGeneralResponse.builder()
                              .id(ct.getId()).idTaiSanGoc(ct.getIdDanhSachThietBiPhanCung()).tenMauTaiSan(tenMau)
                              .soSerial(serial).maTheTaiSan(assetCard)
                              .loaiHinhXuLy(ct.getLoaiHinhXuLy()).idNhaCungCap(ct.getIdNhaCungCap())
                              .tenNhaCungCap(nccMap.get(ct.getIdNhaCungCap()))
                              .trangThaiThucHien(ct.getTrangThaiThucHien().getValue())
                              .tinhTrangThietBi(ct.getTinhTrangThietBi())
                              .phuongAnXuLy(ct.getPhuongAnXuLy()).idLinhKienThayThe(ct.getIdLinhKienThayThe())
                              .chiPhi(ct.getChiPhi()).loai("THIET_BI").build());
               }

               // Đưa dữ liệu linh kiện về định dạng mảng phẳng (Flattened Response Layout)
               for (ChiTietBaoTriLinhKien ct : lkList) {
                    String tenMau = "", serial = "";
                    LinhKienPhanCung core = lkMap.get(ct.getIdLinhKienPhanCung());
                    if (core != null) {
                         serial = core.getSoSerial();
                         if (core.getTaiSanPhanCung() != null)
                              tenMau = core.getTaiSanPhanCung().getTenMau() + " - " + serial;
                    }
                    detailsFlat.add(ChiTietBaoTriGeneralResponse.builder()
                              .id(ct.getId()).idTaiSanGoc(ct.getIdLinhKienPhanCung()).tenMauTaiSan(tenMau)
                              .soSerial(serial).maTheTaiSan(null)
                              .loaiHinhXuLy(ct.getLoaiHinhXuLy()).idNhaCungCap(ct.getIdNhaCungCap())
                              .tenNhaCungCap(nccMap.get(ct.getIdNhaCungCap()))
                              .trangThaiThucHien(ct.getTrangThaiThucHien().getValue())
                              .tinhTrangThietBi(ct.getTinhTrangThietBi())
                              .phuongAnXuLy(ct.getPhuongAnXuLy()).idLinhKienThayThe(null).chiPhi(ct.getChiPhi())
                              .loai("LINH_KIEN").build());
               }
          }

          return PhieuSuaChuaBaoTriResponse.builder()
                    .id(p.getId()).idDonVi(p.getIdDonVi()).maPhieuSuaChua(p.getMaPhieuSuaChua())
                    .keHoachBaoTriId(p.getKeHoachBaoTriDinhKy() != null ? p.getKeHoachBaoTriDinhKy().getId() : null)
                    .maKeHoachBaoTri(
                              p.getKeHoachBaoTriDinhKy() != null ? p.getKeHoachBaoTriDinhKy().getMaKeHoach() : null)
                    .tenNguoiLap(userMap.get(p.getIdNguoiLap())).tenNguoiPheDuyet(userMap.get(p.getIdNguoiPheDuyet()))
                    .thoiGianLapPhieu(p.getThoiGianLapPhieu()).thoiGianBatDau(p.getThoiGianBatDau())
                    .thoiGianHoanThanhDuKien(p.getThoiGianHoanThanhDuKien())
                    .thoiGianHoanThanhThucTe(p.getThoiGianHoanThanhThucTe())
                    .tongChiPhiThucHien(p.getTongChiPhiThucHien()).trangThai(p.getTrangThai().getValue())
                    .ghiChu(p.getGhiChu())
                    .thoiGianTao(p.getThoiGianTao()).thoiGianCapNhat(p.getThoiGianCapNhat()).chiTietTaiSan(detailsFlat)
                    .build();
     }
}