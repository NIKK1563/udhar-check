const { User, ActivityLog } = require('../models/associations');
const { generateToken } = require('../utils/jwt');
const { calculateTrustScore, calculateRepaymentScore } = require('../services/scoringService');

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, phone, whatsapp } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate role
    if (!['lender', 'borrower'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either lender or borrower'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role,
      firstName,
      lastName,
      phone,
      whatsapp: whatsapp || phone
    });

    // Log activity
    await ActivityLog.create({
      userId: user.id,
      action: 'REGISTER',
      description: `New ${role} registered`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.',
        reason: user.blockReason
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: user.id,
      action: 'LOGIN',
      description: 'User logged in',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    // Recalculate scores
    if (user.role === 'borrower') {
      await calculateRepaymentScore(user.id);
    }
    await calculateTrustScore(user.id);

    // Refresh user data
    await user.reload();

    res.json({
      success: true,
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, whatsapp, address, city, state, pincode } = req.body;

    const user = await User.findByPk(req.user.id);
    
    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (whatsapp) user.whatsapp = whatsapp;
    if (address) user.address = address;
    if (city) user.city = city;
    if (state) user.state = state;
    if (pincode) user.pincode = pincode;

    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: user.id,
      action: 'UPDATE_PROFILE',
      description: 'User updated profile',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Complete onboarding
exports.completeOnboarding = async (req, res) => {
  try {
    const { 
      address, city, state, pincode, 
      governmentIdType, governmentIdNumber,
      lendingLimit, termsAccepted 
    } = req.body;

    const user = await User.findByPk(req.user.id);

    // Validate required fields
    if (!address || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'All address fields are required'
      });
    }

    // Validate pincode (6 digits)
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode format. Must be 6 digits'
      });
    }

    // Validate government ID type and number
    if (!governmentIdType || !governmentIdNumber) {
      return res.status(400).json({
        success: false,
        message: 'Government ID details are required'
      });
    }

    // Validate Aadhar number (12 digits)
    if (governmentIdType === 'aadhar') {
      const cleanedAadhar = governmentIdNumber.replace(/\s/g, '');
      if (!/^\d{12}$/.test(cleanedAadhar)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Aadhar number. Must be 12 digits'
        });
      }
    }

    // Validate PAN card (5 letters, 4 digits, 1 letter)
    if (governmentIdType === 'pan') {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
      if (!panRegex.test(governmentIdNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid PAN card format. Must be 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)'
        });
      }
    }

    // Validate Voter ID (3 letters followed by 7 digits)
    if (governmentIdType === 'voter_id') {
      const voterIdRegex = /^[A-Z]{3}[0-9]{7}$/i;
      if (!voterIdRegex.test(governmentIdNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Voter ID format. Must be 3 letters followed by 7 digits (e.g., ABC1234567)'
        });
      }
    }

    // Validate uploaded files
    if (!req.files || !req.files.governmentId || !req.files.selfiePhoto) {
      return res.status(400).json({
        success: false,
        message: 'Government ID document and selfie photo are required'
      });
    }

    // Validate file types
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const allowedDocTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    if (req.files.governmentId) {
      const govIdFile = req.files.governmentId[0];
      if (!allowedDocTypes.includes(govIdFile.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Government ID must be JPG, PNG, or PDF format'
        });
      }
      if (govIdFile.size > 5 * 1024 * 1024) { // 5MB
        return res.status(400).json({
          success: false,
          message: 'Government ID file size must be less than 5MB'
        });
      }
    }

    if (req.files.selfiePhoto) {
      const selfieFile = req.files.selfiePhoto[0];
      if (!allowedImageTypes.includes(selfieFile.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Selfie must be JPG or PNG format'
        });
      }
      if (selfieFile.size > 5 * 1024 * 1024) { // 5MB
        return res.status(400).json({
          success: false,
          message: 'Selfie file size must be less than 5MB'
        });
      }
    }

    // Validate lender-specific requirements
    if (user.role === 'lender') {
      if (!lendingLimit || parseFloat(lendingLimit) < 1000) {
        return res.status(400).json({
          success: false,
          message: 'Lending limit must be at least ₹1000'
        });
      }
      if (!termsAccepted) {
        return res.status(400).json({
          success: false,
          message: 'You must accept the terms and conditions'
        });
      }
    }

    // Update address info
    user.address = address;
    user.city = city;
    user.state = state;
    user.pincode = pincode;

    // Update government ID info (store in uppercase for consistency)
    user.governmentIdType = governmentIdType;
    user.governmentIdNumber = governmentIdNumber.toUpperCase().replace(/\s/g, '');

    // Handle file uploads
    if (req.files) {
      if (req.files.profilePhoto) {
        user.profilePhoto = `/uploads/profiles/${req.files.profilePhoto[0].filename}`;
      }
      if (req.files.selfiePhoto) {
        user.selfiePhoto = `/uploads/selfies/${req.files.selfiePhoto[0].filename}`;
        user.isFaceVerified = true; // In production, add actual face verification
      }
      if (req.files.governmentId) {
        user.governmentId = `/uploads/documents/${req.files.governmentId[0].filename}`;
        user.isIdVerified = true; // In production, add actual ID verification
      }
    }

    // Lender specific
    if (user.role === 'lender' && lendingLimit) {
      user.lendingLimit = lendingLimit;
      user.availableBalance = lendingLimit;
    }

    // Terms acceptance
    if (termsAccepted) {
      user.termsAccepted = true;
      user.termsAcceptedAt = new Date();
    }

    // Mark onboarding complete
    user.isOnboardingComplete = true;

    // Reset verification status to pending for admin review
    user.verificationStatus = 'pending';
    user.isAdminVerified = false;
    user.rejectedDocuments = null;
    user.rejectionReason = null;

    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: user.id,
      action: 'COMPLETE_ONBOARDING',
      description: 'User completed onboarding',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete onboarding',
      error: error.message
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: user.id,
      action: 'CHANGE_PASSWORD',
      description: 'User changed password',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// Admin: Create admin user
