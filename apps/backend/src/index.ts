import dotenv from "dotenv";
dotenv.config();

import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";

const app = express();

// Configure Passport with Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:5001/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, cb) {
      // Here, you would typically associate the Google account with a user record in your database.
      return cb(null, profile);
    }
  )
);

console.log(
  "redirect url: ",
  process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:5001/auth/google/callback"
);

app.use(passport.initialize());

// Route to initiate Google OAuth
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback route for Google OAuth
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { id: (req.user as any).id },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );
      res.redirect(
        `http://localhost:3000/dailystories#/auth/callback?token=${token}`
      );
    } catch (error) {
      console.error("Error in callback:", error);
      res.redirect(
        "http://localhost:3000/dailystories#/auth/callback?error=true"
      );
    }
  }
);

// Middleware to Authenticate JWT Token
function authenticateToken(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    // @ts-ignore
    req.user = user;
    next();
  });
}

// Protected Route
app.get("/protected", authenticateToken, (req, res) => {
  res.json({
    message: "This is a protected route",
    user: req.user,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
