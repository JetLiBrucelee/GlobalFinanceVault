import {
  users,
  accounts,
  cards,
  transactions,
  accessCodes,
  payIds,
  type User,
  type UpsertUser,
  type Account,
  type InsertAccount,
  type Card,
  type InsertCard,
  type Transaction,
  type InsertTransaction,
  type AccessCode,
  type InsertAccessCode,
  type PayId,
  type InsertPayId,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc } from "drizzle-orm";
import { randomBytes } from "crypto";

// Generate random verification code (12-digit numeric code)
export function generateVerificationCode(length: number = 12): string {
  let code = '';
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += (bytes[i] % 10).toString();
  }
  return code;
}

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserStatus(id: string, updates: { isBlocked?: boolean; isLocked?: boolean; isAdmin?: boolean; isApproved?: boolean }): Promise<User>;
  updateUserAvatar(id: string, avatar: string): Promise<User>;
  updateUserProfile(id: string, updates: { firstName: string; lastName: string }): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Account operations
  getAccountsByUserId(userId: string): Promise<Account[]>;
  getAccountByNumber(accountNumber: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccountBalance(accountId: string, newBalance: string): Promise<Account>;
  getAllAccounts(): Promise<Account[]>;

  // Card operations
  getCardsByAccountId(accountId: string): Promise<Card[]>;
  createCard(card: InsertCard): Promise<Card>;
  getAllCards(): Promise<Card[]>;

  // Transaction operations
  getTransactionsByAccountId(accountId: string): Promise<Transaction[]>;
  getRecentTransactionsByUserId(userId: string, limit: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: string, status: string): Promise<Transaction>;
  getAllTransactions(): Promise<Transaction[]>;
  getPendingTransactions(): Promise<Transaction[]>;
  getTransactionById(id: string): Promise<Transaction | undefined>;
  approveTransaction(id: string, adminId: string, codes: { code1: string; code2: string; code3: string; code4: string }): Promise<Transaction>;
  verifyTransactionCode(id: string, codeNumber: 1 | 2 | 3 | 4, code: string): Promise<{ success: boolean; transaction?: Transaction; message?: string }>;

  // Access code operations
  getAccessCode(code: string): Promise<AccessCode | undefined>;
  createAccessCode(accessCode: InsertAccessCode): Promise<AccessCode>;
  markAccessCodeUsed(id: string): Promise<AccessCode>;
  getAllAccessCodes(): Promise<AccessCode[]>;

  // PayID operations
  getPayIdByValue(payIdValue: string): Promise<PayId | undefined>;
  createPayId(payId: InsertPayId): Promise<PayId>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserStatus(id: string, updates: { isBlocked?: boolean; isLocked?: boolean; isAdmin?: boolean; isApproved?: boolean }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserAvatar(id: string, avatar: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ avatar, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserProfile(id: string, updates: { firstName: string; lastName: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Account operations
  async getAccountsByUserId(userId: string): Promise<Account[]> {
    return await db.select().from(accounts).where(eq(accounts.userId, userId));
  }

  async getAccountByNumber(accountNumber: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.accountNumber, accountNumber));
    return account;
  }

  async createAccount(accountData: InsertAccount): Promise<Account> {
    const [account] = await db.insert(accounts).values(accountData).returning();
    return account;
  }

  async updateAccountBalance(accountId: string, newBalance: string): Promise<Account> {
    const [account] = await db
      .update(accounts)
      .set({ balance: newBalance })
      .where(eq(accounts.id, accountId))
      .returning();
    return account;
  }

  async getAllAccounts(): Promise<Account[]> {
    return await db.select().from(accounts).orderBy(desc(accounts.createdAt));
  }

  // Card operations
  async getCardsByAccountId(accountId: string): Promise<Card[]> {
    return await db.select().from(cards).where(eq(cards.accountId, accountId));
  }

  async createCard(cardData: InsertCard): Promise<Card> {
    const [card] = await db.insert(cards).values(cardData).returning();
    return card;
  }

  async getAllCards(): Promise<Card[]> {
    return await db.select().from(cards).orderBy(desc(cards.createdAt));
  }

  // Transaction operations
  async getTransactionsByAccountId(accountId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(
        or(
          eq(transactions.fromAccountId, accountId),
          eq(transactions.toAccountId, accountId)
        )
      )
      .orderBy(desc(transactions.createdAt));
  }

  async getRecentTransactionsByUserId(userId: string, limit: number): Promise<Transaction[]> {
    // Get all accounts for this user
    const userAccounts = await this.getAccountsByUserId(userId);
    const accountIds = userAccounts.map(acc => acc.id);
    
    if (accountIds.length === 0) {
      return [];
    }
    
    // Get transactions for all user accounts
    const result = await db
      .select()
      .from(transactions)
      .where(
        or(
          ...accountIds.map(id => eq(transactions.fromAccountId, id)),
          ...accountIds.map(id => eq(transactions.toAccountId, id))
        )
      )
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
    
    return result;
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(transactionData).returning();
    return transaction;
  }

  async updateTransactionStatus(id: string, status: string): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set({ status, processedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.status, 'pending'))
      .orderBy(desc(transactions.createdAt));
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async approveTransaction(
    id: string,
    adminId: string,
    codes: { code1: string; code2: string; code3: string; code4: string }
  ): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set({
        verificationCode1: codes.code1,
        verificationCode2: codes.code2,
        verificationCode3: codes.code3,
        verificationCode4: codes.code4,
        approvedBy: adminId,
        approvedAt: new Date(),
        status: 'in-progress',
      })
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async verifyTransactionCode(
    id: string,
    codeNumber: 1 | 2 | 3 | 4,
    code: string
  ): Promise<{ success: boolean; transaction?: Transaction; message?: string }> {
    const transaction = await this.getTransactionById(id);
    
    if (!transaction) {
      return { success: false, message: 'Transaction not found' };
    }

    // Check if correct code
    const codeField = `verificationCode${codeNumber}` as keyof Transaction;
    const expectedCode = transaction[codeField] as string;
    
    if (expectedCode !== code) {
      return { success: false, message: 'Invalid verification code' };
    }

    // Update progress based on code number
    const progressMap = { 1: 25, 2: 50, 3: 75, 4: 100 } as const;
    const newProgress = progressMap[codeNumber];

    // Update code entry timestamps
    const timestamps = (transaction.codeEntryTimestamps as any) || {};
    timestamps[`code${codeNumber}`] = new Date().toISOString();

    // If code 4, complete transaction and transfer funds
    let status = transaction.status;
    let updatedTransaction: Transaction;

    if (codeNumber === 4) {
      status = 'completed';
      
      // Process the actual fund transfer
      if (transaction.fromAccountId && transaction.toAccountId) {
        const fromAccount = await db
          .select()
          .from(accounts)
          .where(eq(accounts.id, transaction.fromAccountId))
          .limit(1);
        
        const toAccount = await db
          .select()
          .from(accounts)
          .where(eq(accounts.id, transaction.toAccountId))
          .limit(1);

        if (fromAccount[0] && toAccount[0]) {
          const newFromBalance = (parseFloat(fromAccount[0].balance) - parseFloat(transaction.amount)).toFixed(2);
          const newToBalance = (parseFloat(toAccount[0].balance) + parseFloat(transaction.amount)).toFixed(2);

          // Update balances
          await db
            .update(accounts)
            .set({ balance: newFromBalance })
            .where(eq(accounts.id, transaction.fromAccountId));

          await db
            .update(accounts)
            .set({ balance: newToBalance })
            .where(eq(accounts.id, transaction.toAccountId));
        }
      }

      // Update transaction with completion
      [updatedTransaction] = await db
        .update(transactions)
        .set({
          progressPercentage: newProgress,
          status,
          codeEntryTimestamps: timestamps,
          processedAt: new Date(),
        })
        .where(eq(transactions.id, id))
        .returning();
    } else if (codeNumber === 2) {
      // Code 2: Debit funds from sender at 50%
      if (transaction.fromAccountId) {
        const fromAccount = await db
          .select()
          .from(accounts)
          .where(eq(accounts.id, transaction.fromAccountId))
          .limit(1);

        if (fromAccount[0]) {
          const newFromBalance = (parseFloat(fromAccount[0].balance) - parseFloat(transaction.amount)).toFixed(2);

          // Debit sender account
          await db
            .update(accounts)
            .set({ balance: newFromBalance })
            .where(eq(accounts.id, transaction.fromAccountId));
        }
      }

      [updatedTransaction] = await db
        .update(transactions)
        .set({
          progressPercentage: newProgress,
          codeEntryTimestamps: timestamps,
        })
        .where(eq(transactions.id, id))
        .returning();
    } else {
      // Code 1 or 3: Just update progress
      [updatedTransaction] = await db
        .update(transactions)
        .set({
          progressPercentage: newProgress,
          codeEntryTimestamps: timestamps,
        })
        .where(eq(transactions.id, id))
        .returning();
    }

    return { success: true, transaction: updatedTransaction };
  }

  // Access code operations
  async getAccessCode(code: string): Promise<AccessCode | undefined> {
    const [accessCode] = await db.select().from(accessCodes).where(eq(accessCodes.code, code));
    return accessCode;
  }

  async createAccessCode(accessCodeData: InsertAccessCode): Promise<AccessCode> {
    const [accessCode] = await db.insert(accessCodes).values(accessCodeData).returning();
    return accessCode;
  }

  async markAccessCodeUsed(id: string): Promise<AccessCode> {
    const [accessCode] = await db
      .update(accessCodes)
      .set({ isUsed: true, usedAt: new Date() })
      .where(eq(accessCodes.id, id))
      .returning();
    return accessCode;
  }

  async getAllAccessCodes(): Promise<AccessCode[]> {
    return await db.select().from(accessCodes).orderBy(desc(accessCodes.createdAt));
  }

  // PayID operations
  async getPayIdByValue(payIdValue: string): Promise<PayId | undefined> {
    const [payId] = await db.select().from(payIds).where(eq(payIds.payIdValue, payIdValue));
    return payId;
  }

  async createPayId(payIdData: InsertPayId): Promise<PayId> {
    const [payId] = await db.insert(payIds).values(payIdData).returning();
    return payId;
  }
}

export const storage = new DatabaseStorage();

// Helper functions for generating random banking details
export function generateAccountNumber(): string {
  // Generate a random 16-digit account number (non-sequential)
  let accountNumber = '';
  for (let i = 0; i < 16; i++) {
    accountNumber += Math.floor(Math.random() * 10).toString();
  }
  return accountNumber;
}

export function generateBSB(): string {
  // Generate a valid Australian BSB (bank code 062-999, branch 000-999)
  const bankCode = (62 + Math.floor(Math.random() * 938)).toString().padStart(3, '0');
  const branchCode = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return bankCode + branchCode;
}

export function generateRoutingNumber(): string {
  // Generate a random 9-digit routing number for USA
  let routing = '';
  for (let i = 0; i < 9; i++) {
    routing += Math.floor(Math.random() * 10).toString();
  }
  return routing;
}

export function generateSwiftCode(): string {
  // Generate a random 11-character SWIFT code for New Zealand
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  let swift = '';
  
  // First 4 characters: Bank code (letters)
  for (let i = 0; i < 4; i++) {
    swift += letters[Math.floor(Math.random() * letters.length)];
  }
  
  // Next 2 characters: Country code (NZ)
  swift += 'NZ';
  
  // Next 2 characters: Location code (letters/digits)
  for (let i = 0; i < 2; i++) {
    swift += (letters + digits)[Math.floor(Math.random() * 36)];
  }
  
  // Last 3 characters: Branch code (optional, letters/digits)
  for (let i = 0; i < 3; i++) {
    swift += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return swift;
}

export function generateCardNumber(): string {
  // Generate a random 16-digit card number
  let cardNumber = '';
  for (let i = 0; i < 16; i++) {
    cardNumber += Math.floor(Math.random() * 10).toString();
  }
  return cardNumber;
}

export function generateCVV(): string {
  // Generate a random 3-digit CVV
  return Math.floor(100 + Math.random() * 900).toString();
}

export function generateCardExpiry(): { month: string; year: string } {
  const currentYear = new Date().getFullYear();
  const expiryYear = currentYear + Math.floor(Math.random() * 5) + 2; // 2-6 years from now
  const expiryMonth = (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0');
  
  return {
    month: expiryMonth,
    year: expiryYear.toString(),
  };
}

export function generateAccessCode(): string {
  // Generate a random 12-digit numeric access code using cryptographically secure randomBytes
  let code = '';
  const bytes = randomBytes(12);
  for (let i = 0; i < 12; i++) {
    code += (bytes[i] % 10).toString();
  }
  return code;
}

export function generateNZBranchCode(): string {
  // Generate a random 6-digit New Zealand branch code
  return Math.floor(100000 + Math.random() * 900000).toString();
}
