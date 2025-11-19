import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, generateAccountNumber, generateBSB, generateRoutingNumber, generateSwiftCode, generateCardNumber, generateCVV, generateCardExpiry, generateAccessCode, generateNZBranchCode } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";

const REGIONS = ['AU', 'US', 'NZ'] as const;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // ===================
  // AUTH ROUTES
  // ===================
  
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
        avatar: user.avatar || 'cat',
        isAdmin: user.isAdmin,
        isBlocked: user.isBlocked,
        isLocked: user.isLocked,
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

      // Mark access code as used
      await storage.markAccessCodeUsed(accessCode.id);

      // If the code is ADMIN001, make the user an admin
      if (code === 'ADMIN001') {
        await storage.updateUserStatus(userId, { isAdmin: true });
      }

      // Create account and cards for the user
      const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
      const accountNumber = generateAccountNumber();
      
      let bsb = null, routingNumber = null, swiftCode = null;
      if (region === 'AU') {
        bsb = generateBSB();
      } else if (region === 'US') {
        routingNumber = generateRoutingNumber();
      } else if (region === 'NZ') {
        swiftCode = generateSwiftCode();
      }

      // Create account
      const account = await storage.createAccount({
        userId,
        accountNumber,
        bsb,
        routingNumber,
        swiftCode,
        region,
        balance: "10000.00", // Starting balance
        accountType: "checking",
      });

      // Get user info for card holder name
      const user = await storage.getUser(userId);
      const cardholderName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim().toUpperCase();

      // Create debit card
      const debitExpiry = generateCardExpiry();
      await storage.createCard({
        accountId: account.id,
        cardNumber: generateCardNumber(),
        cardType: "debit",
        cvv: generateCVV(),
        expiryMonth: debitExpiry.month,
        expiryYear: debitExpiry.year,
        cardholderName,
        isActive: true,
      });

      // Create credit card
      const creditExpiry = generateCardExpiry();
      await storage.createCard({
        accountId: account.id,
        cardNumber: generateCardNumber(),
        cardType: "credit",
        cvv: generateCVV(),
        expiryMonth: creditExpiry.month,
        expiryYear: creditExpiry.year,
        cardholderName,
        isActive: true,
      });

      res.json({ message: "Account activated successfully", account });
    } catch (error) {
      console.error("Error verifying access code:", error);
      res.status(500).json({ message: "Failed to verify access code" });
    }
  });

  // ===================
  // USER ROUTES
  // ===================

  app.patch('/api/user/avatar', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { avatar } = req.body;

      const allowedAvatars = ['dog', 'cat', 'bird', 'lion', 'bear', 'cow', 'rabbit', 'panda'];
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

  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName } = req.body;

      if (!firstName || !lastName) {
        return res.status(400).json({ message: "First name and last name are required" });
      }

      if (firstName.trim().length < 1 || lastName.trim().length < 1) {
        return res.status(400).json({ message: "First name and last name cannot be empty" });
      }

      await storage.updateUserProfile(userId, { firstName: firstName.trim(), lastName: lastName.trim() });
      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // ===================
  // ACCOUNT ROUTES
  // ===================

  app.get('/api/accounts', isAuthenticated, async (req: any, res) => {
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
        initialDeposit
      } = req.body;

      // Basic validation
      if (!firstName || !lastName || !email || !accountType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Generate username from email or name
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      // Generate random password
      const bcrypt = (await import('bcryptjs')).default;
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
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

      // Randomly assign region from AU, US, NZ
      const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
      
      // Generate account details based on region
      const accountNumber = generateAccountNumber();
      let bsb = null, routingNumber = null, swiftCode = null, branchCode = null;
      
      if (region === 'AU') {
        bsb = generateBSB();
      } else if (region === 'US') {
        routingNumber = generateRoutingNumber();
      } else if (region === 'NZ') {
        branchCode = generateNZBranchCode();
      }
      swiftCode = generateSwiftCode();

      // Create account with initial deposit
      const depositAmount = initialDeposit && parseFloat(initialDeposit) > 0 ? 
        parseFloat(initialDeposit).toFixed(2) : "0.00";
      
      const account = await storage.createAccount({
        userId: user.id,
        accountNumber,
        bsb,
        routingNumber,
        swiftCode,
        branchCode,
        region,
        balance: depositAmount,
        accountType,
      });

      // Create debit card
      const cardholderName = `${firstName} ${lastName}`.toUpperCase();
      const debitExpiry = generateCardExpiry();
      await storage.createCard({
        accountId: account.id,
        cardNumber: generateCardNumber(),
        cardType: "debit",
        cvv: generateCVV(),
        expiryMonth: debitExpiry.month,
        expiryYear: debitExpiry.year,
        cardholderName,
        isActive: true,
      });

      // Create credit card
      const creditExpiry = generateCardExpiry();
      await storage.createCard({
        accountId: account.id,
        cardNumber: generateCardNumber(),
        cardType: "credit",
        cvv: generateCVV(),
        expiryMonth: creditExpiry.month,
        expiryYear: creditExpiry.year,
        cardholderName,
        isActive: true,
      });

      res.json(account);
    } catch (error: any) {
      console.error("Error opening account:", error);
      res.status(500).json({ message: error.message || "Failed to open account" });
    }
  });

  // ===================
  // CARD ROUTES
  // ===================

  app.get('/api/cards', isAuthenticated, async (req: any, res) => {
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

  // ===================
  // TRANSACTION ROUTES
  // ===================

  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/transactions/transfer', isAuthenticated, async (req: any, res) => {
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

      // Create transaction
      const transaction = await storage.createTransaction({
        fromAccountId: fromAccount.id,
        toAccountId: toAccount?.id || null,
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

  app.post('/api/transactions/bill-pay', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  app.post('/api/transactions/payid', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { payId, amount, description } = req.body;

      if (!payId || !amount) {
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

      // Look up PayID
      const payIdRecord = await storage.getPayIdByValue(payId);

      const transaction = await storage.createTransaction({
        fromAccountId: fromAccount.id,
        toAccountId: payIdRecord?.accountId || null,
        amount: amount.toString(),
        type: "payid",
        status: "pending",
        description: description || `PayID payment to ${payId}`,
        reference: payId,
      });

      res.json(transaction);
    } catch (error) {
      console.error("Error creating PayID payment:", error);
      res.status(500).json({ message: "Failed to create PayID payment" });
    }
  });

  // ===================
  // ADMIN ROUTES
  // ===================

  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
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
        description: 'Admin credit - Account funded',
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
        description: description || 'Admin credit',
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

  app.post('/api/admin/transactions/:transactionId/approve', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { transactionId } = req.params;
      
      // Get transaction
      const transactions = await storage.getAllTransactions();
      const transaction = transactions.find(t => t.id === transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (transaction.status !== 'pending') {
        return res.status(400).json({ message: "Transaction is not pending" });
      }

      // Update balances
      if (transaction.fromAccountId) {
        const fromAccount = await storage.getAccountByNumber(
          (await storage.getAllAccounts()).find(a => a.id === transaction.fromAccountId)!.accountNumber
        );
        if (fromAccount) {
          const newBalance = (Number(fromAccount.balance) - Number(transaction.amount)).toFixed(2);
          await storage.updateAccountBalance(fromAccount.id, newBalance);
        }
      }

      if (transaction.toAccountId) {
        const toAccount = await storage.getAccountByNumber(
          (await storage.getAllAccounts()).find(a => a.id === transaction.toAccountId)!.accountNumber
        );
        if (toAccount) {
          const newBalance = (Number(toAccount.balance) + Number(transaction.amount)).toFixed(2);
          await storage.updateAccountBalance(toAccount.id, newBalance);
        }
      }

      // Update transaction status
      const updatedTransaction = await storage.updateTransactionStatus(transactionId, 'completed');
      res.json(updatedTransaction);
    } catch (error) {
      console.error("Error approving transaction:", error);
      res.status(500).json({ message: "Failed to approve transaction" });
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

  app.post('/api/admin/access-codes/generate', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const code = generateAccessCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      const accessCode = await storage.createAccessCode({
        code,
        userId: null,
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
