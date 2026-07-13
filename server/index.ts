import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import { users, accounts, accessCodes } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const app = express();

async function initializeDatabase() {
  try {
    const adminResult = await db.select().from(users).where(eq(users.username, "Admin@corvenzacapitalfinance.com")).limit(1);
    
    if (adminResult.length === 0) {
      log("Admin user not found. Seeding database inline...");
      
      const adminPassword = await bcrypt.hash("Admin2000!!", 10);
      const [adminUser] = await db.insert(users).values({
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

      await db.insert(accounts).values({
        userId: adminUser.id,
        accountNumber: "1",
        routingNumber: "000000001",
        swiftCode: "CCFNUS01",
        region: "US",
        balance: "400000000000.00",
        accountType: "business",
      }).onConflictDoNothing();

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await db.insert(accessCodes).values([
        { code: "888148737933", userId: null, isUsed: false, expiresAt },
        { code: "723844875497", userId: null, isUsed: false, expiresAt },
        { code: "000000000001", userId: null, isUsed: false, expiresAt },
      ]).onConflictDoNothing();

      log("Database seeded successfully");
    }
  } catch (error: any) {
    log(`Database initialization: ${error.message || 'check skipped'}`);
  }
}

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await initializeDatabase();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  const host = "0.0.0.0";
  
  server.listen({
    port,
    host,
    reusePort: true,
  }, () => {
    log(`✓ Server successfully started`);
    log(`✓ Listening on ${host}:${port}`);
    log(`✓ Environment: ${app.get("env")}`);
  });

  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      log(`✗ Error: Port ${port} is already in use`);
    } else if (error.code === 'EACCES') {
      log(`✗ Error: Permission denied to bind to ${host}:${port}`);
    } else {
      log(`✗ Server error: ${error.message}`);
    }
    process.exit(1);
  });
})().catch((error) => {
  log(`✗ Fatal error during startup: ${error.message}`);
  console.error(error);
  process.exit(1);
});
