export default {
  env: process.env.APP_ENV || "production",
  log: {
    level: "warning",
  },
  betterauth: {
    url: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    signupdisabled: true
  }
};