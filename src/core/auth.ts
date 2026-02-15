import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    user: {
        modelName: "admin",
        role: {
            type: ["admin"],
            required: false,
            defaultValue: "admin",
            input: false,
        },
    },
    emailAndPassword: { 
        enabled: true, 
    },
    advanced: {
        database: {
            generateId: "serial",
        },
    },
});