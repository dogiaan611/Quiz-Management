const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
                scope: ["profile", "email"],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const userData = {
                        googleId: profile.id,
                        email: profile.emails?.[0]?.value,
                        username: profile.displayName,
                        avatar: profile.photos?.[0]?.value,
                    };
                    return done(null, userData);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
} else {
    console.warn("⚠️ Google OAuth credentials missing. Google Login will not work.");
}

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport;
