export default {
  env: "APP_ENV",
  log: {
    level: "LOG_LEVEL",
    disabled: {
      __name: "LOG_DISABLED",
      __format: "json",
    },
  },
  betterauth: {
    signupdisabled: {
      __name: "BETTER_AUTH_SIGNUP_DISABLED",
      __format: "json",
    },
  },
};
