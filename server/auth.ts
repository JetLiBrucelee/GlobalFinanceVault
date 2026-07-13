import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import type { User } from "@shared/schema";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "corvenza-capital-finance-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport-local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        if (user.isBlocked) {
          return done(null, false, { message: "Account has been blocked. Please contact support." });
        }

        if (user.isLocked) {
          return done(null, false, { message: "Account is locked. Please contact support." });
        }

        // Check approval status (admins bypass this check)
        if (!user.isAdmin && !user.isApproved) {
          return done(null, false, { message: "Account is pending approval. Please wait for admin approval." });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as User).id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: User | false, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }

        // Admins bypass the access-code gate. Every other user must verify
        // a fresh admin-issued access code before this session can reach
        // any account data, even if they've logged in before.
        (req.session as any).accessCodeVerified = !!user.isAdmin;

        return res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar || 'cat',
          isAdmin: user.isAdmin,
          isApproved: user.isApproved,
          accessCodeVerified: (req.session as any).accessCodeVerified,
        });
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // GET logout endpoint for browser redirects
  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.redirect("/");
    });
  });

}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.user as User;
  if (!user.isAdmin) {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  next();
};

// Blocks access to account data until the current login session has been
// cleared with a fresh admin-issued access code. Admins set this flag
// automatically on login (see /api/login) and never see the gate.
export const requiresAccessCode: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.user as User;
  if (user.isAdmin) {
    return next();
  }

  if (!(req.session as any).accessCodeVerified) {
    return res.status(403).json({ message: "Access code verification is required for this session" });
  }

  next();
};
