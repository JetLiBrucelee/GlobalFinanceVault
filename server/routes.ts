import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, generateAccountNumber, generateRoutingNumber, generateSwiftCode, generateCardNumber, generateCVV, generateCardExpiry, generateAccessCode, generateVerificationCode } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, requiresAccessCode } from "./auth";
import { detectCardBrand, generateCardNumberWithBrand } from "./utils/cardBrands";
import { buildTransactionHistory } from "./utils/historyGenerator";

// Currency codes (USA only)
const REGION_CURRENCIES: Record<string, { code: string; symbol: string; name: string }> = {
  'US': { code: 'USD', symbol: '$', name: 'US Dollar' },
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // ======
  // HEALTH CHECK
  // ======
  
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ======
  // AUTH ROUTES
  // ======
  
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Wait for passport to deserialize the user
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user;
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        addressLine1: user.addressLine1,
        addressLine2: user.addressLine2,
        city: user.city,
        state: user.state,
        postalCode: user.postalCode,
        country: user.country,
        avatar: user.avatar || 'cat',
        isAdmin: user.isAdmin,
        isBlocked: user.isBlocked,
        isLocked: user.isLocked,
        isApproved: user.isApproved,
        createdAt: user.createdAt,
        accessCodeVerified: user.isAdmin ? true : !!(req.session as any).accessCodeVerified,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/verify-access-code', isAuthenticated, async (req: any, res) => {
    try {
      const { code } = req.body;
      const userId = req.user.id;

      if (!code) {
        return res.status(400).json({ message: "Access code is required" });
      }

      // Get the access code
      const accessCode = await storage.getAccessCode(code);

      if (!accessCode) {
        return res.status(400).json({ message: "Invalid access code" });
      }

      if (accessCode.isUsed) {
        return res.status(400).json({ message: "Access code has already been used" });
      }

      if (new Date(accessCode.expiresAt) < new Date()) {
        return res.status(400).json({ message: "Access code has expired" });
      }

      // A code generated for a specific user can only clear that user's login.
      // Legacy/untargeted codes (userId null) remain usable by anyone, for
      // backward compatibility with codes generated before per-user targeting.
      if (accessCode.userId && accessCode.userId !== userId) {
        return res.status(403).json({ message: "This access code is not valid for your account" });
      }

      // Mark access code as used
      await storage.markAccessCodeUsed(accessCode.id);

      // If the code is 000000000001, make the user an admin
      if (code === '000000000001') {
        await storage.updateUserStatus(userId, { isAdmin: true });
      }

      // This code has cleared the access-code gate for the current login session.
      req.session.accessCodeVerified = true;

      // Only create the user's bank account and cards the very first time they
      // ever clear the gate. Later logins reuse this same check-and-verify
      // endpoint and must not create duplicate accounts.
      const existingAccounts = await storage.getAccountsByUserId(userId);
      if (existingAccounts.length === 0) {
        const accountNumber = generateAccountNumber();
        const routingNumber = generateRoutingNumber();
        const swiftCode = generateSwiftCode();

        const account = await storage.createAccount({
          userId,
          accountNumber,
          routingNumber,
          swiftCode,
          balance: "10000.00", // Starting balance
          accountType: "checking",
        });

        // Get user info for card holder name
        const user = await storage.getUser(userId);
        const cardholderName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim().toUpperCase();

        // Create debit card (Mastercard)
        const debitExpiry = generateCardExpiry();
        const debitCardNumber = generateCardNumberWithBrand('mastercard');
        await storage.createCard({
          accountId: account.id,
          cardNumber: debitCardNumber,
          cardType: "debit",
          cardBrand: detectCardBrand(debitCardNumber),
          cvv: generateCVV(),
          expiryMonth: debitExpiry.month,
          expiryYear: debitExpiry.year,
          cardholderName,
          isActive: true,
        });

        // Create credit card (Visa)
        const creditExpiry = generateCardExpiry();
        const creditCardNumber = generateCardNumberWithBrand('visa');
        await storage.createCard({
          accountId: account.id,
          cardNumber: creditCardNumber,
          cardType: "credit",
          cardBrand: detectCardBrand(creditCardNumber),
          cvv: generateCVV(),
          expiryMonth: creditExpiry.month,
          expiryYear: creditExpiry.year,
          cardholderName,
          isActive: true,
        });

        return res.json({ message: "Account activated successfully", account });
      }

      res.json({ message: "Access code verified successfully" });
    } catch (error) {
      console.error("Error verifying access code:", error);
      res.status(500).json({ message: "Failed to verify access code" });
    }
  });

  // ======
  // CURRENCY ROUTES
  // ======

  // Get region currencies info
  app.get('/api/currencies', async (req, res) => {
    res.json(REGION_CURRENCIES);
  });

  // Exchange rate endpoint retained for compatibility; USA-only deployment always returns USD parity.
  app.get('/api/exchange-rate/:from/:to', async (req, res) => {
    try {
      const { from, to } = req.params;

      if (from.toUpperCase() !== 'USD' || to.toUpperCase() !== 'USD') {
        return res.status(400).json({ message: "Unsupported currency pair" });
      }

      res.json({
        from: 'USD',
        to: 'USD',
        rate: 1,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      res.status(500).json({ message: "Failed to fetch exchange rate" });
    }
  });

  // ======
  // USER ROUTES
  // ======

  app.patch('/api/user/avatar', isAuthenticated, requiresAccessCode, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { avatar } = req.body;

      const allowedAvatars = ['dog', 'cat', 'bird', 'lion', 'bear', 'cow', 'rabbit', 'panda', 'fox', 'tiger', 'penguin', 'koala', 'elephant'];
      if (!avatar || !allowedAvatars.includes(avatar)) {
        return res.status(400).json({ message: "Invalid avatar. Must be one of: " + allowedAvatars.join(', ') });
      }

      await storage.updateUserAvatar(userId, avatar);
      res.json({ message: "Avatar updated successfully" });
    } catch (error) {
      console.error("Error updating avatar:", error);
      res.status(500).json({ message: "Failed to update avatar" });
    }
  });

  app.patch('/api/user/profile', isAuthenticated, requiresAccessCode, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, phone, addressLine1, addressLine2, city, state, postalCode, country } = req.body;

      if (!firstName || !lastName) {
        return res.status(400).json({ message: "First name and last name are required" });
      }

      if (firstName.trim().length < 1 || lastName.trim().length < 1) {
        return res.status(400).json({ message: "First name and last name cannot be empty" });
      }

      const toTrimmedOrNull = (value: unknown) =>
        typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

      await storage.updateUserDetails(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: toTrimmedOrNull(phone),
        addressLine1: toTrimmedOrNull(addressLine1),
        addressLine2: toTrimmedOrNull(addressLine2),
        city: toTrimmedOrNull(city),
        state: toTrimmedOrNull(state),
        postalCode: toTrimmedOrNull(postalCode),
        country: toTrimmedOrNull(country),
      });
      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // ======
  // ACCOUNT ROUTES
  // ======

  app.get('/api/accounts', isAuthenticated, requiresAccessCode, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const accounts = await storage.getAccountsByUserId(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  // Open account endpoint (public - no authentication required)
  app.post('/api/accounts/open', async (req: any, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        address,
        city,
        postalCode,
        accountType,
        initialDeposit,
        username,
        password
      } = req.body;

      // Basic validation
      if (!firstName || !lastName || !email || !accountType || !username || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Hash password
      const bcrypt = (await import('bcryptjs')).default;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.upsertUser({
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        isAdmin: false,
        isBlocked: false,
        isLocked: false,
      });

      // Create a single US account for the user
      const accounts = [];
      const cardholderName = `${firstName} ${lastName}`.toUpperCase();

      const accountNumber = generateAccountNumber();
      const routingNumber = generateRoutingNumber();
      const swiftCode = generateSwiftCode();

      const depositAmount = initialDeposit && parseFloat(initialDeposit) > 0 ?
        parseFloat(initialDeposit).toFixed(2) : "0.00";

      const account = await storage.createAccount({
        userId: user.id,
        accountNumber,
        routingNumber,
        swiftCode,
        balance: depositAmount,
        accountType,
      });

      // Create debit card for this account (Mastercard)
      const debitExpiry = generateCardExpiry();
      const debitCardNumber = generateCardNumberWithBrand('mastercard');
      await storage.createCard({
        accountId: account.id,
        cardNumber: debitCardNumber,
        cardType: "debit",
        cardBrand: detectCardBrand(debitCardNumber),
        cvv: generateCVV(),
        expiryMonth: debitExpiry.month,
        expiryYear: debitExpiry.year,
        cardholderName,
        isActive: true,
      });

      // Create credit card for this account (Visa)
      const creditExpiry = generateCardExpiry();
      const creditCardNumber = generateCardNumberWithBrand('visa');
      await storage.createCard({
        accountId: account.id,
        cardNumber: creditCardNumber,
        cardType: "credit",
        cardBrand: detectCardBrand(creditCardNumber),
        cvv: generateCVV(),
        expiryMonth: creditExpiry.month,
        expiryYear: creditExpiry.year,
        cardholderName,
        isActive: true,
      });

      accounts.push(account);

      res.json({ accounts, username, message: "Account created successfully" });
    } catch (error: any) {
      console.error("Error opening account:", error);
      res.status(500).json({ message: error.message || "Failed to open account" });
    }
  });

  // ======
  // CARD ROUTES
  // ======

  app.get('/api/cards', isAuthenticated, requiresAccessCode, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const accounts = await storage.getAccountsByUserId(userId);
      
      let allCards: any[] = [];
      for (const account of accounts) {
        const cards = await storage.getCardsByAccountId(account.id);
        allCards = allCards.concat(cards);
      }
      
      res.json(allCards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      res.status(500).json({ message: "Failed to fetch cards" });
    }
  });

  // ======
  // TRANSACTION ROUTES
  // ======

  app.get('/api/transactions', isAuthenticated, requiresAccessCode, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const accounts = await storage.getAccountsByUserId(userId);
      
      let allTransactions: any[] = [];
      for (const account of accounts) {
        const transactions = await storage.getTransactionsByAccountId(account.id);
        allTransactions = allTransactions.concat(transactions);
      }
      
      // Remove duplicates and sort by date
      const uniqueTransactions = Array.from(
        new Map(allTransactions.map(t => [t.id, t])).values()
      ).sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
      
      res.json(uniqueTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions/transfer', isAuthenticated, requiresAccessCode, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { toAccountNumber, amount, description } = req.body;

      if (!toAccountNumber || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get user's account
      const userAccounts = await storage.getAccountsByUserId(userId);
      if (userAccounts.length === 0) {
        return res.status(400).json({ message: "No account found" });
      }

      const fromAccount = userAccounts[0];

      // Check balance
      if (Number(fromAccount.balance) < Number(amount)) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      // Get recipient account
      const toAccount = await storage.getAccountByNumber(toAccountNumber);
      
      // Validate recipient account exists (for all users)
      if (!toAccount) {
        return res.status(400).json({ message: "Recipient account not found" });
      }
      
      // For admins, additional validation that the recipient account belongs to a registered user
      if (req.user.isAdmin) {
        // Verify the account belongs to a registered user
        const recipientUser = await storage.getUser(toAccount.userId);
        if (!recipientUser) {
          return res.status(403).json({ message: "Admins can only transfer to registered user accounts" });
        }
        
        // Prevent admins from transferring to other admin accounts
        if (recipientUser.isAdmin) {
          return res.status(403).json({ message: "Admins cannot transfer to other admin accounts" });
        }
      }

      // Create transaction
      const transaction = await storage.createTransaction({
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        amount: amount.toString(),
        type: "transfer",
        status: "pending",
        description: description || "Transfer",
      });

      res.json(transaction);
    } catch (error) {
      console.error("Error creating transfer:", error);
      res.status(500).json({ message: "Failed to create transfer" });
    }
  });

  app.post('/api/transactions/bill-pay', isAuthenticated, requiresAccessCode, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Prevent admins from using bill pay
      if (req.user.isAdmin) {
        return res.status(403).json({ message: "Admins cannot use bill pay feature" });
      }
      
      const { billerCode, referenceNumber, amount, description } = req.body;

      if (!billerCode || !referenceNumber || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const userAccounts = await storage.getAccountsByUserId(userId);
      if (userAccounts.length === 0) {
        return res.status(400).json({ message: "No account found" });
      }

      const fromAccount = userAccounts[0];

      if (Number(fromAccount.balance) < Number(amount)) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      const transaction = await storage.createTransaction({
        fromAccountId: fromAccount.id,
        toAccountId: null,
        amount: amount.toString(),
        type: "bill_pay",
        status: "pending",
        description: description || `Bill payment to ${billerCode}`,
        reference: `${billerCode}-${referenceNumber}`,
      });

      res.json(transaction);
    } catch (error) {
      console.error("Error creating bill payment:", error);
      res.status(500).json({ message: "Failed to create bill payment" });
    }
  });

  // ======
  // ADMIN ROUTES
  // ======

  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/users/:userId/details', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await storage.getUserWithAccounts(userId);
      if (!result) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { user, accounts } = result;
      const recentTransactions = await storage.getRecentTransactionsByUserId(userId, 5);
      
      // Return only safe, non-sensitive user fields
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          addressLine1: user.addressLine1,
          addressLine2: user.addressLine2,
          city: user.city,
          state: user.state,
          postalCode: user.postalCode,
          country: user.country,
          avatar: user.avatar,
          isAdmin: user.isAdmin,
          isBlocked: user.isBlocked,
          isLocked: user.isLocked,
          isApproved: user.isApproved,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accounts,
        recentTransactions
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ message: "Failed to fetch user details" });
    }
  });

  app.post('/api/admin/users/:userId/block', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.updateUserStatus(userId, { isBlocked: true });
      res.json(user);
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).json({ message: "Failed to block user" });
    }
  });

  app.post('/api/admin/users/:userId/unblock', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.updateUserStatus(userId, { isBlocked: false });
      res.json(user);
    } catch (error) {
      console.error("Error unblocking user:", error);
      res.status(500).json({ message: "Failed to unblock user" });
    }
  });

  app.post('/api/admin/users/:userId/lock', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.updateUserStatus(userId, { isLocked: true });
      res.json(user);
    } catch (error) {
      console.error("Error locking user:", error);
      res.status(500).json({ message: "Failed to lock user" });
    }
  });

  app.post('/api/admin/users/:userId/unlock', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.updateUserStatus(userId, { isLocked: false });
      res.json(user);
    } catch (error) {
      console.error("Error unlocking user:", error);
      res.status(500).json({ message: "Failed to unlock user" });
    }
  });

  app.post('/api/admin/users/:userId/approve', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.updateUserStatus(userId, { isApproved: true });
      res.json(user);
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ message: "Failed to approve user" });
    }
  });

  app.post('/api/admin/users/:userId/disapprove', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.updateUserStatus(userId, { isApproved: false });
      res.json(user);
    } catch (error) {
      console.error("Error disapproving user:", error);
      res.status(500).json({ message: "Failed to disapprove user" });
    }
  });

  app.patch('/api/admin/users/:userId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { updateUserSchema } = await import("@shared/schema");
      
      // Validate request body
      const validation = updateUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid update data",
          errors: validation.error.errors 
        });
      }
      
      const updates = validation.data;
      
      // Check if there are any updates
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }
      
      // Check if user exists
      const existingUser = await storage.getUserById(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user details
      const updatedUser = await storage.updateUserDetails(userId, updates);
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.patch('/api/admin/users/:userId/accounts/:accountId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { accountId } = req.params;
      const { updateAccountSchema } = await import("@shared/schema");
      
      // Validate request body
      const validation = updateAccountSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid update data",
          errors: validation.error.errors 
        });
      }
      
      const updates = validation.data;
      
      // Check if there are any updates
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }
      
      // Update account details
      const updatedAccount = await storage.updateAccountDetails(accountId, updates);
      if (!updatedAccount) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      res.json(updatedAccount);
    } catch (error) {
      console.error("Error updating account:", error);
      res.status(500).json({ message: "Failed to update account" });
    }
  });

  app.delete('/api/admin/users/:userId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.post('/api/admin/users/:userId/fund', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { amount } = req.body;
      const adminUserId = req.user.id;

      // Validate amount
      const numericAmount = parseFloat(amount);
      if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount. Must be a positive number." });
      }

      // Get user's account
      const accounts = await storage.getAllAccounts();
      const userAccount = accounts.find(a => a.userId === userId);
      
      if (!userAccount) {
        return res.status(404).json({ message: "User account not found" });
      }

      // Use absolute value to ensure positive amount
      const validAmount = Math.abs(numericAmount).toFixed(2);

      // Create credit transaction
      await storage.createTransaction({
        toAccountId: userAccount.id,
        amount: validAmount,
        type: 'admin_credit',
        status: 'completed',
        description: 'Corvenza Capital Credit - Account funded',
        createdBy: adminUserId,
        availableAt: new Date(),
      });

      // Update balance
      const newBalance = (parseFloat(userAccount.balance) + parseFloat(validAmount)).toFixed(2);
      await storage.updateAccountBalance(userAccount.id, newBalance);

      res.json({ message: "Account funded successfully", amount: validAmount });
    } catch (error) {
      console.error("Error funding account:", error);
      res.status(500).json({ message: "Failed to fund account" });
    }
  });

  app.post('/api/admin/users/:userId/debit', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { amount } = req.body;
      const adminUserId = req.user.id;

      // Validate amount
      const numericAmount = parseFloat(amount);
      if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount. Must be a positive number." });
      }

      // Get user's account
      const accounts = await storage.getAllAccounts();
      const userAccount = accounts.find(a => a.userId === userId);
      
      if (!userAccount) {
        return res.status(404).json({ message: "User account not found" });
      }

      // Use absolute value to ensure positive amount
      const validAmount = Math.abs(numericAmount).toFixed(2);

      // Check if user has sufficient balance
      if (parseFloat(userAccount.balance) < parseFloat(validAmount)) {
        return res.status(400).json({ message: "Insufficient balance in user account" });
      }

      // Create debit transaction
      await storage.createTransaction({
        fromAccountId: userAccount.id,
        amount: validAmount,
        type: 'withdrawal',
        status: 'completed',
        description: 'Admin debit - Account debited',
        createdBy: adminUserId,
        availableAt: new Date(),
      });

      // Update balance
      const newBalance = (parseFloat(userAccount.balance) - parseFloat(validAmount)).toFixed(2);
      await storage.updateAccountBalance(userAccount.id, newBalance);

      res.json({ message: "Account debited successfully", amount: validAmount });
    } catch (error) {
      console.error("Error debiting account:", error);
      res.status(500).json({ message: "Failed to debit account" });
    }
  });

  app.get('/api/admin/accounts', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const accounts = await storage.getAllAccounts();
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.get('/api/admin/transactions', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Admin credit user account with scheduled availability
  app.post('/api/admin/credit-account', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { accountId, amount, description, availabilityOption } = req.body;
      const adminUserId = req.user.id;

      if (!accountId || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid account ID or amount" });
      }

      // Get the target account
      const accounts = await storage.getAllAccounts();
      const targetAccount = accounts.find(a => a.id === accountId);
      
      if (!targetAccount) {
        return res.status(404).json({ message: "Account not found" });
      }

      // Calculate availability time based on option
      let availableAt = new Date();
      if (availabilityOption === 'next-hour') {
        availableAt = new Date(Date.now() + 60 * 60 * 1000);
      } else if (availabilityOption === 'next-day') {
        availableAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      } else if (availabilityOption === '2-days') {
        availableAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      } else if (availabilityOption === 'week') {
        availableAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      }
      // 'instant' means now

      // Create transaction
      const transaction = await storage.createTransaction({
        toAccountId: accountId,
        amount: amount.toString(),
        type: 'admin_credit',
        status: availabilityOption === 'instant' ? 'completed' : 'pending',
        description: description || 'Corvenza Capital Credit',
        createdBy: adminUserId,
        availableAt: availableAt,
      });

      // If instant, update balance immediately
      if (availabilityOption === 'instant') {
        const newBalance = (Number(targetAccount.balance) + Number(amount)).toFixed(2);
        await storage.updateAccountBalance(accountId, newBalance);
      }

      res.json({ 
        message: "Credit successful", 
        transaction,
        availableAt: availableAt.toISOString()
      });
    } catch (error: any) {
      console.error("Error crediting account:", error);
      res.status(500).json({ message: error.message || "Failed to credit account" });
    }
  });

  // Get pending transactions
  app.get('/api/admin/transactions/pending', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const pendingTransactions = await storage.getPendingTransactions();
      res.json(pendingTransactions);
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
      res.status(500).json({ message: "Failed to fetch pending transactions" });
    }
  });

  // Get in-progress transactions
  app.get('/api/admin/transactions/in-progress', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const allTransactions = await storage.getAllTransactions();
      const inProgressTransactions = allTransactions.filter(t => t.status === 'in-progress');
      res.json(inProgressTransactions);
    } catch (error) {
      console.error("Error fetching in-progress transactions:", error);
      res.status(500).json({ message: "Failed to fetch in-progress transactions" });
    }
  });

  // Approve transaction - generates 4 verification codes
  app.post('/api/admin/transactions/:transactionId/approve', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { transactionId } = req.params;
      const adminUserId = req.user?.id;
      
      // Get transaction
      const transaction = await storage.getTransactionById(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (transaction.status !== 'pending') {
        return res.status(400).json({ message: "Transaction is not pending" });
      }

      // Generate 4 random verification codes
      const code1 = generateVerificationCode();
      const code2 = generateVerificationCode();
      const code3 = generateVerificationCode();
      const code4 = generateVerificationCode();

      // Approve transaction with codes
      const updatedTransaction = await storage.approveTransaction(transactionId, adminUserId, {
        code1,
        code2,
        code3,
        code4,
      });

      res.json({
        transaction: updatedTransaction,
        verificationCodes: { code1, code2, code3, code4 },
      });
    } catch (error) {
      console.error("Error approving transaction:", error);
      res.status(500).json({ message: "Failed to approve transaction" });
    }
  });

  // Verify transaction code (codes 1-4)
  app.post('/api/admin/transactions/:transactionId/verify-code', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { transactionId } = req.params;
      const { codeNumber, code } = req.body;

      if (!codeNumber || !code) {
        return res.status(400).json({ message: "Code number and code are required" });
      }

      if (![1, 2, 3, 4].includes(codeNumber)) {
        return res.status(400).json({ message: "Code number must be 1, 2, 3, or 4" });
      }

      const result = await storage.verifyTransactionCode(transactionId, codeNumber, code);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.json({
        success: true,
        transaction: result.transaction,
        message: `Code ${codeNumber} verified successfully. Progress: ${result.transaction?.progressPercentage}%`,
      });
    } catch (error) {
      console.error("Error verifying code:", error);
      res.status(500).json({ message: "Failed to verify code" });
    }
  });

  app.post('/api/admin/transactions/:transactionId/decline', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { transactionId } = req.params;
      const updatedTransaction = await storage.updateTransactionStatus(transactionId, 'declined');
      res.json(updatedTransaction);
    } catch (error) {
      console.error("Error declining transaction:", error);
      res.status(500).json({ message: "Failed to decline transaction" });
    }
  });

  app.get('/api/admin/access-codes', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const accessCodes = await storage.getAllAccessCodes();
      res.json(accessCodes);
    } catch (error) {
      console.error("Error fetching access codes:", error);
      res.status(500).json({ message: "Failed to fetch access codes" });
    }
  });

  app.post('/api/admin/users/:userId/generate-history', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;

      // Verify the user exists and has an account
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userAccounts = await storage.getAccountsByUserId(userId);
      if (userAccounts.length === 0) {
        return res.status(400).json({ message: "User has no account. Create an account for this user first." });
      }

      const account = userAccounts[0];

      // Build synthetic history rows (Jan 2024 → now)
      const rows = buildTransactionHistory(account.id);

      // Bulk-insert
      const count = await storage.bulkInsertHistoryTransactions(rows);

      res.json({ message: `Successfully generated ${count} transactions`, count });
    } catch (error) {
      console.error("Error generating transaction history:", error);
      res.status(500).json({ message: "Failed to generate transaction history" });
    }
  });

  app.post('/api/admin/access-codes/generate', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.body || {};

      if (userId) {
        const targetUser = await storage.getUser(userId);
        if (!targetUser) {
          return res.status(404).json({ message: "User not found" });
        }
      }

      const code = generateAccessCode();
      const expiresAt = new Date();
      // Codes for a specific user's next login expire quickly; untargeted
      // legacy codes keep the longer 7-day window.
      if (userId) {
        expiresAt.setDate(expiresAt.getDate() + 1);
      } else {
        expiresAt.setDate(expiresAt.getDate() + 7);
      }

      const accessCode = await storage.createAccessCode({
        code,
        userId: userId || null,
        isUsed: false,
        expiresAt,
      });

      res.json(accessCode);
    } catch (error) {
      console.error("Error generating access code:", error);
      res.status(500).json({ message: "Failed to generate access code" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
