export const isProduction = () => {
    return process.env.APP_ENV === "production";
}