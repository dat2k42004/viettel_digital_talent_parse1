package com.example.backend.modules.file.service.interfaces;

import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.util.List;

public interface FileService {
    String uploadFile(MultipartFile file);
    List<String> uploadFiles(List<MultipartFile> files);
    InputStream downloadFile(String key);
    String getOriginalFilename(String key);
    long getFileLength(String key);
    String getContentType(String key);
}
