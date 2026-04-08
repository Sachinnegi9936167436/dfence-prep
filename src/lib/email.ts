import nodemailer from 'nodemailer';

// Helper to get SMTP config with validation
const getSmtpConfig = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    const missing = [];
    if (!host) missing.push('SMTP_HOST');
    if (!user) missing.push('SMTP_USER');
    if (!pass) missing.push('SMTP_PASS');
    
    if (missing.length > 0) {
      console.warn(`⚠️ [Email] Missing configuration: ${missing.join(', ')}`);
    }
    return null;
  }

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465, 
    auth: { user, pass },
    tls: {
      // Helps with many SMTP providers, but can be adjusted for security if needed
      rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false
    }
  };
};

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const smtpConfig = getSmtpConfig();

  if (!smtpConfig) {
    console.log('⚠️ [Email] SMTP Configuration is missing! Falling back to MOCK mode.');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('------------------');
    return { messageId: 'mock-id' };
  }

  try {
    const transporter = nodemailer.createTransport(smtpConfig);
    
    console.log(`📧 [Email] Sending to ${to}...`);
    const info = await transporter.sendMail({
      from: `"DfencePrep" <${smtpConfig.auth.user}>`,
      to,
      subject,
      html,
    });
    
    console.log(`✅ [Email] Sent successfully! MessageId: ${info.messageId}`);
    return info;
  } catch (error: any) {
    console.error('❌ [Email] Send Error:', error.message);
    // Explicitly throw it so the API route can return a clearer error
    throw error;
  }
}
