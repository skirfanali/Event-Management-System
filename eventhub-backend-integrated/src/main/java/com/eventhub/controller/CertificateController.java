package com.eventhub.controller;

import com.eventhub.dto.response.*;
import com.eventhub.service.CertificateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
@Tag(name = "Certificates", description = "Participation certificate generation and download")
@SecurityRequirement(name = "Bearer Auth")
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping("/my")
    @Operation(summary = "Get current user's certificates")
    public ResponseEntity<ApiResponse<List<CertificateResponse>>> getMyCertificates() {
        return ResponseEntity.ok(ApiResponse.success("Certificates fetched",
                certificateService.getMycertificates()));
    }

    @GetMapping("/{code}/download")
    @Operation(summary = "Download certificate as PDF")
    public ResponseEntity<byte[]> download(@PathVariable String code) {
        byte[] pdf = certificateService.downloadCertificate(code);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"certificate-" + code + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/{code}/verify")
    @Operation(summary = "Verify a certificate by code")
    public ResponseEntity<ApiResponse<CertificateResponse>> verify(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success("Certificate is valid",
                certificateService.verify(code)));
    }
}
