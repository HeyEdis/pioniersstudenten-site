import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { schema } from "@/drizzle/schema";
import { customSession } from "better-auth/plugins";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema
    }),
    user: {
        modelName: "admin",
    },
    emailAndPassword: { 
        enabled: true,
        minPasswordLength: 8,
    },
    advanced: {
        database: {
            generateId: "serial",
        },
    },
});