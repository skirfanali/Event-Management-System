package com.eventhub.util;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ✅ MIGRATED: Render's free tier blocks outbound SMTP (ports 25/465/587) as of
 * Sept 2025 — see Render's changelog. Every email send via JavaMailSender/Gmail
 * SMTP was timing out at the TCP level before ever reaching Gmail. This class now
 * sends through Brevo's HTTPS transactional email API (port 443, never blocked)
 * instead of opening a raw SMTP socket. No JavaMailSender/spring.mail.* usage
 * remains.
 */
@Component
@Slf4j
public class EmailUtil {

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.mail.from}")
    private String from;

    @Value("${app.mail.from-name:EventHub}")
    private String fromName;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    @PostConstruct
    void checkMailConfig() {
        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            log.warn("⚠️ BREVO_API_KEY is not set — all emails will fail to send.");
        }
        if (from == null || from.isBlank()) {
            log.warn("⚠️ MAIL_FROM (app.mail.from) is not set — all emails will fail to send.");
        }
        log.info("📧 Mail config loaded — provider=Brevo(HTTP API), from={}, frontendUrl={}", from, frontendUrl);
    }

    // ── Verification email — synchronous, throws on failure ────────────────────
    // Kept synchronous and throwing (unlike the others below) so the registration
    // transaction itself surfaces a failure instead of silently succeeding.
    public void sendVerificationEmail(String to, String name, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;

        String html =
                "<p>Hello " + name + ",</p>" +
                "<p>Please verify your email address by clicking the button below:</p>" +
                "<a href='" + link + "' " +
                "style='background:#6366f1;color:white;padding:12px 24px;" +
                "border-radius:8px;text-decoration:none;font-weight:bold;" +
                "display:inline-block;margin:16px 0;'>" +
                "Verify Email</a>" +
                "<p style='color:#888;margin-top:16px;font-size:13px;'>" +
                "Or copy this link:<br/>" +
                "<a href='" + link + "' style='color:#6366f1;'>" + link + "</a></p>" +
                "<p style='color:#888;margin-top:16px;'>Link expires in 24 hours.</p>";

        log.info("📧 Starting verification email");
        log.info("📧 To: {}", to);

        sendHtml(to, "Verify Your Email - EventHub", html, true);

        log.info("✅ VERIFICATION EMAIL SENT SUCCESSFULLY TO {}", to);
    }

    @Async
    public void sendPasswordResetEmail(String to, String name, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        String html = buildEmailHtml("Reset Your Password", name,
            "<p>You requested a password reset. Click below to reset it:</p>" +
            "<a href='" + link + "' style='background:#f43f5e;color:white;padding:12px 24px;" +
            "border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin:16px 0;'>" +
            "Reset Password</a>" +
            "<p style='color:#888;margin-top:16px;'>Link expires in 1 hour. Ignore if not requested.</p>");
        sendHtml(to, "Reset Password - EventHub", html, false);
    }

    @Async
    public void sendRegistrationConfirmationEmail(String to, String name,
                                                   String eventTitle, String ticketCode,
                                                   String eventDate, String venue) {
        String html = buildEmailHtml("Registration Confirmed! 🎫", name,
            "<p>You are successfully registered for:</p>" +
            "<h2 style='color:#6366f1;'>" + eventTitle + "</h2>" +
            "<table style='width:100%;border-collapse:collapse;margin:16px 0;'>" +
            "<tr><td style='padding:8px;border:1px solid #e5e7eb;font-weight:bold;'>Date</td>" +
            "<td style='padding:8px;border:1px solid #e5e7eb;'>" + eventDate + "</td></tr>" +
            "<tr><td style='padding:8px;border:1px solid #e5e7eb;font-weight:bold;'>Venue</td>" +
            "<td style='padding:8px;border:1px solid #e5e7eb;'>" + venue + "</td></tr>" +
            "<tr><td style='padding:8px;border:1px solid #e5e7eb;font-weight:bold;'>Ticket ID</td>" +
            "<td style='padding:8px;border:1px solid #e5e7eb;font-family:monospace;'>" + ticketCode + "</td></tr>" +
            "</table>" +
            "<p>Show your QR ticket at the venue entrance. 🎉</p>");
        sendHtml(to, "Ticket Confirmed - " + eventTitle, html, false);
    }

    @Async
    public void sendEventReminderEmail(String to, String name, String eventTitle,
                                        String venue, String eventDate) {
        String html = buildEmailHtml("Event Tomorrow! 📅", name,
            "<p><strong>" + eventTitle + "</strong> is happening tomorrow!</p>" +
            "<p>📍 <strong>Venue:</strong> " + venue + "</p>" +
            "<p>🕐 <strong>Date:</strong> " + eventDate + "</p>" +
            "<p>Don't forget to bring your QR ticket. See you there! 🎉</p>");
        sendHtml(to, "Reminder: " + eventTitle + " is Tomorrow!", html, false);
    }

    @Async
    public void sendCertificateEmail(String to, String name, String eventTitle) {
        String html = buildEmailHtml("Your Certificate is Ready! 🏆", name,
            "<p>Congratulations! Your participation certificate for <strong>" +
            eventTitle + "</strong> has been generated.</p>" +
            "<a href='" + frontendUrl + "/dashboard/certificates' style='background:#6366f1;" +
            "color:white;padding:12px 24px;border-radius:8px;text-decoration:none;" +
            "font-weight:bold;display:inline-block;margin:16px 0;'>Download Certificate</a>");
        sendHtml(to, "Certificate Ready - " + eventTitle, html, false);
    }

    @Async
    public void sendOrganizerRequestConfirmationEmail(String to, String name) {
        String text =
            "Hi " + name + ",\n\n" +
            "We have received your request to become an organizer on CampusEvents.\n\n" +
            "Our admin team will review your application and get back to you within 24–48 hours.\n\n" +
            "– The CampusEvents Team";
        sendText(to, "CampusEvents – Organizer Request Received", text, false);
    }

    @Async
    public void sendOrganizerApprovalEmail(String to, String name) {
        String text =
            "Hi " + name + ",\n\n" +
            "Your organizer account request has been APPROVED!\n\n" +
            "Login here: " + frontendUrl + "/login\n\n" +
            "Welcome aboard!\n\n– The CampusEvents Team";
        sendText(to, "🎉 CampusEvents – Your Organizer Account is Approved!", text, false);
    }

    @Async
    public void sendOrganizerRejectionEmail(String to, String name, String reason) {
        String text =
            "Hi " + name + ",\n\n" +
            "After reviewing your application, we are unable to approve your request at this time.\n\n" +
            (reason != null && !reason.isBlank() ? "Reason: " + reason + "\n\n" : "") +
            "You are welcome to reapply in the future.\n\n– The CampusEvents Team";
        sendText(to, "CampusEvents – Organizer Request Update", text, false);
    }

    // ── Core senders — HTTPS to Brevo, no SMTP socket involved ─────────────────

    private void sendHtml(String to, String subject, String html, boolean criticalPath) {
        Map<String, Object> body = buildBody(to, subject);
        body.put("htmlContent", html);
        post(body, to, subject, criticalPath);
    }

    private void sendText(String to, String subject, String text, boolean criticalPath) {
        Map<String, Object> body = buildBody(to, subject);
        body.put("textContent", text);
        post(body, to, subject, criticalPath);
    }

    private Map<String, Object> buildBody(String to, String subject) {
        Map<String, Object> body = new HashMap<>();
        Map<String, String> sender = new HashMap<>();
        sender.put("name", fromName);
        sender.put("email", from);
        body.put("sender", sender);
        body.put("to", List.of(Map.of("email", to)));
        body.put("subject", subject);
        return body;
    }

    /**
     * @param criticalPath if true, rethrows on failure (verification email only —
     *                     the caller/registration flow needs to see it failed).
     *                     Everything else logs and swallows, same as before.
     */
    private void post(Map<String, Object> body, String to, String subject, boolean criticalPath) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoApiKey);
            headers.set("accept", "application/json");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(BREVO_API_URL, request, String.class);

            log.info("✅ Email sent via Brevo to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("❌ Failed to send email to {} [{}]: {}", to, subject, e.getMessage(), e);
            if (criticalPath) {
                throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
            }
        }
    }

    private String buildEmailHtml(String heading, String name, String body) {
        return "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;max-width:600px;" +
               "margin:0 auto;padding:20px;background:#f9fafb;'>" +
               "<div style='background:white;border-radius:12px;padding:32px;" +
               "box-shadow:0 2px 8px rgba(0,0,0,0.08);'>" +
               "<div style='text-align:center;margin-bottom:24px;'>" +
               "<h1 style='color:#6366f1;margin:0;font-size:24px;'>EventHub</h1></div>" +
               "<h2 style='color:#1f2937;'>" + heading + "</h2>" +
               "<p>Hi <strong>" + name + "</strong>,</p>" +
               body +
               "<hr style='border:none;border-top:1px solid #e5e7eb;margin:24px 0;'/>" +
               "<p style='color:#9ca3af;font-size:12px;text-align:center;'>" +
               "© 2024 EventHub. All rights reserved.</p></div></body></html>";
    }
}