package com.eventhub.service;

import com.eventhub.dto.response.DashboardStatsResponse;
import java.util.Map;

public interface AnalyticsService {
    DashboardStatsResponse getAdminDashboard();
    Map<String, Object>    getOrganizerDashboard();
    Map<String, Object>    getAdminAnalytics();      // ← NEW: chart data for admin reports page
}