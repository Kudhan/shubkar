const SibApiV3Sdk = require('sib-api-v3-sdk');
const fs = require('fs');

let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const senderEmail = process.env.EMAIL_SENDER || 'info@shubkar.com';
const senderName = 'Shubkar';
const brandColor = '#FF6B6B';
const logoUrl = 'https://shubkar.com/logo.png'; // Update with proper URL if hosted

/**
 * Base professional HTML template for emails
 */
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
<style>
  body {
    font-family: 'Poppins', Arial, sans-serif;
    background-color: #F9FAFB;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 40px auto;
    background: #ffffff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
  .header {
    background-color: ${brandColor};
    color: white;
    text-align: center;
    padding: 20px;
  }
  .header h1 {
    margin: 0;
    font-size: 24px;
    letter-spacing: 1px;
  }
  .content {
    padding: 30px;
    color: #1F2937;
    line-height: 1.6;
    font-size: 16px;
  }
  .footer {
    text-align: center;
    padding: 20px;
    font-size: 12px;
    color: #6B7280;
    background-color: #f3f4f6;
  }
  .btn {
    display: inline-block;
    padding: 12px 24px;
    margin: 20px 0;
    font-size: 16px;
    color: #ffffff !important;
    background-color: ${brandColor};
    text-decoration: none;
    border-radius: 6px;
    font-weight: bold;
  }
  .otp {
    font-size: 32px;
    font-weight: bold;
    color: ${brandColor};
    letter-spacing: 4px;
    padding: 10px;
    background: #fdf2f2;
    border: 1px dashed ${brandColor};
    display: inline-block;
    border-radius: 8px;
    margin: 20px 0;
  }
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
      &copy; ${new Date().getFullYear()} Shubkar. All rights reserved.<br>
      This is an automated message, please do not reply.
    </div>
  </div>
</body>
</html>
`;

/**
 * Send OTP Verification Email
 */
exports.sendOtpEmail = async (toEmail, toName, otp) => {
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = "Verify your Shubkar Account (OTP)";
        sendSmtpEmail.sender = { name: senderName, email: senderEmail };
        sendSmtpEmail.to = [{ email: toEmail, name: toName }];
        
        const content = `
            <h3>Hello ${toName},</h3>
            <p>Thank you for registering on Shubkar. To complete your registration and verify your email address, please use the following One-Time Password (OTP):</p>
            <div style="text-align: center;">
                <div class="otp">${otp}</div>
            </div>
            <p>This OTP will expire in <strong>10 minutes</strong>.</p>
            <p>If you did not request this verification, please ignore this email.</p>
            <p>Please contact us for any help @kudhanshaik04@gmail.com or +916304400979</p>
        `;
        
        sendSmtpEmail.htmlContent = baseTemplate(content);
        
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`[EmailService] OTP sent successfully to ${toEmail}. MessageId: ${data.messageId}`);
        return true;
    } catch (error) {
        console.error("[EmailService] Error sending OTP:", error.message);
        throw new Error("Unable to send verification email");
    }
};

/**
 * Send Vendor Approval/Rejection Email
 */
exports.sendVendorStatusEmail = async (toEmail, toName, status, loginLink, reason = null) => {
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.sender = { name: senderName, email: senderEmail };
        sendSmtpEmail.to = [{ email: toEmail, name: toName }];
        
        let content = '';
        if (status === 'approved') {
            sendSmtpEmail.subject = "Congratulations! Your Shubkar Vendor Account is Approved";
            content = `
                <h3>Hello ${toName},</h3>
                <p>We are thrilled to let you know that your vendor registration on Shubkar has been <strong>approved</strong>!</p>
                <p>You can now log in to your dashboard to manage your portfolio, services, and handle customer bookings.</p>
                <div style="text-align: center;">
                    <a href="${loginLink}" class="btn">Log In to Dashboard</a>
                </div>
                <p>Welcome aboard!</p>
            `;
        } else {
            sendSmtpEmail.subject = "Action Required: Shubkar Vendor Registration Rejected";
            content = `
                <h3>Hello ${toName},</h3>
                <p>Thank you for your interest in becoming a vendor on Shubkar.</p>
                <p>Unfortunately, after reviewing your application, your vendor account registration has been rejected.</p>
                ${reason ? `<p><strong>Reason for Rejection:</strong> ${reason}</p>` : ''}
                <p><strong>Please re-register with valid details and proper documents to get your account approved.</strong></p>
                <p>If you have questions or would like to appeal this decision, please contact our support team.</p>
            `;
        }
        
        sendSmtpEmail.htmlContent = baseTemplate(content);
        
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`[EmailService] Vendor ${status} email sent to ${toEmail}.`);
        return true;
    } catch (error) {
        console.error("[EmailService] Error sending vendor status email:", error.message);
        throw new Error("Unable to send vendor status email");
    }
};

/**
 * Send Invoice Email (with optional Attachment)
 */
exports.sendInvoiceEmail = async (toEmail, toName, bookingDetails, pdfBuffer = null) => {
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = `Your Invoice for Booking #${bookingDetails.id}`;
        sendSmtpEmail.sender = { name: senderName, email: senderEmail };
        sendSmtpEmail.to = [{ email: toEmail, name: toName }];
        
        const content = `
            <h3>Hello ${toName},</h3>
            <p>Thank you for using Shubkar. Please find your invoice details for your recent booking regarding <strong>${bookingDetails.service}</strong>.</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee; margin: 20px 0;">
                <p style="margin: 0; padding-bottom: 5px;"><strong>Booking ID:</strong> ${bookingDetails.id}</p>
                <p style="margin: 0; padding-bottom: 5px;"><strong>Service:</strong> ${bookingDetails.service}</p>
                <p style="margin: 0; padding-bottom: 5px;"><strong>Vendor:</strong> ${bookingDetails.vendorName || 'Shubakar Vendor'}</p>
                <p style="margin: 0; padding-bottom: 5px;"><strong>Date:</strong> ${new Date(bookingDetails.date).toLocaleDateString()}</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0;" />
                <p style="margin: 0; font-size: 18px;"><strong>Total Amount:</strong> ₹${bookingDetails.amount}</p>
            </div>
            ${pdfBuffer ? '<p>We have also attached a PDF copy for your records.</p>' : ''}
            <p>If you have any questions, feel free to contact us.</p>
        `;
        
        sendSmtpEmail.htmlContent = baseTemplate(content);
        
        if (pdfBuffer) {
            sendSmtpEmail.attachment = [
                {
                    content: pdfBuffer.toString('base64'),
                    name: `Invoice_${bookingDetails.id}.pdf`,
                    type: 'application/pdf'
                }
            ];
        }
        
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`[EmailService] Invoice sent to ${toEmail}. MessageId: ${data.messageId}`);
        return true;
    } catch (error) {
        console.error("[EmailService] Error sending invoice email:", error.message);
        throw new Error("Unable to send invoice email");
    }
};
