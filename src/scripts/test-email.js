const nodemailer = require('nodemailer');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
};

console.log('Testing with Config:', {
  host: smtpConfig.host,
  port: smtpConfig.port,
  secure: smtpConfig.secure,
  user: smtpConfig.auth.user,
  pass: process.env.SMTP_PASS ? '******' : 'MISSING'
});

async function testEmail() {
  const transporter = nodemailer.createTransport(smtpConfig);

  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('Connection verified successfully!');

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"DfencePrep Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to self
      subject: 'DfencePrep Email Test',
      text: 'If you are reading this, your SMTP configuration is working correctly.',
      html: '<b>If you are reading this, your SMTP configuration is working correctly.</b>',
    });

    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Email Test Failed:');
    console.error(error);
  }
}

testEmail();
