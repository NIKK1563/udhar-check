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

    // Validate phone number (10 digits)
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits'
      });
    }

    // Validate pincode (6 digits)
    if (pincode && !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'PIN code must be exactly 6 digits'
      });
    }

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
