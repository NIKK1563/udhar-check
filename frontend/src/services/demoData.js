// Demo Data for Frontend-Only Demo Mode
// This provides realistic dummy data for investors demo without backend

export const DEMO_MODE = localStorage.getItem('token') === 'demo-token';

// ============ DEMO USERS ============
export const demoUsers = {
  admin: {
    id: 'demo-admin-001',
    email: 'admin@udhaar.demo',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    role: 'admin',
    phone: '+91 98765 43210',
    isOnboardingComplete: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    isAadhaarVerified: true,
    isPanVerified: true,
    isSelfieVerified: true,
    isVerified: true,
    isAdminVerified: true,
    verificationStatus: 'approved',
    profilePhoto: null,
    trustScore: 100,
    repaymentScore: 100,
    createdAt: '2024-01-15T10:30:00Z',
    city: 'Mumbai',
    state: 'Maharashtra'
  },
  lender: {
    id: 'demo-lender-001',
    email: 'lender@udhaar.demo',
    firstName: 'Priya',
    lastName: 'Sharma',
    role: 'lender',
    phone: '+91 87654 32109',
    isOnboardingComplete: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    isAadhaarVerified: true,
    isPanVerified: true,
    isSelfieVerified: true,
    isVerified: true,
    isAdminVerified: true,
    verificationStatus: 'approved',
    profilePhoto: null,
    trustScore: 92,
    repaymentScore: 95,
    totalLent: 250000,
    availableBalance: 75000,
    createdAt: '2024-02-20T14:45:00Z',
    city: 'Delhi',
    state: 'Delhi'
  },
  borrower: {
    id: 'demo-borrower-001',
    email: 'borrower@udhaar.demo',
    firstName: 'Amit',
    lastName: 'Patel',
    role: 'borrower',
    phone: '+91 76543 21098',
    isOnboardingComplete: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    isAadhaarVerified: true,
    isPanVerified: true,
    isSelfieVerified: true,
    isVerified: true,
    isAdminVerified: true,
    verificationStatus: 'approved',
    profilePhoto: null,
    trustScore: 78,
    repaymentScore: 85,
    createdAt: '2024-03-10T09:15:00Z',
    city: 'Bangalore',
    state: 'Karnataka'
  }
};

// ============ DEMO BORROWERS (for lender view) ============
export const demoBorrowers = [
  {
    id: 'borrower-001',
    firstName: 'Amit',
    lastName: 'Patel',
    email: 'amit@example.com',
    phone: '+91 76543 21098',
    city: 'Bangalore',
    state: 'Karnataka',
    trustScore: 78,
    repaymentScore: 85,
    profilePhoto: null,
    isVerified: true
  },
  {
    id: 'borrower-002',
    firstName: 'Sneha',
    lastName: 'Reddy',
    email: 'sneha@example.com',
    phone: '+91 65432 10987',
    city: 'Hyderabad',
    state: 'Telangana',
    trustScore: 82,
    repaymentScore: 90,
    profilePhoto: null,
    isVerified: true
  },
  {
    id: 'borrower-003',
    firstName: 'Vikram',
    lastName: 'Singh',
    email: 'vikram@example.com',
    phone: '+91 54321 09876',
    city: 'Jaipur',
    state: 'Rajasthan',
    trustScore: 65,
    repaymentScore: 72,
    profilePhoto: null,
    isVerified: true
  },
  {
    id: 'borrower-004',
    firstName: 'Neha',
    lastName: 'Gupta',
    email: 'neha@example.com',
    phone: '+91 43210 98765',
    city: 'Pune',
    state: 'Maharashtra',
    trustScore: 88,
    repaymentScore: 92,
    profilePhoto: null,
    isVerified: true
  },
  {
    id: 'borrower-005',
    firstName: 'Rahul',
    lastName: 'Verma',
    email: 'rahul@example.com',
    phone: '+91 32109 87654',
    city: 'Chennai',
    state: 'Tamil Nadu',
    trustScore: 71,
    repaymentScore: 68,
    profilePhoto: null,
    isVerified: true
  }
];

