package com.example.backend.modules.report.util;

import com.example.backend.modules.report.model.BaoCaoBaoTri;
import com.example.backend.modules.report.model.BaoCaoCapPhat;
import com.example.backend.modules.report.model.BaoCaoTonKho;
import com.example.backend.modules.tenant.model.DonVi;
import com.example.backend.modules.report.dto.BaoCaoToanSanSuperAdminResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class BaoCaoExcelTemplateHelper {

     private static final DateTimeFormatter FORMAT_NGAY = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

     // =========================================================================
     // TEMPLATE 1: KẾT XUẤT FILE FILE EXCEL BÁO CÁO TỒN KHO ĐƠN VỊ
     // =========================================================================
     public static byte[] taoTemplateTonKho(List<BaoCaoTonKho> listData) throws IOException {
          try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
               Sheet sheet = workbook.createSheet("Báo cáo Tồn Kho");

               // 1. Tạo kiểu dáng định dạng (Styles) cho Header và Dữ liệu
               CellStyle headerStyle = taoCellStyleHeader(workbook);
               CellStyle dataStyle = taoCellStyleData(workbook);
               CellStyle moneyStyle = taoCellStyleMoney(workbook);

               // 2. Tạo tiêu đề cột phẳng
               String[] headers = { "STT", "Mã Danh Mục", "Tên Mẫu Vật Tư", "Loại Tài Sản", "Vị Trí Kho Chứa",
                         "Số Lượng Tồn", "Thời Gian Cập Nhật" };
               Row headerRow = sheet.createRow(0);
               for (int i = 0; i < headers.length; i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
               }

               // 3. Đổ mảng dữ liệu phẳng vào các dòng tính toán
               int rowIndex = 1;
               for (BaoCaoTonKho item : listData) {
                    Row row = sheet.createRow(rowIndex++);
                    row.createCell(0).setCellValue(rowIndex - 1);
                    row.createCell(1).setCellValue(item.getMaTaiSanDanhMuc() != null ? item.getMaTaiSanDanhMuc() : "");
                    row.createCell(2)
                              .setCellValue(item.getTenTaiSanDanhMuc() != null ? item.getTenTaiSanDanhMuc() : "");
                    row.createCell(3).setCellValue(item.getLoaiTaiSan());
                    row.createCell(4).setCellValue(item.getTenViTri() != null ? item.getTenViTri() : "");
                    row.createCell(5).setCellValue(item.getSoLuongTonKho());
                    row.createCell(6).setCellValue(
                              item.getThoiGianCapNhat() != null ? item.getThoiGianCapNhat().format(FORMAT_NGAY) : "");

                    // Áp style đồng loạt
                    for (int i = 0; i < headers.length; i++) {
                         if (row.getCell(i).getCellStyle() == null) {
                              row.getCell(i).setCellStyle(dataStyle);
                         }
                    }
               }

               autoSizeColumns(sheet, headers.length);
               workbook.write(out);
               return out.toByteArray();
          }
     }

     // =========================================================================
     // TEMPLATE 2: KẾT XUẤT FILE FILE EXCEL BÁO CÁO CẤP PHÁT PHÒNG BAN
     // =========================================================================
     public static byte[] taoTemplateCapPhat(List<BaoCaoCapPhat> listData) throws IOException {
          try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
               Sheet sheet = workbook.createSheet("Báo cáo Phân Bổ Sử Dụng");

               CellStyle headerStyle = taoCellStyleHeader(workbook);
               CellStyle dataStyle = taoCellStyleData(workbook);
               CellStyle moneyStyle = taoCellStyleMoney(workbook);

               String[] headers = { "STT", "Phòng Ban Tiếp Nhận", "Mã Danh Mục", "Tên Mẫu Tài Sản", "Loại Tài Sản",
                         "Số Lượng Cấp", "Tổng Giá Trị (VND)", "Thời Gian Cập Nhật" };
               Row headerRow = sheet.createRow(0);
               for (int i = 0; i < headers.length; i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
               }

               int rowIndex = 1;
               for (BaoCaoCapPhat item : listData) {
                    Row row = sheet.createRow(rowIndex++);
                    row.createCell(0).setCellValue(rowIndex - 1);
                    row.createCell(1).setCellValue(item.getTenPhongBan() != null ? item.getTenPhongBan() : "");
                    row.createCell(2).setCellValue(item.getMaTaiSanDanhMuc() != null ? item.getMaTaiSanDanhMuc() : "");
                    row.createCell(3)
                              .setCellValue(item.getTenTaiSanDanhMuc() != null ? item.getTenTaiSanDanhMuc() : "");
                    row.createCell(4).setCellValue(item.getLoaiTaiSan());
                    row.createCell(5).setCellValue(item.getSoLuongCap());

                    Cell cellTien = row.createCell(6);
                    cellTien.setCellValue(
                              item.getTongGiaTriCap() != null ? item.getTongGiaTriCap().doubleValue() : 0.0);
                    cellTien.setCellStyle(moneyStyle);

                    row.createCell(7).setCellValue(
                              item.getThoiGianCapNhat() != null ? item.getThoiGianCapNhat().format(FORMAT_NGAY) : "");

                    for (int i = 0; i < headers.length; i++) {
                         if (i != 6)
                              row.getCell(i).setCellStyle(dataStyle);
                    }
               }

               autoSizeColumns(sheet, headers.length);
               workbook.write(out);
               return out.toByteArray();
          }
     }

     // =========================================================================
     // TEMPLATE 3: KẾT XUẤT FILE FILE EXCEL BÁO CÁO CHI PHÍ BẢO TRÌ
     // =========================================================================
     public static byte[] taoTemplateBaoTri(List<BaoCaoBaoTri> listData) throws IOException {
          try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
               Sheet sheet = workbook.createSheet("Báo cáo Chi Phí Bảo Trì");

               CellStyle headerStyle = taoCellStyleHeader(workbook);
               CellStyle dataStyle = taoCellStyleData(workbook);
               CellStyle moneyStyle = taoCellStyleMoney(workbook);

               String[] headers = { "STT", "Mã Danh Mục", "Tên Mẫu Tài Sản", "Loại Tài Sản", "Số Lượt Sửa Chữa",
                         "Tổng Chi Phí (VND)", "Tổng Thời Gian Chết (Ngày)" };
               Row headerRow = sheet.createRow(0);
               for (int i = 0; i < headers.length; i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
               }

               int rowIndex = 1;
               for (BaoCaoBaoTri item : listData) {
                    Row row = sheet.createRow(rowIndex++);
                    row.createCell(0).setCellValue(rowIndex - 1);
                    row.createCell(1).setCellValue(item.getMaTaiSanDanhMuc() != null ? item.getMaTaiSanDanhMuc() : "");
                    row.createCell(2)
                              .setCellValue(item.getTenTaiSanDanhMuc() != null ? item.getTenTaiSanDanhMuc() : "");
                    row.createCell(3).setCellValue(item.getLoaiTaiSan());
                    row.createCell(4).setCellValue(item.getSoLuong());

                    Cell cellTien = row.createCell(5);
                    cellTien.setCellValue(item.getTongChiPhi() != null ? item.getTongChiPhi().doubleValue() : 0.0);
                    cellTien.setCellStyle(moneyStyle);

                    row.createCell(6).setCellValue(item.getTongThoiGian());

                    for (int i = 0; i < headers.length; i++) {
                         if (i != 5)
                              row.getCell(i).setCellStyle(dataStyle);
                    }
               }

               autoSizeColumns(sheet, headers.length);
               workbook.write(out);
               return out.toByteArray();
          }
     }

     // =========================================================================
     // TEMPLATE 4: KẾT XUẤT FILE FILE EXCEL TỔNG HỢP TOÀN SẢN (SUPER ADMIN)
     // =========================================================================
     public static byte[] taoTemplateToanSan(List<BaoCaoToanSanSuperAdminResponse> listData) throws IOException {
          try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
               Sheet sheet = workbook.createSheet("Tổng hợp Toàn Sàn");

               CellStyle headerStyle = taoCellStyleHeader(workbook);
               CellStyle dataStyle = taoCellStyleData(workbook);
               CellStyle moneyStyle = taoCellStyleMoney(workbook);

               String[] headers = { "Mã Đơn Vị", "Tên Đơn Vị", "Tổng Số Lượng Phần Cứng", "Tổng Số Lượng Phần Mềm", "Tổng Giá Trị Ước Tính (VND)" };
               Row headerRow = sheet.createRow(0);
               for (int i = 0; i < headers.length; i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
               }

               int rowIndex = 1;
               for (BaoCaoToanSanSuperAdminResponse item : listData) {
                    Row row = sheet.createRow(rowIndex++);
                    row.createCell(0).setCellValue(item.getIdDonVi());
                    row.createCell(1).setCellValue(item.getTenDonVi() != null ? item.getTenDonVi() : "");
                    row.createCell(2).setCellValue(item.getTongSoLuongPhanCung());
                    row.createCell(3).setCellValue(item.getTongSoLuongPhanMem());

                    Cell cellTien = row.createCell(4);
                    cellTien.setCellValue(item.getTongGiaTriUocTinhVnd() != null ? item.getTongGiaTriUocTinhVnd().doubleValue() : 0.0);
                    cellTien.setCellStyle(moneyStyle);

                    for (int i = 0; i < headers.length; i++) {
                         if (i != 4) {
                              row.getCell(i).setCellStyle(dataStyle);
                         }
                    }
               }

               autoSizeColumns(sheet, headers.length);
               workbook.write(out);
               return out.toByteArray();
          }
     }

     // =========================================================================
     // CÁC HÀM TIỆN ÍCH THIẾT KẾ GIAO DIỆN (UI EXCEL CELL STYLES)
     // =========================================================================
     private static CellStyle taoCellStyleHeader(Workbook workbook) {
          CellStyle style = workbook.createCellStyle();
          Font font = workbook.createFont();
          font.setBold(true);
          font.setFontName("Arial");
          font.setColor(IndexedColors.WHITE.getIndex());
          style.setFont(font);
          style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
          style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
          setBorders(style);
          style.setAlignment(HorizontalAlignment.CENTER);
          return style;
     }

     private static CellStyle taoCellStyleData(Workbook workbook) {
          CellStyle style = workbook.createCellStyle();
          Font font = workbook.createFont();
          font.setFontName("Arial");
          style.setFont(font);
          setBorders(style);
          return style;
     }

     private static CellStyle taoCellStyleMoney(Workbook workbook) {
          CellStyle style = workbook.createCellStyle();
          Font font = workbook.createFont();
          font.setFontName("Arial");
          style.setFont(font);
          setBorders(style);
          DataFormat format = workbook.createDataFormat();
          style.setDataFormat(format.getFormat("#,##0")); // Định dạng phân tách hàng nghìn VND tĩnh phẳng
          return style;
     }

     private static void setBorders(CellStyle style) {
          style.setBorderTop(BorderStyle.THIN);
          style.setBorderBottom(BorderStyle.THIN);
          style.setBorderLeft(BorderStyle.THIN);
          style.setBorderRight(BorderStyle.THIN);
     }

     private static void autoSizeColumns(Sheet sheet, int columnCount) {
          for (int i = 0; i < columnCount; i++) {
               sheet.autoSizeColumn(i);
          }
     }
}