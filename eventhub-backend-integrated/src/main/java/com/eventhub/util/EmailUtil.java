package com.eventhub.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import jakarta.mail.internet.MimeMessage;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailUtil {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    // ✅ FIX: No @Async — runs on same thread so we can catch errors properly.
    // ✅ FIX: Never throws — logs error but returns normally so registration
    //         is NOT rolled back if SMTP fails. User is saved, email may retry.
    public void sendVerificationEmail(String to, String name, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;
        String html = buildEmailHtml("Verify Your Email", name,
            "<p>Please verify your email address by clicking the button below:</p>" +
            "<a href='" + link + "' style='background:#6366f1;color:white;padding:12px 24px;" +
            "border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin:16px 0;'>" +
            "Verify Email</a>" +
            "<p style='color:#888;margin-top:16px;font-size:13px;'>Or copy this link:<br/>" +
            "<a href='" + link + "' style='color:#6366f1;'>" + link + "</a></p>" +
            "<p style='color:#888;margin-top:16px;'>Link expires in 24 hours.</p>");
        sendHtmlEmailSafe(to, "Verify Your Email - EventHub", html);
    }

    // ✅ FIX: No @Async, never throws
    public void sendPasswordResetEmail(String to, String name, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        String html = buildEmailHtml("Reset Your Password", name,
            "<p>You requested a password reset. Click below to reset it:</p>" +
            "<a href='" + link + "' style='background:#f43f5e;color:white;padding:12px 24px;" +
            "border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin:16px 0;'>" +
            "Reset Password</a>" +
            "<p style='color:#888;margin-top:16px;'>Link expires in 1 hour. Ignore if not requested.</p>");
        sendHtmlEmailSafe(to, "Reset Password - EventHub", html);
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
        sendHtmlEmailSafe(to, "Ticket Confirmed - " + eventTitle, html);
    }

    @Async
    public void sendEventReminderEmail(String to, String name, String eventTitle,
                                        String venue, String eventDate) {
        String html = buildEmailHtml("Event Tomorrow! 📅", name,
            "<p><strong>" + eventTitle + "</strong> is happening tomorrow!</p>" +
            "<p>📍 <strong>Venue:</strong> " + venue + "</p>" +
            "<p>🕐 <strong>Date:</strong> " + eventDate + "</p>" +
            "<p>Don't forget to bring your QR ticket. See you there! 🎉</p>");
        sendHtmlEmailSafe(to, "Reminder: " + eventTitle + " is Tomorrow!", html);
    }

    @Async
    public void sendCertificateEmail(String to, String name, String eventTitle) {
        String html = buildEmailHtml("Your Certificate is Ready! 🏆", name,
            "<p>Congratulations! Your participation certificate for <strong>" +
            eventTitle + "</strong> has been generated.</p>" +
            "<a href='" + frontendUrl + "/dashboard/certificates' style='background:#6366f1;" +
            "color:white;padding:12px 24px;border-radius:8px;text-decoration:none;" +
            "font-weight:bold;display:inline-block;margin:16px 0;'>Download Certificate</a>");
        sendHtmlEmailSafe(to, "Certificate Ready - " + eventTitle, html);
    }

    @Async
    public void sendOrganizerRequestConfirmationEmail(String to, String name) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject("CampusEvents – Organizer Request Received");
        msg.setText(
            "Hi " + name + ",\n\n" +
            "We have received your request to become an organizer on CampusEvents.\n\n" +
            "Our admin team will review your application and get back to you within 24–48 hours.\n\n" +
            "– The CampusEvents Team"
        );
        sendSimpleEmailSafe(msg);
    }

    @Async
    public void sendOrganizerApprovalEmail(String to, String name) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject("🎉 CampusEvents – Your Organizer Account is Approved!");
        msg.setText(
            "Hi " + name + ",\n\n" +
            "Your organizer account request has been APPROVED!\n\n" +
            "Login here: " + frontendUrl + "/login\n\n" +
            "Welcome aboard!\n\n– The CampusEvents Team"
        );
        sendSimpleEmailSafe(msg);
    }

    @Async
    public void sendOrganizerRejectionEmail(String to, String name, String reason) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject("CampusEvents – Organizer Request Update");
        msg.setText(
            "Hi " + name + ",\n\n" +
            "After reviewing your application, we are unable to approve your request at this time.\n\n" +
            (reason != null && !reason.isBlank() ? "Reason: " + reason + "\n\n" : "") +
            "You are welcome to reapply in the future.\n\n– The CampusEvents Team"
        );
        sendSimpleEmailSafe(msg);
    }

    // ── Private helpers — never throw, always log ─────────────────────────────

    private void sendHtmlEmailSafe(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
            log.info("✅ Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            // ✅ Log the real error but NEVER throw — registration must succeed
            // even if SMTP is misconfigured. Check MAIL_USERNAME/MAIL_PASSWORD env vars.
            log.error("❌ Failed to send email to {} [{}]: {}", to, subject, e.getMessage());
        }
    }

    private void sendSimpleEmailSafe(SimpleMailMessage msg) {
        try {
            mailSender.send(msg);
            log.info("✅ Simple email sent to {}", String.join(",", msg.getTo()));
        } catch (Exception e) {
            log.error("❌ Failed to send simple email: {}", e.getMessage());
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