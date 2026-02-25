export default {
  env: process.env.APP_ENV || "production",
  log: {
    level: "warning",
  },
  betterauth: {
    signupdisabled: true
  }
};