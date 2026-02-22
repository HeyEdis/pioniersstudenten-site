export const isProduction = () => {
    return process.env.APP_ENV === "production";
}

export const isTesting = () => {
    return process.env.APP_ENV === "test";
}

export const isDevelopment = () => {
    return process.env.APP_ENV === "development";
}