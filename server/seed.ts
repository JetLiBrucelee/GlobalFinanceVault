import { db } from "./db";
import { users, accessCodes, accounts } from "@shared/schema";
import { generateAccessCode, generateAccountNumber, generateBSB, generateRoutingNumber, generateSwiftCode } from "./storage";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create admin user
    const [adminUser] = await db.insert(users).values({
      email: "admin@fundamentalfinancial.com",
      firstName: "System",
      lastName: "Administrator",
      isAdmin: true,
      isBlocked: false,
      isLocked: false,
    }).onConflictDoUpdate({
      target: users.email,
      set: {
        isAdmin: true,
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
    
    // Create access codes
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
    console.log("👤 Admin Account Created:");
    console.log(`   Email: admin@fundamentalfinancial.com`);
    console.log(`   Account Number: ${adminAccountNumber}`);
    console.log(`   Balance: $400,000,000,000.00`);
    console.log("\n📝 Access codes created:");
    console.log(`   User Code 1: ${code1}`);
    console.log(`   User Code 2: ${code2}`);
    console.log(`   Admin Code: ${adminCode} (use this to create the first admin)`);
    console.log("\n📌 Instructions:");
    console.log("   1. Open the app and log in with Replit Auth using admin@fundamentalfinancial.com");
    console.log("   2. Admin can credit user accounts from the admin dashboard");
    console.log("   3. Users can open accounts at /open-account");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