exports.createAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Check if already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const admin = await User.create({
      email,
      password,
      role: 'admin',
      firstName,
      lastName,
      phone,
      isOnboardingComplete: true
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: admin.toJSON()
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin',
      error: error.message
    });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Profile picture file is required'
      });
    }

    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedImageTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Profile picture must be JPG or PNG format'
      });
    }

    // Validate file size (5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Profile picture file size must be less than 5MB'
      });
    }

    // Update profile picture URL
    user.profilePhoto = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: user.id,
      action: 'UPDATE_PROFILE_PICTURE',
      description: 'User updated profile picture',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message
    });
  }
};

// Send email verification
exports.sendEmailVerification = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store verification code and expiry (15 minutes)
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // TODO: In production, send actual email
    // For now, just return the code (remove this in production)
    console.log(`Email verification code for ${user.email}: ${verificationCode}`);

    res.json({
      success: true,
      message: 'Verification code sent to your email',
      // Remove this in production
      ...(process.env.NODE_ENV === 'development' && { code: verificationCode })
    });
  } catch (error) {
    console.error('Send email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code',
      error: error.message
    });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findByPk(req.user.id);

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    if (!user.emailVerificationCode || !user.emailVerificationExpiry) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found. Please request a new one.'
      });
    }

    if (new Date() > user.emailVerificationExpiry) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }

    if (user.emailVerificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpiry = null;
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: user.id,
      action: 'VERIFY_EMAIL',
      description: 'User verified email address',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email',
      error: error.message
    });
  }
};

// Send phone verification
exports.sendPhoneVerification = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (user.phoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'Phone is already verified'
      });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store verification code and expiry (15 minutes)
    user.phoneVerificationCode = verificationCode;
    user.phoneVerificationExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // TODO: In production, send actual SMS
    // For now, just return the code (remove this in production)
    console.log(`Phone verification code for ${user.phone}: ${verificationCode}`);

    res.json({
      success: true,
      message: 'Verification code sent to your phone',
      // Remove this in production
      ...(process.env.NODE_ENV === 'development' && { code: verificationCode })
    });
  } catch (error) {
    console.error('Send phone verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code',
      error: error.message
    });
  }
};

// Verify phone
exports.verifyPhone = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findByPk(req.user.id);

    if (user.phoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'Phone is already verified'
      });
    }

    if (!user.phoneVerificationCode || !user.phoneVerificationExpiry) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found. Please request a new one.'
      });
    }

    if (new Date() > user.phoneVerificationExpiry) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }

    if (user.phoneVerificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Mark phone as verified
    user.phoneVerified = true;
    user.phoneVerificationCode = null;
    user.phoneVerificationExpiry = null;
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: user.id,
      action: 'VERIFY_PHONE',
      description: 'User verified phone number',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Phone verified successfully',
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Verify phone error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify phone',
      error: error.message
    });
  }
};


