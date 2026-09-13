package com.eventhub.controller;

import com.eventhub.dto.response.*;
import com.eventhub.service.TicketService;
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
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Tag(name = "Tickets", description = "Ticket generation, QR codes, PDF download")
@SecurityRequirement(name = "Bearer Auth")
public class TicketController {

    private final TicketService ticketService;

    @GetMapping("/my")
    @Operation(summary = "Get all tickets of current user")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getMyTickets() {
        return ResponseEntity.ok(ApiResponse.success("My tickets", ticketService.getMyTickets()));
    }

    @GetMapping("/{ticketCode}")
    @Operation(summary = "Get ticket by code")
    public ResponseEntity<ApiResponse<TicketResponse>> getByCode(@PathVariable String ticketCode) {
        return ResponseEntity.ok(ApiResponse.success("Ticket found", ticketService.getByCode(ticketCode)));
    }

    @GetMapping("/{ticketCode}/qr")
    @Operation(summary = "Get QR code (Base64) for a ticket")
    public ResponseEntity<ApiResponse<String>> getQRCode(@PathVariable String ticketCode) {
        return ResponseEntity.ok(ApiResponse.success("QR code generated", ticketService.getQRCodeBase64(ticketCode)));
    }

    @GetMapping("/{ticketCode}/download")
    @Operation(summary = "Download ticket as PDF")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable String ticketCode) {
        byte[] pdf = ticketService.downloadTicketPdf(ticketCode);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ticket-" + ticketCode + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
