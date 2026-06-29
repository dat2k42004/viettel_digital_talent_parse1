package com.example.backend.modules.report.service;

import com.example.backend.modules.report.dto.*;
import com.example.backend.modules.report.model.*;
import com.example.backend.modules.report.repository.*;
import com.example.backend.modules.report.service.interfaces.BaoCaoService;
import com.example.backend.modules.tenant.model.DonVi;
import com.example.backend.modules.tenant.repository.DonViRepository;
import com.example.backend.shared.exception.NghiepVuException;
import com.example.backend.shared.response.PageResponse;
import com.example.backend.shared.tenant.DonViContextHolder;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BaoCaoServiceImpl implements BaoCaoService {

     private final BaoCaoTonKhoRepository baoCaoTonKhoRepository;
     private final BaoCaoCapPhatRepository baoCaoCapPhatRepository;
     private final BaoCaoBaoTriRepository baoCaoBaoTriRepository;
     private final DonViRepository donViRepository;

     // Hàm rà soát kiểm tra mốc thời gian ràng buộc của bộ lọc
     private void kiemTraRangBuocThoiGian(BaoCaoFilterRequest request) {
          if (request.getTuNgay() != null && request.getDenNgay() != null) {
               if (request.getTuNgay().isAfter(request.getDenNgay())) {
                    throw new NghiepVuException(
                              "Yêu cầu bộ lọc không hợp lệ. Ngày bắt đầu không được lớn hơn ngày kết thúc", 400);
               }
          }
     }

     // Chặn đứng Super Admin (tài khoản chứa chuỗi quyền tối cao) xem sâu chi tiết
     // mã máy, thông tin đơn vị
     private void xacThucQuyenNguoiDungCoSo() {
          boolean laQuanTriToanSan = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                    .anyMatch(a -> "XEM_QUAN_TRI_TOAN_SAN".equalsIgnoreCase(a.getAuthority()));
          if (laQuanTriToanSan && DonViContextHolder.getTenantId() != null) {
               throw new NghiepVuException(
                         "Quyền truy cập bị từ chối. Bạn chỉ được phép xem số liệu tổng hợp để bảo mật dữ liệu khách hàng",
                         403);
          }
     }

     @Override
     @Transactional(readOnly = true)
     public PageResponse<BaoCaoTonKhoResponse> layBaoCaoTonKho(BaoCaoFilterRequest request, int page, int size) {
          xacThucQuyenNguoiDungCoSo();
          kiemTraRangBuocThoiGian(request);
          Long idDonVi = DonViContextHolder.getTenantId();

          Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "thoiGianCapNhat"));

          Specification<BaoCaoTonKho> spec = (root, query, cb) -> {
               List<Predicate> predicates = new ArrayList<>();
               if (idDonVi != null) {
                    predicates.add(cb.equal(root.get("idDonVi"), idDonVi));
               }
               predicates.add(cb.isNull(root.get("thoiGianXoa")));

               if (request.getIdViTri() != null) {
                    predicates.add(cb.equal(root.get("idViTri"), request.getIdViTri()));
               }
               if (request.getTuNgay() != null) {
                    predicates.add(
                              cb.greaterThanOrEqualTo(root.get("thoiGianCapNhat"), request.getTuNgay().atStartOfDay()));
               }
               if (request.getDenNgay() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("thoiGianCapNhat"),
                              request.getDenNgay().atTime(LocalTime.MAX)));
               }

               // Xử lý bài toán liên kết Join bảng lọc động theo từ khóa của cậu
               if (request.getTuKhoaTimKiem() != null && !request.getTuKhoaTimKiem().trim().isEmpty()) {
                    String pattern = "%" + request.getTuKhoaTimKiem().trim().toLowerCase() + "%";
                    Join<BaoCaoTonKho, ChiTietTonKho> joinChiTiet = root.join("danhSachChiTiet", JoinType.LEFT);
                    predicates.add(cb.or(
                              cb.like(cb.lower(joinChiTiet.get("soSerial")), pattern),
                              cb.like(cb.lower(joinChiTiet.get("maTheTaiSan")), pattern),
                              cb.like(cb.lower(root.get("tenTaiSanDanhMuc")), pattern)));
                    query.distinct(true);
               }
               return cb.and(predicates.toArray(new Predicate[0]));
          };

          Page<BaoCaoTonKho> pageResult = baoCaoTonKhoRepository.findAll(spec, pageable);

          List<BaoCaoTonKhoResponse> content = pageResult.getContent().stream().map(m -> {
               List<ChiTietTonKhoResponse> chiTietList = m.getDanhSachChiTiet() == null ? new ArrayList<>()
                         : m.getDanhSachChiTiet().stream().map(c -> ChiTietTonKhoResponse.builder()
                                   .id(c.getId()).idTaiSanCuThe(c.getIdTaiSanCuThe())
                                   .tenTaiSanCuThe(c.getTenTaiSanCuThe())
                                   .soSerial(c.getSoSerial()).maTheTaiSan(c.getMaTheTaiSan())
                                   .loaiTaiSan(c.getLoaiTaiSan())
                                   .viTriKho(c.getViTriKho()).trangThai(c.getTrangThai())
                                   .idDotKiemKeGanNhat(c.getIdDotKiemKeGanNhat())
                                   .tenDotKiemKeGanNhat(c.getTenDotKiemKeGanNhat())
                                   .ghiChu(c.getGhiChu()).thoiGianGhiNhan(c.getThoiGianGhiNhan()).build())
                                   .collect(Collectors.toList());

               return BaoCaoTonKhoResponse.builder()
                         .id(m.getId()).idDonVi(m.getIdDonVi()).idViTri(m.getIdViTri()).tenViTri(m.getTenViTri())
                         .idTaiSanDanhMuc(m.getIdTaiSanDanhMuc()).tenTaiSanDanhMuc(m.getTenTaiSanDanhMuc())
                         .maTaiSanDanhMuc(m.getMaTaiSanDanhMuc())
                         .loaiTaiSan(m.getLoaiTaiSan()).soLuongTonKho(m.getSoLuongTonKho())
                         .thoiGianCapNhat(m.getThoiGianCapNhat())
                         .danhSachChiTiet(chiTietList).build();
          }).collect(Collectors.toList());

          return PageResponse.from(new PageImpl<>(content, pageable, pageResult.getTotalElements()));
     }

     @Override
     @Transactional(readOnly = true)
     public PageResponse<BaoCaoCapPhatResponse> layBaoCaoCapPhat(BaoCaoFilterRequest request, int page, int size) {
          xacThucQuyenNguoiDungCoSo();
          kiemTraRangBuocThoiGian(request);
          Long idDonVi = DonViContextHolder.getTenantId();

          Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "thoiGianCapNhat"));

          Specification<BaoCaoCapPhat> spec = (root, query, cb) -> {
               List<Predicate> predicates = new ArrayList<>();
               if (idDonVi != null) {
                    predicates.add(cb.equal(root.get("idDonVi"), idDonVi));
               }
               predicates.add(cb.isNull(root.get("thoiGianXoa")));

               if (request.getIdPhongBan() != null) {
                    predicates.add(cb.equal(root.get("idPhongBan"), request.getIdPhongBan()));
               }
               if (request.getTuNgay() != null) {
                    predicates.add(
                              cb.greaterThanOrEqualTo(root.get("thoiGianCapNhat"), request.getTuNgay().atStartOfDay()));
               }
               if (request.getDenNgay() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("thoiGianCapNhat"),
                              request.getDenNgay().atTime(LocalTime.MAX)));
               }
               if (request.getTuKhoaTimKiem() != null && !request.getTuKhoaTimKiem().trim().isEmpty()) {
                    String pattern = "%" + request.getTuKhoaTimKiem().trim().toLowerCase() + "%";
                    Join<BaoCaoCapPhat, ChiTietSuDung> joinChiTiet = root.join("danhSachChiTiet", JoinType.LEFT);
                    predicates.add(cb.or(
                              cb.like(cb.lower(joinChiTiet.get("soSerial")), pattern),
                              cb.like(cb.lower(joinChiTiet.get("maTheTaiSan")), pattern),
                              cb.like(cb.lower(joinChiTiet.get("maChungTuGoc")), pattern),
                              cb.like(cb.lower(joinChiTiet.get("hoTenNhanVienTiepNhan")), pattern)));
                    query.distinct(true);
               }
               return cb.and(predicates.toArray(new Predicate[0]));
          };

          Page<BaoCaoCapPhat> pageResult = baoCaoCapPhatRepository.findAll(spec, pageable);

          List<BaoCaoCapPhatResponse> content = pageResult.getContent().stream().map(m -> {
               List<ChiTietSuDungResponse> chiTietList = m.getDanhSachChiTiet() == null ? new ArrayList<>()
                         : m.getDanhSachChiTiet().stream().map(c -> ChiTietSuDungResponse.builder()
                                   .id(c.getId()).idTaiSanCuThe(c.getIdTaiSanCuThe())
                                   .tenTaiSanCuThe(c.getTenTaiSanCuThe())
                                   .soSerial(c.getSoSerial()).maTheTaiSan(c.getMaTheTaiSan())
                                   .loaiTaiSan(c.getLoaiTaiSan())
                                   .idNhanVienTiepNhan(c.getIdNhanVienTiepNhan())
                                   .hoTenNhanVienTiepNhan(c.getHoTenNhanVienTiepNhan())
                                   .idChungTuGoc(c.getIdChungTuGoc()).maChungTuGoc(c.getMaChungTuGoc())
                                   .tinhTrangBanGiao(c.getTinhTrangBanGiao()).thoiGianThucHien(c.getThoiGianThucHien())
                                   .build()).collect(Collectors.toList());

               return BaoCaoCapPhatResponse.builder()
                         .id(m.getId()).idDonVi(m.getIdDonVi()).idPhongBan(m.getIdPhongBan())
                         .tenPhongBan(m.getTenPhongBan())
                         .idTaiSanDanhMuc(m.getIdTaiSanDanhMuc()).tenTaiSanDanhMuc(m.getTenTaiSanDanhMuc())
                         .maTaiSanDanhMuc(m.getMaTaiSanDanhMuc())
                         .loaiTaiSan(m.getLoaiTaiSan()).soLuongCap(m.getSoLuongCap())
                         .tongGiaTriCap(m.getTongGiaTriCap())
                         .thoiGianCapNhat(m.getThoiGianCapNhat()).danhSachChiTiet(chiTietList).build();
          }).collect(Collectors.toList());

          return PageResponse.from(new PageImpl<>(content, pageable, pageResult.getTotalElements()));
     }

     @Override
     @Transactional(readOnly = true)
     public PageResponse<BaoCaoBaoTriResponse> layBaoCaoBaoTri(BaoCaoFilterRequest request, int page, int size) {
          xacThucQuyenNguoiDungCoSo();
          kiemTraRangBuocThoiGian(request);
          Long idDonVi = DonViContextHolder.getTenantId();

          Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "thoiGianCapNhat"));

          Specification<BaoCaoBaoTri> spec = (root, query, cb) -> {
               List<Predicate> predicates = new ArrayList<>();
               if (idDonVi != null) {
                    predicates.add(cb.equal(root.get("idDonVi"), idDonVi));
               }
               predicates.add(cb.isNull(root.get("thoiGianXoa")));

               if (request.getTuNgay() != null) {
                    predicates.add(
                              cb.greaterThanOrEqualTo(root.get("thoiGianCapNhat"), request.getTuNgay().atStartOfDay()));
               }
               if (request.getDenNgay() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("thoiGianCapNhat"),
                              request.getDenNgay().atTime(LocalTime.MAX)));
               }
               if (request.getTuKhoaTimKiem() != null && !request.getTuKhoaTimKiem().trim().isEmpty()) {
                    String pattern = "%" + request.getTuKhoaTimKiem().trim().toLowerCase() + "%";
                    Join<BaoCaoBaoTri, ChiTietBaoTri> joinChiTiet = root.join("danhSachChiTiet", JoinType.LEFT);
                    predicates.add(cb.or(
                              cb.like(cb.lower(joinChiTiet.get("soSerial")), pattern),
                              cb.like(cb.lower(joinChiTiet.get("maTheTaiSan")), pattern),
                              cb.like(cb.lower(joinChiTiet.get("maPhieuSuaChua")), pattern)));
                    query.distinct(true);
               }
               return cb.and(predicates.toArray(new Predicate[0]));
          };

          Page<BaoCaoBaoTri> pageResult = baoCaoBaoTriRepository.findAll(spec, pageable);

          List<BaoCaoBaoTriResponse> content = pageResult.getContent().stream().map(m -> {
               List<ChiTietBaoTriResponse> chiTietList = m.getDanhSachChiTiet() == null ? new ArrayList<>()
                         : m.getDanhSachChiTiet().stream().map(c -> ChiTietBaoTriResponse.builder()
                                   .id(c.getId()).idTaiSanCuThe(c.getIdTaiSanCuThe())
                                   .tenTaiSanCuThe(c.getTenTaiSanCuThe())
                                   .soSerial(c.getSoSerial()).maTheTaiSan(c.getMaTheTaiSan())
                                   .loaiTaiSan(c.getLoaiTaiSan())
                                   .idPhieuSuaChua(c.getIdPhieuSuaChua()).maPhieuSuaChua(c.getMaPhieuSuaChua())
                                   .chiPhiThucTe(c.getChiPhiThucTe())
                                   .thoiGianGianDoan(c.getThoiGianGianDoan()).noiDungKhacPhuc(c.getNoiDungKhacPhuc())
                                   .thoiGianNghiemThu(c.getThoiGianNghiemThu()).build()).collect(Collectors.toList());

               return BaoCaoBaoTriResponse.builder()
                         .id(m.getId()).idDonVi(m.getIdDonVi()).idTaiSanDanhMuc(m.getIdTaiSanDanhMuc())
                         .tenTaiSanDanhMuc(m.getTenTaiSanDanhMuc()).maTaiSanDanhMuc(m.getMaTaiSanDanhMuc())
                         .loaiTaiSan(m.getLoaiTaiSan())
                         .soLuong(m.getSoLuong()).tongChiPhi(m.getTongChiPhi()).tongThoiGian(m.getTongThoiGian())
                         .thoiGianCapNhat(m.getThoiGianCapNhat()).danhSachChiTiet(chiTietList).build();
          }).collect(Collectors.toList());

          return PageResponse.from(new PageImpl<>(content, pageable, pageResult.getTotalElements()));
     }

     @Override
     @Transactional(readOnly = true)
     public PageResponse<BaoCaoToanSanSuperAdminResponse> layTongHopToanSanSuperAdmin(int page, int size) {
          // Xác thực chuỗi quyền tối cao toàn sàn hệ thống
          boolean laQuanTriToanSan = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                    .anyMatch(a -> "XEM_QUAN_TRI_TOAN_SAN".equalsIgnoreCase(a.getAuthority()));
          if (!laQuanTriToanSan) {
               throw new NghiepVuException(
                         "Quyền truy cập bị từ chối. Bạn không có thẩm quyền truy cập số liệu tổng hợp toàn sàn", 403);
          }

          Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
          Specification<DonVi> spec = (root, query, cb) -> cb.isNull(root.get("thoiGianXoa"));
          Page<DonVi> unitsPage = donViRepository.findAll(spec, pageable);

          List<BaoCaoToanSanSuperAdminResponse> content = unitsPage.getContent().stream().map(dv -> {
               List<BaoCaoCapPhat> cpList = baoCaoCapPhatRepository.findByIdDonViAndThoiGianXoaIsNull(dv.getId());

               // Nạp đầy đủ phân loại LINH_KIEN cộng dồn chung vào nhóm Phần cứng vật lý tránh
               // thiếu sót vật tư
               long phanCungVatLy = cpList.stream()
                         .filter(x -> "PHAN_CUNG".equalsIgnoreCase(x.getLoaiTaiSan())
                                   || "LINH_KIEN".equalsIgnoreCase(x.getLoaiTaiSan()))
                         .mapToLong(BaoCaoCapPhat::getSoLuongCap).sum();

               long phanMemSo = cpList.stream()
                         .filter(x -> "PHAN_MEM".equalsIgnoreCase(x.getLoaiTaiSan()))
                         .mapToLong(BaoCaoCapPhat::getSoLuongCap).sum();

               BigDecimal totalVal = cpList.stream()
                         .map(BaoCaoCapPhat::getTongGiaTriCap)
                         .filter(Objects::nonNull)
                         .reduce(BigDecimal.ZERO, BigDecimal::add);

               return BaoCaoToanSanSuperAdminResponse.builder()
                         .idDonVi(dv.getId()).tenDonVi(dv.getTenThuongMai())
                         .tongSoLuongPhanCung(phanCungVatLy).tongSoLuongPhanMem(phanMemSo)
                         .tongGiaTriUocTinhVnd(totalVal)
                         .build();
          }).collect(Collectors.toList());

          return PageResponse.from(new PageImpl<>(content, pageable, unitsPage.getTotalElements()));
     }

     @Override
     @Transactional(readOnly = true)
     public byte[] xuatFileBaoCao(BaoCaoFilterRequest request, String dinhDangFile) {
          xacThucQuyenNguoiDungCoSo();
          kiemTraRangBuocThoiGian(request);
          Long idDonVi = DonViContextHolder.getTenantId();

          boolean laExcel = "xlsx".equalsIgnoreCase(dinhDangFile);
          boolean laPdf = "pdf".equalsIgnoreCase(dinhDangFile);

          if (!laExcel && !laPdf) {
               throw new NghiepVuException("Hệ thống chỉ hỗ trợ xuất file báo cáo định dạng Excel (.xlsx) hoặc PDF (.pdf)", 400);
          }

          String tenDonVi = "Tất cả đơn vị";
          if (idDonVi != null) {
               tenDonVi = donViRepository.findByIdAndThoiGianXoaIsNull(idDonVi)
                         .map(DonVi::getTenThuongMai)
                         .orElse("Đơn vị");
          }

          try {
               if (request.getIdViTri() != null) {
                    // 1. Phân hệ Tồn Kho
                    Specification<BaoCaoTonKho> spec = (root, query, cb) -> {
                         List<Predicate> predicates = new ArrayList<>();
                         if (idDonVi != null) {
                              predicates.add(cb.equal(root.get("idDonVi"), idDonVi));
                         }
                         predicates.add(cb.isNull(root.get("thoiGianXoa")));

                         if (request.getIdViTri() != null) {
                              predicates.add(cb.equal(root.get("idViTri"), request.getIdViTri()));
                         }
                         if (request.getTuNgay() != null) {
                              predicates.add(cb.greaterThanOrEqualTo(root.get("thoiGianCapNhat"), request.getTuNgay().atStartOfDay()));
                         }
                         if (request.getDenNgay() != null) {
                              predicates.add(cb.lessThanOrEqualTo(root.get("thoiGianCapNhat"), request.getDenNgay().atTime(LocalTime.MAX)));
                         }
                         if (request.getTuKhoaTimKiem() != null && !request.getTuKhoaTimKiem().trim().isEmpty()) {
                              String pattern = "%" + request.getTuKhoaTimKiem().trim().toLowerCase() + "%";
                              Join<BaoCaoTonKho, ChiTietTonKho> joinChiTiet = root.join("danhSachChiTiet", JoinType.LEFT);
                              predicates.add(cb.or(
                                        cb.like(cb.lower(joinChiTiet.get("soSerial")), pattern),
                                        cb.like(cb.lower(joinChiTiet.get("maTheTaiSan")), pattern),
                                        cb.like(cb.lower(root.get("tenTaiSanDanhMuc")), pattern)
                              ));
                              query.distinct(true);
                         }
                         return cb.and(predicates.toArray(new Predicate[0]));
                    };
                    List<BaoCaoTonKho> dataTonKho = baoCaoTonKhoRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "thoiGianCapNhat"));
                    if (laExcel) {
                         return com.example.backend.modules.report.util.BaoCaoExcelTemplateHelper.taoTemplateTonKho(dataTonKho);
                    } else {
                         return com.example.backend.modules.report.util.BaoCaoPdfTemplateHelper.taoTemplateTonKhoPdf(dataTonKho, tenDonVi);
                    }

               } else if (request.getIdPhongBan() != null) {
                    // 2. Phân hệ Cấp Phát Sử Dụng
                    Specification<BaoCaoCapPhat> spec = (root, query, cb) -> {
                         List<Predicate> predicates = new ArrayList<>();
                         if (idDonVi != null) {
                              predicates.add(cb.equal(root.get("idDonVi"), idDonVi));
                         }
                         predicates.add(cb.isNull(root.get("thoiGianXoa")));

                         if (request.getIdPhongBan() != null) {
                              predicates.add(cb.equal(root.get("idPhongBan"), request.getIdPhongBan()));
                         }
                         if (request.getTuNgay() != null) {
                              predicates.add(cb.greaterThanOrEqualTo(root.get("thoiGianCapNhat"), request.getTuNgay().atStartOfDay()));
                         }
                         if (request.getDenNgay() != null) {
                              predicates.add(cb.lessThanOrEqualTo(root.get("thoiGianCapNhat"), request.getDenNgay().atTime(LocalTime.MAX)));
                         }
                         if (request.getTuKhoaTimKiem() != null && !request.getTuKhoaTimKiem().trim().isEmpty()) {
                              String pattern = "%" + request.getTuKhoaTimKiem().trim().toLowerCase() + "%";
                              Join<BaoCaoCapPhat, ChiTietSuDung> joinChiTiet = root.join("danhSachChiTiet", JoinType.LEFT);
                              predicates.add(cb.or(
                                        cb.like(cb.lower(joinChiTiet.get("soSerial")), pattern),
                                        cb.like(cb.lower(joinChiTiet.get("maTheTaiSan")), pattern),
                                        cb.like(cb.lower(joinChiTiet.get("maChungTuGoc")), pattern),
                                        cb.like(cb.lower(joinChiTiet.get("hoTenNhanVienTiepNhan")), pattern)
                              ));
                              query.distinct(true);
                         }
                         return cb.and(predicates.toArray(new Predicate[0]));
                    };
                    List<BaoCaoCapPhat> dataCapPhat = baoCaoCapPhatRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "thoiGianCapNhat"));
                    if (laExcel) {
                         return com.example.backend.modules.report.util.BaoCaoExcelTemplateHelper.taoTemplateCapPhat(dataCapPhat);
                    } else {
                         return com.example.backend.modules.report.util.BaoCaoPdfTemplateHelper.taoTemplateCapPhatPdf(dataCapPhat, tenDonVi);
                    }

               } else {
                    // 3. Phân hệ Chi Phí Bảo Sửa Tài Sản
                    Specification<BaoCaoBaoTri> spec = (root, query, cb) -> {
                         List<Predicate> predicates = new ArrayList<>();
                         if (idDonVi != null) {
                              predicates.add(cb.equal(root.get("idDonVi"), idDonVi));
                         }
                         predicates.add(cb.isNull(root.get("thoiGianXoa")));

                         if (request.getTuNgay() != null) {
                              predicates.add(cb.greaterThanOrEqualTo(root.get("thoiGianCapNhat"), request.getTuNgay().atStartOfDay()));
                         }
                         if (request.getDenNgay() != null) {
                              predicates.add(cb.lessThanOrEqualTo(root.get("thoiGianCapNhat"), request.getDenNgay().atTime(LocalTime.MAX)));
                         }
                         if (request.getTuKhoaTimKiem() != null && !request.getTuKhoaTimKiem().trim().isEmpty()) {
                              String pattern = "%" + request.getTuKhoaTimKiem().trim().toLowerCase() + "%";
                              Join<BaoCaoBaoTri, ChiTietBaoTri> joinChiTiet = root.join("danhSachChiTiet", JoinType.LEFT);
                              predicates.add(cb.or(
                                        cb.like(cb.lower(joinChiTiet.get("soSerial")), pattern),
                                        cb.like(cb.lower(joinChiTiet.get("maTheTaiSan")), pattern),
                                        cb.like(cb.lower(joinChiTiet.get("maPhieuSuaChua")), pattern)
                              ));
                              query.distinct(true);
                         }
                         return cb.and(predicates.toArray(new Predicate[0]));
                    };
                    List<BaoCaoBaoTri> dataBaoTri = baoCaoBaoTriRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "thoiGianCapNhat"));
                    if (laExcel) {
                         return com.example.backend.modules.report.util.BaoCaoExcelTemplateHelper.taoTemplateBaoTri(dataBaoTri);
                    } else {
                         return com.example.backend.modules.report.util.BaoCaoPdfTemplateHelper.taoTemplateBaoTriPdf(dataBaoTri, tenDonVi);
                    }
               }
          } catch (IOException e) {
               log.error("Lỗi khi kết xuất file báo cáo dạng Excel/PDF: {}", e.getMessage(), e);
               throw new NghiepVuException("Lỗi hệ thống trong quá trình sinh file văn bản dữ liệu", 500);
          }
     }

     @Override
     public byte[] xuatFileBaoCaoToanSanSuperAdmin() {
          boolean laQuanTriToanSan = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                    .anyMatch(a -> "XEM_QUAN_TRI_TOAN_SAN".equalsIgnoreCase(a.getAuthority()));
          if (!laQuanTriToanSan) {
               throw new NghiepVuException("Quyền truy cập bị từ chối. Không có quyền xuất báo cáo toàn sàn", 403);
          }
          log.info("Khởi động công cụ kết xuất Excel tổng hợp ngân sách tài sản ẩn danh toàn sàn hệ thống SaaS");
          return "Mảng byte dữ liệu file Excel tổng hợp toàn sàn Super Admin".getBytes();
     }
}