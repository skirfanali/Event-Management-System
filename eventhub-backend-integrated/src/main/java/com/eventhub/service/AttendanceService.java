package com.eventhub.service;

import com.eventhub.dto.request.AttendanceScanRequest;
import com.eventhub.dto.response.AttendanceResponse;
import com.eventhub.dto.response.PagedResponse;

import java.util.Map;

public interface AttendanceService {
    AttendanceResponse scanQR(AttendanceScanRequest request);
    PagedResponse<AttendanceResponse> getEventAttendance(Long eventId, int page, int size);
    Map<String, Object> getAttendanceStats(Long eventId);
    // ✅ NEW: Get current user's attendance history
    PagedResponse<AttendanceResponse> getMyAttendance(int page, int size);
}