// ============ DEMO LENDERS ============
export const demoLenders = [
  {
    id: 'lender-001',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya@example.com',
    city: 'Delhi',
    state: 'Delhi',
    trustScore: 92,
    repaymentScore: 95,
    totalLent: 250000,
    profilePhoto: null,
    isVerified: true
  },
  {
    id: 'lender-002',
    firstName: 'Suresh',
    lastName: 'Menon',
    email: 'suresh@example.com',
    city: 'Kochi',
    state: 'Kerala',
    trustScore: 88,
    repaymentScore: 91,
    totalLent: 180000,
    profilePhoto: null,
    isVerified: true
  }
];

// ============ DEMO LOAN REQUESTS (Pending - for lender) ============
export const demoPendingRequests = [
  {
    id: 'loan-pending-001',
    amount: 15000,
    duration: 30,
    purpose: 'Medical Emergency',
    description: 'Need funds for urgent medical treatment for family member',
    status: 'pending',
    borrower: demoBorrowers[0],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    interestRate: 2
  },
  {
    id: 'loan-pending-002',
    amount: 8000,
    duration: 15,
    purpose: 'Education',
    description: 'Course fee payment deadline approaching',
    status: 'pending',
    borrower: demoBorrowers[1],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    interestRate: 2
  },
  {
    id: 'loan-pending-003',
    amount: 25000,
    duration: 45,
    purpose: 'Business',
    description: 'Inventory purchase for small business expansion',
    status: 'pending',
    borrower: demoBorrowers[2],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    interestRate: 2.5
  },
  {
    id: 'loan-pending-004',
    amount: 5000,
    duration: 7,
    purpose: 'Personal',
    description: 'Short-term personal requirement',
    status: 'pending',
    borrower: demoBorrowers[3],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    interestRate: 1.5
  },
  {
    id: 'loan-pending-005',
    amount: 12000,
    duration: 30,
    purpose: 'Rent',
    description: 'Need help with this month\'s rent payment',
    status: 'pending',
    borrower: demoBorrowers[4],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    interestRate: 2
  }
];

// ============ DEMO ACTIVE LOANS (for lender - lending history) ============
export const demoLenderLoans = [
  {
    id: 'loan-active-001',
    amount: 20000,
    duration: 30,
    purpose: 'Medical Emergency',
    description: 'Hospital bills',
    status: 'in_progress',
    borrower: demoBorrowers[0],
    lender: demoLenders[0],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    acceptedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    interestRate: 2,
    totalAmount: 20400,
    repaidAmount: 10000
  },
  {
    id: 'loan-active-002',
    amount: 10000,
    duration: 15,
    purpose: 'Education',
    description: 'Exam fees',
    status: 'completed',
    borrower: demoBorrowers[1],
    lender: demoLenders[0],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    acceptedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    interestRate: 2,
    totalAmount: 10200,
    repaidAmount: 10200
  },
  {
    id: 'loan-active-003',
    amount: 35000,
    duration: 60,
    purpose: 'Business',
    description: 'Working capital',
    status: 'in_progress',
    borrower: demoBorrowers[2],
    lender: demoLenders[0],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    acceptedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    interestRate: 2.5,
    totalAmount: 36750,
    repaidAmount: 15000
  }
];

// ============ DEMO BORROWER LOANS ============
export const demoBorrowerLoans = [
  {
    id: 'borrower-loan-001',
    amount: 15000,
    duration: 30,
    purpose: 'Medical Emergency',
    description: 'Urgent hospital bills',
    status: 'in_progress',
    lender: demoLenders[0],
    borrower: demoUsers.borrower,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    acceptedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    interestRate: 2,
    totalAmount: 15300,
    repaidAmount: 5000
  },
  {
    id: 'borrower-loan-002',
    amount: 8000,
    duration: 15,
    purpose: 'Education',
    description: 'Course fees',
    status: 'completed',
    lender: demoLenders[1],
    borrower: demoUsers.borrower,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    acceptedAt: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    interestRate: 2,
    totalAmount: 8160,
    repaidAmount: 8160
  },
  {
    id: 'borrower-loan-003',
    amount: 5000,
    duration: 7,
    purpose: 'Personal',
    description: 'Emergency personal expense',
    status: 'pending',
    borrower: demoUsers.borrower,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    interestRate: 1.5
  }
];

