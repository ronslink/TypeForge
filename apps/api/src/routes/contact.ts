import { Hono } from 'hono';
import nodemailer from 'nodemailer';

const router = new Hono();

/** Escape user-supplied values before interpolating them into the HTML email body. */
function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Strip CR/LF so user input cannot inject extra headers into the subject line. */
function sanitizeHeader(value: unknown): string {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
}

router.post('/', async (c) => {
  try {
    const payload = await c.req.json();
    const { name, email, phone, company, notes, subject, description, honeypot } = payload;

    // Silent discard for bots triggering honeypot
    if (honeypot) {
      console.warn('Spam bot caught via honeypot field in contact request');
      return c.json({ success: true });
    }

    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = (process.env.SMTP_USER || '').trim();
    const smtpPassword = (process.env.SMTP_PASSWORD || '').replace(/ /g, '').trim();
    const senderEmail = process.env.SMTP_FROM_EMAIL || smtpUser || 'notifications@typeforge.local';

    const recipient = (process.env.DEMO_NOTIFICATION_EMAIL || process.env.SMTP_USER || '').trim();

    if (!smtpUser || !smtpPassword || !recipient) {
      console.warn('SMTP configuration missing or recipient missing');
      return c.json(
        { error: 'SMTP configuration is missing. Could not send email.' },
        502
      );
    }

    const notesValue = notes ?? description ?? 'N/A';
    const mailSubject = subject
      ? sanitizeHeader(subject)
      : `[TypeForge] New Contact Request: ${sanitizeHeader(name)}`;

    const textBody = `
New Contact Request for TypeForge:
-------------------------------
Name: ${name ?? ''}
Email: ${email ?? ''}
Phone: ${phone ?? ''}
Company: ${company ?? ''}
Notes/Description: ${notesValue}
`;

    const htmlBody = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">
          New TypeForge Contact Request
        </h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr>
            <td style="padding: 8px; font-weight: bold; width: 160px; border-bottom: 1px solid #eee;">Name:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Email:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Phone:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Company:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(company)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee; vertical-align: top;">Notes/Description:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; white-space: pre-wrap;">${escapeHtml(notesValue)}</td>
          </tr>
        </table>
      </body>
    </html>
    `;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    await transporter.sendMail({
      from: `"TypeForge Contact" <${senderEmail}>`,
      to: recipient,
      subject: mailSubject,
      text: textBody,
      html: htmlBody,
    });

    console.log(`Contact request email dispatched successfully for ${email ?? ''}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error dispatching contact request email via SMTP:', error);
    return c.json(
      { error: 'Failed to dispatch email. Please try again later.' },
      502
    );
  }
});

export default router;
