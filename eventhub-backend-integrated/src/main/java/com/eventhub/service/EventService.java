package com.eventhub.service;

import com.eventhub.dto.request.EventRequest;
import com.eventhub.dto.response.EventResponse;
import com.eventhub.dto.response.PagedResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface EventService {
    EventResponse create(EventRequest request);
    EventResponse update(Long id, EventRequest request);
    void delete(Long id);
    EventResponse getById(Long id);
    PagedResponse<EventResponse> getAll(int page, int size, String sortBy, String sortDir);
    PagedResponse<EventResponse> search(String search, String category, Boolean isFree,
                                         String status, int page, int size, String sortBy, String sortDir);
    List<EventResponse> getFeatured();
    List<EventResponse> getTrending();
    PagedResponse<EventResponse> getByOrganizer(int page, int size);
    String uploadEventImage(Long eventId, MultipartFile file);
    void updateEventStatuses();
}
