export default {
  env: process.env.APP_ENV || "development",
  log: {
    level: "silly",
    disabled: false,
  },
  betterauth: {
    signupdisabled: false
  }
};
