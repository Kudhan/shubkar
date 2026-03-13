# Forgot Password Feature Implementation - TODO

## Status: In Progress

## Backend Changes
- [x] **Step 1**: Update `backend/models/User.js` - Add `passwordResetToken`, `passwordResetExpires` fields and `createPasswordResetToken()` method
- [x] **Step 2**: Add `sendResetPasswordEmail()` function to `backend/services/emailService.js`
- [x] **Step 3**: Add `forgotPassword()` and `resetPassword()` functions to `backend/controllers/authController.js`
- [x] **Step 4**: Add routes `POST /forgot-password` and `POST /reset-password` to `backend/routes/authRoutes.js`

## Frontend Changes
- [x] **Step 5**: Add `forgotPassword(email)` and `resetPassword(token, password)` functions to `frontend/src/services/api.js`
- [x] **Step 6**: Update `frontend/src/pages/Login.jsx` - Add "Forgot Password?" link/modal
- [x] **Step 7**: Create new `frontend/src/components/ForgotPasswordModal.jsx`
- [ ] **Step 8**: Add route for reset if using URL tokens (optional)
- [ ] **Step 9**: Test end-to-end (backend + frontend)

## Testing
- [ ] Backend: Test /forgot-password → email sent, /reset-password → password updated
- [ ] Frontend: Full user flow
- [ ] Rate limiting works

**Next: Step 1 - User model update**
