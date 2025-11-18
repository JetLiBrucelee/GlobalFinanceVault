import { db } from "./db";
import { users, accessCodes } from "@shared/schema";
import { generateAccessCode } from "./storage";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create an initial admin user (will be created on first login)
    // For now, just create some access codes
    
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
    console.log("📝 Access codes created:");
    console.log(`   User Code 1: ${code1}`);
    console.log(`   User Code 2: ${code2}`);
    console.log(`   Admin Code: ${adminCode} (use this to create the first admin)`);
    console.log("\n📌 Instructions:");
    console.log("   1. Open the app and log in with Replit Auth");
    console.log("   2. Use one of the access codes above to activate your account");
    console.log("   3. To make a user an admin, update their isAdmin field in the database");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
