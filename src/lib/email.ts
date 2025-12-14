import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    // SMTP credentials not configured. Email will not be sent.
    // In development, verification code would be logged here
    return;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'رمز التحقق من البريد الإلكتروني - متجر الدراجات',
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">مرحباً بك في متجر الدراجات</h2>
        <p style="color: #666; font-size: 16px;">شكراً لك على التسجيل. يرجى استخدام الرمز التالي للتحقق من بريدك الإلكتروني:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #007bff; font-size: 32px; letter-spacing: 8px; margin: 0;">${code}</h1>
        </div>
        <p style="color: #666; font-size: 14px;">هذا الرمز صالح لمدة 24 ساعة.</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
}

