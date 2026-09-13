package com.eventhub.util;

import com.eventhub.entity.Certificate;
import com.eventhub.entity.Ticket;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Component
public class PdfUtil {

    private static final BaseColor BRAND_COLOR  = new BaseColor(99, 102, 241);
    private static final BaseColor ACCENT_COLOR = new BaseColor(244, 63, 94);
    private static final BaseColor DARK_BG      = new BaseColor(30, 27, 75);
    private static final DateTimeFormatter FMT  = DateTimeFormatter.ofPattern("EEE, MMM dd yyyy • HH:mm");

    public byte[] generateTicketPdf(Ticket ticket, byte[] qrBytes) throws Exception {
        Document doc = new Document(new Rectangle(240, 400));
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        // ✅ FIX: Only ONE PdfWriter.getInstance() call — calling it twice corrupts the PDF
        PdfWriter writer = PdfWriter.getInstance(doc, out);
        doc.open();

        // Header
        doc.add(createColoredParagraph("EventHub", BRAND_COLOR, 18, Element.ALIGN_CENTER, true));
        doc.add(createColoredParagraph("E-TICKET", new BaseColor(180, 180, 220), 9, Element.ALIGN_CENTER, false));
        doc.add(Chunk.NEWLINE);

        // QR Code
        if (qrBytes != null) {
            Image qrImg = Image.getInstance(qrBytes);
            qrImg.scaleToFit(160, 160);
            qrImg.setAlignment(Element.ALIGN_CENTER);
            doc.add(qrImg);
        }

        doc.add(Chunk.NEWLINE);

        // Event title
        Font titleFont = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, BaseColor.WHITE);
        Paragraph title = new Paragraph(ticket.getEvent().getTitle(), titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        doc.add(title);

        doc.add(Chunk.NEWLINE);

        // Details
        Font detFont = new Font(Font.FontFamily.HELVETICA, 8, Font.NORMAL, new BaseColor(199, 210, 254));
        if (ticket.getEvent().getEventDate() != null) {
            doc.add(createInfoLine("Date:", ticket.getEvent().getEventDate().format(FMT), detFont));
        }
        doc.add(createInfoLine("Venue:",    ticket.getEvent().getVenue(),    detFont));
        doc.add(createInfoLine("Attendee:", ticket.getUser().getName(),      detFont));

        // Ticket Code
        doc.add(Chunk.NEWLINE);
        Font codeFont = new Font(Font.FontFamily.COURIER, 7, Font.NORMAL, new BaseColor(148, 163, 184));
        Paragraph code = new Paragraph("Ticket ID: " + ticket.getTicketCode(), codeFont);
        code.setAlignment(Element.ALIGN_CENTER);
        doc.add(code);

        doc.close();
        return out.toByteArray();
    }

    public byte[] generateCertificatePdf(Certificate certificate) throws Exception {
        Document doc = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        // ✅ FIX: Single PdfWriter.getInstance() call
        PdfWriter writer = PdfWriter.getInstance(doc, out);
        doc.open();

        doc.add(Chunk.NEWLINE);
        doc.add(Chunk.NEWLINE);

        Font titleFont = new Font(Font.FontFamily.HELVETICA, 28, Font.BOLD, BRAND_COLOR);
        Paragraph title = new Paragraph("Certificate of Participation", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        doc.add(title);

        doc.add(Chunk.NEWLINE);

        Font normalFont = new Font(Font.FontFamily.HELVETICA, 14, Font.NORMAL, BaseColor.DARK_GRAY);
        Paragraph certify = new Paragraph("This is to certify that", normalFont);
        certify.setAlignment(Element.ALIGN_CENTER);
        doc.add(certify);

        doc.add(Chunk.NEWLINE);

        Font nameFont = new Font(Font.FontFamily.HELVETICA, 24, Font.BOLD, new BaseColor(30, 27, 75));
        Paragraph name = new Paragraph(certificate.getUser().getName(), nameFont);
        name.setAlignment(Element.ALIGN_CENTER);
        doc.add(name);

        doc.add(Chunk.NEWLINE);

        Paragraph attended = new Paragraph(
            "has successfully participated in\n" + certificate.getEvent().getTitle(), normalFont);
        attended.setAlignment(Element.ALIGN_CENTER);
        doc.add(attended);

        doc.add(Chunk.NEWLINE);

        Font smallFont = new Font(Font.FontFamily.HELVETICA, 11, Font.NORMAL, BaseColor.GRAY);
        if (certificate.getEvent().getEventDate() != null) {
            Paragraph date = new Paragraph(
                "Held on: " + certificate.getEvent().getEventDate().format(FMT), smallFont);
            date.setAlignment(Element.ALIGN_CENTER);
            doc.add(date);
        }

        doc.add(Chunk.NEWLINE);

        Font certCodeFont = new Font(Font.FontFamily.COURIER, 9, Font.NORMAL, BaseColor.GRAY);
        Paragraph certCode = new Paragraph("Certificate ID: " + certificate.getCertificateCode(), certCodeFont);
        certCode.setAlignment(Element.ALIGN_CENTER);
        doc.add(certCode);

        doc.close();
        return out.toByteArray();
    }

    private Paragraph createColoredParagraph(String text, BaseColor color, float size,
                                              int align, boolean bold) {
        Font f = new Font(Font.FontFamily.HELVETICA, size, bold ? Font.BOLD : Font.NORMAL, color);
        Paragraph p = new Paragraph(text, f);
        p.setAlignment(align);
        return p;
    }

    private Paragraph createInfoLine(String label, String value, Font font) {
        Paragraph p = new Paragraph(label + " " + value, font);
        p.setAlignment(Element.ALIGN_CENTER);
        return p;
    }
}