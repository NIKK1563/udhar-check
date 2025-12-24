const { User, LoanRequest, Report, Dispute, Settings, ActivityLog, Repayment } = require('../models/associations');
const { Op } = require('sequelize');
const sequelize = require('../models/index');

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalLenders,
      totalBorrowers,
      activeLoans,
      completedLoans,
      pendingReports,
      openDisputes,
      totalLentAmount,
      totalBorrowedAmount
    ] = await Promise.all([
      User.count({ where: { role: { [Op.ne]: 'admin' } } }),
      User.count({ where: { role: 'lender' } }),
      User.count({ where: { role: 'borrower' } }),
      LoanRequest.count({ where: { status: 'in_progress' } }),
      LoanRequest.count({ where: { status: 'completed' } }),
      Report.count({ where: { status: 'pending' } }),
      Dispute.count({ where: { status: { [Op.in]: ['open', 'under_review'] } } }),
      User.sum('totalLent', { where: { role: 'lender' } }),
      User.sum('totalBorrowed', { where: { role: 'borrower' } })
    ]);

    // Get recent activity
    const recentLoans = await LoanRequest.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'borrower', attributes: ['firstName', 'lastName'] },
        { model: User, as: 'lender', attributes: ['firstName', 'lastName'] }
      ]
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalLenders,
          totalBorrowers,
          activeLoans,
          completedLoans,
          pendingReports,
          openDisputes,
          totalLentAmount: totalLentAmount || 0,
          totalBorrowedAmount: totalBorrowedAmount || 0
        },
        recentLoans
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats',
      error: error.message
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { 
      role, 
      isBlocked, 
      isOnboardingComplete,
      verificationStatus,
      search,
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const where = { role: { [Op.ne]: 'admin' } };
    
    if (role) where.role = role;
    if (isBlocked !== undefined) where.isBlocked = isBlocked === 'true';
    if (isOnboardingComplete !== undefined) where.isOnboardingComplete = isOnboardingComplete === 'true';
    if (verificationStatus) where.verificationStatus = verificationStatus;
    
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        users: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

// Get user details
exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's loan history
    let loans;
    if (user.role === 'borrower') {
      loans = await LoanRequest.findAll({
        where: { borrowerId: id },
        include: [{ model: User, as: 'lender', attributes: ['firstName', 'lastName'] }],
        order: [['createdAt', 'DESC']],
        limit: 10
      });
    } else if (user.role === 'lender') {
      loans = await LoanRequest.findAll({
        where: { lenderId: id },
        include: [{ model: User, as: 'borrower', attributes: ['firstName', 'lastName'] }],
        order: [['createdAt', 'DESC']],
        limit: 10
      });
    }

    // Get reports
    const reportsAgainst = await Report.count({ where: { reportedUserId: id } });
    const reportsFiled = await Report.count({ where: { reporterId: id } });

    res.json({
      success: true,
      data: {
        user,
        loans,
        reports: { against: reportsAgainst, filed: reportsFiled }
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user details',
      error: error.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    const userEmail = user.email;
    
    // Delete related records first to avoid foreign key constraint errors
    const { Notification, ActivityLog, Report, Dispute, LoanRequest, Repayment } = require('../models/associations');
    
    // Delete notifications for this user
    await Notification.destroy({ where: { userId: id } });
    
    // Delete activity logs for this user
    await ActivityLog.destroy({ where: { userId: id } });
    
    // Delete reports filed by or against this user
    await Report.destroy({ 
      where: { 
        [require('sequelize').Op.or]: [
          { reporterId: id },
          { reportedUserId: id }
        ]
      }
    });
    
    // Handle disputes - set user references to null instead of deleting
    await Dispute.update(
      { raisedById: null },
      { where: { raisedById: id } }
    );
    await Dispute.update(
      { againstUserId: null },
      { where: { againstUserId: id } }
    );
    
    // Handle repayments - set user references to null
    await Repayment.update(
      { borrowerId: null },
      { where: { borrowerId: id } }
    );
    await Repayment.update(
      { lenderId: null },
      { where: { lenderId: id } }
    );
    
    // Handle loan requests - set user references to null
    await LoanRequest.update(
      { borrowerId: null },
      { where: { borrowerId: id } }
    );
    await LoanRequest.update(
      { lenderId: null },
      { where: { lenderId: id } }
    );
    
    // Now delete the user
    await user.destroy();

    // Log activity (use admin's ID since user is deleted)
    await ActivityLog.create({
      userId: req.user.id,
      action: 'DELETE_USER',
      description: `Deleted user: ${userEmail}`,
      entityType: 'User',
      entityId: id
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user: ' + error.message,
      error: error.message
    });
  }
};

// Block/Unblock user
exports.toggleBlockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { block, reason } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot block admin users'
      });
    }

    user.isBlocked = block;
    user.blockReason = block ? reason : null;
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: block ? 'BLOCK_USER' : 'UNBLOCK_USER',
      description: `${block ? 'Blocked' : 'Unblocked'} user: ${user.email}`,
      entityType: 'User',
      entityId: id
    });

    res.json({
      success: true,
      message: `User ${block ? 'blocked' : 'unblocked'} successfully`
    });
  } catch (error) {
    console.error('Toggle block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

// Verify user (approve verification)
exports.verifyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { approve } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isOnboardingComplete) {
      return res.status(400).json({
        success: false,
        message: 'User has not completed onboarding'
      });
    }

    user.isAdminVerified = approve;
    user.verificationStatus = approve ? 'approved' : 'pending';
    user.isIdVerified = approve;
    user.isFaceVerified = approve;
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'VERIFY_USER',
      description: `Approved verification for user: ${user.email}`,
      entityType: 'User',
      entityId: id
    });

    res.json({
      success: true,
      message: 'User verified successfully',
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify user',
      error: error.message
    });
  }
};

