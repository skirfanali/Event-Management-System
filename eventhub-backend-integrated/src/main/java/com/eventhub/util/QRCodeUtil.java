package com.eventhub.util;

import com.google.zxing.*;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.UUID;

@Component
public class QRCodeUtil {

    public byte[] generateQRCodeBytes(String data, int width, int height) throws Exception {
        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix matrix = writer.encode(data, BarcodeFormat.QR_CODE, width, height);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", out);
        return out.toByteArray();
    }

    public String generateQRCodeBase64(String data) throws Exception {
        byte[] bytes = generateQRCodeBytes(data, 300, 300);
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(bytes);
    }

    public String generateUniqueQRData(Long userId, Long eventId, Long registrationId) {
        return String.format("EH-%d-%d-%d-%s",
            userId, eventId, registrationId,
            UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    }

    public String generateTicketCode() {
        return "TKT-" + System.currentTimeMillis() + "-"
             + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    public String generateCertificateCode() {
        return "CERT-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    }
}
