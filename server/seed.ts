import { db } from "./db";
import { users, accessCodes, accounts } from "@shared/schema";
import { generateAccessCode, generateAccountNumber, generateBSB, generateRoutingNumber, generateSwiftCode } from "./storage";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash("Admin@123", 10);
    const userPassword = await bcrypt.hash("User@123", 10);

    // Create admin user
    const [adminUser] = await db.insert(users).values({
      username: "admin",
      password: adminPassword,
      email: "admin@fundamentalfinancial.com",
      firstName: "System",
      lastName: "Administrator",
      isAdmin: true,
      isBlocked: false,
      isLocked: false,
    }).onConflictDoUpdate({
      target: users.username,
      set: {
        isAdmin: true,
        password: adminPassword, // Update password in case it changed
      }
    }).returning();

    // Create admin account with $400 billion balance
    const adminAccountNumber = generateAccountNumber();
    await db.insert(accounts).values({
      userId: adminUser.id,
      accountNumber: adminAccountNumber,
      bsb: generateBSB(),
      routingNumber: generateRoutingNumber(),
      swiftCode: generateSwiftCode(),
      region: "AU",
      balance: "400000000000.00", // $400 billion
      accountType: "business",
    }).onConflictDoNothing();

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
    console.log("👤 ADMIN LOGIN CREDENTIALS:");
    console.log("═══════════════════════════════════════════");
    console.log(`   Username: admin`);
    console.log(`   Password: Admin@123`);
    console.log(`   Account Number: ${adminAccountNumber}`);
    console.log(`   Balance: $400,000,000,000.00`);
    console.log("═══════════════════════════════════════════\n");

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
