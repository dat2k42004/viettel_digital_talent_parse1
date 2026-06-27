package com.example.backend.modules.report.util;

import com.example.backend.modules.report.model.BaoCaoBaoTri;
import com.example.backend.modules.report.model.BaoCaoCapPhat;
import com.example.backend.modules.report.model.BaoCaoTonKho;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.DecimalFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class BaoCaoPdfTemplateHelper {

     private static final DateTimeFormatter FORMAT_NGAY = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
     private static final DecimalFormat DINH_DANG_TIEN = new DecimalFormat("#,##0");

     public static byte[] taoTemplateTonKhoPdf(List<BaoCaoTonKho> listData, String tenDonVi) {
          ByteArrayOutputStream luongGhi = new ByteArrayOutputStream();
          Document taiLieu = new Document(PageSize.A4.rotate(), 36, 36, 36, 54);

          try {
               PdfWriter boGhi = PdfWriter.getInstance(taiLieu, luongGhi);
               BaseFont phongChuCoBan = LayFontVietNam();
               boGhi.setPageEvent(new PageNumEventHelper(phongChuCoBan, tenDonVi));

               taiLieu.open();

               // Tạo tiêu đề
               Font phongTitle = new Font(phongChuCoBan, 16, Font.BOLD, Color.DARK_GRAY);
               Font phongSubtitle = new Font(phongChuCoBan, 10, Font.ITALIC, Color.GRAY);
               Font phongHeader = new Font(phongChuCoBan, 9, Font.BOLD, Color.WHITE);
               Font phongData = new Font(phongChuCoBan, 9, Font.NORMAL, Color.BLACK);

               Paragraph tieuDeReport = new Paragraph("BÁO CÁO TỒN KHO TÀI SẢN CNTT", phongTitle);
               tieuDeReport.setAlignment(Element.ALIGN_CENTER);
               tieuDeReport.setSpacingAfter(5);
               taiLieu.add(tieuDeReport);

               Paragraph phuDeReport = new Paragraph("Đơn vị: " + (tenDonVi != null ? tenDonVi : "Hệ thống") + " | Ngày xuất: " + LocalDateTime.now().format(FORMAT_NGAY), phongSubtitle);
               phuDeReport.setAlignment(Element.ALIGN_CENTER);
               phuDeReport.setSpacingAfter(20);
               taiLieu.add(phuDeReport);

               // Tạo bảng
               float[] doRongCot = { 5f, 15f, 25f, 12f, 18f, 10f, 15f };
               PdfPTable bangDuLieu = new PdfPTable(doRongCot);
               bangDuLieu.setWidthPercentage(100);

               // Header
               String[] headers = { "STT", "Mã Danh Mục", "Tên Mẫu Vật Tư", "Loại Tài Sản", "Vị Trí Kho Chứa", "Số Lượng Tồn", "Thời Gian Cập Nhật" };
               Color mauHeader = new Color(0, 51, 102); // Dark Blue

               for (String text : headers) {
                    PdfPCell oCell = new PdfPCell(new Phrase(text, phongHeader));
                    oCell.setBackgroundColor(mauHeader);
                    oCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    oCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                    oCell.setPadding(6);
                    bangDuLieu.addCell(oCell);
               }

               // Dữ liệu
               int stt = 1;
               for (BaoCaoTonKho item : listData) {
                    bangDuLieu.addCell(taoCellDuLieu(String.valueOf(stt++), phongData, Element.ALIGN_CENTER));
                    bangDuLieu.addCell(taoCellDuLieu(item.getMaTaiSanDanhMuc(), phongData, Element.ALIGN_LEFT));
                    bangDuLieu.addCell(taoCellDuLieu(item.getTenTaiSanDanhMuc(), phongData, Element.ALIGN_LEFT));
                    bangDuLieu.addCell(taoCellDuLieu(item.getLoaiTaiSan(), phongData, Element.ALIGN_CENTER));
                    bangDuLieu.addCell(taoCellDuLieu(item.getTenViTri(), phongData, Element.ALIGN_LEFT));
                    bangDuLieu.addCell(taoCellDuLieu(item.getSoLuongTonKho() != null ? String.valueOf(item.getSoLuongTonKho()) : "0", phongData, Element.ALIGN_RIGHT));
                    bangDuLieu.addCell(taoCellDuLieu(item.getThoiGianCapNhat() != null ? item.getThoiGianCapNhat().format(FORMAT_NGAY) : "", phongData, Element.ALIGN_CENTER));
               }

               taiLieu.add(bangDuLieu);
               taiLieu.close();
          } catch (Exception e) {
               throw new RuntimeException("Lỗi sinh báo cáo PDF Tồn Kho: " + e.getMessage(), e);
          }

          return luongGhi.toByteArray();
     }

     public static byte[] taoTemplateCapPhatPdf(List<BaoCaoCapPhat> listData, String tenDonVi) {
          ByteArrayOutputStream luongGhi = new ByteArrayOutputStream();
          Document taiLieu = new Document(PageSize.A4.rotate(), 36, 36, 36, 54);

          try {
               PdfWriter boGhi = PdfWriter.getInstance(taiLieu, luongGhi);
               BaseFont phongChuCoBan = LayFontVietNam();
               boGhi.setPageEvent(new PageNumEventHelper(phongChuCoBan, tenDonVi));

               taiLieu.open();

               Font phongTitle = new Font(phongChuCoBan, 16, Font.BOLD, Color.DARK_GRAY);
               Font phongSubtitle = new Font(phongChuCoBan, 10, Font.ITALIC, Color.GRAY);
               Font phongHeader = new Font(phongChuCoBan, 9, Font.BOLD, Color.WHITE);
               Font phongData = new Font(phongChuCoBan, 9, Font.NORMAL, Color.BLACK);

               Paragraph tieuDeReport = new Paragraph("BÁO CÁO PHÂN BỔ SỬ DỤNG TÀI SẢN", phongTitle);
               tieuDeReport.setAlignment(Element.ALIGN_CENTER);
               tieuDeReport.setSpacingAfter(5);
               taiLieu.add(tieuDeReport);

               Paragraph phuDeReport = new Paragraph("Đơn vị: " + (tenDonVi != null ? tenDonVi : "Hệ thống") + " | Ngày xuất: " + LocalDateTime.now().format(FORMAT_NGAY), phongSubtitle);
               phuDeReport.setAlignment(Element.ALIGN_CENTER);
               phuDeReport.setSpacingAfter(20);
               taiLieu.add(phuDeReport);

               float[] doRongCot = { 5f, 18f, 12f, 22f, 13f, 10f, 10f, 10f };
               PdfPTable bangDuLieu = new PdfPTable(doRongCot);
               bangDuLieu.setWidthPercentage(100);

               String[] headers = { "STT", "Phòng Ban Tiếp Nhận", "Mã Danh Mục", "Tên Mẫu Tài Sản", "Loại Tài Sản", "Số Lượng Cấp", "Tổng Giá Trị (VND)", "Thời Gian Cập Nhật" };
               Color mauHeader = new Color(0, 51, 102);

               for (String text : headers) {
                    PdfPCell oCell = new PdfPCell(new Phrase(text, phongHeader));
                    oCell.setBackgroundColor(mauHeader);
                    oCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    oCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                    oCell.setPadding(6);
                    bangDuLieu.addCell(oCell);
               }

               int stt = 1;
               for (BaoCaoCapPhat item : listData) {
                    bangDuLieu.addCell(taoCellDuLieu(String.valueOf(stt++), phongData, Element.ALIGN_CENTER));
                    bangDuLieu.addCell(taoCellDuLieu(item.getTenPhongBan(), phongData, Element.ALIGN_LEFT));
                    bangDuLieu.addCell(taoCellDuLieu(item.getMaTaiSanDanhMuc(), phongData, Element.ALIGN_LEFT));
                    bangDuLieu.addCell(taoCellDuLieu(item.getTenTaiSanDanhMuc(), phongData, Element.ALIGN_LEFT));
                    bangDuLieu.addCell(taoCellDuLieu(item.getLoaiTaiSan(), phongData, Element.ALIGN_CENTER));
                    bangDuLieu.addCell(taoCellDuLieu(item.getSoLuongCap() != null ? String.valueOf(item.getSoLuongCap()) : "0", phongData, Element.ALIGN_RIGHT));
                    bangDuLieu.addCell(taoCellDuLieu(item.getTongGiaTriCap() != null ? DINH_DANG_TIEN.format(item.getTongGiaTriCap()) : "0", phongData, Element.ALIGN_RIGHT));
                    bangDuLieu.addCell(taoCellDuLieu(item.getThoiGianCapNhat() != null ? item.getThoiGianCapNhat().format(FORMAT_NGAY) : "", phongData, Element.ALIGN_CENTER));
               }

               taiLieu.add(bangDuLieu);
               taiLieu.close();
          } catch (Exception e) {
               throw new RuntimeException("Lỗi sinh báo cáo PDF Cấp Phát: " + e.getMessage(), e);
          }

          return luongGhi.toByteArray();
     }

     public static byte[] taoTemplateBaoTriPdf(List<BaoCaoBaoTri> listData, String tenDonVi) {
          ByteArrayOutputStream luongGhi = new ByteArrayOutputStream();
          Document taiLieu = new Document(PageSize.A4.rotate(), 36, 36, 36, 54);

          try {
               PdfWriter boGhi = PdfWriter.getInstance(taiLieu, luongGhi);
               BaseFont phongChuCoBan = LayFontVietNam();
               boGhi.setPageEvent(new PageNumEventHelper(phongChuCoBan, tenDonVi));

               taiLieu.open();

               Font phongTitle = new Font(phongChuCoBan, 16, Font.BOLD, Color.DARK_GRAY);
               Font phongSubtitle = new Font(phongChuCoBan, 10, Font.ITALIC, Color.GRAY);
               Font phongHeader = new Font(phongChuCoBan, 9, Font.BOLD, Color.WHITE);
               Font phongData = new Font(phongChuCoBan, 9, Font.NORMAL, Color.BLACK);

               Paragraph tieuDeReport = new Paragraph("BÁO CÁO CHI PHÍ BẢO TRÌ SỬA CHỮA TÀI SẢN", phongTitle);
               tieuDeReport.setAlignment(Element.ALIGN_CENTER);
               tieuDeReport.setSpacingAfter(5);
               taiLieu.add(tieuDeReport);

               Paragraph phuDeReport = new Paragraph("Đơn vị: " + (tenDonVi != null ? tenDonVi : "Hệ thống") + " | Ngày xuất: " + LocalDateTime.now().format(FORMAT_NGAY), phongSubtitle);
               phuDeReport.setAlignment(Element.ALIGN_CENTER);
               phuDeReport.setSpacingAfter(20);
               taiLieu.add(phuDeReport);

               float[] doRongCot = { 5f, 15f, 25f, 15f, 10f, 15f, 15f };
               PdfPTable bangDuLieu = new PdfPTable(doRongCot);
               bangDuLieu.setWidthPercentage(100);

               String[] headers = { "STT", "Mã Danh Mục", "Tên Mẫu Tài Sản", "Loại Tài Sản", "Số Lượt Sửa Chữa", "Tổng Chi Phí (VND)", "Tổng Thời Gian Chết (Ngày)" };
               Color mauHeader = new Color(0, 51, 102);

               for (String text : headers) {
                    PdfPCell oCell = new PdfPCell(new Phrase(text, phongHeader));
                    oCell.setBackgroundColor(mauHeader);
                    oCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    oCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                    oCell.setPadding(6);
                    bangDuLieu.addCell(oCell);
               }

               int stt = 1;
               for (BaoCaoBaoTri item : listData) {
                    bangDuLieu.addCell(taoCellDuLieu(String.valueOf(stt++), phongData, Element.ALIGN_CENTER));
                    bangDuLieu.addCell(taoCellDuLieu(item.getMaTaiSanDanhMuc(), phongData, Element.ALIGN_LEFT));
                    bangDuLieu.addCell(taoCellDuLieu(item.getTenTaiSanDanhMuc(), phongData, Element.ALIGN_LEFT));
                    bangDuLieu.addCell(taoCellDuLieu(item.getLoaiTaiSan(), phongData, Element.ALIGN_CENTER));
                    bangDuLieu.addCell(taoCellDuLieu(item.getSoLuong() != null ? String.valueOf(item.getSoLuong()) : "0", phongData, Element.ALIGN_RIGHT));
                    bangDuLieu.addCell(taoCellDuLieu(item.getTongChiPhi() != null ? DINH_DANG_TIEN.format(item.getTongChiPhi()) : "0", phongData, Element.ALIGN_RIGHT));
                    bangDuLieu.addCell(taoCellDuLieu(item.getTongThoiGian() != null ? String.valueOf(item.getTongThoiGian()) : "0", phongData, Element.ALIGN_RIGHT));
               }

               taiLieu.add(bangDuLieu);
               taiLieu.close();
          } catch (Exception e) {
               throw new RuntimeException("Lỗi sinh báo cáo PDF Bảo Trì: " + e.getMessage(), e);
          }

          return luongGhi.toByteArray();
     }

     private static PdfPCell taoCellDuLieu(String text, Font font, int alignment) {
          PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", font));
          cell.setHorizontalAlignment(alignment);
          cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
          cell.setPadding(5);
          return cell;
     }

     private static BaseFont LayFontVietNam() throws IOException {
          try {
               // Load Arial font from standard Windows path (or similar system path if available)
               return BaseFont.createFont("C:/Windows/Fonts/arial.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
          } catch (Exception e) {
               try {
                    // Fallback to standard times if arial is missing
                    return BaseFont.createFont("C:/Windows/Fonts/times.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
               } catch (Exception ex) {
                    // Fail-safe fallback to HELVETICA if no system fonts are found (non-Windows system / docker)
                    return BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.EMBEDDED);
               }
          }
     }

     private static class PageNumEventHelper extends PdfPageEventHelper {
          private final BaseFont fontChu;
          private final String tenDonVi;

          public PageNumEventHelper(BaseFont fontChu, String tenDonVi) {
               this.fontChu = fontChu;
               this.tenDonVi = tenDonVi;
          }

          @Override
          public void onEndPage(PdfWriter writer, Document document) {
               PdfContentByte cb = writer.getDirectContent();
               cb.beginText();
               cb.setFontAndSize(fontChu, 8);
               cb.setColorFill(Color.GRAY);

               // Left footer: Company name
               cb.showTextAligned(PdfContentByte.ALIGN_LEFT, "Đơn vị phát hành: " + (tenDonVi != null ? tenDonVi : "Hệ thống ITAM"),
                         document.left() + 10, document.bottom() - 15, 0);

               // Right footer: Page number
               String phanTrangText = "Trang " + writer.getPageNumber();
               cb.showTextAligned(PdfContentByte.ALIGN_RIGHT, phanTrangText,
                         document.right() - 10, document.bottom() - 15, 0);

               cb.endText();
          }
     }
}
