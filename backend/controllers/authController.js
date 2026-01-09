const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
                socialLinks: otherDetails.socialLinks,
                bookingPolicy: otherDetails.bookingPolicy,
                awards: otherDetails.awards
            });

            newUser.vendorProfile = newProfile._id;
            await newUser.save({ validateBeforeSave: false }); // Avoid re-validating password
        }

        createSendToken(newUser, 201, res);
    } catch (err) {
        // If user creation succeeded but profile failed, maybe rollback? 
        // For MVP, just return error. MongoDB unique email constraint handles duplicate user.
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: 'fail', message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            console.log(`[DEBUG] Login Failed for ${email}. UserFound: ${!!user}`);
            return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
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