// Reject user verification
exports.rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isOnboardingComplete) {
      return res.status(400).json({
        success: false,
        message: 'User has not completed onboarding'
      });
    }

    user.verificationStatus = 'rejected';
    user.rejectionReason = reason;
    user.isAdminVerified = false;
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'REJECT_USER_VERIFICATION',
      description: `Rejected verification for user: ${user.email}. Reason: ${reason}`,
      entityType: 'User',
      entityId: id
    });

    res.json({
      success: true,
      message: 'User verification rejected',
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject user',
      error: error.message
    });
  }
};

// Partial reject user verification (specific documents)
exports.partialRejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejections } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isOnboardingComplete) {
      return res.status(400).json({
        success: false,
        message: 'User has not completed onboarding'
      });
    }

    // Store rejected documents information
    user.verificationStatus = 'rejected';
    user.rejectedDocuments = rejections;
    user.isAdminVerified = false;

    // Clear specific verification flags based on rejections
    rejections.forEach(rejection => {
      if (rejection.type === 'identity') {
        user.isIdVerified = false;
      } else if (rejection.type === 'selfie') {
        user.isFaceVerified = false;
      }
    });

    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'PARTIAL_REJECT_USER_VERIFICATION',
      description: `Partially rejected verification for user: ${user.email}. Rejected: ${rejections.map(r => r.type).join(', ')}`,
      entityType: 'User',
      entityId: id
    });

    res.json({
      success: true,
      message: 'User verification partially rejected',
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Partial reject user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to partially reject user',
      error: error.message
    });
  }
};

// Get all reports
exports.getAllReports = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (type) where.reportType = type;

    const { count, rows } = await Report.findAndCountAll({
      where,
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'reportedUser', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: LoanRequest, attributes: ['id', 'amount', 'status'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        reports: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reports',
      error: error.message
    });
  }
};

// Resolve report
exports.resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, actionTaken } = req.body;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = status;
    report.adminNotes = adminNotes;
    report.actionTaken = actionTaken;
    report.resolvedBy = req.user.id;
    report.resolvedAt = new Date();
    await report.save();

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: report
    });
  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report',
      error: error.message
    });
  }
};

// Get all disputes
exports.getAllDisputes = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Dispute.findAndCountAll({
      where,
      include: [
        { model: User, as: 'raisedBy', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'againstUser', attributes: ['id', 'firstName', 'lastName'] },
        { model: LoanRequest, attributes: ['id', 'amount', 'status'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        disputes: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all disputes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get disputes',
      error: error.message
    });
  }
};

// Resolve dispute
exports.resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;

    const dispute = await Dispute.findByPk(id);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    dispute.status = status;
    dispute.resolution = resolution;
    dispute.resolvedBy = req.user.id;
    dispute.resolvedAt = new Date();
    await dispute.save();

    res.json({
      success: true,
      message: 'Dispute resolved successfully',
      data: dispute
    });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve dispute',
      error: error.message
    });
  }
};

// Get all loans
exports.getAllLoans = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await LoanRequest.findAndCountAll({
      where,
      include: [
        { model: User, as: 'borrower', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'lender', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        loans: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all loans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get loans',
      error: error.message
    });
  }
};

// Get settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.findAll({
      where: { isActive: true },
      order: [['category', 'ASC'], ['key', 'ASC']]
    });

    // Group by category
    const grouped = settings.reduce((acc, setting) => {
      const category = setting.category || 'general';
      if (!acc[category]) acc[category] = [];
      acc[category].push(setting);
      return acc;
    }, {});

    res.json({
      success: true,
      data: grouped
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get settings',
      error: error.message
    });
  }
};

// Update setting
exports.updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;

    let setting = await Settings.findOne({ where: { key } });
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    setting.value = value;
    setting.updatedBy = req.user.id;
    await setting.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'UPDATE_SETTING',
      description: `Updated setting: ${key}`,
      entityType: 'Settings',
      entityId: setting.id,
      metadata: { oldValue: setting.previous('value'), newValue: value }
    });

    res.json({
      success: true,
      message: 'Setting updated successfully',
      data: setting
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update setting',
      error: error.message
    });
  }
};

// Get activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    const { userId, action, page = 1, limit = 50 } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;

    const { count, rows } = await ActivityLog.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'email', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        logs: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity logs',
      error: error.message
    });
  }
};

// Initialize default settings
exports.initializeSettings = async (req, res) => {
  try {
    const defaultSettings = Settings.defaultSettings;
    
    for (const setting of defaultSettings) {
      await Settings.findOrCreate({
        where: { key: setting.key },
        defaults: setting
      });
    }

    res.json({
      success: true,
      message: 'Settings initialized successfully'
    });
  } catch (error) {
    console.error('Initialize settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize settings',
      error: error.message
    });
  }
};
