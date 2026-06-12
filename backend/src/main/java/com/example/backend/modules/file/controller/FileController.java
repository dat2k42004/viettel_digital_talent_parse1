package com.example.backend.modules.file.controller;

import com.example.backend.modules.file.service.interfaces.FileService;
import com.example.backend.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    @PreAuthorize("hasAuthority('TAI_LEN_FILE')")
    public ApiResponse<List<String>> upload(@RequestParam("files") List<MultipartFile> files) {
        return ApiResponse.success(fileService.uploadFiles(files));
    }

    @GetMapping("/download")
    @PreAuthorize("hasAuthority('TAI_XUONG_FILE')")
    public ResponseEntity<InputStreamResource> download(@RequestParam("key") String key) {
        InputStream is = fileService.downloadFile(key);
        String filename = fileService.getOriginalFilename(key);
        long length = fileService.getFileLength(key);
        String contentType = fileService.getContentType(key);

        String encodedFilename = URLEncoder.encode(filename, StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFilename)
                .contentType(MediaType.parseMediaType(contentType))
                .contentLength(length)
                .body(new InputStreamResource(is));
    }
}
