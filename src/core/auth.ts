import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { schema } from "@/drizzle/schema";
import config from 'config';

const SIGNUP_DISABLED = config.get<boolean>("betterauth.signupdisabled");

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema
    }),
    user: {
        modelName: "admin",
        additionalFields: {
            role: {
                type: "string",
                required: false,
                input: false,
            },
        },
    },
    emailAndPassword: { 
        enabled: true,
        minPasswordLength: 8,
        requireEmailVerification: false,
        disableSignUp: SIGNUP_DISABLED,
    },
    advanced: {
        database: {
            generateId: "serial",
        },
    },
});