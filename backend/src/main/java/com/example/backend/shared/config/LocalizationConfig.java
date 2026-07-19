package com.example.backend.shared.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Locale;

@Configuration
public class LocalizationConfig {

     /**
      * LocaleResolver tự động trích xuất thông tin ngôn ngữ từ HTTP Header
      * "Accept-Language"
      */
     @Bean
     public LocaleResolver localeResolver() {
          AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
          // Ngôn ngữ mặc định là Tiếng Việt
          resolver.setDefaultLocale(new Locale("vi"));
          // Cấu hình các ngôn ngữ được hỗ trợ
          resolver.setSupportedLocales(Arrays.asList(new Locale("vi"), Locale.ENGLISH));
          return resolver;
     }

     /**
      * MessageSource liên kết các file message .properties phục vụ tra cứu thông tin
      * dịch
      */
     @Bean
     public ResourceBundleMessageSource messageSource() {
          ResourceBundleMessageSource source = new ResourceBundleMessageSource();
          // Đường dẫn file bắt đầu bằng messages (tìm messages_vi.properties,
          // messages_en.properties)
          source.setBasenames("messages");
          source.setDefaultEncoding(StandardCharsets.UTF_8.name());
          // Cho phép trả về mã code nếu không tìm thấy key dịch tương ứng thay vì ném lỗi
          source.setUseCodeAsDefaultMessage(true);
          return source;
     }
}
