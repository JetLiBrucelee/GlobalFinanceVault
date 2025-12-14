import { db } from "./db";
import { users, accounts, cards } from "@shared/schema";
import { generateAccountNumber, generateSwiftCode, generateCardNumber, generateCVV, generateCardExpiry } from "./storage";
import { detectCardBrand, generateCardNumberWithBrand } from "./utils/cardBrands";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";

async function createHanlieUser() {
  console.log("Creating user: Hanlie Johanna Theron...");

  try {
    const password = await bcrypt.hash("Hanlie123!", 10);

    const existingUser = await db.select().from(users)
      .where(sql`LOWER(${users.username}) = LOWER(${'Hanlietheron13'})`)
      .limit(1);

    let hanlieUser;
    
    if (existingUser.length > 0) {
      console.log("User Hanlie already exists. Updating...");
      const [updated] = await db
        .update(users)
        .set({
          password,
          email: "hanlietheron13@gmail.com",
          firstName: "Hanlie Johanna",
          lastName: "Theron",
          country: "South Africa",
          isApproved: true,
          isAdmin: false,
          isBlocked: false,
          isLocked: false,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser[0].id))
        .returning();
      hanlieUser = updated;
    } else {
      const [created] = await db.insert(users).values({
        username: "Hanlietheron13",
        password,
        email: "hanlietheron13@gmail.com",
        firstName: "Hanlie Johanna",
        lastName: "Theron",
        country: "South Africa",
        avatar: "lion",
        isAdmin: false,
        isBlocked: false,
        isLocked: false,
        isApproved: true,
      }).returning();
      hanlieUser = created;
      console.log("User Hanlie created successfully!");
    }

    const existingAccount = await db.select().from(accounts)
      .where(eq(accounts.userId, hanlieUser.id))
      .limit(1);

    let hanlieAccount;
    const accountNumber = generateAccountNumber();
    const branchCode = Math.floor(100000 + Math.random() * 900000).toString();
    const swiftCode = generateSwiftCode();

    if (existingAccount.length > 0) {
      console.log("Account already exists. Updating balance...");
      const [updated] = await db
        .update(accounts)
        .set({
          balance: "320000.00",
          region: "ZA",
        })
        .where(eq(accounts.id, existingAccount[0].id))
        .returning();
      hanlieAccount = updated;
    } else {
      const [created] = await db.insert(accounts).values({
        userId: hanlieUser.id,
        accountNumber,
        branchCode,
        swiftCode,
        region: "ZA",
        balance: "320000.00",
        accountType: "checking",
      }).returning();
      hanlieAccount = created;
      console.log("ZA Account created successfully!");

      const cardholderName = "HANLIE JOHANNA THERON";

      const debitExpiry = generateCardExpiry();
      const debitCardNumber = generateCardNumberWithBrand('mastercard');
      await db.insert(cards).values({
        accountId: hanlieAccount.id,
        cardNumber: debitCardNumber,
        cardType: "debit",
        cardBrand: detectCardBrand(debitCardNumber),
        cvv: generateCVV(),
        expiryMonth: debitExpiry.month,
        expiryYear: debitExpiry.year,
        cardholderName,
        isActive: true,
      });

      const creditExpiry = generateCardExpiry();
      const creditCardNumber = generateCardNumberWithBrand('visa');
      await db.insert(cards).values({
        accountId: hanlieAccount.id,
        cardNumber: creditCardNumber,
        cardType: "credit",
        cardBrand: detectCardBrand(creditCardNumber),
        cvv: generateCVV(),
        expiryMonth: creditExpiry.month,
        expiryYear: creditExpiry.year,
        cardholderName,
        isActive: true,
      });

      console.log("Cards created successfully!");
    }

    console.log("\n==========================================");
    console.log("HANLIE JOHANNA THERON - ACCOUNT DETAILS");
    console.log("==========================================");
    console.log(`Username: Hanlietheron13 (or hanlietheron13@gmail.com)`);
    console.log(`Password: Hanlie123!`);
    console.log(`Region: South Africa (ZA)`);
    console.log(`Account Number: ${hanlieAccount.accountNumber}`);
    console.log(`Balance: $${Number(hanlieAccount.balance).toLocaleString()} USD`);
    console.log(`         R${(Number(hanlieAccount.balance) * 18.5).toLocaleString()} ZAR (approx)`);
    console.log("==========================================");
    console.log("\nNotes:");
    console.log("- Login is case-insensitive for username (H or h works)");
    console.log("- Password is case-sensitive");
    console.log("- Dashboard shows both USD and ZAR balances");
    console.log("==========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Error creating Hanlie user:", error);
    process.exit(1);
  }
}

createHanlieUser();
