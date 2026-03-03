# Shubkar - Brevo Email Integration Documentation

This document explains the transactional email integration for the Shubkar platform using Brevo.

## 1. Email Flow Explanation

We have centralized all email logic into a new service module: `services/emailService.js`.
This module utilizes the official `@getbrevo/brevo` Node.js SDK to send transactional emails securely. Data is injected into dynamic, professionally styled HTML templates.

**Flows Implemented:**

### A. Customer Email OTP Verification

1.  **Registration (`POST /api/auth/register`)**: Instead of automatically logging in a new user, the system generates a random 6-digit OTP, encrypts it using `bcrypt`, and saves it to the `User` model with an expiry time of 10 minutes. It then triggers `emailService.sendOtpEmail`.
2.  **Verification (`POST /api/auth/verify-email-otp`)**: The user submits their email and OTP. The system verifies the expiry and hash. If successful, `email_verified` is set to `true`, and the OTP data is wiped.
3.  **Resend (`POST /api/auth/resend-otp`)**: Users can request a new OTP. A rate limit is enforced (1 minute between requests, maximum 5 resends).
4.  **Login Control**: `authController.login` checks if `email_verified` is `true`. If not, it returns a `403 Forbidden` response prompting verification.

### B. Vendor Registration Approval/Rejection Mail

1.  **Trigger**: When an admin interacts with `POST /api/admin/vendors/:id/approve` or `reject`.
2.  **Action**: The system populates the user's email and name, then passes them to `emailService.sendVendorStatusEmail`.
3.  **Content**:
    - **Approved**: Sends a congratulations email containing a dynamic link to the frontend login portal.
    - **Rejected**: Sends a rejection email, embedding the reason if provided by the admin.

### C. Email Invoice (Customer + Vendor)

1.  **Endpoint (`POST /api/payments/email-invoice/:bookingId`)**: When called, it retrieves booking details.
2.  **PDF Generation**: `pdfkit` is used to dynamically construct a clean, structurally aligned PDF in memory containing all relevant invoice data (ID, amounts, addresses, service name).
3.  **Attachment**: The PDF Buffer is encoded to base64 and passed to `emailService.sendInvoiceEmail`. The user receives a branded email with the `Invoice_{ID}.pdf` safely attached.

## 2. Security Considerations

- **API Key Protection**: The Brevo API Key (`BREVO_API_KEY`) is stored strictly in the `.env` file and is never exposed to the frontend or version control (assuming `.env` is ignored).
- **OTP Security**: OTPs are treated like passwords. They are hashed using `bcrypt` before saving to the DB. A breached database will not expose plaintext OTPs.
- **OTP Lifecycle**: OTPs strictly expire after 10 minutes. Successful verification immediately nullifies the existing OTP data to prevent replay attacks.
- **Rate Limiting**: To prevent email spamming and brute-force accumulation of OTPs, the resend endpoint tracks `otp_last_resent_at` and `otp_resend_count`.
- **PDF Sanitization**: `pdfkit` generates rendering instructions rather than evaluating string HTML, which helps mitigate injection risks from malformed user data during invoice generation.

## 3. How to Configure Brevo

1.  Log in to [Brevo](https://www.brevo.com/).
2.  Navigate to **Transactional > Email > Settings**.
3.  Ensure your chosen `EMAIL_SENDER` (e.g., `info@shubkar.com` or `kudhanshaik04@gmail.com`) is either verified as a single sender or your entire domain is authenticated via DNS. **Brevo will reject sends from unverified addresses.**
4.  Go to the API Keys section from your account menu.
5.  Generate a new `v3` API Key.
6.  Open `shubkar/backend/.env` and update:
    ```env
    BREVO_API_KEY=your_copied_api_key_here
    EMAIL_SENDER=your_verified_sender_email_here
    FRONTEND_URL=http://localhost:5173
    ```

## 4. How to Test Locally

1.  Ensure your `mongo` instance is running and `.env` is populated with `BREVO_API_KEY`.
2.  Run the backend: `npm run dev` or `node server.js`.
3.  **Testing Registration / OTP**:
    - Send a `POST` request to `http://localhost:5000/api/auth/register` with a dummy email you can access.
    - Check your actual email inbox for the OTP.
    - Verify the OTP via `POST http://localhost:5000/api/auth/verify-email-otp`.
4.  **Testing Vendor Approvals**:
    - Log in as Super Admin to get an admin token.
    - Send a `POST` to `/api/admin/vendors/{vendor_id}/approve` passing the admin token in Authorization Headers.
    - Verify the associated user receives the 'Approved' email.
5.  **Testing Invoices**:
    - Log in as a customer that possesses a 'Paid' booking.
    - Send a `POST` to `/api/payments/email-invoice/{booking_id}`.
    - Verify you receive an email with the PDF attached perfectly formatted.
