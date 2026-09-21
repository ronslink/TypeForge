import { Hono } from 'hono';
import nodemailer from 'nodemailer';

const router = new Hono();

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

    const mailSubject = subject || \[TypeForge] New Contact Request: \\;

    const textBody = \
New Contact Request for TypeForge:
-------------------------------
Name: \
Email: \
Phone: \
Company: \
Notes/Description: \
\;

    const htmlBody = \
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">
          New TypeForge Contact Request
        </h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr>
            <td style="padding: 8px; font-weight: bold; width: 160px; border-bottom: 1px solid #eee;">Name:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">\</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Email:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:\">\</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Phone:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="tel:\">\</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Company:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">\</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee; vertical-align: top;">Notes/Description:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; white-space: pre-wrap;">\</td>
          </tr>
        </table>
      </body>
    </html>
    \;

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
      from: \"TypeForge Contact" <\>\,
      to: recipient,
      subject: mailSubject,
      text: textBody,
      html: htmlBody,
    });

    console.log(\Contact request email dispatched successfully for \\);
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
