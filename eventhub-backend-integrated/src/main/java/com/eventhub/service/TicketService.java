package com.eventhub.service;

import com.eventhub.dto.response.TicketResponse;
import com.eventhub.entity.Ticket;

import java.util.List;

public interface TicketService {
    TicketResponse createTicket(Long registrationId);
    TicketResponse getByCode(String ticketCode);
    List<TicketResponse> getMyTickets();
    byte[] downloadTicketPdf(String ticketCode);
    String getQRCodeBase64(String ticketCode);
    Ticket getTicketEntityByCode(String ticketCode);
}
