import dotenv from "dotenv";
dotenv.config();

import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import cors from "cors";
import { StoryGenerator, StorySettings } from "@dailystories/shared";

const app = express();

// Add CORS middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

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

// Add JSON parsing middleware
app.use(express.json());

// Protected endpoint to generate a story
app.post("/api/generate-story", authenticateToken, async (req, res) => {
  try {
    const storySettings: StorySettings = req.body;

    // Set response headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const generator = new StoryGenerator(storySettings);

    // Create callback functions that send SSE events
    const callbacks = {
      onProgress: (progress: number, message: string) => {
        res.write(
          `data: ${JSON.stringify({ type: "progress", progress, message })}\n\n`
        );
      },
      onOutline: (outline: string) => {
        res.write(`data: ${JSON.stringify({ type: "outline", outline })}\n\n`);
      },
      onPageUpdate: (text: string, illustration: string | null) => {
        res.write(
          `data: ${JSON.stringify({
            type: "pageUpdate",
            text,
            illustration,
          })}\n\n`
        );
      },
      onCoverGenerated: (coverImage: string) => {
        res.write(
          `data: ${JSON.stringify({ type: "coverGenerated", coverImage })}\n\n`
        );
      },
    };

    // Generate the story
    const story = await generator.generateStory(callbacks);

    // Send the final story data
    res.write(`data: ${JSON.stringify({ type: "complete", story })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Error generating story:", error);
    // Send error event
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: "Failed to generate story",
      })}\n\n`
    );
    res.end();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
