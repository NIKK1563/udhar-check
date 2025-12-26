const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'lender', 'borrower'),
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  whatsapp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profilePhoto: {
    type: DataTypes.STRING,
    allowNull: true
  },
  selfiePhoto: {
    type: DataTypes.STRING,
    allowNull: true
  },
  governmentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  governmentIdType: {
    type: DataTypes.ENUM('aadhar', 'pan', 'voter_id', 'passport', 'driving_license'),
    allowNull: true
  },
  governmentIdNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isIdVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isFaceVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  phoneVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailVerificationCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emailVerificationExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  phoneVerificationCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phoneVerificationExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isOnboardingComplete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isAdminVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificationStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rejectedDocuments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  blockReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Lender specific fields
  lendingLimit: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0
  },
  availableBalance: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0
  },
  totalLent: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  termsAccepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  termsAcceptedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Borrower specific fields
  totalBorrowed: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  // Common score fields
  trustScore: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    validate: {
      min: 0,
      max: 100
    }
  },
  repaymentScore: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    validate: {
      min: 0,
      max: 100
    }
  },
  totalRatings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  reportCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
