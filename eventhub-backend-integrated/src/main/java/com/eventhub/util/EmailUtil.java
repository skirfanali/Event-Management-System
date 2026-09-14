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

    @Async
    public void sendVerificationEmail(String to, String name, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;
        String html = buildEmailHtml("Verify Your Email", name,
            "<p>Please verify your email address by clicking the button below:</p>" +
            "<a href='" + link + "' style='background:#6366f1;color:white;padding:12px 24px;" +
            "border-radius:8px;text-decoration:none;font-weight:bold;'>Verify Email</a>" +
            "<p style='color:#888;margin-top:16px;'>Link expires in 24 hours.</p>");
        sendHtmlEmail(to, "Verify Your Email - EventHub", html);
    }

    @Async
    public void sendPasswordResetEmail(String to, String name, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        String html = buildEmailHtml("Reset Your Password", name,
            "<p>You requested a password reset. Click below to reset it:</p>" +
            "<a href='" + link + "' style='background:#f43f5e;color:white;padding:12px 24px;" +
            "border-radius:8px;text-decoration:none;font-weight:bold;'>Reset Password</a>" +
            "<p style='color:#888;margin-top:16px;'>Link expires in 1 hour. Ignore if not requested.</p>");
        sendHtmlEmail(to, "Reset Password - EventHub", html);
    }

    @Async
    public void sendRegistrationConfirmationEmail(String to, String name,
                                                   String eventTitle, String ticketCode,
                                                   String eventDate, String venue) {
        String html = buildEmailHtml("Registration Confirmed!", name,
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
            "<p>Show your QR ticket at the venue entrance.</p>");
        sendHtmlEmail(to, "Ticket Confirmed - " + eventTitle, html);
    }

    @Async
    public void sendEventReminderEmail(String to, String name, String eventTitle,
                                        String venue, String eventDate) {
        String html = buildEmailHtml("Event Tomorrow! \uD83D\uDCC5", name,
            "<p><strong>" + eventTitle + "</strong> is happening tomorrow!</p>" +
            "<p>📍 <strong>Venue:</strong> " + venue + "</p>" +
            "<p>🕐 <strong>Date:</strong> " + eventDate + "</p>" +
            "<p>Don't forget to bring your QR ticket. See you there! 🎉</p>");
        sendHtmlEmail(to, "Reminder: " + eventTitle + " is Tomorrow!", html);
    }

    @Async
    public void sendCertificateEmail(String to, String name, String eventTitle) {
        String html = buildEmailHtml("Your Certificate is Ready! \uD83C\uDFC6", name,
            "<p>Congratulations! Your participation certificate for <strong>" +
            eventTitle + "</strong> has been generated.</p>" +
            "<a href='" + frontendUrl + "/dashboard/certificates' style='background:#6366f1;" +
            "color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;'>" +
            "Download Certificate</a>");
        sendHtmlEmail(to, "Certificate Ready - " + eventTitle, html);
    }

    private String buildEmailHtml(String heading, String name, String body) {
        return "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;max-width:600px;" +
               "margin:0 auto;padding:20px;background:#f9fafb;'>" +
               "<div style='background:white;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.08);'>" +
               "<div style='text-align:center;margin-bottom:24px;'>" +
               "<h1 style='color:#6366f1;margin:0;font-size:24px;'>EventHub</h1></div>" +
               "<h2 style='color:#1f2937;'>" + heading + "</h2>" +
               "<p>Hi <strong>" + name + "</strong>,</p>" +
               body +
               "<hr style='border:none;border-top:1px solid #e5e7eb;margin:24px 0;'/>" +
               "<p style='color:#9ca3af;font-size:12px;text-align:center;'>" +
               "© 2024 EventHub. All rights reserved.</p></div></body></html>";
    }

    private void sendHtmlEmail(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
    
 // ─── ADD THESE 3 METHODS TO YOUR EXISTING EmailUtil.java ───────────────────
 // Place them alongside your existing sendRegistrationConfirmationEmail() method

 // ✅ FIX: these 3 methods were missing @Async — they ran on the request
 // thread and blocked the HTTP response until the SMTP call finished (or
 // hung), which is why submit/approve/reject appeared to time out on the
 // frontend even though the DB write had already succeeded.
 @Async
 public void sendOrganizerRequestConfirmationEmail(String to, String name) {
     try {
         SimpleMailMessage msg = new SimpleMailMessage();
         msg.setTo(to);
         msg.setSubject("CampusEvents – Organizer Request Received");
         msg.setText(
             "Hi " + name + ",\n\n" +
             "We have received your request to become an organizer on CampusEvents.\n\n" +
             "Our admin team will review your application and get back to you within 24–48 hours.\n\n" +
             "You will receive an email once your request is approved or if we need more information.\n\n" +
             "Thank you for your interest!\n\n" +
             "– The CampusEvents Team"
         );
         mailSender.send(msg);
     } catch (Exception e) {
         log.warn("Failed to send organizer request confirmation email: {}", e.getMessage());
     }
 }

 @Async
 public void sendOrganizerApprovalEmail(String to, String name) {
     try {
         SimpleMailMessage msg = new SimpleMailMessage();
         msg.setTo(to);
         msg.setSubject("🎉 CampusEvents – Your Organizer Account is Approved!");
         msg.setText(
             "Hi " + name + ",\n\n" +
             "Great news! Your organizer account request has been APPROVED.\n\n" +
             "You can now log in to CampusEvents using the email and password you provided during registration.\n\n" +
             "Login here: http://localhost:3000/login\n\n" +
             "As an organizer you can:\n" +
             "  • Create and manage events\n" +
             "  • Track registrations and attendance\n" +
             "  • Accept payments and view revenue analytics\n\n" +
             "Welcome aboard!\n\n" +
             "– The CampusEvents Team"
         );
         mailSender.send(msg);
     } catch (Exception e) {
         log.warn("Failed to send organizer approval email: {}", e.getMessage());
     }
 }

 @Async
 public void sendOrganizerRejectionEmail(String to, String name, String reason) {
     try {
         SimpleMailMessage msg = new SimpleMailMessage();
         msg.setTo(to);
         msg.setSubject("CampusEvents – Organizer Request Update");
         msg.setText(
             "Hi " + name + ",\n\n" +
             "Thank you for your interest in becoming an organizer on CampusEvents.\n\n" +
             "After reviewing your application, we are unable to approve your request at this time.\n\n" +
             (reason != null && !reason.isBlank()
                 ? "Reason: " + reason + "\n\n"
                 : "") +
             "You are welcome to reapply in the future with more details about your organization and events.\n\n" +
             "If you have questions, please contact our support team.\n\n" +
             "– The CampusEvents Team"
         );
         mailSender.send(msg);
     } catch (Exception e) {
         log.warn("Failed to send organizer rejection email: {}", e.getMessage());
     }
 }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
}