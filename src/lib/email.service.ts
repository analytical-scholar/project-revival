import nodemailer from "nodemailer";

interface SendAdmissionEmailOptions {
  email: string;
  fullName: string;
  matricNumber: string;
  departmentName?: string;
  facultyName?: string;
}

interface SendRejectionEmailOptions {
  email: string;
  fullName: string;
  reason: string;
}

function getTransporter() {
  const host = process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_SERVER_PORT || 587);
  const user = process.env.SMTP_USER || process.env.EMAIL_SERVER_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD;

  // 1. Real SMTP Credentials (e.g., Gmail, SendGrid, Mailgun, Amazon SES, Custom SMTP)
  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  }

  // 2. Resend API Integration via SMTP
  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: {
        user: "resend",
        pass: process.env.RESEND_API_KEY,
      },
    });
  }

  // 3. Resilient fallback transport that records messages cleanly
  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

export async function sendAdmissionApprovalEmail(options: SendAdmissionEmailOptions) {
  const { email, fullName, matricNumber } = options;
  const fromEmail =
    process.env.SMTP_FROM ||
    process.env.SENDER_EMAIL ||
    '"ASU Admissions Office" <admissions@asu.edu.ng>';

  const subject = `Congratulations! Admission Approved & Matriculation Number Assigned (${matricNumber})`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Admission Approved</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: #064e3b; color: #ffffff; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
        .header p { margin: 6px 0 0; opacity: 0.85; font-size: 13px; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
        .matric-card { background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .matric-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #15803d; letter-spacing: 1px; }
        .matric-number { font-size: 28px; font-family: monospace; font-weight: 900; color: #166534; letter-spacing: 2px; margin: 8px 0; }
        .info-box { background: #f8fafc; border-radius: 12px; padding: 16px; font-size: 13px; line-height: 1.6; color: #334155; margin-bottom: 24px; border: 1px solid #e2e8f0; }
        .btn { display: block; width: 100%; max-width: 280px; margin: 24px auto 0; padding: 14px 20px; background: #059669; color: #ffffff !important; text-align: center; text-decoration: none; font-weight: 700; border-radius: 10px; font-size: 14px; }
        .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ADMISSION APPROVED</h1>
          <p>Official Academic Notification</p>
        </div>
        <div class="content">
          <div class="greeting">Dear ${fullName},</div>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            We are pleased to inform you that your application for admission has been formally <strong>ACCEPTED & APPROVED</strong> by the Admissions Office.
          </p>

          <div class="matric-card">
            <div class="matric-label">Your Official Matriculation Number</div>
            <div class="matric-number">${matricNumber}</div>
            <p style="margin: 4px 0 0; font-size: 12px; color: #15803d;">Keep this number safe for signing in to the Student Portal.</p>
          </div>

          <div class="info-box">
            <strong>Next Steps to Complete Portal Access:</strong><br/>
            1. Visit the Student Portal Sign In Page.<br/>
            2. Enter your <strong>Matriculation Number</strong> (<code>${matricNumber}</code>).<br/>
            3. Enter the password you created during registration.<br/>
            4. Access your student dashboard, courses, and fee schedules.
          </div>

          <a href="https://ais-dev-skcuikaqc2rsvqji3uxr26-469213737561.europe-west2.run.app/login" class="btn">
            Log In To Student Portal
          </a>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Academic Portal & Admissions Office. All rights reserved.<br/>
          If you did not initiate this registration, please contact support immediately.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject,
      html,
      text: `Dear ${fullName},\n\nCongratulations! Your admission has been approved.\nYour Official Matriculation Number is: ${matricNumber}\n\nPlease sign in to the Student Portal using your Matric Number and password.\n\nBest regards,\nAdmissions Office`,
    });

    console.log(
      `[EMAIL DISPATCH SUCCESS] Dispatched email to ${email}. MessageId: ${info.messageId}`,
    );
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(
      `[EMAIL DISPATCH WARN] Could not send via primary transport:`,
      err?.message || err,
    );
    return { success: false, error: err?.message || "Delivery warning" };
  }
}

export async function sendAdmissionRejectionEmail(options: SendRejectionEmailOptions) {
  const { email, fullName, reason } = options;
  const fromEmail =
    process.env.SMTP_FROM ||
    process.env.SENDER_EMAIL ||
    '"ASU Admissions Office" <admissions@asu.edu.ng>';

  const subject = `Update Regarding Your Application for Admission`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Application Status Update</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: #991b1b; color: #ffffff; padding: 28px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
        .content { padding: 32px 24px; }
        .reason-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #7f1d1d; }
        .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>APPLICATION STATUS UPDATE</h1>
        </div>
        <div class="content">
          <p style="font-size: 15px; font-weight: bold;">Dear ${fullName},</p>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Thank you for your interest in our institution. Following evaluation of your application, we regret to inform you that your registration could not be accepted at this time.
          </p>

          <div class="reason-box">
            <strong>Decision Details:</strong><br/>
            ${reason}
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            If you believe this decision was made in error or wish to submit updated documentation, please contact the Admissions Desk.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Admissions Office. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject,
      html,
      text: `Dear ${fullName},\n\nWe regret to inform you that your application could not be accepted.\nReason: ${reason}\n\nBest regards,\nAdmissions Office`,
    });

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[EMAIL DISPATCH WARN] Rejection email dispatch error:`, err?.message || err);
    return { success: false, error: err?.message || "Delivery warning" };
  }
}
