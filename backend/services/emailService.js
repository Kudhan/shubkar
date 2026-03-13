const Brevo = require('sib-api-v3-sdk');

let defaultClient = Brevo.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

let apiInstance = new Brevo.TransactionalEmailsApi();

const senderEmail = process.env.EMAIL_SENDER || 'kudhanshaik04@gmail.com';
const senderName = 'Shubkar';
const brandColor = '#FF6B6B';

/**
 * Base HTML template
 */
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Poppins', Arial, sans-serif; background-color: #F9FAFB; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
  .header { background-color: ${brandColor}; color: white; text-align: center; padding: 20px; }
  .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
  .content { padding: 30px; color: #1F2937; line-height: 1.6; font-size: 16px; }
  .footer { text-align: center; padding: 20px; font-size: 12px; color: #6B7280; background-color: #f3f4f6; }
  .btn { display: inline-block; padding: 12px 24px; margin: 20px 0; font-size: 16px; color: #ffffff !important; background-color: ${brandColor}; text-decoration: none; border-radius: 6px; font-weight: bold; }
  .otp { font-size: 32px; font-weight: bold; color: ${brandColor}; letter-spacing: 4px; padding: 10px; background: #fdf2f2; border: 1px dashed ${brandColor}; display: inline-block; border-radius: 8px; margin: 20px 0; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Shubkar</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Shubkar. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

/**
 * Send OTP Email
 */
exports.sendOtpEmail = async (toEmail, toName, otp) => {
    try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        sendSmtpEmail.subject = "Verify your Shubkar Account - OTP";
        sendSmtpEmail.sender = { name: senderName, email: senderEmail };
        sendSmtpEmail.to = [{ email: toEmail, name: toName }];
        sendSmtpEmail.htmlContent = baseTemplate(`
            <h3>Hello ${toName},</h3>
            <p>Your Shubkar OTP: <div class="otp">${otp}</div></p>
            <p>Expires in 10 minutes. Contact: kudhanshaik04@gmail.com</p>
        `);
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`[EmailService] OTP sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error("[EmailService] OTP error:", error.response?.body || error.message);
        throw new Error("OTP email failed");
    }
};

/**
 * Send Reset Password Email
 */
exports.sendResetPasswordEmail = async (toEmail, toName, resetUrl) => {
    try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        sendSmtpEmail.subject = "Reset Your Shubkar Password";
        sendSmtpEmail.sender = { name: senderName, email: senderEmail };
        sendSmtpEmail.to = [{ email: toEmail, name: toName }];
        sendSmtpEmail.htmlContent = baseTemplate(`
            <h3>Hello ${toName},</h3>
            <p>Reset link (1hr expiry): <a href="${resetUrl}" class="btn">Reset Password</a></p>
            <p>Ignore if not requested. Support: kudhanshaik04@gmail.com</p>
        `);
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`[EmailService] Reset email sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error("[EmailService] Reset error:", error.response?.body || error.message);
        throw new Error("Reset email failed");
    }
};

exports.sendVendorStatusEmail = async (toEmail, toName, status, loginLink) => {
    try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        sendSmtpEmail.subject = status === 'approved' ? 'Vendor Approved!' : 'Vendor Update';
        sendSmtpEmail.sender = { name: senderName, email: senderEmail };
        sendSmtpEmail.to = [{ email: toEmail, name: toName }];
        sendSmtpEmail.htmlContent = baseTemplate(`
            <h3>${status === 'approved' ? 'Approved!' : 'Update'}</h3>
            <a href="${loginLink}" class="btn">Dashboard</a>
        `);
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`[EmailService] Vendor ${status} email sent`);
        return true;
    } catch (error) {
        console.error("[EmailService] Vendor error:", error.message);
        throw error;
    }
};

exports.sendInvoiceEmail = async (toEmail, toName, bookingDetails, pdfBuffer) => {
    try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        sendSmtpEmail.subject = `Invoice #${bookingDetails.id}`;
        sendSmtpEmail.sender = { name: senderName, email: senderEmail };
        sendSmtpEmail.to = [{ email: toEmail, name: toName }];
        sendSmtpEmail.htmlContent = baseTemplate(`<h3>Invoice for ${bookingDetails.service}</h3><p>₹${bookingDetails.amount}</p>`);
        if (pdfBuffer) {
            sendSmtpEmail.attachment = [{
                content: pdfBuffer.toString('base64'),
                name: `invoice_${bookingDetails.id}.pdf`,
                type: 'application/pdf'
            }];
        }
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`[EmailService] Invoice sent`);
        return true;
    } catch (error) {
        console.error("[EmailService] Invoice error:", error.message);
        throw error;
    }
};

