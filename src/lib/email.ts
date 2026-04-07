import nodemailer from 'nodemailer';

const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false // Often needed for some SMTP servers
  }
};

console.log('Initializing Email Transporter with:', {
  host: smtpConfig.host,
  port: smtpConfig.port,
  secure: smtpConfig.secure,
  user: smtpConfig.auth.user
});

const transporter = nodemailer.createTransport(
  process.env.SMTP_HOST ? smtpConfig : {
    streamConfig: true,
    newline: 'unix',
    buffer: true,
  } as any
);

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.SMTP_HOST) {
    console.log('--- MOCK EMAIL ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${html}`);
    console.log('------------------');
    return { messageId: 'mock-id' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"DfencePrep" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email');
  }
}
