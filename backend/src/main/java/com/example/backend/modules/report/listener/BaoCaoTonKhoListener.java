package com.example.backend.modules.report.listener;

import com.example.backend.modules.report.model.BaoCaoTonKho;
import com.example.backend.modules.report.model.ChiTietTonKho;
import com.example.backend.modules.report.repository.BaoCaoTonKhoRepository;
import com.example.backend.modules.report.repository.ChiTietTonKhoRepository;
import com.example.backend.modules.asset.model.DanhSachThietBiPhanCung;
import com.example.backend.modules.asset.model.LinhKienPhanCung;
import com.example.backend.modules.asset.model.DanhSachThietBiPhanMem;
import com.example.backend.modules.asset.service.interfaces.DanhSachThietBiPhanCungService;
import com.example.backend.modules.asset.service.interfaces.LinhKienPhanCungService;
import com.example.backend.modules.asset.service.interfaces.DanhSachThietBiPhanMemService;
import com.example.backend.modules.tenant.model.ViTri;
import com.example.backend.modules.tenant.service.interfaces.ViTriService;
import com.example.backend.modules.tenant.dto.ViTriResponse;
import com.example.backend.shared.dto.BienDongTonKhoEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class BaoCaoTonKhoListener {

     private final BaoCaoTonKhoRepository baoCaoTonKhoRepository;
     private final ChiTietTonKhoRepository chiTietTonKhoRepository;

     private final DanhSachThietBiPhanCungService thietBiPhanCungRepository;
     private final LinhKienPhanCungService linhKienPhanCungRepository;
     private final DanhSachThietBiPhanMemService thietBiPhanMemRepository;
     private final ViTriService viTriRepository;

     @RabbitListener(queues = "inventory.bien-dong-ton-kho.queue")
     @Transactional
     public void xuLyBienDongTonKhoNgam(BienDongTonKhoEvent event) {
          log.info("RabbitMQ Worker - Nhận lệnh kết toán dữ liệu tồn kho độc lập: {}, Tài sản cá thể ID: {}",
                    event.getHanhDong(), event.getIdTaiSanCuThe());
          try {
               Long idTaiSanDanhMuc = null;
               String tenTaiSanDanhMuc = "Tài sản lưu kho";
               String maTaiSanDanhMuc = "TS-STOCK";
               String soSerial = "";
               String maTheTaiSan = "";

               // 1. Phân nhánh trích xuất thông tin an toàn từ các Entity Core tĩnh của cậu
               if ("PHAN_CUNG".equalsIgnoreCase(event.getLoaiTaiSan())) {
                    Optional<DanhSachThietBiPhanCung> pcOpt = thietBiPhanCungRepository.layEntityTheoId(event.getIdTaiSanCuThe());
                    if (pcOpt.isPresent()) {
                         DanhSachThietBiPhanCung pc = pcOpt.get();
                         soSerial = pc.getSoSerial();
                         maTheTaiSan = pc.getMaTheTaiSan();
                         if (pc.getTaiSanPhanCung() != null) {
                              idTaiSanDanhMuc = pc.getTaiSanPhanCung().getId();
                              tenTaiSanDanhMuc = pc.getTaiSanPhanCung().getTenMau();
                              maTaiSanDanhMuc = pc.getTaiSanPhanCung().getMaMau();
                         }
                    }
               } else if ("LINH_KIEN".equalsIgnoreCase(event.getLoaiTaiSan())) {
                    Optional<LinhKienPhanCung> lkOpt = linhKienPhanCungRepository.layEntityTheoId(event.getIdTaiSanCuThe());
                    if (lkOpt.isPresent()) {
                         LinhKienPhanCung lk = lkOpt.get();
                         soSerial = lk.getSoSerial();
                         maTheTaiSan = ""; // Gán rỗng an toàn vì LinhKien không có trường mã thẻ tài sản
                         if (lk.getTaiSanPhanCung() != null) {
                              idTaiSanDanhMuc = lk.getTaiSanPhanCung().getId();
                              tenTaiSanDanhMuc = lk.getTaiSanPhanCung().getTenMau();
                              maTaiSanDanhMuc = lk.getTaiSanPhanCung().getMaMau();
                         }
                    }
               } else if ("PHAN_MEM".equalsIgnoreCase(event.getLoaiTaiSan())) {
                    Optional<DanhSachThietBiPhanMem> pmOpt = thietBiPhanMemRepository.layEntityTheoId(event.getIdTaiSanCuThe());
                    if (pmOpt.isPresent()) {
                         DanhSachThietBiPhanMem pm = pmOpt.get();
                         soSerial = ""; // Bản quyền phần mềm không có số Serial vật lý
                         maTheTaiSan = ""; // Bản quyền phần mềm không có mã thẻ tài sản
                         if (pm.getTaiSanPhanMem() != null) {
                              idTaiSanDanhMuc = pm.getTaiSanPhanMem().getId();
                              tenTaiSanDanhMuc = pm.getTaiSanPhanMem().getTenMau();
                              maTaiSanDanhMuc = pm.getTaiSanPhanMem().getMaMau();
                         }
                    }
               }

               // 2. Thực hiện điều hướng toán tử kết toán Summary phẳng
               switch (event.getHanhDong()) {
                    case NHAP_KHO -> {
                         BaoCaoTonKho existingSummary = congSoLuongTonKho(event, event.getIdViTriKho(), idTaiSanDanhMuc,
                                   tenTaiSanDanhMuc, maTaiSanDanhMuc);
                         ghiLogChiTietTonKho(event, existingSummary, soSerial, maTheTaiSan, tenTaiSanDanhMuc);
                    }
                    case THANH_LY -> {
                         truSoLuongTonKho(event, event.getIdViTriKho(), idTaiSanDanhMuc);
                         ghiLogChiTietTonKho(event, null, soSerial, maTheTaiSan, tenTaiSanDanhMuc);
                    }
               }
               log.info("RabbitMQ Worker - Kết toán thành công dữ liệu tồn kho độc lập cho chứng từ gốc: {}",
                         event.getMaChungTuGoc());
          } catch (Exception e) {
               log.error("Lỗi kết toán cộng dồn số liệu tồn kho độc lập chạy ngầm: {}", e.getMessage(), e);
               throw e;
          }
     }

     private BaoCaoTonKho congSoLuongTonKho(BienDongTonKhoEvent event, Long idViTri, Long idDanhMuc, String tenDanhMuc,
               String maDanhMuc) {
          BaoCaoTonKho bc = baoCaoTonKhoRepository
                    .findByIdDonViAndIdViTriAndIdTaiSanDanhMucAndLoaiTaiSanAndThoiGianXoaIsNull(
                              event.getIdDonVi(), idViTri, idDanhMuc, event.getLoaiTaiSan())
                    .orElseGet(() -> {
                         String tenVT = java.util.Optional.ofNullable(viTriRepository.layTheoId(idViTri)).map(ViTriResponse::getTenViTri).orElse("Phòng kho lưu trữ");
                         BaoCaoTonKho newBc = new BaoCaoTonKho();
                         newBc.setIdDonVi(event.getIdDonVi());
                         newBc.setIdViTri(idViTri);
                         newBc.setTenViTri(tenVT);
                         newBc.setIdTaiSanDanhMuc(idDanhMuc);
                         newBc.setTenTaiSanDanhMuc(tenDanhMuc);
                         newBc.setMaTaiSanDanhMuc(maDanhMuc);
                         newBc.setLoaiTaiSan(event.getLoaiTaiSan());
                         newBc.setSoLuongTonKho(0);
                         newBc.setThoiGianCapNhat(LocalDateTime.now());
                         return newBc;
                    });

          bc.setSoLuongTonKho(bc.getSoLuongTonKho() + 1);
          bc.setThoiGianCapNhat(LocalDateTime.now());
          return baoCaoTonKhoRepository.save(bc);
     }

     private void truSoLuongTonKho(BienDongTonKhoEvent event, Long idViTri, Long idDanhMuc) {
          baoCaoTonKhoRepository.findByIdDonViAndIdViTriAndIdTaiSanDanhMucAndLoaiTaiSanAndThoiGianXoaIsNull(
                    event.getIdDonVi(), idViTri, idDanhMuc, event.getLoaiTaiSan()).ifPresent(bc -> {
                         bc.setSoLuongTonKho(Math.max(0, bc.getSoLuongTonKho() - 1));
                         bc.setThoiGianCapNhat(LocalDateTime.now());
                         baoCaoTonKhoRepository.save(bc);
                    });
     }

     private void ghiLogChiTietTonKho(BienDongTonKhoEvent event, BaoCaoTonKho bc, String serial, String maThe,
               String tenDanhMuc) {
          ChiTietTonKho ct = chiTietTonKhoRepository.findByIdDonViAndIdTaiSanCuTheAndLoaiTaiSanAndThoiGianXoaIsNull(
                    event.getIdDonVi(), event.getIdTaiSanCuThe(), event.getLoaiTaiSan()).orElseGet(ChiTietTonKho::new);

          ct.setIdDonVi(event.getIdDonVi());
          ct.setBaoCaoTonKho(bc);
          ct.setIdTaiSanCuThe(event.getIdTaiSanCuThe());
          ct.setTenTaiSanCuThe(tenDanhMuc);
          ct.setSoSerial(serial);
          ct.setMaTheTaiSan(maThe);
          ct.setLoaiTaiSan(event.getLoaiTaiSan());
          ct.setViTriKho(event.getViTriKhoChiTiet() != null ? event.getViTriKhoChiTiet() : "Khu vực lưu trữ kho");
          ct.setTrangThai(event.getTrangThaiMoi() != null ? event.getTrangThaiMoi() : "SẢN_SÀNG");

          ct.setThoiGianGhiNhan(LocalDateTime.now());
          chiTietTonKhoRepository.save(ct);
     }
}