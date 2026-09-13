package com.eventhub.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardStatsResponse {

    // ── Summary counts ─────────────────────────────────────────────────────
    private Long        totalUsers;
    private Long        totalOrganizers;
    private Long        totalEvents;
    private Long        totalRegistrations;
    private Long        activeEvents;
    private Long        upcomingEvents;
    private Long        completedEvents;
    private BigDecimal  totalRevenue;
    private Long        totalTickets;
    private String      mostPopularEvent;

    // ── Chart data ─────────────────────────────────────────────────────────
    // [ { month:"Jan", revenue: 45000 }, … ]          → RevenueChart
    private List<Map<String, Object>> revenueChart;

    // [ { month:"Jan", users: 120, events: 8 }, … ]   → GrowthChart  (was monthlyGrowth)
    private List<Map<String, Object>> monthlyGrowth;

    // [ { name:"Music", value: 35, count: 7 }, … ]    → CategoryChart (was categoryStats)
    private List<Map<String, Object>> categoryStats;

    // [ { month:"Jan", count: 340 }, … ]              → RegistrationChart
    private List<Map<String, Object>> registrationChart;
}