import { db } from "./db";
import { users, accessCodes, accounts } from "@shared/schema";
import { generateAccessCode, generateAccountNumber, generateRoutingNumber, generateSwiftCode } from "./storage";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // PERMANENT ADMIN CREDENTIALS - DO NOT CHANGE
    const adminPassword = await bcrypt.hash("Admin2000!!", 10);

    // Check if admin already exists to preserve their profile name changes
    const existingAdminResult = await db.select().from(users).where(eq(users.username, "Admin@corvenzacapitalfinance.com")).limit(1);
    const existingAdmin = existingAdminResult[0];
    
    let adminUser;
    if (existingAdmin) {
      // Admin exists - ONLY update password, email, and admin status
      // PRESERVE: firstName, lastName, avatar (user's custom changes)
      const [updated] = await db
        .update(users)
        .set({
          password: adminPassword,
          email: "Admin@corvenzacapitalfinance.com",
          isAdmin: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingAdmin.id))
        .returning();
      adminUser = updated;
      console.log(`✓ Admin user found - preserved custom name: ${adminUser.firstName} ${adminUser.lastName}, avatar: ${adminUser.avatar}`);
    } else {
      // Admin doesn't exist - create with default values
      const [created] = await db.insert(users).values({
        username: "Admin@corvenzacapitalfinance.com",
        password: adminPassword,
        email: "Admin@corvenzacapitalfinance.com",
        firstName: "Don Pablo",
        lastName: "Administrative",
        avatar: "cat",
        isAdmin: true,
        isBlocked: false,
        isLocked: false,
        isApproved: true,
      }).returning();
      adminUser = created;
      console.log(`✓ Admin user created with default profile`);
    }

    // Create admin account with FIXED account number "1" and $400 billion balance
    const adminAccountNumber = "1";
    const adminRoutingNumber = "000000001";
    const adminSwiftCode = "CCFNUS01";
    
    await db.insert(accounts).values({
      userId: adminUser.id,
      accountNumber: adminAccountNumber,
      routingNumber: adminRoutingNumber,
      swiftCode: adminSwiftCode,
      balance: "400000000000.00", // $400 billion
      accountType: "business",
    }).onConflictDoUpdate({
      target: accounts.accountNumber,
      set: {
        balance: "400000000000.00", // Always reset to $400 billion
        userId: adminUser.id,
        routingNumber: adminRoutingNumber,
        swiftCode: adminSwiftCode,
      }
    });

    // Demo user removed - users will be created via account registration
    
    // Create access codes for account opening
    const code1 = generateAccessCode();
    const code2 = generateAccessCode();
    const adminCode = "000000000001"; // Special code for admin - easy to remember 12-digit number
    
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
    console.log(`   Username: Admin@corvenzacapitalfinance.com`);
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
