package com.example.backend.modules.file.controller;

import com.example.backend.modules.file.service.interfaces.FileService;
import com.example.backend.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    public ApiResponse<String> download(@RequestParam("key") String key) {
        String presignedUrl = fileService.generatePresignedDownloadUrl(key);
        return ApiResponse.success(presignedUrl);
    }
}
