const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    user.password = undefined; // Remove password from output

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

const VendorProfile = require('../models/VendorProfile');
const { uploadImageToCloudinary } = require('../utils/cloudinary');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, ...otherDetails } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ status: 'fail', message: 'Please provide name, email and password' });
        }

        // Role safety
        let userRole = 'customer';
        if (role === 'vendor') userRole = 'vendor';

        const newUser = await User.create({
            name,
            email,
            password,
            role: userRole,
        });

        console.log(`[DEBUG] User registered: ${email}, Role: ${userRole}`);


        // Create Vendor Profile if role is vendor
        if (userRole === 'vendor') {
            let business_documents = [];
            if (req.files && req.files.length > 0) {
                const uploadPromises = req.files.map(file => uploadImageToCloudinary(file.buffer, file.mimetype));
                business_documents = await Promise.all(uploadPromises);
            }

            let bookingPolicy = otherDetails.bookingPolicy;
            if (typeof bookingPolicy === 'string') {
                try { bookingPolicy = JSON.parse(bookingPolicy); } catch(e) {}
            }
            
            let socialLinks = otherDetails.socialLinks;
            if (typeof socialLinks === 'string') {
                try { socialLinks = JSON.parse(socialLinks); } catch(e) {}
            }

            const newProfile = await VendorProfile.create({
                user: newUser._id,
                companyName: otherDetails.companyName || otherDetails.serviceType || name + "'s Service",
                description: otherDetails.description,
                services: otherDetails.services || [otherDetails.serviceType], // Support array or single
                website: otherDetails.website,
                experience: otherDetails.experience,
                teamSize: otherDetails.teamSize,
                contactEmail: email,

                // New Extended Fields
                serviceCities: otherDetails.serviceCities,
                foundedYear: otherDetails.foundedYear,
                socialLinks: socialLinks,
                bookingPolicy: bookingPolicy,
                awards: otherDetails.awards,
                
                // New Fields for KYC
                gst_number: req.body.gst_number || otherDetails.gst_number || null,
                pan_number: req.body.pan_number || otherDetails.pan_number || null,
                phone_number: req.body.phone_number || otherDetails.phone_number || null,
                date_of_birth: req.body.date_of_birth || otherDetails.date_of_birth || null,
                business_documents: business_documents,
                is_verified: false,
                verification_status: 'PENDING'
            });

            newUser.vendorProfile = newProfile._id;
            await newUser.save({ validateBeforeSave: false }); // Avoid re-validating password
        }


        // ---------------- OTP Section START ----------------
        // Generate 6 digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        
        newUser.otp_hash = hashedOtp;
        newUser.otp_expiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
        newUser.otp_resend_count = 0;
        await newUser.save({ validateBeforeSave: false });
        
        // Send OTP email
        try {
            await emailService.sendOtpEmail(newUser.email, newUser.name, otp);
        } catch (emailErr) {
            console.error('[DEBUG] Failed to send OTP email during registration:', emailErr.message);
            // Optionally could continue or return 500, we'll continue so user can resend
        }
        
        return res.status(201).json({
            status: 'success',
            message: 'Registration successful. An OTP has been sent to your email. Please verify your email before logging in.',
            data: {
                userId: newUser._id,
                email: newUser.email
            }
        });
        // ---------------- OTP Section END ----------------
    } catch (err) {
        // If user creation succeeded but profile failed, maybe rollback? 
        // For MVP, just return error. MongoDB unique email constraint handles duplicate user.
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

exports.verifyEmailOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({ status: 'fail', message: 'Please provide email and OTP' });
        }
        
        const user = await User.findOne({ email }).select('+otp_hash +otp_expiry +email_verified');
        
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }
        
        if (user.email_verified) {
            return res.status(400).json({ status: 'fail', message: 'Email is already verified' });
        }
        
        if (!user.otp_hash || !user.otp_expiry || Date.now() > user.otp_expiry) {
            return res.status(400).json({ status: 'fail', message: 'OTP has expired or is invalid. Please request a new one.' });
        }
        
        const isMatch = await bcrypt.compare(String(otp), user.otp_hash);
        if (!isMatch) {
            return res.status(400).json({ status: 'fail', message: 'Invalid OTP' });
        }
        
        // Mark as verified, clear OTP data
        user.email_verified = true;
        user.otp_hash = undefined;
        user.otp_expiry = undefined;
        await user.save({ validateBeforeSave: false });
        
        return res.status(200).json({
            status: 'success',
            message: 'Email successfully verified. You can now log in.'
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ status: 'fail', message: 'Please provide email' });
        }
        
        const user = await User.findOne({ email }).select('+otp_resend_count +otp_last_resent_at +email_verified');
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }
        
        if (user.email_verified) {
            return res.status(400).json({ status: 'fail', message: 'Email is already verified' });
        }
        
        // Rate limiting: Check if resent too recently (e.g. within 1 minute)
        if (user.otp_last_resent_at && Date.now() - user.otp_last_resent_at < 60 * 1000) {
            return res.status(429).json({ status: 'fail', message: 'Please wait at least 1 minute before requesting another OTP.' });
        }
        
        // Rate limiting: Max resend checks (e.g. max 5 times per day, simplified here)
        if (user.otp_resend_count && user.otp_resend_count >= 5) {
             // Reset logic could be implemented here, assuming block indefinitely for MVP
             return res.status(429).json({ status: 'fail', message: 'Maximum OTP resend limit reached. Please contact support.' });
        }
        
        const newOtp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(newOtp, 10);
        
        user.otp_hash = hashedOtp;
        user.otp_expiry = Date.now() + 10 * 60 * 1000;
        user.otp_resend_count = (user.otp_resend_count || 0) + 1;
        user.otp_last_resent_at = Date.now();
        await user.save({ validateBeforeSave: false });
        
        await emailService.sendOtpEmail(user.email, user.name, newOtp);
        
        return res.status(200).json({
            status: 'success',
            message: 'A new OTP has been sent to your email.'
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: 'fail', message: 'Please provide email and password' });
        }

        // We also select otp_hash to determine if this is a legacy user (registered before OTP feature)
        const user = await User.findOne({ email }).select('+password +email_verified +otp_hash');

        if (!user || !(await user.correctPassword(password, user.password))) {
            console.log(`[DEBUG] Login Failed for ${email}. UserFound: ${!!user}`);
            return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
        }
        
        // OTP Verification Check
        // Bypass for admin, superadmin, or legacy users (who have no otp_hash but aren't verified yet)
        if (!user.email_verified && user.role !== 'superadmin' && user.role !== 'admin') {
            if (user.otp_hash) {
                return res.status(403).json({ 
                    status: 'fail', 
                    message: 'Your email is not verified. Please verify your email to log in.',
                    requires_verification: true,
                    email: email
                });
            }
        }
        
        console.log(`[DEBUG] Login Success for ${email}`);

        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