// ============ DEMO NOTIFICATIONS ============
export const demoNotifications = [
  {
    id: 'notif-001',
    type: 'loan_accepted',
    title: 'Loan Request Accepted',
    message: 'Your loan request of ₹15,000 has been accepted by Priya Sharma',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-002',
    type: 'payment_received',
    title: 'Payment Received',
    message: 'You received a repayment of ₹5,000 from Amit Patel',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-003',
    type: 'reminder',
    title: 'Payment Reminder',
    message: 'Your loan payment of ₹10,300 is due in 5 days',
    isRead: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-004',
    type: 'verification',
    title: 'Verification Approved',
    message: 'Your identity verification has been approved. Your trust score has been updated.',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-005',
    type: 'new_request',
    title: 'New Loan Request',
    message: 'Sneha Reddy is requesting ₹8,000 for Education',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
];

// ============ DEMO ADMIN DATA ============
export const demoAdminStats = {
  totalUsers: 1247,
  totalLenders: 342,
  totalBorrowers: 892,
  newUsersThisMonth: 156,
  activeLoans: 423,
  completedLoans: 1876,
  defaultedLoans: 23,
  totalLentAmount: 15680000,
  pendingReports: 8,
  openDisputes: 12,
  pendingVerifications: 45,
  monthlyGrowth: 12.5,
  averageLoanAmount: 18500,
  repaymentRate: 94.2
};

// Pending verification users for demo
export const demoPendingVerificationUsers = [
  {
    id: 'pending-user-001',
    firstName: 'Rohit',
    lastName: 'Verma',
    email: 'rohit.verma@example.com',
    phone: '+91 98123 45678',
    role: 'borrower',
    city: 'Pune',
    state: 'Maharashtra',
    status: 'pending_verification',
    isOnboardingComplete: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    isAadhaarVerified: false,
    isPanVerified: false,
    isSelfieVerified: false,
    isVerified: false,
    trustScore: 50,
    repaymentScore: 50,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    aadhaarNumber: '1234-5678-9012',
    panNumber: 'ABCDE1234F',
    address: { street: '123 MG Road', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
    idDocument: '/uploads/documents/sample-aadhaar.jpg',
    addressDocument: '/uploads/documents/sample-address.jpg',
    selfie: '/uploads/selfies/sample-selfie.jpg'
  },
  {
    id: 'pending-user-002',
    firstName: 'Sneha',
    lastName: 'Patil',
    email: 'sneha.patil@example.com',
    phone: '+91 97654 32109',
    role: 'lender',
    city: 'Bangalore',
    state: 'Karnataka',
    status: 'pending_verification',
    isOnboardingComplete: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    isAadhaarVerified: false,
    isPanVerified: false,
    isSelfieVerified: false,
    isVerified: false,
    trustScore: 50,
    repaymentScore: 50,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    aadhaarNumber: '9876-5432-1098',
    panNumber: 'PQRST5678G',
    address: { street: '456 Whitefield', city: 'Bangalore', state: 'Karnataka', pincode: '560066' },
    idDocument: '/uploads/documents/sample-aadhaar2.jpg',
    addressDocument: '/uploads/documents/sample-address2.jpg',
    selfie: '/uploads/selfies/sample-selfie2.jpg'
  },
  {
    id: 'pending-user-003',
    firstName: 'Arjun',
    lastName: 'Desai',
    email: 'arjun.desai@example.com',
    phone: '+91 99887 76655',
    role: 'borrower',
    city: 'Hyderabad',
    state: 'Telangana',
    status: 'pending_verification',
    isOnboardingComplete: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    isAadhaarVerified: false,
    isPanVerified: false,
    isSelfieVerified: false,
    isVerified: false,
    trustScore: 50,
    repaymentScore: 50,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    aadhaarNumber: '5555-6666-7777',
    panNumber: 'XYZAB9999H',
    address: { street: '789 Hitech City', city: 'Hyderabad', state: 'Telangana', pincode: '500081' },
    idDocument: '/uploads/documents/sample-aadhaar3.jpg',
    addressDocument: '/uploads/documents/sample-address3.jpg',
    selfie: '/uploads/selfies/sample-selfie3.jpg'
  }
];

export const demoAllUsers = [
  { ...demoUsers.admin, status: 'active' },
  { ...demoUsers.lender, status: 'active' },
  { ...demoUsers.borrower, status: 'active' },
  ...demoBorrowers.map((b, i) => ({ 
    ...b, 
    role: 'borrower', 
    status: i === 2 ? 'pending_verification' : 'active',
    isOnboardingComplete: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    isAadhaarVerified: i !== 2,
    isPanVerified: i !== 2,
    isSelfieVerified: i !== 2
  })),
  ...demoLenders.map(l => ({ 
    ...l, 
    role: 'lender', 
    status: 'active',
    isOnboardingComplete: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    isAadhaarVerified: true,
    isPanVerified: true,
    isSelfieVerified: true
  })),
  ...demoPendingVerificationUsers,
  {
    id: 'user-blocked-001',
    firstName: 'Blocked',
    lastName: 'User',
    email: 'blocked@example.com',
    role: 'borrower',
    city: 'Mumbai',
    state: 'Maharashtra',
    trustScore: 25,
    repaymentScore: 30,
    status: 'blocked',
    isBlocked: true,
    isVerified: false,
    createdAt: '2024-01-10T10:30:00Z'
  }
];

export const demoRecentLoans = [
  ...demoLenderLoans,
  ...demoPendingRequests.slice(0, 3)
];

export const demoReports = [
  {
    id: 'report-001',
    reportType: 'fraud',
    type: 'fraud',
    title: 'Suspicious Activity Report',
    description: 'User attempted to create multiple accounts with different emails',
    reason: 'User attempted to create multiple accounts with different emails',
    status: 'pending',
    reportedBy: demoBorrowers[0],
    reportedUser: demoBorrowers[4],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'report-002',
    reportType: 'harassment',
    type: 'harassment',
    title: 'Harassment Report',
    description: 'Aggressive collection messages and threatening calls',
    reason: 'Aggressive collection messages and threatening calls',
    status: 'investigating',
    reportedBy: demoBorrowers[1],
    reportedUser: demoLenders[0],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'report-003',
    reportType: 'payment_issue',
    type: 'payment_issue',
    title: 'Payment Dispute',
    description: 'Payment marked as received but not actually received',
    reason: 'Payment marked as received but not actually received',
    status: 'resolved',
    reportedBy: demoLenders[1],
    reportedUser: demoBorrowers[2],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'report-004',
    reportType: 'fake_profile',
    type: 'fake_profile',
    title: 'Fake Profile Report',
    description: 'User profile appears to have fake or stolen identity documents',
    reason: 'User profile appears to have fake or stolen identity documents',
    status: 'pending',
    reportedBy: demoLenders[0],
    reportedUser: demoBorrowers[3],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'report-005',
    reportType: 'non_payment',
    type: 'non_payment',
    title: 'Non-Payment Report',
    description: 'Borrower has not responded to repayment requests for 2 weeks',
    reason: 'Borrower has not responded to repayment requests for 2 weeks',
    status: 'investigating',
    reportedBy: demoLenders[1],
    reportedUser: demoBorrowers[4],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const demoDisputes = [
  {
    id: 'dispute-001',
    loanId: 'loan-active-001',
    disputeType: 'repayment',
    type: 'repayment',
    title: 'Repayment Amount Dispute',
    description: 'Borrower claims to have paid more than recorded in the system',
    reason: 'Borrower claims to have paid more than recorded in the system',
    status: 'open',
    raisedBy: demoBorrowers[0],
    loan: demoLenderLoans[0],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'dispute-002',
    loanId: 'loan-active-003',
    disputeType: 'terms',
    type: 'terms',
    title: 'Interest Rate Dispute',
    description: 'Disagreement on agreed interest rate - borrower says 1.5%, lender recorded 2.5%',
    reason: 'Disagreement on agreed interest rate - borrower says 1.5%, lender recorded 2.5%',
    status: 'investigating',
    raisedBy: demoBorrowers[2],
    loan: demoLenderLoans[2],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'dispute-003',
    loanId: 'loan-active-002',
    disputeType: 'loan_terms',
    type: 'loan_terms',
    title: 'Loan Duration Dispute',
    description: 'Borrower claims the agreed duration was 45 days, not 30 days',
    reason: 'Borrower claims the agreed duration was 45 days, not 30 days',
    status: 'open',
    raisedBy: demoBorrowers[1],
    loan: demoLenderLoans[1],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const demoActivityLogs = [
  {
    id: 'log-001',
    action: 'user_registered',
    description: 'New user registration: Amit Patel',
    userId: 'borrower-001',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-002',
    action: 'loan_created',
    description: 'New loan request: ₹15,000 by Sneha Reddy',
    userId: 'borrower-002',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-003',
    action: 'loan_accepted',
    description: 'Loan accepted: ₹20,000 by Priya Sharma',
    userId: 'lender-001',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-004',
    action: 'payment_received',
    description: 'Payment received: ₹5,000 from Amit Patel',
    userId: 'borrower-001',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-005',
    action: 'user_verified',
    description: 'User verification approved: Neha Gupta',
    userId: 'borrower-004',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const demoSettings = {
  minLoanAmount: 500,
  maxLoanAmount: 100000,
  minDuration: 7,
  maxDuration: 90,
  defaultInterestRate: 2,
  maxInterestRate: 5,
  platformFee: 1,
  minTrustScore: 40,
  minRepaymentScore: 35,
  autoApproveThreshold: 80,
  maxActiveLoansPerBorrower: 3,
  maxActiveLoansPerLender: 10,
  reminderDaysBefore: 3,
  overdueGracePeriod: 5,
  maintenanceMode: false
};

// ============ HELPER FUNCTION TO CHECK DEMO MODE ============
export const isDemoMode = () => {
  return localStorage.getItem('token') === 'demo-token';
};

// ============ GET CURRENT DEMO USER ============
export const getCurrentDemoUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    if (user.id?.startsWith('demo-')) {
      // Return fresh data from demoUsers to ensure all fields are present
      if (user.role === 'admin') return demoUsers.admin;
      if (user.role === 'lender') return demoUsers.lender;
      if (user.role === 'borrower') return demoUsers.borrower;
      return user;
    }
  } catch (e) {
    return null;
  }
  return null;
};

// ============ DEMO API RESPONSES ============
export const demoResponses = {
  // Auth
  getProfile: () => {
    const user = getCurrentDemoUser();
    return { data: { success: true, data: user } };
  },

  // Notifications
  getNotifications: () => ({
    data: { success: true, data: { notifications: demoNotifications, total: demoNotifications.length } }
  }),
  getUnreadCount: () => ({
    data: { success: true, data: { count: demoNotifications.filter(n => !n.isRead).length } }
  }),

  // Loans - Borrower
  getMyBorrowings: () => ({
    data: { success: true, data: { loans: demoBorrowerLoans, total: demoBorrowerLoans.length } }
  }),
  createRequest: (data) => {
    const newLoan = {
      id: `loan-new-${Date.now()}`,
      ...data,
      status: 'pending',
      borrower: demoUsers.borrower,
      createdAt: new Date().toISOString()
    };
    demoBorrowerLoans.unshift(newLoan);
    return { data: { success: true, data: newLoan, message: 'Loan request created successfully' } };
  },

  // Loans - Lender
  getPendingRequests: () => ({
    data: { success: true, data: { requests: demoPendingRequests, total: demoPendingRequests.length, totalPages: 1 } }
  }),
  getMyLending: () => ({
    data: { success: true, data: { loans: demoLenderLoans, total: demoLenderLoans.length, totalPages: 1 } }
  }),
  getLoanDetails: (id) => {
    const loan = [...demoLenderLoans, ...demoBorrowerLoans, ...demoPendingRequests].find(l => l.id === id);
    return { data: { success: true, data: loan || demoLenderLoans[0] } };
  },

  // Admin
  getDashboardStats: () => ({
    data: { 
      success: true, 
      data: { 
        stats: demoAdminStats,
        recentLoans: demoRecentLoans.slice(0, 5),
        recentUsers: demoAllUsers.slice(0, 5)
      } 
    }
  }),
  getUsers: (params = {}) => {
    let users = [...demoAllUsers];
    if (params.role && params.role !== 'all') {
      users = users.filter(u => u.role === params.role);
    }
    if (params.status && params.status !== 'all') {
      users = users.filter(u => u.status === params.status);
    }
    // Filter by verificationStatus (for Verifications page)
    if (params.verificationStatus === 'pending') {
      users = users.filter(u => 
        u.status === 'pending_verification' || 
        (u.isOnboardingComplete && !u.isVerified && !u.isAadhaarVerified)
      );
    }
    // Filter by isOnboardingComplete
    if (params.isOnboardingComplete !== undefined) {
      users = users.filter(u => u.isOnboardingComplete === params.isOnboardingComplete);
    }
    return {
      data: { 
        success: true, 
        data: { 
          users, 
          total: users.length, 
          pages: 1,
          page: 1
        } 
      }
    };
  },
  getUserDetails: (id) => {
    const user = demoAllUsers.find(u => u.id === id);
    return { data: { success: true, data: user || demoAllUsers[0] } };
  },
  getPendingVerificationsCount: () => {
    const pendingUsers = demoAllUsers.filter(u => 
      u.status === 'pending_verification' || 
      (u.isOnboardingComplete && !u.isVerified && !u.isAadhaarVerified)
    );
    return { data: { success: true, data: { count: pendingUsers.length } } };
  },
  getPendingReportsCount: () => {
    const pendingReports = demoReports.filter(r => 
      r.status === 'pending' || r.status === 'investigating'
    );
    return { data: { success: true, data: { count: pendingReports.length } } };
  },
  getPendingDisputesCount: () => {
    const pendingDisputes = demoDisputes.filter(d => 
      d.status === 'open' || d.status === 'investigating'
    );
    return { data: { success: true, data: { count: pendingDisputes.length } } };
  },
  getLoans: () => ({
    data: { success: true, data: { loans: demoRecentLoans, total: demoRecentLoans.length, totalPages: 1 } }
  }),
  getReports: () => ({
    data: { success: true, data: { reports: demoReports, total: demoReports.length, totalPages: 1 } }
  }),
  getDisputes: () => ({
    data: { success: true, data: { disputes: demoDisputes, total: demoDisputes.length, totalPages: 1 } }
  }),
  getActivityLogs: () => ({
    data: { success: true, data: { logs: demoActivityLogs, total: demoActivityLogs.length, totalPages: 1 } }
  }),
  getSettings: () => ({
    data: { success: true, data: demoSettings }
  }),

  // Reports
  getMyReports: () => ({
    data: { success: true, data: { reports: demoReports.filter(r => r.reportedBy.id === 'borrower-001'), total: 1 } }
  }),

  // Disputes
  getMyDisputes: () => ({
    data: { success: true, data: { disputes: demoDisputes, total: demoDisputes.length } }
  }),

  // Demo Registration - creates a demo user when backend is not available
  register: (data) => {
    const newUser = {
      id: `demo-${data.role}-${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role,
      isOnboardingComplete: false,
      isEmailVerified: false,
      isPhoneVerified: false,
      isAadhaarVerified: false,
      isPanVerified: false,
      isSelfieVerified: false,
      isVerified: false,
      profilePhoto: null,
      trustScore: 50,
      repaymentScore: 50,
      createdAt: new Date().toISOString(),
      city: '',
      state: ''
    };
    return { 
      data: { 
        success: true, 
        data: { 
          user: newUser, 
          token: 'demo-token' 
        },
        message: 'Registration successful! Welcome to उधार CHECK demo.' 
      } 
    };
  },

  // Generic success response
  success: (message = 'Operation successful') => ({
    data: { success: true, message }
  })
};

export default {
  isDemoMode,
  getCurrentDemoUser,
  demoUsers,
  demoResponses,
  demoNotifications,
  demoPendingRequests,
  demoLenderLoans,
  demoBorrowerLoans,
  demoAdminStats,
  demoAllUsers,
  demoReports,
  demoDisputes,
  demoSettings
};
