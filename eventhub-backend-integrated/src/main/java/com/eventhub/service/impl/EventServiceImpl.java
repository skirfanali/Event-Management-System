package com.eventhub.service.impl;

import com.eventhub.dto.request.EventRequest;
import com.eventhub.dto.response.EventResponse;
import com.eventhub.dto.response.PagedResponse;
import com.eventhub.entity.*;
import com.eventhub.enums.EventStatus;
import com.eventhub.enums.Role;
import com.eventhub.exception.*;
import com.eventhub.repository.*;
import com.eventhub.service.CloudinaryService;
import com.eventhub.service.EventService;
import com.eventhub.util.PageUtil;
import com.eventhub.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class EventServiceImpl implements EventService {

    private final EventRepository      eventRepository;
    private final CategoryRepository   categoryRepository;
    private final WishlistRepository   wishlistRepository;
    private final RegistrationRepository registrationRepository;
    private final CloudinaryService    cloudinaryService;
    private final SecurityUtil         securityUtil;

    @Override
    public EventResponse create(EventRequest request) {
        User organizer = securityUtil.getCurrentUser();
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        Event event = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(category)
                .organizer(organizer)
                .eventDate(request.getEventDate())
                .endDate(request.getEndDate())
                .venue(request.getVenue())
                .venueAddress(request.getVenueAddress())
                .city(request.getCity())
                .capacity(request.getCapacity())
                .price(request.getPrice())
                .isFree(request.isFree())
                .tags(request.getTags())
                .imageUrl(request.getImageUrl())
                .status(EventStatus.UPCOMING)
                .build();

        return toResponse(eventRepository.save(event), organizer.getId());
    }

    @Override
    public EventResponse update(Long id, EventRequest request) {
        User current = securityUtil.getCurrentUser();
        Event event = getEventOrThrow(id);

        if (!event.getOrganizer().getId().equals(current.getId()) && current.getRole() != Role.ADMIN) {
            throw new ForbiddenException("You don't have permission to edit this event");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setCategory(category);
        event.setEventDate(request.getEventDate());
        event.setEndDate(request.getEndDate());
        event.setVenue(request.getVenue());
        event.setVenueAddress(request.getVenueAddress());
        event.setCity(request.getCity());
        event.setCapacity(request.getCapacity());
        event.setPrice(request.getPrice());
        event.setFree(request.isFree());
        event.setTags(request.getTags());
        if (request.getImageUrl() != null) event.setImageUrl(request.getImageUrl());

        return toResponse(eventRepository.save(event), current.getId());
    }

    @Override
    public void delete(Long id) {
        User current = securityUtil.getCurrentUser();
        Event event = getEventOrThrow(id);

        if (!event.getOrganizer().getId().equals(current.getId()) && current.getRole() != Role.ADMIN) {
            throw new ForbiddenException("You don't have permission to delete this event");
        }
        event.setDeleted(true);
        event.setStatus(EventStatus.CANCELLED);
        eventRepository.save(event);
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponse getById(Long id) {
        Event event = getEventOrThrow(id);
        Long currentUserId = tryGetCurrentUserId();
        return toResponse(event, currentUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<EventResponse> getAll(int page, int size, String sortBy, String sortDir) {
        Pageable pageable = PageUtil.createPageable(page, size, sortBy, sortDir);
        Long currentUserId = tryGetCurrentUserId();
        Page<Event> events = eventRepository.findByDeletedFalse(pageable);
        return PageUtil.toPagedResponse(events.map(e -> toResponse(e, currentUserId)));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<EventResponse> search(String search, String category, Boolean isFree,
                                                String status, int page, int size,
                                                String sortBy, String sortDir) {
        Pageable pageable = PageUtil.createPageable(page, size, sortBy, sortDir);
        EventStatus es = (status != null && !status.isBlank()) ? EventStatus.valueOf(status.toUpperCase()) : null;
        Long uid = tryGetCurrentUserId();
        Page<Event> events = eventRepository.searchEvents(search, category, isFree, es, pageable);
        return PageUtil.toPagedResponse(events.map(e -> toResponse(e, uid)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> getFeatured() {
        Long uid = tryGetCurrentUserId();
        return eventRepository.findFeatured(PageRequest.of(0, 6))
                .stream().map(e -> toResponse(e, uid)).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> getTrending() {
        Long uid = tryGetCurrentUserId();
        return eventRepository.findTopByRegisteredCount(PageRequest.of(0, 6))
                .stream().map(e -> toResponse(e, uid)).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<EventResponse> getByOrganizer(int page, int size) {
        User organizer = securityUtil.getCurrentUser();
        Pageable pageable = PageUtil.createPageable(page, size, "createdAt", "desc");
        Page<Event> events = eventRepository.findByOrganizerIdAndDeletedFalse(organizer.getId(), pageable);
        return PageUtil.toPagedResponse(events.map(e -> toResponse(e, organizer.getId())));
    }

    @Override
    public String uploadEventImage(Long eventId, MultipartFile file) {
        Event event = getEventOrThrow(eventId);
        User current = securityUtil.getCurrentUser();
        if (!event.getOrganizer().getId().equals(current.getId()) && current.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Not authorized");
        }
        if (event.getImagePublicId() != null) cloudinaryService.deleteImage(event.getImagePublicId());
        Map<String, String> result = cloudinaryService.uploadImage(file, "events");
        event.setImageUrl(result.get("url"));
        event.setImagePublicId(result.get("publicId"));
        eventRepository.save(event);
        return result.get("url");
    }

    @Override
    @Scheduled(fixedDelay = 3600000) // every hour
    public void updateEventStatuses() {
        LocalDateTime now = LocalDateTime.now();
        eventRepository.findAll().forEach(event -> {
            if (event.isDeleted()) return;
            if (event.getStatus() == EventStatus.CANCELLED) return;
            if (event.getEventDate().isBefore(now) && (event.getEndDate() == null || event.getEndDate().isBefore(now))) {
                event.setStatus(EventStatus.COMPLETED);
            } else if (event.getEventDate().isBefore(now)) {
                event.setStatus(EventStatus.ONGOING);
            }
            eventRepository.save(event);
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private Event getEventOrThrow(Long id) {
        return eventRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
    }

    private Long tryGetCurrentUserId() {
        try { return securityUtil.getCurrentUserId(); } catch (Exception e) { return null; }
    }

    private EventResponse toResponse(Event e, Long currentUserId) {
        boolean wishlisted  = currentUserId != null && wishlistRepository.existsByUserIdAndEventId(currentUserId, e.getId());
        boolean registered  = currentUserId != null &&
            registrationRepository.existsByUserIdAndEventIdAndStatus(currentUserId, e.getId(),
                com.eventhub.enums.RegistrationStatus.ACTIVE);

        return EventResponse.builder()
                .id(e.getId())
                .title(e.getTitle())
                .description(e.getDescription())
                .category(e.getCategory() != null ? e.getCategory().getName() : null)
                .categoryId(e.getCategory() != null ? e.getCategory().getId() : null)
                .organizerName(e.getOrganizer().getName())
                .organizerId(e.getOrganizer().getId())
                .eventDate(e.getEventDate())
                .endDate(e.getEndDate())
                .venue(e.getVenue())
                .venueAddress(e.getVenueAddress())
                .city(e.getCity())
                .capacity(e.getCapacity())
                .registeredCount(e.getRegisteredCount())
                .price(e.getPrice())
                .isFree(e.isFree())
                .imageUrl(e.getImageUrl())
                .status(e.getStatus())
                .tags(e.getTags())
                .avgRating(e.getAvgRating())
                .reviewCount(e.getReviewCount())
                .createdAt(e.getCreatedAt())
                .wishlisted(wishlisted)
                .registeredByCurrentUser(registered)
                .spotsLeft(Math.max(0, e.getCapacity() - e.getRegisteredCount()))
                .build();
    }
}