exports.protect = async (req, res, next) => {
    try {
        // 1) Getting token and check of it's there
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return res.status(401).json({ status: 'fail', message: 'You are not logged in! Please log in to get access.' });
        }

        // 2) Verification token
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) reject(err);
                resolve(decoded);
            });
        });

        // 3) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({ status: 'fail', message: 'The user belonging to this token no longer does exist.' });
        }

        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        next();
    } catch (err) {
        return res.status(401).json({ status: 'fail', message: 'Invalid token or session expired' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name } = req.body;

        // 1) Update user document
        const updatedUser = await User.findByIdAndUpdate(req.user.id, { name }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // 1) Get user from collection
        const user = await User.findById(req.user.id).select('+password');

        // 2) Check if POSTed current password is correct
        if (!(await user.correctPassword(currentPassword, user.password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Your current password is wrong'
            });
        }

        // 3) Update password
        user.password = newPassword;
        await user.save(); // User.save() runs pre-save hooks (hashing) // IMPORTANT: .save() is required for pre-save hook

        // 4) Log user in, send JWT (updating password usually invalidates old tokens in some stateless architectures, but here we just re-issue)
        createSendToken(user, 200, res);

    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ status: 'fail', message: 'Email is required' });
        }

        const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');
        
        if (!user) {
            return res.status(404).json({ 
                status: 'fail', 
                message: 'No account found with that email address' 
            });
        }
        
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });
        
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
        
        await emailService.sendResetPasswordEmail(user.email, user.name, resetUrl);
        
        res.status(200).json({ 
            status: 'success', 
            message: 'Password reset link sent to your email. Check your inbox (and spam folder).' 
        });
        
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: 'There was an error sending the email. Try again later.'
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        
        if (!token || !password) {
            return res.status(400).json({ status: 'fail', message: 'Token and password required' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        const user = await User.findOne({ 
            passwordResetToken: hashedToken, 
            passwordResetExpires: { $gt: Date.now() }
        }).select('+password');
        
        if (!user) {
            return res.status(400).json({ status: 'fail', message: 'Invalid or expired token' });
        }
        
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        
        // Log user in after successful reset
        createSendToken(user, 200, res);
        
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

