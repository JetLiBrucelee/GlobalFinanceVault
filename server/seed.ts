import { db } from "./db";
import { users, accessCodes, accounts } from "@shared/schema";
import { generateAccessCode, generateAccountNumber, generateBSB, generateRoutingNumber, generateSwiftCode } from "./storage";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // PERMANENT ADMIN CREDENTIALS - DO NOT CHANGE
    const adminPassword = await bcrypt.hash("Admin2000!!", 10);

    // Create admin user with permanent credentials
    const [adminUser] = await db.insert(users).values({
      username: "Admin@fundamentalfinancial.com",
      password: adminPassword,
      email: "Admin@fundamentalfinancial.com",
      firstName: "System",
      lastName: "Administrator",
      isAdmin: true,
      isBlocked: false,
      isLocked: false,
    }).onConflictDoUpdate({
      target: users.username,
      set: {
        isAdmin: true,
        password: adminPassword,
        email: "Admin@fundamentalfinancial.com",
        firstName: "System",
        lastName: "Administrator",
      }
    }).returning();

    // Create admin account with FIXED account number "1" and $400 billion balance
    const adminAccountNumber = "1";
    const adminBSB = "000001";
    const adminRoutingNumber = "000000001";
    const adminSwiftCode = "FUNDBKAU001";
    
    await db.insert(accounts).values({
      userId: adminUser.id,
      accountNumber: adminAccountNumber,
      bsb: adminBSB,
      routingNumber: adminRoutingNumber,
      swiftCode: adminSwiftCode,
      region: "AU",
      balance: "400000000000.00", // $400 billion
      accountType: "business",
    }).onConflictDoUpdate({
      target: accounts.accountNumber,
      set: {
        balance: "400000000000.00", // Always reset to $400 billion
        userId: adminUser.id,
        bsb: adminBSB,
        routingNumber: adminRoutingNumber,
        swiftCode: adminSwiftCode,
      }
    });

    // Demo user removed - users will be created via account registration
    
    // Create access codes for account opening
    const code1 = generateAccessCode();
    const code2 = generateAccessCode();
    const adminCode = "ADMIN001"; // Special code for admin
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Expires in 30 days

    await db.insert(accessCodes).values([
      {
        code: code1,
        userId: null,
        isUsed: false,
        expiresAt,
      },
      {
        code: code2,
        userId: null,
        isUsed: false,
        expiresAt,
      },
      {
        code: adminCode,
        userId: null,
        isUsed: false,
        expiresAt,
      },
    ]).onConflictDoNothing();

    console.log("✅ Seed complete!");
    console.log("\n═══════════════════════════════════════════");
    console.log("👤 PERMANENT ADMIN LOGIN CREDENTIALS:");
    console.log("═══════════════════════════════════════════");
    console.log(`   Username: Admin@fundamentalfinancial.com`);
    console.log(`   Password: Admin2000!!`);
    console.log(`   Account Number: ${adminAccountNumber}`);
    console.log(`   Balance: $400,000,000,000.00`);
    console.log("═══════════════════════════════════════════\n");
    console.log("⚠️  IMPORTANT: These credentials are permanent and");
    console.log("   will persist across all Replit moves and restarts.");

    console.log("📝 Access codes for new account opening:");
    console.log(`   Code 1: ${code1}`);
    console.log(`   Code 2: ${code2}`);
    console.log(`   Admin Code: ${adminCode}`);
    console.log("\n📌 Instructions:");
    console.log("   1. Open the app and log in with admin credentials");
    console.log("   2. Admin can manage users and credit accounts from the admin dashboard");
    console.log("   3. New users can open accounts at /open-account");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
