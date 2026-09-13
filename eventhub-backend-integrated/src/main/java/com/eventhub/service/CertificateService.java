package com.eventhub.service;

import com.eventhub.dto.response.CertificateResponse;

import java.util.List;

public interface CertificateService {
    CertificateResponse generate(Long eventId, Long userId);
    List<CertificateResponse> getMycertificates();
    byte[] downloadCertificate(String certificateCode);
    CertificateResponse verify(String certificateCode);
}
