package com.eventhub.service.impl;

import com.eventhub.dto.response.DashboardStatsResponse;
import com.eventhub.enums.EventStatus;
import com.eventhub.enums.Role;
import com.eventhub.enums.RegistrationStatus;
import com.eventhub.repository.*;
import com.eventhub.service.AnalyticsService;
import com.eventhub.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private final UserRepository         userRepository;
    private final EventRepository        eventRepository;
    private final RegistrationRepository registrationRepository;
    private final PaymentRepository      paymentRepository;
    private final TicketRepository       ticketRepository;
    private final AttendanceRepository   attendanceRepository;
    private final SecurityUtil           securityUtil;

    // ── Admin dashboard: summary counts + all chart data ──────────────────
    @Override
    public DashboardStatsResponse getAdminDashboard() {
        LocalDateTime since = LocalDateTime.now().minusMonths(6);

        String mostPopular = eventRepository
                .findTopByRegisteredCount(PageRequest.of(0, 1))
                .stream().findFirst().map(e -> e.getTitle()).orElse("N/A");

        // ── 1. Revenue chart ───────────────────────────────────────────────
        List<Object[]> revenueRaw = paymentRepository.getMonthlyRevenuePlatform(since);
        LinkedHashMap<String, BigDecimal> revenueMap = buildMonthMap6();
        for (Object[] row : revenueRaw) {
            String label = monthLabel(((Number) row[0]).intValue());
            if (revenueMap.containsKey(label))
                revenueMap.put(label, row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO);
        }
        List<Map<String, Object>> revenueChart = new ArrayList<>();
        revenueMap.forEach((m, v) -> revenueChart.add(Map.of("month", m, "revenue", v)));

        // ── 2. Growth chart (users + events per month) ────────────────────
        List<Object[]> userGrowthRaw  = userRepository.getMonthlyUserGrowth(since);
        List<Object[]> eventGrowthRaw = eventRepository.getMonthlyEventGrowth(since);

        LinkedHashMap<String, Long> userMap  = buildMonthMapLong6();
        LinkedHashMap<String, Long> eventMap = buildMonthMapLong6();
        for (Object[] row : userGrowthRaw) {
            String label = monthLabel(((Number) row[0]).intValue());
            if (userMap.containsKey(label)) userMap.put(label, ((Number) row[2]).longValue());
        }
        for (Object[] row : eventGrowthRaw) {
            String label = monthLabel(((Number) row[0]).intValue());
            if (eventMap.containsKey(label)) eventMap.put(label, ((Number) row[2]).longValue());
        }
        List<Map<String, Object>> monthlyGrowth = new ArrayList<>();
        userMap.forEach((m, users) ->
            monthlyGrowth.add(Map.of("month", m, "users", users, "events", eventMap.getOrDefault(m, 0L)))
        );

        // ── 3. Category chart ─────────────────────────────────────────────
        List<Object[]> catRaw  = eventRepository.countAllEventsByCategory();
        long           total   = eventRepository.countByDeletedFalse();
        List<Map<String, Object>> categoryStats = new ArrayList<>();
        for (Object[] row : catRaw) {
            String name  = row[0] != null ? (String) row[0] : "Other";
            long   count = ((Number) row[1]).longValue();
            double pct   = total > 0 ? Math.round((count * 100.0) / total) : 0;
            categoryStats.add(Map.of("name", name, "value", pct, "count", count));
        }

        // ── 4. Registration chart (monthly) ───────────────────────────────
        List<Object[]> regRaw = registrationRepository.getMonthlyRegistrationsPlatform(since);
        LinkedHashMap<String, Long> regMap = buildMonthMapLong6();
        for (Object[] row : regRaw) {
            String label = monthLabel(((Number) row[0]).intValue());
            if (regMap.containsKey(label)) regMap.put(label, ((Number) row[2]).longValue());
        }
        List<Map<String, Object>> registrationChart = new ArrayList<>();
        regMap.forEach((m, v) -> registrationChart.add(Map.of("month", m, "count", v)));

        return DashboardStatsResponse.builder()
                // summary
                .totalUsers(userRepository.countByRole(Role.USER))
                .totalOrganizers(userRepository.countByRole(Role.ORGANIZER))
                .totalEvents(eventRepository.countByDeletedFalse())
                .totalRegistrations(registrationRepository.countTotalActive())
                .activeEvents(eventRepository.countByStatusAndDeletedFalse(EventStatus.ONGOING))
                .upcomingEvents(eventRepository.countByStatusAndDeletedFalse(EventStatus.UPCOMING))
                .completedEvents(eventRepository.countByStatusAndDeletedFalse(EventStatus.COMPLETED))
                .totalRevenue(paymentRepository.getTotalRevenue())
                .totalTickets(ticketRepository.count())
                .mostPopularEvent(mostPopular)
                // charts
                .revenueChart(revenueChart)
                .monthlyGrowth(monthlyGrowth)
                .categoryStats(categoryStats)
                .registrationChart(registrationChart)
                .build();
    }

    // ── Admin analytics endpoint (for Reports page) ───────────────────────
    @Override
    public Map<String, Object> getAdminAnalytics() {
        LocalDateTime since = LocalDateTime.now().minusMonths(6);

        // Revenue
        List<Object[]> revenueRaw = paymentRepository.getMonthlyRevenuePlatform(since);
        LinkedHashMap<String, BigDecimal> revenueMap = buildMonthMap6();
        for (Object[] row : revenueRaw) {
            String label = monthLabel(((Number) row[0]).intValue());
            if (revenueMap.containsKey(label))
                revenueMap.put(label, row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO);
        }
        List<Map<String, Object>> revenueChart = new ArrayList<>();
        revenueMap.forEach((m, v) -> revenueChart.add(Map.of("month", m, "revenue", v)));

        // Growth
        List<Object[]> userGrowthRaw  = userRepository.getMonthlyUserGrowth(since);
        List<Object[]> eventGrowthRaw = eventRepository.getMonthlyEventGrowth(since);
        LinkedHashMap<String, Long> userMap  = buildMonthMapLong6();
        LinkedHashMap<String, Long> eventMap = buildMonthMapLong6();
        for (Object[] row : userGrowthRaw) {
            String label = monthLabel(((Number) row[0]).intValue());
            if (userMap.containsKey(label)) userMap.put(label, ((Number) row[2]).longValue());
        }
        for (Object[] row : eventGrowthRaw) {
            String label = monthLabel(((Number) row[0]).intValue());
            if (eventMap.containsKey(label)) eventMap.put(label, ((Number) row[2]).longValue());
        }
        List<Map<String, Object>> growthChart = new ArrayList<>();
        userMap.forEach((m, users) ->
            growthChart.add(Map.of("month", m, "users", users, "events", eventMap.getOrDefault(m, 0L)))
        );

        // Category
        List<Object[]> catRaw = eventRepository.countAllEventsByCategory();
        long total = eventRepository.countByDeletedFalse();
        List<Map<String, Object>> categoryChart = new ArrayList<>();
        for (Object[] row : catRaw) {
            String name  = row[0] != null ? (String) row[0] : "Other";
            long   count = ((Number) row[1]).longValue();
            double pct   = total > 0 ? Math.round((count * 100.0) / total) : 0;
            categoryChart.add(Map.of("name", name, "value", pct, "count", count));
        }

        // Attendance (top 6 events)
        var topEvents = eventRepository
                .findTopByRegisteredCount(PageRequest.of(0, 6))
                .stream().toList();
        List<Map<String, Object>> attendanceChart = new ArrayList<>();
        topEvents.forEach(ev -> {
            long registered = registrationRepository.countByEventIdAndStatus(
                    ev.getId(), RegistrationStatus.ACTIVE);
            long attended   = attendanceRepository.countByEventId(ev.getId());
            String title    = ev.getTitle().length() > 15
                    ? ev.getTitle().substring(0, 13) + "…" : ev.getTitle();
            attendanceChart.add(Map.of("event", title, "registered", registered, "attended", attended));
        });

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("revenueChart",    revenueChart);
        result.put("growthChart",     growthChart);
        result.put("categoryChart",   categoryChart);
        result.put("attendanceChart", attendanceChart);
        return result;
    }

    // ── Organizer dashboard (unchanged) ───────────────────────────────────
    @Override
    public Map<String, Object> getOrganizerDashboard() {
        Long uid            = securityUtil.getCurrentUserId();
        LocalDateTime since = LocalDateTime.now().minusMonths(6);

        var organizerEvents = eventRepository
                .findByOrganizerIdAndDeletedFalse(uid, PageRequest.of(0, 1000))
                .getContent();

        long totalRegistrations = organizerEvents.stream()
                .mapToLong(e -> registrationRepository
                        .countByEventIdAndStatus(e.getId(), RegistrationStatus.ACTIVE))
                .sum();

        BigDecimal totalRevenue = paymentRepository.getTotalRevenueByOrganizer(uid);

        List<Object[]> revenueRaw = paymentRepository.getMonthlyRevenueByOrganizer(uid, since);
        LinkedHashMap<String, BigDecimal> revenueMap = buildMonthMap6();
        for (Object[] row : revenueRaw) {
            String label = monthLabel(((Number) row[0]).intValue());
            if (revenueMap.containsKey(label))
                revenueMap.put(label, row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO);
        }
        List<Map<String, Object>> revenueChart = new ArrayList<>();
        revenueMap.forEach((m, v) -> revenueChart.add(Map.of("month", m, "revenue", v)));

        List<Object[]> regRaw = registrationRepository.getMonthlyRegistrationsByOrganizer(uid, since);
        LinkedHashMap<String, Long> regMap = buildMonthMapLong6();
        for (Object[] row : regRaw) {
            String label = monthLabel(((Number) row[0]).intValue());
            if (regMap.containsKey(label)) regMap.put(label, ((Number) row[2]).longValue());
        }
        List<Map<String, Object>> registrationChart = new ArrayList<>();
        regMap.forEach((m, v) -> registrationChart.add(Map.of("month", m, "count", v)));

        List<Map<String, Object>> attendanceChart = new ArrayList<>();
        organizerEvents.stream().limit(6).forEach(ev -> {
            long registered = registrationRepository.countByEventIdAndStatus(
                    ev.getId(), RegistrationStatus.ACTIVE);
            long attended   = attendanceRepository.countByEventId(ev.getId());
            String title    = ev.getTitle().length() > 15
                    ? ev.getTitle().substring(0, 13) + "…" : ev.getTitle();
            attendanceChart.add(Map.of("event", title, "registered", registered, "attended", attended));
        });

        List<Object[]> catRaw = eventRepository.countEventsByCategory(uid);
        long catTotal = organizerEvents.size();
        List<Map<String, Object>> categoryChart = new ArrayList<>();
        for (Object[] row : catRaw) {
            String name  = row[0] != null ? (String) row[0] : "Other";
            long   count = ((Number) row[1]).longValue();
            double pct   = catTotal > 0 ? Math.round((count * 100.0) / catTotal) : 0;
            categoryChart.add(Map.of("name", name, "value", pct, "count", count));
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalEvents",        organizerEvents.size());
        result.put("totalRegistrations", totalRegistrations);
        result.put("totalRevenue",       totalRevenue);
        result.put("upcomingEvents",     eventRepository.countByStatusAndDeletedFalse(EventStatus.UPCOMING));
        result.put("revenueChart",       revenueChart);
        result.put("registrationChart",  registrationChart);
        result.put("attendanceChart",    attendanceChart);
        result.put("categoryChart",      categoryChart);
        return result;
    }

    // ── helpers ───────────────────────────────────────────────────────────
    private String monthLabel(int monthNum) {
        return Month.of(monthNum).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
    }

    private LinkedHashMap<String, BigDecimal> buildMonthMap6() {
        LinkedHashMap<String, BigDecimal> map = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--)
            map.put(monthLabel(LocalDateTime.now().minusMonths(i).getMonthValue()), BigDecimal.ZERO);
        return map;
    }

    private LinkedHashMap<String, Long> buildMonthMapLong6() {
        LinkedHashMap<String, Long> map = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--)
            map.put(monthLabel(LocalDateTime.now().minusMonths(i).getMonthValue()), 0L);
        return map;
    }
}