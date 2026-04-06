const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

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
    console.warn("⚠️  CẢNH BÁO: Thiếu GOOGLE_CLIENT_ID hoặc GOOGLE_CLIENT_SECRET. Tính năng Đăng nhập bằng Google sẽ không hoạt động.");
}

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport;
