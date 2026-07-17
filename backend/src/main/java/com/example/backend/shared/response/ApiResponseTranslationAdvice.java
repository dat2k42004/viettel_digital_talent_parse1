package com.example.backend.shared.response;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@RestControllerAdvice
public class ApiResponseTranslationAdvice implements ResponseBodyAdvice<Object> {

    private final MessageSource messageSource;

    public ApiResponseTranslationAdvice(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @SuppressWarnings("unchecked")
    @Override
    public Object beforeBodyWrite(
            Object body,
            MethodParameter returnType,
            MediaType selectedContentType,
            Class<? extends HttpMessageConverter<?>> selectedConverterType,
            ServerHttpRequest request,
            ServerHttpResponse response
    ) {
        if (body instanceof ApiResponse) {
            ApiResponse<Object> apiResponse = (ApiResponse<Object>) body;
            boolean isEn = "en".equalsIgnoreCase(LocaleContextHolder.getLocale().getLanguage());
            
            // Translate the message field if it exists
            if (apiResponse.getMessage() != null) {
                String originalMsg = apiResponse.getMessage();
                String translatedMsg = messageSource.getMessage(
                        originalMsg,
                        null,
                        originalMsg,
                        LocaleContextHolder.getLocale()
                );
                
                // If it was not translated by properties and locale is English, try dynamic patterns
                if (translatedMsg.equals(originalMsg) && isEn) {
                    translatedMsg = translateDynamicTextEn(originalMsg);
                }
                apiResponse.setMessage(translatedMsg);
            }
            
            // Translate the data field if it is a String message
            if (apiResponse.getData() instanceof String) {
                String originalData = (String) apiResponse.getData();
                String translatedData = messageSource.getMessage(
                        originalData,
                        null,
                        originalData,
                        LocaleContextHolder.getLocale()
                );
                
                // If it was not translated by properties and locale is English, try dynamic patterns
                if (translatedData.equals(originalData) && isEn) {
                    translatedData = translateDynamicTextEn(originalData);
                }
                apiResponse.setData(translatedData);
            }
        }
        return body;
    }

    private String translateDynamicTextEn(String text) {
        if (text == null) return null;
        
        // Common 'Không tìm thấy' errors
        if (text.startsWith("Không tìm thấy thông tin nhà cung cấp cần cập nhật trạng thái")) {
            return "Supplier information to update status not found";
        }
        if (text.startsWith("Không tìm thấy thông tin nhà cung cấp cần xóa")) {
            return "Supplier information to delete not found";
        }
        if (text.startsWith("Không tìm thấy thông tin nhà cung cấp cần chỉnh sửa")) {
            return "Supplier information to edit not found";
        }
        if (text.startsWith("Không tìm thấy nhà cung cấp hoặc dữ liệu không thuộc quyền quản lý")) {
            return "Supplier not found or not managed by your unit";
        }
        if (text.startsWith("Không tìm thấy nhà cung cấp")) {
            return "Supplier not found";
        }
        if (text.startsWith("Không tìm thấy thông tin đơn vị")) {
            return "Unit information not found";
        }
        if (text.startsWith("Không tìm thấy đơn vị")) {
            return "Unit not found";
        }
        if (text.startsWith("Không tìm thấy vị trả") || text.startsWith("Không tìm thấy vị trí")) {
            return "Location not found";
        }
        if (text.startsWith("Không tìm thấy phòng ban")) {
            return "Department not found";
        }
        if (text.startsWith("Không tìm thấy danh mục cấu hình")) {
            return "Configuration category not found";
        }
        if (text.startsWith("Không tìm thấy cấu hình đơn vị")) {
            return "Unit configuration not found";
        }
        if (text.startsWith("Không tìm thấy phiếu nhập kho tài sản hợp lệ")) {
            return "Valid asset import voucher not found";
        }
        if (text.startsWith("Không tìm thấy thông tin phiếu nhập cần chỉnh sửa")) {
            return "Asset import voucher information to edit not found";
        }
        if (text.startsWith("Không tìm thấy thông tin phiếu nhập cần cập nhật trạng thái")) {
            return "Asset import voucher information to update status not found";
        }
        if (text.startsWith("Không tìm thấy thông tin phiếu nhập cần xóa")) {
            return "Asset import voucher information to delete not found";
        }
        if (text.startsWith("Không tìm thấy đơn hàng mua sắm")) {
            return "Purchase order not found";
        }
        if (text.startsWith("Không tìm thấy thông tin đơn hàng mua sắm cần chỉnh sửa")) {
            return "Purchase order information to edit not found";
        }
        if (text.startsWith("Không tìm thấy thông tin đơn hàng mua sắm cần xóa")) {
            return "Purchase order information to delete not found";
        }
        if (text.startsWith("Không tìm thấy phiếu thu hồi tài sản ID ")) {
            return text.replace("Không tìm thấy phiếu thu hồi tài sản ID ", "Asset retrieval ticket ID not found: ");
        }
        if (text.startsWith("Không tìm thấy chi tiết cấp phát ")) {
            return text.replace("Không tìm thấy chi tiết cấp phát ", "Allocation details not found: ");
        }

        // Dynamic patterns replacement
        if (text.startsWith("Không thể chuyển đổi trạng thái từ ")) {
            return text.replace("Không thể chuyển đổi trạng thái từ ", "Cannot transition status from ");
        }
        if (text.startsWith("Không thể phê duyệt đơn hàng ở trạng thái: ")) {
            return text.replace("Không thể phê duyệt đơn hàng ở trạng thái: ", "Cannot approve purchase order in status: ");
        }
        if (text.startsWith("Không thể phê duyệt phiếu ở trạng thái: ")) {
            return text.replace("Không thể phê duyệt phiếu ở trạng thái: ", "Cannot approve ticket in status: ");
        }
        if (text.startsWith("Không thể hoàn thành phiếu ở trạng thái: ")) {
            return text.replace("Không thể hoàn thành phiếu ở trạng thái: ", "Cannot complete ticket in status: ");
        }
        if (text.startsWith("Chi tiết cấp phát phần cứng ID ")) {
            return text.replace("Chi tiết cấp phát phần cứng ID ", "Hardware allocation details ID ");
        }
        if (text.startsWith("Chi tiết cấp phát phần mềm ID ")) {
            return text.replace("Chi tiết cấp phát phần mềm ID ", "Software allocation details ID ");
        }
        if (text.startsWith("Chi tiết cấp phát linh kiện ID ")) {
            return text.replace("Chi tiết cấp phát linh kiện ID ", "Component allocation details ID ");
        }
        if (text.startsWith("Thiết bị mã số serial ")) {
            return text.replace("Thiết bị mã số serial ", "Device with serial number ");
        }
        if (text.startsWith("Linh kiện số serial ")) {
            return text.replace("Linh kiện số serial ", "Component with serial number ");
        }
        if (text.startsWith("Thiết bị phần cứng với thẻ ")) {
            return text.replace("Thiết bị phần cứng với thẻ ", "Hardware device with tag ");
        }
        if (text.startsWith("Tải file lên hệ thống lưu trữ thất bại: ")) {
            return text.replace("Tải file lên hệ thống lưu trữ thất bại: ", "Upload file to storage system failed: ");
        }
        if (text.startsWith("Không thể tạo liên kết tải file: ")) {
            return text.replace("Không thể tạo liên kết tải file: ", "Cannot create file download link: ");
        }
        if (text.startsWith("Vui lòng cấu hình thuộc tính bắt buộc: ")) {
            return text.replace("Vui lòng cấu hình thuộc tính bắt buộc: ", "Please configure mandatory attribute: ");
        }
        
        // Middle replacements (e.g. Thuộc tính '...' hiện đang bị khóa)
        if (text.startsWith("Thuộc tính '") && text.endsWith("' hiện đang bị khóa")) {
            String attrName = text.substring(12, text.length() - 20);
            return "Attribute '" + attrName + "' is currently locked";
        }
        if (text.startsWith("Giá trị thuộc tính '") && text.endsWith("' là bắt buộc nhập")) {
            String attrName = text.substring(20, text.length() - 19);
            return "Attribute value '" + attrName + "' is required";
        }
        if (text.startsWith("Lựa chọn gợi ý '") && text.contains("' không thuộc thuộc tính '")) {
            return text.replace("Lựa chọn gợi ý '", "Suggested option '")
                       .replace("' không thuộc thuộc tính '", "' does not belong to attribute '");
        }
        if (text.startsWith("Lựa chọn gợi ý '") && text.endsWith("' hiện đang bị khóa")) {
            String optName = text.substring(16, text.length() - 20);
            return "Suggested option '" + optName + "' is currently locked";
        }
        
        return text;
    }
}
